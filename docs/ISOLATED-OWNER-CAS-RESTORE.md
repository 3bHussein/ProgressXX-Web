# Disposable owner CAS, RLS and restore acceptance

Status: VERIFIED on PostgreSQL 17 in disposable CI; no production rollout authorized. PR #17 merged as f1004cf.

This test extends the PostgreSQL 17 service in `.github/workflows/postgres-cas-integration.yml`. It creates only synthetic roles/schema in `synthetic_cas`, restores a real `pg_dump` into a fresh `synthetic_cas_restore`, and removes only assets it created. Existing schema/role/database collisions fail instead of replacing data. No Supabase project, account, grants, RLS, migration or production record is changed. No paid branch/service is enabled.

## Scope and boundary

| Check | Executable assertion | What it does not prove |
| --- | --- | --- |
| Owner identity | RPC takes revision and payload only; owner derives from a fixture claim | JWT signature verification, session revocation or Supabase Auth |
| Row isolation | A cannot select B; writer role also cannot select B; ownership reassignment denied | Live Supabase/PostgREST configuration |
| Direct write bypass | App INSERT/upsert/UPDATE/DELETE/TRUNCATE denied, including own-account legacy upsert | Production clients have migrated to CAS |
| Privileges | No role is superuser/BYPASSRLS/login; app is not a writer-role member; TRUNCATE/TRIGGER/REFERENCES denied | Existing production grants have changed |
| CAS | Eight independent sessions race first insert and same-revision update; one winner per race | Production CAS endpoint exists |
| Deletion | Stale RPC cannot restore deleted Food/Daily, including actual root snapshot string keys | Real-device UI lifecycle and every normalized-table conflict path |
| Invalid input | Exact SQLSTATE 22023 and unchanged records for invalid payload/revision | Complete real-world backup schema validation |
| Restore | Real pg_dump/psql restore compares all owner IDs, revisions, payload fields/strings and rechecks RLS/grants/RPC | A real production backup is restorable |
| Runner safety | Unsafe hosts/databases/users/ports rejected before subprocess; PG overrides sanitized | Authorization to point a SQL client at production |

## Privilege separation experiment

The earlier SECURITY INVOKER proposal requires the caller to retain table write privileges, so merely revoking those grants would also break its RPC. This isolated fixture tests a different candidate: a private-schema SECURITY DEFINER RPC owned by a dedicated **NOLOGIN, NOSUPERUSER, NOBYPASSRLS role that does not own the table**. The table has FORCE ROW LEVEL SECURITY, explicit owner USING/WITH CHECK, and the function has an empty search_path and fully qualified object names. PUBLIC execute is revoked; only the test app role may invoke CAS. The app itself retains owner-scoped SELECT only.

This is a test-only architectural experiment, not a deployable Supabase migration. Identity comes from a session claim injected by the administrator test harness. SQL users who can set arbitrary claims are outside this simulated gateway boundary; real JWT/API negatives still require independently authorized staging. Exposed-schema wrapper design, function ownership, privilege inheritance, advisors and old-client migration need review before any production proposal.

## Repeatable execution

Use the existing GitHub Actions `Isolated PostgreSQL CAS integration` workflow (PR, main relevant-path push, or workflow_dispatch). The guard unit test is `python3 tests/postgres-owner-cas-guard.py`; it never opens a database connection. The acceptance runner requires literal localhost, database `synthetic_cas`, administrator `postgres` and port 5432, with no connection URL accepted.

CI uses the PostgreSQL service container's **pg_dump 17** to avoid a client/server major-version mismatch. Backup files live in a private temporary directory, are removed after testing and are not uploaded as artifacts. Only synthetic pass/fail evidence is logged.

## Next gate

After a verified CI result, retain live AUTH-01, DATA-01 and SYNC-01/02/03 as OPEN. Prepare a real restorable backup, separate approved Supabase staging, real JWT/two-user direct API negatives, client CAS integration/legacy cutover and real two-device acceptance before requesting a reviewed production rollout.

## Verified execution — 2026-10-12

[PR PostgreSQL #38301607318](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38301607318), [main PostgreSQL #38301837684](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38301837684), [main Full UI #38301837754](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38301837754) SUCCESS. All executable assertions in the matrix above passed. Real pg_dump restored three synthetic owners with identical full manifests, forced RLS, restricted grants and constrained function ownership. Stale CAS remained rejected, valid CAS succeeded in the restored database, and source stayed unchanged. Temporary files/databases/schema/roles were cleaned up. These results do not close production JWT/API/backup/physical-device gates. Exact commit and CI history are in DEVELOPMENT-LOG.
