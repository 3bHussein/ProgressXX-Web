# ProgressX — Development Log (Persistent)

This is the **append-only** chronological log of completed work, investigations, releases and handoffs. Last updated: **2026-10-12**.

## Rules — mandatory for all future tasks

1. Before work: read `README.md`, `ROADMAP.md`, `docs/PROJECT-HANDOFF.md`, **this log**, recent commits/PRs and Actions.
2. After **every** completed change or investigation, append a new dated entry here; never silently rewrite/delete historical entries. Update `docs/PROJECT-HANDOFF.md` with **current state / next action**, and update `ROADMAP.md` statuses and evidence where applicable.
3. Each entry MUST record: date (UTC preferred), scope, source/target files, what changed, commit/PR, tests and CI links/results, deployment status, data migration impact, known risks, and **exact next step**. If untested or not deployed write `NOT VERIFIED`; never claim a pass without evidence.
4. Update tracking files **as part of the task**, ideally in the same PR as code; if CI runs after the commit, append a follow-up verification entry when confirmed.
5. Never log secrets, real health data, personal workout/food exports, credentials or private user information in this public repository.
6. Only production target is `https://3bhussein.github.io/ProgressXX-Web/` (root `index.html`). Do not switch to `commercial-v1.html`.
7. If a task cannot be completed, log the blocker and continue in the next chat from the recorded step. Do not mark incomplete work as finished.

## Latest handoff snapshot

- **Stage:** Pre-release hardening; not certified for sale/public paid launch.
- **Known risk:** Real-account reproduction of login `undefined.filter` and Food/Daily restored-data sync needs independent confirmation, even though earlier CI ran green.
- **Primary next step:** Test prepared migration on separate staging Supabase project/branch (none currently available); verify postflight grants and two-user RLS, then Food/Daily/Workout/Weight CRUD/sync. Production grants are unchanged.
- **Data safety:** Preserve all existing user records; do not wipe or silently replace records.
- **Deployment URL:** https://3bhussein.github.io/ProgressXX-Web/
- **Repository:** https://github.com/3bHussein/ProgressXX-Web

## Entries (newest first)
### 2026-10-12 — Investigate failed Food restart-recovery smoke

- CI #38180320704 **FAILED** at Full UI browser smoke; GitHub Pages deployment #38180320858 **SUCCEEDED**. Failure should not be reported as a passing recovery test. Original log unavailable through current connector; likely test race identified by inspection, not yet proven as root cause.
- Updated `scripts/smoke-full-ui.cjs`: persist queued synthetic product locally before reload; hold simulated HTTP 503 throughout restart; release server failure only after inspecting saved queue and product, then retry. Commit `6e5b9454b2dbc46eb0bbe9784d0a9941b326f9f9`.
- CI outcome for new commit pending. No production database changes. Security deferred marker unchanged.
- Next: check current CI; if failure persists inspect available error details and repair the specific app/test defect.



### 2026-10-12 — Food outbox survives app restart: regression gate

- Verified full UI smoke #38180217072 SUCCESS for Food transient HTTP 503 retry test.
- Changed `scripts/smoke-full-ui.cjs` in commit `6a4134bfd113df58c784783e99ee12ab45a525e5`: after a simulated 503 response, reload the app, assert both the pending Food queue item and its local product survive, then retry and assert queue drains and only one cloud write exists.
- New CI result not yet verified; if it fails, diagnose genuine Food rehydration race before accepting deployment.
- Separate infrastructure warning: GitHub Pages run #38180217307 failed at Deploy to GitHub Pages though its build succeeded; inspect current/latest deploy before attributing to application code.
- No production database writes or application code changes. Security checkpoint `SECURITY-DEFERRED-2026-10-12` still deferred.
- Next: review new CI and deployment; fix any confirmed reload/reconciliation issue safely.



### 2026-10-12 — Food transient-server retry regression

- Added a browser smoke test to `scripts/smoke-full-ui.cjs` for an injected HTTP 503 on a queued Food Library POST, verifying the outbox retains the failed operation, retries once after recovery, and produces one cloud record.
- Code commit: `76c8b0e97fa40f6bda48abefcc30299c6164c1a8`.
- Latest prior workflow for outbox tombstone checks was still running when inspected (#38180138777); newer server-retry CI is not yet verified.
- No production database or runtime application code changed. Mocked test only.
- Next: inspect new Actions result and investigate failures. Keep `SECURITY-DEFERRED-2026-10-12` paused.



### 2026-10-12 — Food outbox duplicate/tombstone browser regression

- **Prior results:** Full UI smoke #38180040958 and #38180026886 SUCCESS (mocked Food Diary deletion remains absent on reload).
- **Change:** `scripts/smoke-full-ui.cjs` now exercises two duplicate queue requests for an active Food Library product and a locally deleted/tombstoned product. Checks queue deduplication, one eventual active product write, no resurrection of deleted product and a drained queue.
- **Commit:** `7d1b3ef14cc416e97fa951a5ee5e29adac480694`.
- **Status:** New CI is pending; result not yet verified. Mocked browser test only; no production user records or database changed.
- **Next:** Verify GitHub full-ui-smoke result, fix failures and then test failed-write retry preservation.
- **Security:** `SECURITY-DEFERRED-2026-10-12` remains paused.



### 2026-10-12 — Food Diary delete confirmation and no-resurrection regression

- **Previous CI:** [Full migration smoke #38179820794](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38179820794) SUCCESS; Food offline rejection and online retry mock checks passed.
- **Scope:** `scripts/smoke-full-ui.cjs` now mocks Food Diary DELETE by client ID, calls `food_log_delete`, confirms mocked cloud removal, reloads the account and checks that the entry remains absent.
- **Commit:** `734cb8cf95eabafab490d00f382e3a15086f9037`.
- **Verification:** The latest CI result for this commit is pending review; this is mock-backend browser coverage, not real Supabase or two-user verification.
- **Production/data impact:** No changes to runtime app, database schema or user data.
- **Next:** Verify updated CI and fix any issue; then add stronger Food conflict/outbox test coverage without modifying production.
- **Security:** `SECURITY-DEFERRED-2026-10-12` remains on hold at user's request.



### 2026-10-12 — Food offline-to-online retry smoke coverage

- **Previous CI evidence:** [Full UI run #38179694848](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38179694848) SUCCESS, including Workout CRUD, Workout Schedule mirror and noop regression checks.
- **Change:** `scripts/smoke-full-ui.cjs` simulates offline browser mode and checks Food Library and Food Diary upserts do not falsely report success or reach mocked backend; restores connectivity and exercises successful retries, duplicate-free Food Diary write, and deleted product non-resurrection.
- **Commit:** `0d5dbbbf628121f68e946b00300f206d354d003d`.
- **Tests:** Await CI result for modified browser smoke test; mock backend tests do not prove all real-device/offline sync paths.
- **Production/data:** No application runtime source or Supabase production data changed.
- **Security:** `SECURITY-DEFERRED-2026-10-12` remains intentionally deferred.
- **Next:** Inspect CI; fix failures without bypass; improve offline queued Food conflict/deletion coverage once baseline passes.



### 2026-10-12 — Workout sync test coverage promoted to CI

- **Previous verification:** [Full UI smoke #38179540966](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38179540966) SUCCESS for Account Snapshot / Daily / Weight checks.
- **Change:** `.github/workflows/full-ui-smoke.yml` now also runs existing `tests/workout-supabase-table.cjs`, `tests/workout-schedule-table-mirror.cjs`, and `tests/workout-sync-noop-regression.cjs`.
- **Commit:** `df125ea27849dcc88c748da4ce0468578c2e96f8`.
- **Tests:** Final CI result for this commit still must be checked. Workout tests use fixtures/mocks and are not live cross-account or real-device sync verification.
- **Deployment/data:** No application source, database schema, permissions or records changed; only CI workflow and docs.
- **Next:** Review GitHub Actions result, address test failures without bypass; then expand Food CRUD/offline synchronization coverage.
- **Security:** `SECURITY-DEFERRED-2026-10-12` remains paused by owner and remains a commercial launch blocker.



### 2026-10-12 — Promote account sync, Daily and Weight regression checks into CI

- **Scope:** Automated verification only, no production app/database changes; deferred security item SECURITY-DEFERRED-2026-10-12 remains deferred.
- **Changed:** `.github/workflows/full-ui-smoke.yml` (commit `e53bf90ac1e9a83aa9338339fd87cc52f4ce9940`).
- **Added CI checks:** `tests/account-pages-snapshot-sync.cjs` (two isolated browser contexts, same test account, account snapshot roundtrip), `tests/daily-history-supabase-hydration.cjs` (Daily archival load/idempotency), `tests/weight-table-bridge.cjs` (Weight create/retry/delete). Existing Chromium smoke still runs first.
- **Verification:** Await GitHub Actions run result; tests simulate Supabase responses and do not establish true user-to-user RLS isolation.
- **Data/deployment impact:** No database modifications or migration applications; no user data affected.
- **Next:** Inspect full-ui-smoke workflow outcome, correct any genuine regression, then extend Food/Workout normalized sync tests. Do not resume the deferred security phase without a request.



### 2026-10-12 — SECURITY-DEFERRED-2026-10-12: Security staging and advanced RLS testing paused by owner

- **Decision:** Owner explicitly requests skipping the paid staging/local RLS isolation work for now and returning only when requested. This is DEFERRED, not passed or cancelled.
- **Reason:** Current budget/priorities. No paid Supabase staging branch was created.
- **Still open:** Apply/test `supabase/migrations/20261012_revoke_excess_table_privileges.sql` in safe staging; verify excess TRUNCATE/TRIGGER grants removed; test two genuinely separate accounts' negative CRUD/RLS; confirm cross-device data isolation; review leaked-password protection.
- **Evidence/files:** `docs/SUPABASE-SECURITY-AUDIT.md`, `docs/RLS-NEGATIVE-READ-PROBE.md`, `supabase/security-grants-verification.sql`, `tests/security-migration-safety.cjs`. Static and read-only checks exist but are not a full security certification.
- **State:** Production permissions unchanged. No application or user data modified. Do not apply the migration or create paid services without explicit renewed approval.
- **Resume trigger:** User says `Resume SECURITY-DEFERRED-2026-10-12` / `ارجع لاختبارات الأمان المؤجلة`.
- **Next active work:** Continue unrelated, non-destructive ProgressX improvements (Food/Daily/Workout/Weight UX, sync regression tests, performance) without declaring product ready for public paid launch.


### 2026-10-12 — Budget constraint: no paid staging

- Owner declined the paid Supabase staging branch due to current budget constraints. **Do not create or enable paid infrastructure without a new explicit approval.**
- Quoted branch rate was USD 0.01344/hour; no branch created and no payment incurred by this decision.
- Continue with free static CI, read-only production checks and optional local PostgreSQL/Supabase emulation using synthetic data.
- The permission-revocation migration remains UNAPPLIED to production, and real two-account CRUD isolation remains unverified.
- Next: design a no-cost local RLS regression harness and document commands; avoid database production mutations.


### 2026-10-12 — RLS read-only verification

- GitHub full UI smoke #38178220700 passed.
- Read-only role simulations found zero visible private rows for an absent synthetic authenticated identity and for anonymous visitors in the audited private tables.
- Detailed evidence: docs/RLS-NEGATIVE-READ-PROBE.md (commit a91a2d2e0451cb55b65c1738846def7674a70ada).
- No production schema or user data changes. Excessive grants remain; security migration is not applied.
- Next: approved staging environment, migration rehearsal, and actual two-user authenticated CRUD isolation tests.


### 2026-10-12 — Static security-migration verification added to CI

- **Files:** `tests/security-migration-safety.cjs`, `.github/workflows/full-ui-smoke.yml`.
- **Commits:** `9a44af0245e72e7d16276eaa9e2bafc6f872f9c1` (final test correction), `df4a14761d11dbd77bb028c2f82e6eda0ee330ab` (CI wiring).
- **Change:** automated assertion checks the pending migration has exactly 11 specific `REVOKE TRUNCATE, TRIGGER` statements for intended tables and no unexpected SQL operations; Full UI workflow now runs it on push/PR.
- **Tests:** Newly triggered GitHub Actions result must be inspected; static validation does not replace actual migration testing or RLS tests.
- **Deployment/data:** No Supabase changes, no personal data touched. Security migration remains UNAPPLIED. No staging branch exists; creating one requires separate cost confirmation.
- **Next:** Confirm GitHub CI passes; arrange separate staging with approved cost, rehearse migration/negative two-user access and verify app CRUD/sync. Never apply to production solely on static test success.


### 2026-10-12 — Stage-only least privilege migration prepared (NOT APPLIED)

- **Read-only recheck:** 11 private public tables grant TRUNCATE and TRIGGER to both anon and authenticated. Supabase project has no development branches available. Normal CRUD and RLS remain unchanged.
- **Files:** `supabase/migrations/20261012_revoke_excess_table_privileges.sql` (commit `2e5b9b1782defe7586313a33d3c42c3995c91dee`), `supabase/security-grants-verification.sql` (commit `fd724b86b2bbb81ef7ff75602a9a85feeb9817ea`).
- **Scope:** Revoke only TRUNCATE and TRIGGER from anon/authenticated for 11 verified tables, retaining CRUD, REFERENCES, all data and RLS policies; SQL saved but **NOT RUN**.
- **Tests:** Preflight grants metadata confirmed; postflight verification and two-user negative RLS tests **NOT RUN**. No staging branch exists. No claim of successful hardening yet.
- **Deployment/data:** GitHub files only; no changes to running site or production Supabase database.
- **Next:** Set up approved staging/test environment and run migration there, validate effective privileges, full application CRUD/sync and two-user isolation; only then propose production rollout. Also review leaked-password protection warning.


### 2026-10-12 — Read-only live Supabase security audit

- **Scope:** Supabase production metadata only: RLS, policies, table grants, public functions and security advisor. No database writes or user records inspected.
- **Evidence:** 20/20 public tables have RLS. Core private tables have auth.uid() owner policies; published program catalog uses intentionally public-to-authenticated SELECT policies.
- **Security issue:** Several private tables grant TRUNCATE/TRIGGER and REFERENCES privileges to anon/authenticated. PostgreSQL TRUNCATE bypasses RLS row filtering; tighten least privilege with reviewed and tested migration. Also Supabase advisor flags leaked-password protection disabled.
- **Document:** `docs/SUPABASE-SECURITY-AUDIT.md` (commit `d740c67b953677ab6566b1843b171435fb27ffe0`).
- **Tests:** Read-only schema and advisor inspection done; no live two-account negative tests and no staged permission migration yet. **NOT PRODUCTION SECURITY VERIFIED.**
- **Deployment/data impact:** Documentation only; no application, table policies, roles or user data changed.
- **Next:** Stage reviewed REVOKE of excess grants and test two accounts' RLS isolation, then verify Food/Daily/Workout/Weight CRUD and sync.


### 2026-10-11 — Login regression CI confirmed green; user confirms app works

- **Confirmation:** User reported the application works after the prior restored-account test assertion correction.
- **Automated evidence:** [Deploy ProgressXX Full App run #38156792995](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38156792995) completed **SUCCESS** for commit `d7d8d0b5a8eba7a4e7e5f2271165417df5354371`.
- **Scope:** Status verification and project documentation only; no application files, database schema or user records changed in this entry.
- **Remaining risk:** User confirmation and mocked CI do not establish complete multi-user authorization, live restored-data parity, or all-device sync correctness.
- **Next:** Audit Supabase table ownership/RLS and verify Food, Daily, Workout and Weight CRUD/sync for two independent test accounts; add negative authorization tests before paid launch.


### 2026-10-11 — Fix restored-account regression fixture count mismatch

- **Observed CI failure:** restored Food/Daily login test returned `hidden=true`, `entries=33`, `reminders=3`, `problems=[]` but expected 32 entries.
- **Finding:** Test snapshot explicitly contains one `local-test` workout record **plus** 32 mocked `legacy_workout_entries` records. Correct combined expected count is 33, not 32. This is a test-fixture mismatch, not evidence of a production account error.
- **Code changed:** `tests/login-imported-archive-regression.cjs` now expects `workouts.length + 1` and separately checks the local fixture appears exactly once, while still rejecting browser errors.
- **Commit:** `d7d8d0b5a8eba7a4e7e5f2271165417df5354371`.
- **Tests/deploy:** Updated GitHub Actions run is pending; must inspect actual outcome before marking pass. No production app, schema or user data changed.
- **Next:** Verify rerun of mandatory Pages workflow. If passing, audit account-isolated Food/Daily/Workout/Weight tables and RLS; separately confirm real restored-account login.


### 2026-10-11 — Fix hanging restored Food/Daily login CI regression

- **Symptom:** Pages deploy #38155895490 stayed in progress on `Required restored Food and Daily account login regression` after prior login UI regression succeeded.
- **Root-cause hypothesis:** Failure handler in `tests/login-imported-archive-regression.cjs` set `process.exitCode=1` but left Playwright Chromium running; a thrown assertion could keep Node alive until job timeout, masking the error. Confirm actual failing assertion from next CI log; this is a hang fix, not proof the underlying regression passes.
- **Files changed:** `tests/login-imported-archive-regression.cjs`, `.github/workflows/deploy-pages.yml`.
- **Commits:** `0750b4f069d89ebe024ffe334ac3b72e52afc054` (fail fast on error with stack); `7f49a6756edd8566dc5b5544628c79c41a9c07dc` (re-run deployment validation when either mandatory login test changes).
- **Tests/CI:** GitHub run on latest workflow commit pending verification. Do **not** mark pass until required regression and Pages deploy complete.
- **Deployment/data impact:** Test/CI only. No application data or schema touched; deploy remains gated.
- **Risk:** Actual mock-account test may fail even after hanging process is fixed; test quality and real Supabase two-user isolation remain unverified.
- **Next:** Inspect latest Pages CI run, capture first failing assertion; fix genuine login hydration bug without disabling tests, then proceed to Food/Daily/Workout/Weight RLS audit.


### 2026-10-11 — Make login regression checks mandatory for Pages deploy

- **Scope:** CI deployment gate for existing login recovery tests (not an application behavior change).
- **File changed:** `.github/workflows/deploy-pages.yml`.
- **Commit:** `2297115beebb3014b2c693682c7bd971b285fb5e`.
- **Change:** After existing mobile smoke test, require `node tests/login-optional-render-recovery.cjs` and `node tests/login-imported-archive-regression.cjs` to pass before Pages artifact upload/deploy. Restored Food/Daily login tests were previously present but not explicitly called by deploy workflow.
- **Tests:** As of logging, [deployment run #38155895490](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38155895490) and [full-UI smoke #38155895425](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38155895425) were QUEUED — **NOT VERIFIED**, must inspect final conclusions.
- **Deployment/data:** No database or user data changes; deployment of workflow update pending CI.
- **Risk:** Tests use mocked account responses, not a live Supabase two-user/RLS verification. Existing tests must actually pass in CI. A real restored account may still exhibit the prior exception.
- **Next:** Inspect queued CI results; on failure diagnose/fix without bypass. Then test two-account RLS isolation and audit Food/Daily persistence.


### 2026-10-11 — Persistent development log and future-chat continuity

- **Scope:** Documentation/process only; no application code or data modified.
- **Files:** `docs/DEVELOPMENT-LOG.md`; README and handoff documentation cross-links/rules.
- **Change:** Introduced append-only development history, mandatory per-task closeout checklist, persistent last-known state and explicit next step for future chats.
- **Commit:** See GitHub history for this documentation change.
- **Tests/CI:** Documentation checked by re-fetch from GitHub; no functional test implied. Any triggered CI must be inspected separately.
- **Deployment/data impact:** No intended runtime, schema or user-data changes.
- **Risks:** The log only updates when future contributors actively commit new entries; it is not a background auto-logger.
- **Next step:** Verify `undefined.filter` login regression on live deployed root site with safe restored-account test, then map Food/Daily sync and RLS.

### 2026-10-11 — Initial README, roadmap and handoff created

- **Scope:** Documentation baseline for future chats.
- **Files:** `README.md`, `ROADMAP.md`, `docs/PROJECT-HANDOFF.md`.
- **Commits:** `cab205f8ac2795bcee2b9376b61d48a269111880`, `062d2861f7ba05eb8611b1dd8037ddd02994f2a7`, `09c28192fa1bfa2d26027ad0df4c8a82b383d160`.
- **Tests/CI:** Document files fetched and confirmed present; no functional production certification.
- **Deployment/data impact:** No application changes.
- **Known risk:** Security and end-to-end persistence not yet certified.
- **Next step:** Phase 0/1 in ROADMAP; investigate restored-account login regression first.

### 2026-10-11 — Last observed application regression commit (historical observation)

- **App commit:** `f2ee3f45562ded0c5ac7f2037625c438ad521b94`: login Food/Daily `undefined.filter` crash regression with restored archive fixtures (#15).
- **Observed CI:** [Full ProgressXX migration smoke #38154374844](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38154374844) — success.
- **Observed deploy:** [Deploy ProgressXX Full App #38154374610](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38154374610) — success.
- **Caution:** Fixtures and CI cannot prove every real account is fixed. Recheck latest runs each new session.
- **Next step:** Test real restored account + distinct user data isolation and compare with current production state.
