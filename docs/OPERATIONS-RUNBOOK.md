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

Local suite: **73/73 PASS**, including diagnostic projection, synthetic error/rejection recording, malformed/legacy records, 50-event bound, sanitized clipboard and diagnostic-only clearing. Standard Chromium/Firefox/WebKit PR/main CI and gated deployment VERIFIED for PR #30 / 760e223; exact links and deployed-byte proof below.

Read-only repository audit: rulesets API returned `[]`; classic main protection API returned HTTP 403 (`Resource not accessible by integration`). This is partial visibility, not proof that main is unprotected or protected. No settings changed. See [release audit](RELEASE-CI-AUDIT.md).


## 2026-10-13 Cairo — Diagnostic redaction and operations preparation VERIFIED

[PR #30](https://github.com/3bHussein/ProgressXX-Web/pull/30), source `ba7afb8e9157d8924bad6fe5ef2fe9cc0655a5c2`, merge `760e22339a8e8754dcae8487fe4baf154208c441`. All eight PR workflows SUCCESS. Matching main: [Fast conflict safety contracts #38463464881](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38463464881) SUCCESS, [Cross-browser frontend accessibility #38463465074](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38463465074) SUCCESS, [Full ProgressXX migration smoke #38463464809](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38463464809) SUCCESS, [Deploy ProgressXX Full App #38463464812](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38463464812) SUCCESS. Local full suite **73/73 PASS**. Diagnostics regression PASS in Chromium/Full UI and standard Firefox/WebKit PR/main CI; selected matrix now eight fixtures per engine. PR Firefox job115522983186 and WebKit115522983586 logs explicitly confirm allowlisted projection, malformed/legacy events, sanitized clipboard, generic local error capture and fitness-data preservation with zero backend calls.

Dedicated deploy job115524273777 recorded Pages `build_type=workflow`, waited for and accepted same-SHA validators Full UI38463464809, Fast38463464881, Cross-browser38463465074 before publishing. No PostgreSQL or legacy Jekyll run at this merge SHA. Actual public root and worker HTTP200 responses match tested source byte-for-byte: root `75b49223ddfc633e58dabaad4288740e107ec8228e872fe2216f86f5e9223e1e`, worker `323f5022828b49efc6b39105e1c53e92716f73e74a9da738aec0dd1d56db4515`.

[Operations runbook](OPERATIONS-RUNBOOK.md) documents incident triage, private evidence, local report limits and a new-commit frontend rollback through release gates. Prepared and reviewed, not a live rollback rehearsal. No remote monitoring service enabled or assigned support/incident owner invented. Read-only branch audit remains partial: rulesets API [], classic protection403; enforcement not certified. Phase 3 IN PROGRESS; Phase 4 PREPARATION / IN PROGRESS, incomplete. Milestone 2 remains paused/incomplete; commercial launch NOT APPROVED. No SQL/Supabase/staging/backup experiments, production schema/grants/RLS/migrations, fitness-record/synchronization changes or paid services. Final evidence update is documentation-only; runtime proof belongs to the tested merge above.
