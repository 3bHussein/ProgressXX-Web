"""Test-only owner CAS/RLS/grants and pg_dump restore on localhost disposable DBs.
This is PostgreSQL proof with injected synthetic claims, NOT Supabase JWT/API proof.
"""
import concurrent.futures
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import tempfile

SOURCE = 'synthetic_cas'
RESTORE = 'synthetic_cas_restore'
SCHEMA = 'px_cas_auth'
APP = 'px_cas_test_app'
WRITER = 'px_cas_test_writer'
ANON = 'px_cas_test_anon'
A = '00000000-0000-4000-8000-000000000011'
B = '00000000-0000-4000-8000-000000000012'
C = '00000000-0000-4000-8000-000000000013'
D = '00000000-0000-4000-8000-000000000014'
# Guard BEFORE invoking subprocess; production URLs and arbitrary database names are rejected.
if os.environ.get('PGHOST') not in ('localhost', '127.0.0.1') or os.environ.get('PGDATABASE') != SOURCE:
    raise SystemExit('Refusing to run outside localhost disposable synthetic_cas')
if os.environ.get('PGUSER') != 'postgres' or os.environ.get('PGPORT', '5432') != '5432':
    raise SystemExit('Expected disposable CI PostgreSQL administrator on port 5432')
DUMP_CONTAINER = os.environ.get('PG_DUMP_CONTAINER')
if DUMP_CONTAINER and not re.fullmatch(r'[a-f0-9]{12,64}', DUMP_CONTAINER):
    raise SystemExit('Invalid disposable PostgreSQL service container ID')
ENV = {k: v for k, v in os.environ.items() if not k.startswith('PG')}
ENV['PGPASSWORD'] = os.environ.get('PGPASSWORD', '')
ENV['PGCONNECT_TIMEOUT'] = '5'
CONNECTION = ['-h', '127.0.0.1', '-p', '5432', '-U', 'postgres']


def sql(query, database=SOURCE, denied=None):
    assert database in (SOURCE, RESTORE)
    result = subprocess.run(['psql', *CONNECTION, '-d', database, '-X', '-q', '-A', '-t',
                             '-v', 'ON_ERROR_STOP=1', '-v', 'VERBOSITY=verbose', '-c', query],
                            env=ENV, capture_output=True, text=True, timeout=30)
    if denied:
        assert result.returncode != 0, 'Unauthorized operation unexpectedly succeeded'
        assert re.search(r'ERROR:\s+' + re.escape(denied) + r':', result.stderr), result.stderr
        return None
    if result.returncode:
        raise RuntimeError(result.stderr)
    return result.stdout.strip()


def as_role(query, owner=None, role=APP, database=SOURCE, denied=None):
    assert role in (APP, WRITER, ANON) and owner in (None, A, B, C, D)
    claim = owner or ''
    return sql(f"BEGIN; SET LOCAL ROLE {role}; SELECT set_config('request.jwt.claim.sub','{claim}',true); {query}; COMMIT;",
               database, denied)


def rpc(owner, revision, payload, database=SOURCE, denied=None):
    # Only generated fixtures are serialized; never interpolate actual user input.
    body = json.dumps(payload, ensure_ascii=True).replace("'", "''")
    output = as_role(f"SELECT row_to_json(r) FROM {SCHEMA}.save_snapshot({revision},'{body}'::jsonb) r",
                     owner, database=database, denied=denied)
    return json.loads(output.splitlines()[-1]) if output is not None else None


def manifest(database):
    data = sql(f"SELECT coalesce(jsonb_agg(to_jsonb(s) ORDER BY user_id),'[]') FROM {SCHEMA}.snapshots s", database)
    return json.dumps(json.loads(data), sort_keys=True, separators=(',', ':'))


def isolation(database):
    for owner, foreign in ((A, B), (B, A)):
        read = as_role(f"SELECT count(*) FROM {SCHEMA}.snapshots WHERE user_id='{foreign}'", owner, database=database)
        assert read.splitlines()[-1] == '0', 'Cross-owner row leaked'
        own = as_role(f"SELECT count(*) FROM {SCHEMA}.snapshots WHERE user_id='{owner}'", owner, database=database)
        assert own.splitlines()[-1] == '1'
        # Even own-account direct mutations are denied: old unconditional upsert cannot bypass CAS.
        for query in (
            f"UPDATE {SCHEMA}.snapshots SET payload='{{}}' WHERE user_id='{foreign}'",
            f"DELETE FROM {SCHEMA}.snapshots WHERE user_id='{foreign}'",
            f"INSERT INTO {SCHEMA}.snapshots VALUES('{owner}','{{}}',1) ON CONFLICT(user_id) DO UPDATE SET payload='{{}}'",
            f"TRUNCATE {SCHEMA}.snapshots",
        ):
            as_role(query, owner, database=database, denied='42501')
    as_role(f'SELECT * FROM {SCHEMA}.snapshots', role=ANON, database=database, denied='42501')
    as_role(f"SELECT * FROM {SCHEMA}.save_snapshot(0,'{{}}')", A, ANON, database, denied='42501')
    rpc(None, 0, {}, database, denied='28000')
    # Check the privileged writer still obeys RLS and cannot transfer ownership.
    assert as_role(f"SELECT count(*) FROM {SCHEMA}.snapshots WHERE user_id='{A}'", B, WRITER, database).splitlines()[-1] == '0'
    as_role(f"INSERT INTO {SCHEMA}.snapshots VALUES('{D}','{{}}',1)", A, WRITER, database, denied='42501')
    as_role(f"UPDATE {SCHEMA}.snapshots SET user_id='{D}' WHERE user_id='{A}'", A, WRITER, database, denied='42501')
    for role in (APP, WRITER, ANON):
        flags = sql(f"SELECT rolsuper OR rolbypassrls OR rolcanlogin FROM pg_roles WHERE rolname='{role}'", database)
        assert flags == 'f'
        for privilege in ('TRUNCATE', 'TRIGGER', 'REFERENCES'):
            assert sql(f"SELECT has_table_privilege('{role}','{SCHEMA}.snapshots','{privilege}')", database) == 'f'
    assert sql(f"SELECT pg_has_role('{APP}','{WRITER}','MEMBER')", database) == 'f'
    assert sql(f"SELECT relrowsecurity AND relforcerowsecurity FROM pg_class WHERE oid='{SCHEMA}.snapshots'::regclass", database) == 't'
    owner = sql(f"SELECT pg_get_userbyid(proowner) FROM pg_proc WHERE oid='{SCHEMA}.save_snapshot(bigint,jsonb)'::regprocedure", database)
    assert owner == WRITER, 'RPC owner must not bypass RLS'


fixture = Path('tests/postgres-owner-cas-fixture.sql').read_text()
# Atomic setup fails on name collision; no existing schema/roles are dropped.
sql(fixture)
restore_created = False
try:
    original = {
        'food': [{'id': 'food-one', 'name': 'Synthetic food'}],
        'foodLibrary': [{'id': 'library-one'}], 'savedMeals': [{'id': 'meal-one'}],
        'daily': [{'id': 'daily-one'}], 'workout': [{'id': 'workout-one', 'raw': '25*8'}],
        'weight': [{'id': 'weight-one', 'value': 80}],
        # Actual root app storage keys carry byte-exact JSON strings in the snapshot.
        'progressx-food-log': json.dumps([{'id': 'food-one', 'name': 'Synthetic food'}]),
        'progressx-food-products': json.dumps([{'id': 'library-one'}]),
        'progressx-meal-templates-v1': json.dumps([{'id': 'meal-one'}]),
        'progressx-reminders': json.dumps([{'id': 'daily-one', 'name': 'Synthetic reminder'}]),
        'progressx-data-v19': json.dumps([{'id': 'workout-one', 'performance': '25*8'}]),
        'progressx-progress-photos-v1': json.dumps([{'id': 'weight-one', 'weight': 80}]),
        'unknownKey': {'keep': 'unchanged'}, 'unicode': 'بيانات اختبار',
    }
    assert rpc(A, 0, original)['actual_revision'] == 1
    assert rpc(B, 0, {'food': [{'id': 'B-only'}]})['accepted']
    baseline = manifest(SOURCE)
    isolation(SOURCE)
    assert manifest(SOURCE) == baseline, 'Denied operations changed data'
    for invalid in ([], None, 'invalid'):
        rpc(A, 1, invalid, denied='22023')
    rpc(A, -1, {}, denied='22023')
    assert manifest(SOURCE) == baseline, 'Invalid payload changed data'

    def race(owner, revision, payload):
        with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
            results = list(pool.map(lambda i: rpc(owner, revision, {**payload, 'writer': i}), range(8)))
        assert sum(r['accepted'] is True for r in results) == 1, results
        assert all(r['actual_revision'] == revision + 1 for r in results), results
        return results

    race(C, 0, {'food': []})  # Same owner, first-insert unique-key race.
    deleted = {**original, 'food': [], 'daily': [], 'progressx-food-log': '[]', 'progressx-reminders': '[]'}
    race(A, 1, deleted)  # Same revision, privileged RPC still serialized by row lock.
    before_stale = manifest(SOURCE)
    result = rpc(A, 1, original)
    assert result['accepted'] is False and result['actual_payload']['food'] == []
    assert result['actual_payload']['progressx-food-log'] == '[]' and result['actual_payload']['progressx-reminders'] == '[]'
    assert result['actual_payload']['progressx-data-v19'] == original['progressx-data-v19']
    assert manifest(SOURCE) == before_stale, 'Stale RPC resurrected a deletion'
    assert json.loads(as_role(f"SELECT payload FROM {SCHEMA}.snapshots WHERE user_id='{B}'", B).splitlines()[-1]) == {'food': [{'id': 'B-only'}]}
    print('PASS: owner RLS, cross-owner read/write denial, anonymous denial, constrained RPC owner, legacy direct-upsert lockout, invalid inputs and 8-session first-write/update races')

    # Real pg_dump and restore into a fresh disposable database, preserving owners and ACLs.
    assert sql(f"SELECT count(*) FROM pg_database WHERE datname='{RESTORE}'") == '0', 'Restore DB already exists; refusing to replace it'
    sql(f'CREATE DATABASE {RESTORE} TEMPLATE template0')
    restore_created = True
    before = manifest(SOURCE)
    with tempfile.TemporaryDirectory(prefix='progressx-synthetic-restore-') as directory:
        dump = Path(directory) / 'fixture.sql'
        dump.touch(mode=0o600)
        # Use the service's pg_dump 17; Ubuntu's default client may be an older major.
        command = (['docker', 'exec', '-e', 'PGPASSWORD', DUMP_CONTAINER, 'pg_dump', '-U', 'postgres', '-d', SOURCE, '--schema', SCHEMA]
                   if DUMP_CONTAINER else ['pg_dump', *CONNECTION, '-d', SOURCE, '--schema', SCHEMA])
        with dump.open('w') as output:
            subprocess.run(command, env=ENV, check=True, stdout=output, stderr=subprocess.PIPE, text=True, timeout=30)
        checksum = hashlib.sha256(dump.read_bytes()).hexdigest()
        subprocess.run(['psql', *CONNECTION, '-d', RESTORE, '-X', '-v', 'ON_ERROR_STOP=1', '-f', str(dump)],
                       env=ENV, check=True, capture_output=True, text=True, timeout=30)
        assert hashlib.sha256(dump.read_bytes()).hexdigest() == checksum, 'Backup altered during restore'
        assert manifest(RESTORE) == before, 'Restored owner/revision/payload manifest differs'
        assert manifest(SOURCE) == before, 'Restore modified source'
        isolation(RESTORE)
        assert manifest(RESTORE) == before, 'Post-restore negative tests changed data'
        assert rpc(A, 1, original, RESTORE)['accepted'] is False
        assert manifest(RESTORE) == before
        # Owner-scoped CAS must still work after grants/function-owner restoration.
        assert rpc(A, 2, deleted, RESTORE)['actual_revision'] == 3
        assert manifest(SOURCE) == before, 'Restored-db write leaked to source'
        print('PASS: pg_dump restore preserves all 3 owners, revisions, every payload field, RPC owner, forced RLS and grants; stale replay still rejected and valid CAS succeeds in restored DB. Synthetic only; production backup NOT verified.')
finally:
    if restore_created:
        sql(f'DROP DATABASE {RESTORE}')
    sql(f'DROP SCHEMA {SCHEMA} CASCADE; DROP ROLE {APP},{WRITER},{ANON}')
