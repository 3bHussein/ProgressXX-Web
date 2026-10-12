"""Exercise the existing CAS reference with independent PostgreSQL sessions.
Only localhost/synthetic_cas is allowed; no production or Supabase connection.
"""
import concurrent.futures
import json
import os
from pathlib import Path
import subprocess

if os.environ.get('PGHOST') not in ('localhost', '127.0.0.1') or os.environ.get('PGDATABASE') != 'synthetic_cas':
    raise SystemExit('Refusing to run outside localhost disposable synthetic_cas database')
SCHEMA = 'px_cas_parallel'


def sql(query):
    return subprocess.run(['psql', '-X', '-q', '-A', '-t', '-v', 'ON_ERROR_STOP=1', '-c', query],
                          check=True, capture_output=True, text=True, timeout=30).stdout.strip()


def race(owner, expected):
    def attempt(i):
        payload = json.dumps({'writer': i, 'food': []})
        return sql(f"SELECT accepted FROM {SCHEMA}.save_snapshot('{owner}',{expected},'{payload}'::jsonb)")
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        outcomes = list(pool.map(attempt, range(8)))
    assert outcomes.count('t') == 1 and outcomes.count('f') == 7, outcomes
    row = json.loads(sql(f"SELECT json_build_object('revision',revision,'payload',payload) FROM {SCHEMA}.snapshots WHERE user_id='{owner}'"))
    assert row['revision'] == expected + 1, row
    assert row['payload']['food'] == [], row
    return row


# The SQL reference is shared with sequential tests; no second CAS implementation.
source = Path('tests/postgres-cas-isolated.sql').read_text()
setup = source[source.index('CREATE SCHEMA demo;'):source.index('DO $$')].replace('demo.', SCHEMA + '.').replace('CREATE SCHEMA demo;', f'CREATE SCHEMA {SCHEMA};')
# CREATE SCHEMA fails if an existing schema is present; never drop unknown pre-existing data.
sql(setup)
try:
    owner = '00000000-0000-4000-8000-000000000003'
    race(owner, 0)  # concurrent first inserts: only one may create revision 1
    race(owner, 1)  # concurrent updates: only one may advance revision 1
    before = sql(f"SELECT payload FROM {SCHEMA}.snapshots WHERE user_id='{owner}'")
    assert sql(f"SELECT accepted FROM {SCHEMA}.save_snapshot('{owner}',1,'{{\"food\":[\"resurrect\"]}}')") == 'f'
    assert sql(f"SELECT payload FROM {SCHEMA}.snapshots WHERE user_id='{owner}'") == before
    print('PASS: real PostgreSQL independent-session first-write and update races each have one winner; stale deletion replay rejected. Synthetic only; not Supabase auth/RLS proof.')
finally:
    sql(f'DROP SCHEMA {SCHEMA} CASCADE')
