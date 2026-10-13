# ProgressX Commercial Readiness — Release Control

**Started:** 2026-10-12
**Release candidate:** NOT APPROVED
**Active work:** Phase 3 frontend/mobile/accessibility; all database experimentation paused by owner on 2026-10-13 Cairo. No automatic database CI; old staging/backup plans must not resume without a new explicit request.
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
| QA-01 | P1 | Latest required Full UI, fast contracts and Pages runs green for same deployed SHA | VERIFIED for UI runtime 68a8a26 — seven PR UI/mock checks and matching main Full UI/Fast/Deploy/Pages SUCCESS; root/worker byte-exact; database experiments paused |
| MOBILE-01 | P1 | Real Android and responsive PWA checks, accessible navigation and cross-browser smoke | PARTIAL — selected Chromium/Firefox/WebKit frontend fixtures PASS locally and in PR/main CI (PR #22); actual Android/iPhone/Safari and full device/PWA acceptance NOT VERIFIED |
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

## 2026-10-12 — Verified owner CAS/RLS/legacy lockout and real isolated restore

**Commit / PR:** [054b496](https://github.com/3bHussein/ProgressXX-Web/commit/054b4960369abb6c5e47352160c58882f6cbd000), [PR #17](https://github.com/3bHussein/ProgressXX-Web/pull/17) MERGED as [f1004cf](https://github.com/3bHussein/ProgressXX-Web/commit/f1004cf56b39afa64dc850bf203cd370de3c745f). Scope: test-only owner CAS SQL fixture, guarded Python acceptance/restore runner, negative target-guard unit tests, PostgreSQL workflow and isolated acceptance/tracking documents. This follow-up is documentation-only.

**Verified PR evidence:** PostgreSQL 17 [#38301607318](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38301607318) SUCCESS; job logs explicitly confirm owner RLS and cross-owner/anonymous denial, constrained writer owner, legacy direct-upsert lockout, invalid payload/revision rejection, one winner per eight concurrent first-write/update attempts, and real pg_dump restore. Full UI [#38301607300](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38301607300) and Fast [#38301607564](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38301607564) SUCCESS on the same PR head. Two guard tests PASS locally and in CI, including six unsafe target cases and sanitized PG overrides. Python compilation/diff checks PASS.

**Verified main evidence:** PostgreSQL [#38301837684](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38301837684), Full UI [#38301837754](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38301837754) and Pages [#38301836988](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38301836988) SUCCESS on f1004cf. No runtime index.html change: production root remains byte-identical to the previously verified PR #16 runtime. No Supabase migration/deployment was performed.

**Restore proof:** A real pg_dump 17 of the synthetic schema was restored into a newly created separate database. Manifest equality verified all 3 owners, revisions, every payload field, Unicode, unknown keys and byte-exact app snapshot string values. Post-restore owner/anonymous/legacy-write/privilege/RLS negatives passed; stale CAS remained rejected and valid CAS advanced only the restored database. Backup checksum stayed unchanged; source manifest stayed unchanged throughout restore and restored writes. Temporary dump, restored database, source fixture and test roles were cleaned up; no database dump or actual user data was committed/uploaded.

**Boundary / risks:** Identities are synthetic SQL gateway claims; this does NOT verify Supabase JWT signatures, live PostgREST/RLS/grants, production backup restoration or real two-device behavior. The private-schema definer experiment has a NOLOGIN/NOSUPERUSER/NOBYPASSRLS non-table-owner writer, FORCE RLS, empty search_path and revoked PUBLIC execute; it is test-only, not an approved production architecture/migration. Existing invoker staging draft must not be applied verbatim.

**Gate / exact next action:** Free isolated owner/CAS/restore checks are VERIFIED. Live DATA-01, AUTH-01 and SYNC-01/02/03 remain OPEN; Milestone 2 IN PROGRESS, commercial NO-GO and historical 55–65% estimate unchanged. Next obtain a trusted private restorable production backup and an independently authorized Supabase staging environment, then real JWT/direct API and client CAS/old-client cutover tests plus physical computer/mobile CRUD/offline/delete matrix. Production schema/grants/RLS/CAS changes need explicit approval and verified backups. No production accounts/data/tables/grants/RLS/migrations or paid services were changed.

## 2026-10-13 Cairo (2026-10-12 UTC) — Owner paused database experiments; Phase 3 mobile/accessibility started

**Owner instruction:** Stop database experimentation and move to the next phase because of reported free-database concerns. Cause of the reported issue is NOT VERIFIED; the supplied screenshot was unavailable locally. Previous PostgreSQL acceptance ran in disposable GitHub service databases, not production Supabase. Regardless, all further database experiments/backup/staging work is paused until a new explicit owner request. Normal production app sync is not disabled.

**Scope:** root `index.html`, PostgreSQL/Full UI workflow files, `tests/database-experiments-paused.cjs`, `tests/mobile-motion-anatomy-accessibility.cjs` and project tracking/acceptance documents. Implementation commit/PR and remote evidence follow after CI.

**Database pause:** Removed PostgreSQL push/PR triggers. Manual workflow defaults to false and job requires workflow_dispatch plus explicit true owner-resume input; no SQL service starts otherwise. Added source guard regression to Full UI, with no SQL execution.

**Phase 3 improvements:** UI CSS and explicit scroll options respect prefers-reduced-motion; keyboard focus indicators, bilingual named/focusable anatomy image controls, Enter/Space opening, labelled zoom dialog, named zoom buttons, Tab/Shift-Tab containment, Escape/close focus restoration and Android back callback closing zoom first. Anatomy/online-food image decoding is asynchronous while lazy-loading remains intact. No quantified performance gain claimed.

**Verification:** 61 local Node/Chromium/static checks PASS, including root UI widths 320/390/768, reduced-motion vs normal scroll, zoom keyboard/touch layout, focus restoration and Android back callback. The new UI test intercepts external requests and asserts zero Supabase requests. Exact revised pause guard, script syntax and whitespace checks PASS. No PostgreSQL/pg_dump/production DB tests executed. Fresh CI and deployment NOT VERIFIED until recorded in closeout.

**Data / gate:** No schema/grants/RLS/migrations, production data, sync protocol, paid services or user history changed. Only root index.html is the runtime target. Milestone 2 remains PAUSED/INCOMPLETE; pre-sale safety gates remain OPEN and commercial launch NOT APPROVED. Phase 3 is IN PROGRESS; physical Android/cross-browser/PWA/load and wider accessibility still require evidence. Historical 55–65% estimate unchanged. Next: verify UI-only PR checks and root deployment with PostgreSQL absent/skipped, then continue frontend performance/mobile quality without database experiments.

## 2026-10-13 Cairo (2026-10-12 UTC) — Phase 3 UI batch merged/deployed; database experiments paused

**Commit / PR:** [b88ce1a](https://github.com/3bHussein/ProgressXX-Web/commit/b88ce1a2a303683011b276b1b57fd927903f5e47), [PR #18](https://github.com/3bHussein/ProgressXX-Web/pull/18) MERGED as [e772ab3](https://github.com/3bHussein/ProgressXX-Web/commit/e772ab328a1ab3121d93ac0d3f4ed533c0c0c814). This follow-up is documentation-only; UI source is unchanged.

**Verified:** 61 local Node/Chromium/static checks PASS. Seven PR client/UI/mock workflows SUCCESS, including Full UI [#38309224502](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38309224502) and Fast #38309224419; no PostgreSQL run registered. Main Full UI [#38309482027](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38309482027), Fast [#38309482002](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38309482002), Deploy Full App [#38309481961](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38309481961) and Pages [#38309481986](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38309481986) SUCCESS on e772ab3. Main run listing contains no PostgreSQL workflow; pause regression PASS. Supabase-labelled client contracts are mocks/source checks, not database connections.

**Deployment:** Cache-busted HTTP root index.html response matches tested source byte-for-byte; SHA-256 `dea490dc4038b1a6bd0d12f5d027333c29844c26f0c243bd1eeebfb03a11fb9f`. Production target remains root index.html.

**Completed UI scope:** reduced-motion CSS and explicit scroll behavior; visible keyboard focus; named/focusable anatomy image controls; Enter/Space opening; labelled zoom dialog, named controls, focus containment/restoration, Escape and Android back callback; lazy asynchronous image decoding. Chromium fixture widths 320/390/768 passed with zero Supabase requests. Real Android/other engines/performance gains are NOT VERIFIED.

**Persistent owner rule:** DATABASE-EXPERIMENTS-PAUSED-2026-10-13. No PostgreSQL/Supabase/staging/backup experiments until a new explicit owner request. Database workflow has no push/PR trigger and default-false manual resume requiring workflow_dispatch + true opt-in. No SQL/pg_dump/production DB experiments performed in this task. Normal app synchronization remains unchanged/enabled; no production rows, grants, RLS, schema, migrations or paid services changed.

**Exact next authorized step:** Phase 3 frontend mobile/PWA/performance/accessibility work using local fixtures and mocked requests. Keep database work paused. Milestone 2 remains paused/incomplete, all unverified live safety gates remain open and commercial launch is NOT APPROVED. Historical 55–65% estimate unchanged. Do not automatically return to historical staging/backup plans or infer that reported free-database issue was caused by prior isolated tests.


## 2026-10-13 Cairo — Phase 3 scoped offline PWA shell

Fixed `sw.js` root-folder and query-string offline fallback using canonical scope-local public asset keys; v2 cache update excludes API/other paths, waits for cache writes, and retains the working shell after HTTP errors/redirects. No root `index.html`, browser account storage or database changes. Added VM lifecycle/cache regression and actual Chromium offline-shell regression to Full UI CI. Unrelated caches and synthetic draft localStorage are preserved; zero Supabase requests in the offline browser fixture.

Local verification: 62/63 checks passed in the parallel sweep; full UI smoke initially timed out at mock sign-out, then passed on an isolated rerun without code changes. Both new PWA tests PASS. Remote CI/deployment NOT VERIFIED pending this PR. Physical Android install, cross-engine support, offline authenticated data and rollback remain unverified. Database experiments remain paused; commercial launch NOT APPROVED. Next: verify PR/Main UI checks and deployed root/sw bytes, then continue mobile/PWA permission and update checks with mocks.


## 2026-10-13 Cairo — PR #19 verified PWA closeout

[PR #19](https://github.com/3bHussein/ProgressXX-Web/pull/19), source `74c9a514`, merged as `86a5c13a611c97f567a243c2ea1f4be565be500f`. PR [Full UI 38312547067](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38312547067) and [Fast 38312547060](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38312547060) SUCCESS. Matching main [Full UI 38312780947](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38312780947), [Deploy Full App 38312780922](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38312780922) and [Pages 38312780450](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38312780450) SUCCESS. No PostgreSQL workflow triggered; main Fast has path filters and was not triggered for this service-worker-only runtime change.

Live root and `sw.js` fetched over HTTP and compared byte-for-byte with source: root SHA-256 `dea490dc4038b1a6bd0d12f5d027333c29844c26f0c243bd1eeebfb03a11fb9f`, worker SHA-256 `323f5022828b49efc6b39105e1c53e92716f73e74a9da738aec0dd1d56db4515`. Public offline shell regression VERIFIED locally and in CI; this does not certify offline authenticated data or real-device PWA installation. No database requests/experiments, schema/grants/RLS changes or user-data migration. Database pause remains in force; Milestone 2 incomplete and commercial launch NOT APPROVED. Next: mock-only PWA permission denial/update and further mobile accessibility; owner-device Android acceptance remains outstanding.


## 2026-10-13 Cairo — Phase 3 install/permission/update recovery

Root `index.html`: install prompt single-flight/disabled busy state, accessible status announcements, dismissal and synchronous/asynchronous/choice error recovery, accepted versus confirmed-installed status, and loopback install help. No automatic document reload or account storage changes. Added `tests/pwa-install-permission-recovery-browser.cjs` (synthetic browser events, denied/unsupported/failed notification requests, denied camera with manual fallback) and `tests/pwa-update-failure-browser.cjs` (actual scoped Chromium worker update/failing precache; local server refuses connections; fresh-launch shell and synthetic localStorage/IndexedDB/unrelated cache retention). Both fixtures assert zero Supabase requests. Registered in Full UI; acceptance limits and remaining real-device checks in `docs/PWA-LOCAL-ACCEPTANCE.md`.

Final local suite: **65/65 PASS**. Initial update fixture had transition/navigation timing failures; final fixture waits for the new controller and validates fresh launch, not every in-flight navigation on an existing document. Remote CI/commit/deployment pending this batch. Physical Android/OS installation, cross-engine, live rollback and authenticated offline data remain NOT VERIFIED. No SQL/database experiments, production tables/grants/RLS/migrations or paid services changed. Database pause and commercial NO-GO remain. Exact next step: verify PR/main UI checks and deployed root/worker bytes, record closeout; continue frontend accessibility/mobile checks with mocked requests.


## 2026-10-13 Cairo — PR #20 deployed install/permission recovery

[PR #20](https://github.com/3bHussein/ProgressXX-Web/pull/20), source `1bb140a73ce0027cb2e31266e38834f23b6181b4`, merged as `5bfd73db81e95b91a0228badff33b9480c58ffe4`. Final local suite **65/65 PASS** and all seven PR UI/client-mock workflows SUCCESS: [Full UI 38319533081](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38319533081), Fast 38319532847, Page snapshot 38319532931, Workout Chromium 38319532851, Workout table 38319532873, Schedule table 38319532867 and Weight bridge 38319532859. These contracts do not access a database.

Matching main [Pages 38319716115](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38319716115) SUCCESS. At closeout, repeated main run listings showed only Pages: Full UI/Fast/Deploy Full App were **NOT TRIGGERED/NOT VERIFIED** on the merge SHA; their workflow definitions are active, but the trigger cause is undetermined. Do not substitute PR runs for matching-main evidence or claim the commercial QA gate fully closed. Observe the documentation follow-up push and investigate trigger configuration if checks still do not start.

Live HTTP root/worker byte-exact verified against tested source: root SHA-256 `64106dd7afc6aec77d455f486aa998d3a64a54ac6cf6eb856ea270363b6d230d`, worker `323f5022828b49efc6b39105e1c53e92716f73e74a9da738aec0dd1d56db4515`. See [PWA acceptance](PWA-LOCAL-ACCEPTANCE.md) for local fixture coverage and exclusions. No account data changes, SQL/database experiments, production grants/RLS/migrations or paid services. No PostgreSQL run observed. Existing app synchronization remains enabled. Physical Android/OS installation, Firefox/WebKit, authenticated offline data, live rollback and every in-flight document transition remain unverified. Milestone 2 paused/incomplete; commercial launch NOT APPROVED. Next: verify follow-up main UI CI, then frontend keyboard/Arabic RTL/mobile controls using local fixtures; keep database experiments paused.


## 2026-10-13 Cairo — Main follow-up UI verification

Documentation follow-up `a4529f9ce44269c78e56ba188f105f2a354f7c3f` triggered main [Full UI 38320055927](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38320055927) and [Pages 38320055270](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38320055270), both **SUCCESS**. `git diff 5bfd73d a4529f9 -- index.html sw.js` is empty: the root/worker runtime is exactly the already deployed and byte-verified PR #20 code. No PostgreSQL run; database pause preserved. Main UI verification for this runtime is now available on the follow-up commit; Fast/Deploy on the merge SHA remain unobserved, and their trigger cause is still undetermined. This final evidence update changes documentation only. Physical-device and commercial release gates remain open. Next authorized work: frontend keyboard/Arabic RTL/mobile controls with mocked requests, and review CI trigger/deployment gating; do not resume database experiments.


## 2026-10-13 Cairo — Mobile barcode keyboard and Arabic anatomy

Production root `index.html`: labelled barcode dialog/close button/manual input/live status, initial input focus, Tab/Shift+Tab containment, Escape and immediate focus return, Enter manual lookup, 44px mobile controls and LTR numeric input. Scanner generation and serialized cleanup now ignore old decode callbacks, stop/clear a camera whose startup completes after close, prevent duplicate opening, and delay reopening until prior cleanup completes. Existing lookup/data/synchronization behavior unchanged. Anatomy detail/list direction and language update before empty-result return; list uses logical alignment/padding/RTL selection accent and English scientific subtitle stays LTR.

Added `tests/mobile-barcode-keyboard-rtl-browser.cjs` to Full UI: widths 320/390/768, keyboard/focus/control bounds, pending-start close/reopen, Android back callback and Arabic/English empty-result transitions; zero Supabase requests with mock camera and UI-only fixtures. Limits/checklist: `docs/MOBILE-ACCESSIBILITY-ACCEPTANCE.md`. New regression PASS. Parallel sweep: **64/66 PASS**; existing full UI mock sign-out and two-device conflict-review waits timed out, then **both passed isolated reruns without code changes**. Initial new harness accidentally awaited its pending start promise; corrected before final verification. No clean 66/66 parallel run is claimed. Remote CI/PR/deployment pending. No database experiments, real accounts, SQL/schema/grants/RLS/migrations, paid services or user-data changes. Milestone 2 remains paused/incomplete and commercial launch NOT APPROVED. Next: verify PR UI/mock checks, deployed root bytes and main/follow-up CI, then continue frontend accessibility/browser acceptance without database experiments.


## 2026-10-13 Cairo — PR #21 verified mobile/RTL closeout

[PR #21](https://github.com/3bHussein/ProgressXX-Web/pull/21), source `15a0ea111dd16cf7a395d12d092b817f725e298d`, merged as `68a8a26346846c0e0430cdcbe2764dd2aa5fbc0b`. All seven PR UI/client-mock workflows SUCCESS, including [Full UI 38353176414](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38353176414) and [Fast 38353176425](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38353176425); snapshot 38353176477, Workout Chromium 38353176611, Workout table 38353176709, Schedule 38353176348 and Weight 38353176491. Matching main [Full UI 38353408898](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38353408898), [Fast 38353408893](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38353408893), [Deploy Full App 38353408879](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38353408879) and [Pages 38353408114](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38353408114) all SUCCESS. No PostgreSQL workflow ran. Current main triggers were observed; earlier PR #20 missing-trigger history remains undetermined and is not a current-runtime failure.

Actual HTTP root `index.html` and `sw.js` responses match tested source byte-for-byte: root SHA-256 `d63fff23bd3a9c62830a7f001ef0bf8abc5ae164a36cb4d66c3a26e252b1573a`, worker `323f5022828b49efc6b39105e1c53e92716f73e74a9da738aec0dd1d56db4515`. Keyboard/44px/focus behavior, late-camera cleanup/reopen/old callbacks, Android back callback and scoped Arabic anatomy/empty-result transitions VERIFIED in Chromium mock fixtures at 320/390/768. Local parallel result remains 64/66 plus two PASS isolated reruns; do not rewrite it as a clean parallel pass. See `MOBILE-ACCESSIBILITY-ACCEPTANCE.md` for exclusions. No database experiments, account data changes, schema/grants/RLS/migrations or paid services. Normal synchronization remains enabled. Physical camera/Android/screen reader/Firefox/WebKit acceptance remains open; Phase 3 is still in progress, Milestone 2 paused/incomplete, commercial launch NOT APPROVED. Next: remaining frontend keyboard/labels, browser-engine and measured-performance checks with mock data; do not resume database work.


## 2026-10-13 Cairo — Cross-browser frontend matrix

Added `tests/helpers/browser-engine.cjs` with strict `PX_BROWSER` selection/default Chromium, and reused the production-root anatomy/motion, barcode/RTL and install/permission fixtures unchanged in their assertions. Added `.github/workflows/cross-browser-ui.yml`: independent Firefox/WebKit jobs, standard Playwright 1.55.0 install/dependencies, ready-checked local HTTP server, read-only repository permission and database-pause source guard. No root `index.html`, `sw.js`, runtime data or synchronization code changes. Coverage/limits: `docs/CROSS-BROWSER-ACCEPTANCE.md`.

**Local 9/9 PASS:** three fixtures each in Chromium, Firefox and WebKit, with zero Supabase requests. Default/invalid engine selection and workflow shell syntax verified. Initial browser environment failures were resolved locally: Firefox sandbox flags in constrained executor, and separately extracted WebKit libraries/host-validation skip because isolated libraries were absent from the system cache probe. Actual assertions ran; these local arrangements are not in CI/repository. Remote standard-runner CI/PR/main verification pending; no remote pass is claimed yet. Only selected frontend fixtures are covered: full authenticated E2E, cross-engine offline worker, native install, physical Android/iPhone/Safari, screen readers and performance remain open. No SQL/database experiments, production tables/grants/RLS/migrations, user data or paid services changed. Database pause and commercial NO-GO persist. Next: verify both matrix jobs and existing Full UI/Fast, merge tested changes and record matching main/deployed byte evidence, then frontend performance/remaining accessibility.


## 2026-10-13 Cairo — PR #22 cross-browser closeout verified

[PR #22](https://github.com/3bHussein/ProgressXX-Web/pull/22), source `56f46706ac3cefd63bdc63a6738cf8376c6aaa5d`, merged as `6d11b918d0708ba6bfc3fdd83167e29be097fb6e`. PR [Cross-browser 38358078916](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38358078916) (Firefox job 115165542365, WebKit 115165542703), [Full UI 38358078938](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38358078938) and [Fast 38358078900](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38358078900) SUCCESS. Matching main [Cross-browser 38358354281](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38358354281) (Firefox job 115166420476, WebKit 115166420555), [Full UI 38358354307](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38358354307) and [Pages 38358353890](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38358353890) SUCCESS. Both engine jobs completed standard dependency installation and all three UI fixtures with no local host-validation/sandbox arrangements. Fast/Deploy are path-filtered and were not triggered on this test-only main change; no matching-main Fast/Deploy claim is made.

**Selected frontend matrix: 9/9 local PASS and all selected CI fixtures PASS** across Chromium/Firefox/WebKit. Each fixture asserts zero Supabase requests; no account login or database experiment. Full UI also remained green. Root `index.html`/`sw.js` are unchanged (`git diff 108c643 6d11b91 -- index.html sw.js` empty). Actual public HTTP bytes match source: root SHA-256 `d63fff23bd3a9c62830a7f001ef0bf8abc5ae164a36cb4d66c3a26e252b1573a`, worker `323f5022828b49efc6b39105e1c53e92716f73e74a9da738aec0dd1d56db4515`. No PostgreSQL workflow ran, no production data/schema/grants/RLS/migrations, runtime synchronization or paid service changes. Database pause persists. Phase 3 remains IN PROGRESS; full authenticated E2E, physical Android/iPhone/Safari, screen readers, native PWA/OS permissions, cross-engine offline workers and measured performance remain open. Milestone 2 paused/incomplete; commercial launch NOT APPROVED. Next: measured frontend performance/remaining accessibility with local fixtures and mocks; do not resume database work.
