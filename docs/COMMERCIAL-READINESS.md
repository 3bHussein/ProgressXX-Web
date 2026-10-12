# ProgressX Commercial Readiness — Release Control

**Started:** 2026-10-12
**Release candidate:** NOT APPROVED
**Production URL:** https://3bhussein.github.io/ProgressXX-Web/
**Authoritative code:** root `index.html`; `commercial-v1.html` is NOT a release target.
**Interpretation:** This is an operating gate, not a certification. No billing or external customer onboarding until P0 acceptance is verified.

## Required gates and proof

| ID | Priority | Acceptance evidence | Status |
| --- | --- | --- | --- |
| DATA-01 | P0 | Independent backup and restore into safe test environment with counts and no leaked records | BLOCKED / NOT VERIFIED |
| AUTH-01 | P0 | Two distinct real test accounts, denial of cross-account read/update/delete, direct API negatives and RLS/grants evidence | DEFERRED / NOT VERIFIED |
| SYNC-01 | P0 | Atomic server-side version-checked writes, stale snapshot returns conflict without changing stored data | BLOCKED / NOT DEPLOYED |
| SYNC-02 | P0 | Two real devices: Food, Food Library, Saved Meals, Daily, Workout and Weight add/edit/delete, refresh and sign-out/in | NOT VERIFIED |
| SYNC-03 | P0 | Offline retry, simultaneous write, deletion resurrection and conflict-resolution acceptance | NOT VERIFIED |
| ACCOUNT-01 | P0 | Signup, confirmation, login, refresh, reset and deletion verified; old restored-data filter error retested | NOT VERIFIED |
| QA-01 | P1 | Latest required Full UI, fast contracts and Pages runs green for same deployed SHA | VERIFIED for runtime c1a6d6f — matching main checks and byte-exact root deployment; documentation-only closeout follows |
| MOBILE-01 | P1 | Real Android and responsive PWA checks, accessible navigation and cross-browser smoke | NOT VERIFIED |
| OPS-01 | P1 | Restore/rollback playbook, monitoring, incident owner and support route | NOT VERIFIED |
| LEGAL-01 | P1 | Reviewed privacy notice, terms, retention/deletion process and country-specific legal requirements | NOT VERIFIED |
| BILL-01 | P1 | Test-mode server-verified subscriptions, receipts, webhook idempotency and cancellation/refund lifecycle | NOT STARTED |
| BETA-01 | P1 | Voluntary consented testers, issue triage, P0/P1 closure and rollback rehearsal | NOT STARTED |

## Immediate execution order

**Batch A — Free / safe work now**
1. Record the actual GitHub Actions results and deployed commit SHA. Never assume green from an existing workflow file.
2. Complete the manual read-only inventory of sync endpoints, account ownership, local storage and data domains.
3. Prepare sanitized backup/restore commands and obtain evidence of restore without placing real data in public GitHub.
4. Execute the [beta acceptance matrix](BETA-ACCEPTANCE-MATRIX.md) on authorized disposable test accounts only.
5. Fix evidenced login, mobile, Food and Daily defects with automated regression tests.

**Batch B — Server data safety (approval required before changing production)**
1. Obtain verified, restorable backup and a separate staging database.
2. Audit real grants, RLS and direct-write paths using two accounts.
3. Implement transactional CAS on the server and prohibit old unconditional direct writes only during an approved migration.
4. Verify old-client handling, conflict UI, deletion preservation and safe rollback.
5. Repeat full two-device acceptance; sign off P0 only with evidence.

**Batch C — Commercial services**
1. Draft privacy/terms/account deletion documents for review.
2. Provide support email, incident response, monitoring and retention controls.
3. Integrate billing in test mode with *server-validated* entitlements and webhook retries.
4. Run controlled private beta, resolve blockers and capture deployment/rollback evidence.
5. Owner makes the explicit GO/NO-GO decision.

## Go / No-go rule

**NO-GO** if any P0 item is NOT VERIFIED, failed, deferred, or if the deployed SHA cannot be confirmed against required CI. Mock test passes never count as real RLS, CAS or recovery evidence. Unverified items stay open.

## Costs and owner exception

`SECURITY-DEFERRED-2026-10-12` remains deferred as requested. Free QA and product work continue; **no paid staging, privilege migrations, paid billing activation or security claim** without explicit permission. This exception does not waive pre-sale protection requirements.

## Evidence recording

For each completed item record commit SHA, exact test/device/account fixture, UTC timestamp, GitHub Actions URL/result, backup restore evidence, production deployment SHA and rollback path. Do not put customer exports, credentials, health records or personal workout logs in this public repository.

Commercial readiness percentage **55–65%** is the historical subjective estimate, not a measured pass rate; do not increment it just because this document exists.

## 2026-10-12 — Confirmed production root synchronization finding

Source review of root `index.html` (blob `a9c580fbbda53863d25fd14d7dd9238ab58cf68c`) confirms `async function flush()` still performs an unconditional POST to `user_app_snapshots?on_conflict=user_id`, sending `{user_id:account,payload:{...values},updated_at:new Date().toISOString()}`. This replaces the full snapshot without an atomic server-side expected-revision predicate. Successful browser/unit tests cannot rule out a stale device restoring a deleted Food/Daily entry or erasing an unrelated device's update. **SYNC-01 P0 is CONFIRMED OPEN, NOT RESOLVED.**

**Required safe fix:** verified restorable backup; isolated staging; owner-account RLS validation; server-side atomic revision compare-and-swap function that rejects stale revisions and returns authoritative snapshot; client changes retaining local drafts and offering explicit conflict review; two-device deletion/edit regression; old-client version compatibility; only then controlled production cutover with rollback. A client-side read-before-write check is NOT sufficient because two devices can pass the check simultaneously. No production DB or runtime mutation authorized/performed in this review.

## 2026-10-12 — P0 database privilege audit (read-only, verified)

Connected production inspection verified `public.user_app_snapshots` has RLS enabled and owner predicate `auth.uid() = user_id` on the existing ALL policy, with `USING` and `WITH CHECK`. However, `information_schema.role_table_grants` shows **both `anon` and `authenticated` roles have TRUNCATE, REFERENCES, TRIGGER, DELETE, INSERT, UPDATE and SELECT grants**. In PostgreSQL, **TRUNCATE is not constrained by row-level security**; this is a critical privilege exposure that requires a separately authorized, carefully sequenced privileges fix. The read-only metadata result does not by itself prove whether an external REST API route exposes TRUNCATE; don't assert successful exploitation. Do not revoke production privileges or claim safety until backed-up tests verify necessary legitimate app operations and expected denial for TRUNCATE and cross-account access. The underlying full-snapshot legacy POST also remains atomic-CAS unsafe. **AUTH-01 P0 OPEN.** Owner's paid testing deferral does not waive a commercial safety gate.

Planned corrective test sequence: (1) confirm current backups and safe restoration, (2) test grant reduction on isolated clone, (3) remove unneeded table-level TRUNCATE/REFERENCES/TRIGGER grants, including those inherited from PUBLIC if any, (4) preserve only necessary API privileges guarded by owner RLS, (5) verify direct client negative access and daily/food/sync regression, (6) apply reviewed production changes only after explicit owner approval. No SQL mutations made in this audit.

## 2026-10-12 — Work task recovery verification

Milestone 2 remains IN PROGRESS. Sequential PostgreSQL 17 CAS reference run [#38270129009](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38270129009) SUCCESS, with assertions and transaction rollback verified from logs. The new independent-session race integration still needs its own CI result. Root pending-baseline, workout hydration race and Analytics argument fixes have focused local Node/Chromium evidence, including stale-device hold and recovery export; these use synthetic data and mocked APIs. Full UI/Fast/new PostgreSQL/deployment evidence will be appended after completion. DATA-01, AUTH-01, SYNC-01/02/03 remain OPEN; local mocked passes do not close live safety gates. No production database or paid service changes; launch NOT APPROVED; historical subjective 55–65% estimate unchanged.

**Local Work task verification (2026-10-12):** 59/59 Node/Chromium checks PASS on the current source, covering all Full UI registered tests plus security migration source safety and login optional-render isolation. `git diff --check` and Python concurrency-harness compilation PASS. PostgreSQL concurrency runtime and fresh remote CI/deployment remain NOT VERIFIED until recorded below. No live-account or production SQL tests were performed.

## 2026-10-12 — Work task PR #16: verified concurrent PostgreSQL CAS and CI follow-up

**Commit / PR:** [3f24165](https://github.com/3bHussein/ProgressXX-Web/commit/3f241652c573e8f2b4c6daa8bb5569ce2e336d8a), [PR #16](https://github.com/3bHussein/ProgressXX-Web/pull/16). PostgreSQL 17 [#38273401672](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38273401672) SUCCESS; both sequential rollback assertions and eight independent-session first-write/update races are verified from job logs. Each race has exactly one winner, seven conflicts, and stale deleted-list replay rejection. Synthetic SQL reference only, not Supabase authenticated RPC/RLS.

**CI results on implementation commit:** Fast conflict [#38273401690](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38273401690), cross-device snapshot #38273401813, workout Chromium #38273401683, workout table #38273401641, weight #38273401608, schedule #38273401605 all SUCCESS. Full UI [#38273401866](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38273401866) FAILED despite 59/59 local checks: automatic Daily alarm already open invalidated the keyboard test's focus origin, and account normalization status overwrote paused-conflict wording after reload.

**Follow-up source / tests:** `index.html` `tell()` now keeps explicit `Sync paused for conflict review` in every status while a conflict hold exists. Browser stale-device regression also asserts a new local edit cannot hide the hold. Alarm keyboard fixture waits for full gate-hidden initialization and dismisses an existing automatic alarm before opening its test dialog; real focus restoration assertions remain unchanged. Focused Chromium tests PASS. Fresh remote Full UI/deployment pending verification; do not claim merged/deployed yet.

**Impact / next:** Production Supabase data/tables/grants/RLS/migrations unchanged; paid features untouched. Milestone 2 IN PROGRESS and commercial NO-GO. Verify follow-up PR workflows, merge only after all checks green, inspect matching root Pages deployment, then record evidence. Approved staging/verified backup/authenticated isolation and real-device acceptance remain required before production CAS.

## 2026-10-12 — Work task complete: merged recovery fixes, green CI and verified root deployment

**Source commits:** [3f24165](https://github.com/3bHussein/ProgressXX-Web/commit/3f241652c573e8f2b4c6daa8bb5569ce2e336d8a), [b449085](https://github.com/3bHussein/ProgressXX-Web/commit/b449085b952b52efb259f2c294c7277936953140), merged via [PR #16](https://github.com/3bHussein/ProgressXX-Web/pull/16) into [c1a6d6f](https://github.com/3bHussein/ProgressXX-Web/commit/c1a6d6f421bfdeb52e6790f84df5d9dc28de4a5e). This final documentation-only closeout updates DEVELOPMENT-LOG, PROJECT-HANDOFF, ROADMAP and COMMERCIAL-READINESS; runtime source is unchanged.

**Verified checks:** 59/59 local Node/Chromium checks PASS on the pushed follow-up source. All eight PR workflows on b449085 SUCCESS, including Full UI [#38274049474](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38274049474), Fast [#38274049461](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38274049461), PostgreSQL [#38274049563](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38274049563), cross-device snapshot #38274049489, workout Chromium #38274049463, workout table #38274049478, weight #38274049632 and schedule #38274049469.

**Main/deployment:** Full UI [#38274340006](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38274340006), Fast [#38274340125](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38274340125), PostgreSQL [#38274339969](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38274339969), Deploy Full App [#38274339939](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38274339939) and Pages [#38274338554](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38274338554) all SUCCESS on c1a6d6f. HTTP retrieval of the root URL with cache-busting query matched tested `index.html` byte-for-byte; SHA-256 `beb238837feef781adb5dd40c8fea4aa75d5b3217b379c1c5178270ff727b4a5`. Only root index.html is the production target.

**Completed parts:** acknowledged pending-baseline recovery after newer edits/mirror failure; account workout hydration before startup refresh; restored Analytics metrics argument; locked-workspace refresh guards; persistent conflict-hold status; real browser stale-deletion hold/reload and read-only review/pair export; repaired preflight-aware test fixtures and release classifier; PostgreSQL 17 independent-session CAS create/update races and stale deletion replay tests. Mock/synthetic limits are explicit.

**Data / release:** No production Supabase table/grant/RLS/migration mutation, real-account writes, personal exports, paid services or security activation. Existing data preserved. Client read-before-write remains non-atomic. Milestone 2 **IN PROGRESS / partially verified**, not complete; DATA-01, AUTH-01, SYNC-01/02/03 remain OPEN, commercial launch **NOT APPROVED**, historical subjective 55–65% estimate unchanged.

**Exact next gate:** Obtain independently verified restorable backup and a separately authorized safe staging environment; test authenticated owner-specific atomic RPC, cross-account read/write negatives and necessary grants, including old-client direct-upsert lockout; then complete real two-device Food/Food Library/Saved Meals/Daily/Workout/Weight CRUD, offline/concurrent/deletion recovery. Production CAS/grants rollout needs explicit approval plus verified backups. Do not merge old draft PR #10 wholesale: it targets an older base and contains unapproved server migration proposals. No further production changes are requested until these prerequisites are concrete.

## 2026-10-12 — Owner CAS/RLS/restore acceptance prepared in disposable PostgreSQL

**Scope:** `tests/postgres-owner-cas-fixture.sql`, `tests/postgres-owner-cas-acceptance.py`, `tests/postgres-owner-cas-guard.py`, PostgreSQL CI workflow and `docs/ISOLATED-OWNER-CAS-RESTORE.md`; accompanying tracking changes in DEVELOPMENT-LOG, PROJECT-HANDOFF, ROADMAP and COMMERCIAL-READINESS. Commit/PR/CI links follow once remote execution finishes.

**Prepared:** owner-derived CAS without a caller-supplied owner argument, forced RLS, exact cross-owner/anonymous/invalid-input denial assertions, app legacy-upsert lockout, narrowly privileged non-owner NOBYPASSRLS writer RPC, eight-session first-write/update races, stale Food/Daily deletion replay rejection, actual root snapshot storage keys/unknown-field preservation. Real pg_dump and fresh-database restore compare all owner IDs/revisions/payload fields and recheck RLS/grants, stale rejection and valid CAS; source must remain unchanged. Fixture uses injected synthetic identity claims, NOT real Supabase JWTs. It is NOT a production migration.

**Guard validation:** 2 local Python guard tests PASS (six rejected target configurations before any subprocess, plus sanitized PG overrides with pinned loopback/database/user). Python compilation and whitespace checks PASS. PostgreSQL acceptance runtime is NOT VERIFIED until CI result. Use the service's pg_dump 17 instead of assuming Ubuntu client major matches the database.

**Design finding:** Revoking direct app writes breaks the earlier SECURITY INVOKER RPC if caller privileges stay unchanged. New private-schema test-only definer uses a NOLOGIN/NOSUPERUSER/NOBYPASSRLS non-table-owner writer with FORCE RLS and empty search_path to test restricted mutation routing. This architectural experiment needs separate review/JWT/API evidence before it can become a Supabase proposal.

**Data/deployment:** No production Supabase reads/writes, tables/grants/RLS/migrations, real accounts/exports or paid features touched. Root index.html unchanged; no new runtime deployment intended. Existing production recovery source remains the verified PR #16 runtime. Milestone 2 IN PROGRESS, commercial NO-GO; live AUTH-01/DATA-01/SYNC-01/02/03 remain OPEN. Next: run all PR workflows, fix actual SQL failures, record exact successful isolated evidence; then require approved real staging and verified production backup before live rollout.
