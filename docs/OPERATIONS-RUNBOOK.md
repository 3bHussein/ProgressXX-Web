# ProgressX operations runbook — preparation

Production is root `index.html` at https://3bhussein.github.io/ProgressXX-Web/.
This is a frontend incident procedure, not a completed rollback rehearsal or launch approval.
Database experiments remain paused by owner (`DATABASE-EXPERIMENTS-PAUSED-2026-10-13`).

## Triage and preserve data

Treat suspected record loss, cross-account exposure or overwritten concurrent changes as P0: block release/beta expansion, preserve evidence privately and stop the suspected destructive action. Do not clear browser storage, reset pending drafts, overwrite conflicts or ask the user to import an older snapshot over current data. Normal synchronization remains enabled; this procedure does not instruct a blanket shutdown.

For a broken core flow or repeated startup failure, record app version, deployed commit, browser/device, time, reproduction steps and observed sync status. Use synthetic reproductions first. Record both versions of a conflict using the existing recovery/export controls only when needed; keep any account export private. Never attach customer records, raw browser storage, credentials, URLs containing tokens or backup files to public GitHub issues.

## Local diagnostics

Settings → Diagnostics → Refresh / Copy sanitized report. Events are account-scoped locally; no monitoring service or automatic remote upload is added. Report fields: app/version, report timestamp, online state, workout record count, pending workout-sync count, localStorage availability and up to 50 events. Counts/times can still reveal usage patterns; review before sharing.

Each exported event has only `at` (ISO UTC timestamp or null) and allowlisted `type`: `runtime_error`, `unhandled_rejection`, `error`, or `other`. Unknown imported types become `other`; message, stack, URLs and arbitrary nested properties are excluded. Reading/copying does not rewrite stored events. Local window error/rejection listeners record generic categories only and do not suppress errors. This is best-effort diagnostics, not complete error boundaries, remote alerting or a guarantee that every failure is captured.

Clear diagnostic events removes only the diagnostic key; it is not an account-data reset. Storage unavailable or malformed: reporting falls back safely. Regression: `tests/diagnostics-redaction-browser.cjs`, synthetic records and mocked storage with zero backend calls. Do not represent these tests as real account isolation acceptance.

## Frontend rollback procedure — not yet rehearsed live

1. Identify the incident commit and a previously approved root runtime using PR/main test evidence. Assign an incident owner and communicate via the owner's selected private support route.
2. Prepare a new branch/commit restoring the required frontend assets from the known version, review the complete diff and root `index.html` target. Include matching worker/manifest assets when required. Do not reset main history, clear caches/storage indiscriminately, change database records or run migrations. An older client may be incompatible with a later server contract: inspect compatibility before release.
3. Run relevant local synthetic regressions, then required PR checks. Merge only a reviewed, tested change. The new rollback commit must pass same-SHA Full UI, Fast conflict contracts and Cross-browser checks on main before the dedicated Pages gate publishes it. Do not bypass the gate by deploying an old SHA or changing the Pages source.
4. Verify the dedicated deployment succeeded, Pages metadata is `build_type=workflow`, and actual public root/worker bytes match that tested commit. Inspect worker update/fresh-launch and draft/conflict retention using local fixtures; document what real device acceptance remains unverified. Diagnose stale-cache behavior before considering any targeted intervention that could affect user data.
5. Record incident cause, affected scope, tested commit/run links, recovery result and follow-up regression. A successful code revert alone is not proof of preserved real records.

## Release and incident ownership

Incident owner, deputy, private support contact, escalation hours and release approver: **TBD by owner**, not invented by this document. Remote monitoring/alerting, staged rollout and a live frontend rollback rehearsal remain open. No new service, paid feature or external message is enabled/sent.

Database backup cadence, retention, RPO/RTO, production restore and staging drills are **DEFERRED** until explicit owner resumption with verified backups and separately approved scope. No database rollback instructions are executed by this frontend procedure. Privacy/terms, deletion lifecycle and third-party license review remain separate acceptance gates. Commercial launch remains **NOT APPROVED**.

## Evidence for this preparation batch

Local suite: **73/73 PASS**, including diagnostic projection, synthetic error/rejection recording, malformed/legacy records, 50-event bound, sanitized clipboard and diagnostic-only clearing. Firefox/WebKit standard CI and deployment evidence must be recorded after actual runs; not inferred from workflow configuration.

Read-only repository audit: rulesets API returned `[]`; classic main protection API returned HTTP 403 (`Resource not accessible by integration`). This is partial visibility, not proof that main is unprotected or protected. No settings changed. See [release audit](RELEASE-CI-AUDIT.md).
