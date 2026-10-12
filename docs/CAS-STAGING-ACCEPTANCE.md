# CAS staging readiness checklist (not a migration)

This document is a design checklist only. It does not authorize modifications to production or payment.

## Acceptance checks

1. Record a verified recoverable backup and restore it into a dedicated test environment.
2. Preserve every existing user snapshot while assigning each owned snapshot an initial version.
3. Require a server-checked version number and authenticated owner for every mutation.
4. An outdated version must return conflict without changing any stored record.
5. A different signed-in user must never read or modify another user's snapshot.
6. A rejected request must retain the device's unsynced draft, including after refresh.
7. A remote deletion must remain deleted after unrelated stale device activity.
8. Duplicate retry attempts must not overwrite newer accepted versions.
9. Old application clients must be denied unsafe writes only after a tested upgrade and rollback plan.
10. Do not enable the design until two-account tests, device tests and an independently verified restore have passed.

Current status: DESIGN ONLY. Production still uses whole-snapshot upsert; its P0 risk remains open. The paid staging/security checkpoint stays deferred until the owner explicitly resumes it.

## 2026-10-12 — Executable isolated owner/restore suite

[Disposable PostgreSQL acceptance](ISOLATED-OWNER-CAS-RESTORE.md) now has an executable fixture/harness covering owner RLS, restricted RPC, legacy-write denial, concurrent CAS and real pg_dump restore. Runtime CI result pending; local connection-guard tests PASS. This is a separate synthetic identity experiment, not deployment of the earlier draft or verification of production JWT/API/backup/device safety. Live gates stay OPEN.
