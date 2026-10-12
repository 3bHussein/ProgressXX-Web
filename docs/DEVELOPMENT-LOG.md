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
### 2026-10-12 — CAS simulation passes; Daily conflict UI recovery spec drafted

- Full UI #38189120475 **SUCCESS**, Pages #38189120489 **SUCCESS** for prior simulated CAS contract.
- Added `docs/DAILY-CONFLICT-RECOVERY-SPEC.md`, commit `9b9361278bd4933e45be3a69a2428313fe04bd3f`: proposed non-destructive conflict notice, field-by-field comparison, Keep Cloud / Keep Device / Merge / Later, durable local pending and retry against latest cloud baseline. **Design only; no conflict UI or server RPC deployed.**
- Next requires explicit DB migration approval and authenticated integration tests before production CAS activation. No production data, schema, or existing sync flow changed. Paid security verification remains deferred (`SECURITY-DEFERRED-2026-10-12`).


### 2026-10-12 — CAS two-device contract simulation, no database changes

- Confirmed Full UI #38188790240 SUCCESS and Pages #38188790364 SUCCESS for the prior unapplied SQL proposal.
- New `tests/snapshot-cas-contract-simulation.cjs` demonstrates a synthetic desktop write accepted, stale phone write rejected, preserved pending phone edit, and an explicitly resolved retry against the latest baseline. Commit `5f814a19ad6002a867999c668dff040e9992138e`.
- Wired contract test into `.github/workflows/full-ui-smoke.yml` commit `b3c79416771de9b34119d0ab552e306b73b7bfbf`. New CI result pending.
- This is **only a model/contract test**; the actual server RPC is NOT deployed, real RLS/grants, atomic concurrency and browser conflict UI are not verified. The live site continues last-writer-wins until an explicitly approved, tested migration/client rollout. No production DB or user data touched. `SECURITY-DEFERRED-2026-10-12` remains.


### 2026-10-12 — Draft server-guarded snapshot CAS, not applied

- Full UI #38188634435 SUCCESS and GitHub Pages #38188634220 SUCCESS for prior concurrency-risk reproduction.
- Created **unapplied** SQL proposal `supabase/proposals/20261012_snapshot_compare_and_swap_NOT_APPLIED.sql`: authenticated caller identity, SECURITY INVOKER, locked existing account row, compare expected snapshot to current before updating, fail closed for absent snapshots/conflicts. This is a review artifact, **NOT** a running feature or deployed function.
- Added static guard test `tests/snapshot-cas-proposal-safety.cjs`, wired into `.github/workflows/full-ui-smoke.yml`. Fresh CI pending. Atomic concurrent behavior and RLS grants require real staging verification before any production rollout.
- Existing website still uses old whole-snapshot upsert; avoid concurrent edits to the same Daily reminder. No production database migration/change. Security work stays deferred per `SECURITY-DEFERRED-2026-10-12`.


### 2026-10-12 — Synthetic concurrent Daily conflict reproduction in CI

- Confirmed latest Full UI #38188317333 **SUCCESS**, Pages #38188317315 **SUCCESS** before these new test changes.
- Added `tests/daily-concurrent-conflict-regression.cjs` in commit `c96d0c30717c9143484c42a26a20186bd32cf68b` and wired it into full UI workflow, commit `84f7b77d6e6a89b8624ff66394fb97d10c90c050`.
- Synthetic replay demonstrates whole-snapshot last-writer-wins may lose desktop changes when phone submits an older copy; regression defines common-baseline conflict check. **This test documents the vulnerability; it does NOT add protection.**
- Before changing live snapshot writes, implement atomic server-enforced compare-and-swap / versioned updates and test conflict recovery without losing locally queued edits. No production code or database edits today. Security paid stage remains deferred (`SECURITY-DEFERRED-2026-10-12`).


### 2026-10-12 — Full CI green; concurrent Daily edit conflict risk reviewed

- Full UI [#38188317333](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38188317333) **SUCCESS**, Pages [#38188317315](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38188317315) **SUCCESS**. Owner previously confirmed ordinary cross-device Daily creation/deletion works.
- Reviewed `flush()` account snapshot upsert and `__pxRefreshAccountDailyReminders()` read guard. Snapshot writes are whole-payload last-writer-wins; local pending edits prevent refresh overwrite but cannot prevent a stale device from overwriting a newer remote change on POST. **Concurrent-edit safety is NOT VERIFIED**.
- Intentionally made no untested automatic merge or destructive real-data changes. Before implementing safe conflict resolution, test with synthetic separate browser contexts, a captured baseline/version and a guarded conditional write that explicitly detects conflicts. Avoid simultaneous editing of same reminder on real devices pending fix.
- Paid security phase remains deferred (`SECURITY-DEFERRED-2026-10-12`).



### 2026-10-12 — Owner confirms Daily create/delete cross-device sync; CI fixture fix

- Owner explicitly confirmed Daily now works after Supabase add/delete refresh fix. This is user-confirmed real-device behavior, not proof of concurrent edit conflict safety.
- Pages #38187392355 and Deploy Full App #38187338277 SUCCESS. Full UI #38187392401 FAILED after successful app smoke and eight-group cross-context snapshot tests because isolated VM test forgot `DAILY_REMINDERS_KEY`, causing false failure `1 !== 0` for an explicit empty list.
- Corrected fixture constant in `tests/daily-history-supabase-hydration.cjs`, commit `d3ac97721e470d7770c89f325c6ade2e60d1fb53`. Await new full CI result.
- No production data / schema changed and no security scope expanded. `SECURITY-DEFERRED-2026-10-12` remains.

### 2026-10-12 — Real-device Daily deletion not syncing; retired Apps Script warning

- Owner reported real Daily reminder create sometimes appears on other device, but **deletion does not propagate in either direction**. Daily UI said `Apps Script URL is missing.`, caused by retired `syncRemindersFromSheet()` being called on Daily navigation, focus and timer while still requiring legacy Apps Script.
- Replaced that Daily list refresh with signed-in **Supabase snapshot GET**, including an explicitly empty `[]` list as authoritative deletion. Never overwrite local unsynced/pending edits or write fetched values back to cloud; refresh UI from the restored account list. Root commit `c7fd95ea628b5cb94de8f35548c4ce089746721e`.
- Added regression for remotely added/removed lists, empty list, pending local edits, and absence of Apps Script calls in `tests/daily-history-supabase-hydration.cjs`, commit `7dbbeb8d53ba888c7081f3928470c8fca3b360b3`.
- CI and real-device confirmation **pending**. Previous CI #38186889487 failed, new tests await verification. No production data deletion/schema edits. User's security-cost deferral `SECURITY-DEFERRED-2026-10-12` remains in effect.
- Follow-up: check Actions then retest creation/deletion on two devices only with labelled test reminders; do not delete historic reminders.


### 2026-10-12 — Owner Daily recheck acknowledged; repair Food smoke preload timeout

- User responded "تم نكمل" after request to retest Daily reminder list. This confirms they completed a check but does **not explicitly confirm** the lists now match; ask if mismatch persists.
- Latest Pages [#38186670494](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38186670494) **SUCCESS**. Full UI [#38186670763](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38186670763) **FAILED** at Food Diary preload wait (`smoke-full-ui.cjs:60`, timeout 12 seconds), before evaluating the updated Daily regression.
- Smoke test now explicitly awaits normalized Food refresh and checks a real account-scoped stored Food Diary record rather than hidden Food Diary DOM text (commit `87f698debd69995b015b36a577bf4a3567ab6f6e`). Fresh CI pending; do not claim green.
- No production data or database changes. Security testing remains deferred (`SECURITY-DEFERRED-2026-10-12`). Next inspect CI and if it fails, diagnose rather than weakening checks.


### 2026-10-12 — Daily list mismatch: preserve saved empty lists and add regression

- Real phone/desktop feedback: Daily reminder lists missing/different, while Workout Log and Weight match. Prior commit `65685b1` rehydrates account-specific reminder global before boot.
- Fixed `loadDailyReminders()` to treat an explicitly saved empty `[]` as user-controlled data, not repopulate default reminders, in root `index.html` commit `fdedf5537e790e84f9bbe01acc9022164bf86f40`.
- Added regression verifying empty, populated, and missing lists plus post-auth in-memory reload in `tests/daily-history-supabase-hydration.cjs` commit `27b488d90739cd7fd8ee8999cbb59f0a562a9b41`.
- Previous Full UI #38186516050 FAILED before Daily assertion while waiting for Food Diary preload (timeout, smoke-full-ui.cjs:60); Pages #38186515911 SUCCESS. Fresh CI pending. Do not claim user's Daily mismatch solved until a phone/desktop retest.
- No user records or Supabase production database changed; security testing remains deferred (`SECURITY-DEFERRED-2026-10-12`).


### 2026-10-12 — Real-device Daily mismatch, account reminder rehydration fix

- User verified Workout Log and Weight Check-ins match across phone/desktop, but Daily is **different or missing**; field/date unknown.
- Root cause candidate: global `dailyReminders=loadDailyReminders()` runs pre-login while `PXStore` is not yet account-scoped, so the in-memory UI may retain defaults despite correct restored account snapshot/archive.
- Production root `index.html` now reloads `dailyReminders` **after** cloud snapshot and reminder archive, **before** legacy boot: commit `65685b1366e3a59ec5d50d4b2286061a4699e0c5`.
- Strengthened full Chromium smoke to require in-memory Daily reminder list to include the account-scoped QA reminder after sign-out/sign-in: commit `216ca4ca903dda7077b3b8e9b99a7bc22f8deb66`.
- Fresh CI and real-device Daily retest PENDING. Do not claim completion or mutate existing Daily history. No production database changes; security testing still deferred (`SECURITY-DEFERRED-2026-10-12`).


### 2026-10-12 — User-verified bidirectional Food sync on real devices

- Owner confirmed one Food Diary record entered from phone appeared **exactly once with correct data** on desktop.
- Combined with the previously confirmed desktop-created Food Library product appearing on phone: **Food Library desktop → phone PASS; Food Diary phone → desktop PASS** for these real-device checks.
- Still unverified: real-device Workout Log, Daily History/reminders/water and Weight Check-in reconciliation; concurrent edits and conflict handling.
- Next: owner performs **read-only** comparisons for one existing record/day in Workout, Daily and Weight on phone versus desktop, recording any mismatches without edits.
- Docs-only work by assistant. No production DB changes, and paid security phase remains deferred (`SECURITY-DEFERRED-2026-10-12`).


### 2026-10-12 — Real phone Food Library sync user-confirmed

- Account owner confirmed the labelled Food Library test product added on desktop **appeared on phone** with the same account. This is a real-device **one-direction partial PASS**, not verification of Food Diary reverse sync or all tables.
- Next: create **one** labelled Food Diary entry from phone; verify exactly one record on desktop, same date/time/meal/calories; preserve existing records. Cleanup only the test items after success.
- No production data edits made by assistant. Security testing remains deferred (`SECURITY-DEFERRED-2026-10-12`).


### 2026-10-12 — Real-device sync QA instructions prepared

- Added `docs/REAL-DEVICE-SYNC-CHECKLIST.md` with safe two-device verification of Food Library and Diary creation, cloud confirmation, duplicate checks and read-only checks of existing Daily/Workout/Weight, optional deletion of only labelled synthetic entries. Commit `f4f8bc5cd4b7e741dfca1c1b5eea01ea6bd29e4f`.
- Pages #38185916722 SUCCESS. Full UI #38185916906 was IN PROGRESS when inspected. Prior completed Full UI #38185856127 SUCCESS.
- **Manual QA has not been run**; user must conduct real phone/desktop steps or report screenshots. Never assert real-device sync passed from mocked tests.
- No existing real user data or production DB modified by this docs-only update. Security testing remains deferred (`SECURITY-DEFERRED-2026-10-12`).


### 2026-10-12 — Eight-group independent-browser snapshot recovery VERIFIED

- Full UI [#38185774877](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38185774877) **SUCCESS** including strict second independent Chromium-context wait for exact eight cloud snapshot keys, all restored and compared.
- Previously verified Pages [#38185774574](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38185774574) **SUCCESS**. New documentation-triggered runs may still be in progress and are not evidence of a code failure.
- Scope: **mocked** Supabase and independent browser contexts; not real multi-user RLS, real devices, real-account dataset reconciliation or independent normalized table sync.
- No production code, database, secrets, or user-data modifications; security phase stays deferred (`SECURITY-DEFERRED-2026-10-12`).
- Next: request voluntary real-device/account verification, or add offline/recovery and conflict regression tests using synthetic data before broader rollout.


### 2026-10-12 — Cross-context status checkpoint

- Full UI #38185686778 SUCCESS for prior mock sync patch; GitHub Pages #38185774574 SUCCESS.
- Latest strict second-context exact-value check #38185774877 was still IN PROGRESS at last check. Do not claim it passed until GitHub reports completion.
- No code or production database changes in this checkpoint. Mocked two-context verification does not validate real two-user RLS or actual devices. Security stage remains deferred (`SECURITY-DEFERRED-2026-10-12`).
- Next: inspect #38185774877 final result and logs if failing.


### 2026-10-12 — Verify exact second-browser restored values

- Prior Full UI #38185686778 was in progress at inspection; latest Pages #38185686976 queued. No claims of CI success.
- Hardened `tests/account-pages-snapshot-sync.cjs` so the **second independent browser context** awaits all eight exact account-scoped fixture values before readback/assertions, rather than trusting an early `Synced` label. First-context server-acknowledgement check remains strict. Commit `3f0b601440eea087ccb981504fd51edce2f776f2`.
- Fresh CI pending. Test is mocked multi-browser behavior, not actual two-user security or real-device confirmation. No production app/database records modified; `SECURITY-DEFERRED-2026-10-12` remains on hold.
- Next: inspect CI, investigate concrete failures without relaxing checks.


### 2026-10-12 — Cross-browser sync: await persisted values instead of stale status

- GitHub Actions Full UI [#38185543017](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38185543017) **FAILED** in `tests/account-pages-snapshot-sync.cjs`: `Missing cloud snapshot for Workout Schedule` even though `smoke-full-ui.cjs` passed. Pages [#38185543037](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38185543037) **SUCCESS**.
- Root test race: the first context's `Synced to Supabase` status could refer to an earlier sync, not the new eight-key sample batch.
- Tightened test to poll **actual mock cloud snapshot values** for all eight feature groups for at most 25 seconds, then retain strict per-key assertions (commit `cabc8e8b4f1a76a00d1914b5c8bc1671b50eb685`). Next CI pending.
- No production app/database/user data changed; security testing remains deferred (`SECURITY-DEFERRED-2026-10-12`). If test still fails, inspect whether values truly flush and why; do not soften the assertion.


### 2026-10-12 — Workout passed; second browser context auth timing regression

- Full UI #38185419994 **SUCCESS**, including new Workout Log record-level sign-out/sign-in assertion. Pages #38185426186 **SUCCESS**.
- Subsequent Full UI #38185426244 **FAILED** despite `smoke-full-ui.cjs` PASS; the separate `tests/account-pages-snapshot-sync.cjs` reported `Second-device JavaScript errors: Not authenticated`.
- Added wait for explicit `Synced to Supabase` readiness for **both browser contexts** after auth gate dismissal, before cross-context comparison. Commit `e77fda465c9d6b7fcb74cab5de188492b1158b17`; new CI pending. Keep strict page-error assertion; don't hide errors.
- This is mocked multi-context verification only, not real two-user isolation. No production database changes. Security remains deferred as requested (`SECURITY-DEFERRED-2026-10-12`).
- Next: review new CI and inspect auth race further if `Not authenticated` persists.


### 2026-10-12 — Weight check-in CI passed and Workout Log account roundtrip added

- Full UI [#38185282090](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38185282090) **SUCCESS** and Pages [#38185281890](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38185281890) **SUCCESS**, including Weight Check-in dated row and note after mock logout/login.
- Added a synthetic Workout Log entry with id `qa-workout-relogin`, week 20, day Monday, exercise `QA dumbbell row`, and notes; test invokes app `save()`, signs out/in, and checks record fields in `scripts/smoke-full-ui.cjs`. Commit `4fd2fcd9135f3b94a30cc64d47d303a2caa81d7e`. Fresh CI pending.
- All tests use mocked accounts; not proof of real two-account/cross-device syncing. No production DB changes; security phase remains deferred (`SECURITY-DEFERRED-2026-10-12`).
- Next: inspect CI, fix any Workout Log hydration/persistence errors without weakening tests.


### 2026-10-12 — Daily QA green and weight check-in logout/login test

- Full UI #38185151840 **SUCCESS** and Pages #38185151808 **SUCCESS**, including synthetic Daily reminder completion and water state after re-login.
- Added mock account roundtrip for real Weight Check-in structure via `saveProgressPhotos`/`progressPhotos` (ID `qa-weight-relogin`, dated 2026-10-09, 78.4 kg and note) in `scripts/smoke-full-ui.cjs`; strict assertion after sign-out/sign-in. Commit `b436894974c4bc38c3fc7412c6b7d16fb93d7fdd`. Fresh CI pending.
- Workout Schedule and Weight Goal already passed; Workout Log record persistence still pending. No actual user or DB records changed. Security testing remains deferred (`SECURITY-DEFERRED-2026-10-12`).


### 2026-10-12 — Daily reminder and water re-login regression

- Full UI #38184630725 SUCCESS and Pages #38184630608 SUCCESS, including Daily History synthetic account roundtrip.
- Added new mocked account sign-out/sign-in assertions preserving a synthetic Daily reminder, its completion marker, and today's water current/target in `scripts/smoke-full-ui.cjs`. Commit `ff333b79eef09f37d89e7d85e55dfb5f8441bbcc`. New CI pending.
- No production data or database changes; security verification remains deferred (`SECURITY-DEFERRED-2026-10-12`).
- Next: examine CI result; distinguish test setup failure from actual data persistence bug and verify without weakening assertions.



### 2026-10-12 — Food complete; Daily history account roundtrip test added

- Full UI [#38184364104](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38184364104) **SUCCESS** and Pages [#38184364239](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38184364239) **SUCCESS**. Mock Food Library/Diary record-level assertions after sign-out/sign-in now pass.
- Added a synthetic dated Daily history row marker in account-scoped snapshot storage before sign-out and assert it is restored after sign-in (`scripts/smoke-full-ui.cjs`, commit `40d45def60a708b7e013d3c60b9b910b279bf54a`). Fresh CI result pending.
- This tests Daily snapshot persistence, not all daily reminders/water/real cross-device synchronization. No production database or user-data modifications; security deferred at `SECURITY-DEFERRED-2026-10-12`.
- Next: inspect fresh CI, and if failing diagnose why Daily snapshot state fails to persist rather than weakening assertions.



### 2026-10-12 — Correct mocked Food Diary cloud list during re-login

- Full UI [#38184268033](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38184268033) **FAILED**: real record-level test found Food Library item present, but Food Diary item absent after mock logout/login and hydration.
- Diagnosis: test mock `food_entries` list GET always returned only fixed Cloud QA Oats fixture, dropping records previously accepted by POST. This false simulation masked persisted Diary records even though mock POST recorded them.
- Fixed `scripts/smoke-full-ui.cjs` to include saved Diary POST rows in the list response while preserving fixed fixture; strict roundtrip assertion unchanged. Commit `002f743ea97634b22a80a5959dc683c49d9cb0b4`.
- New CI pending; no production app, database, user data or security changes. `SECURITY-DEFERRED-2026-10-12` remains on hold.
- Next: verify Actions, then extend separate Daily roundtrip assertions with safe fixtures.


### 2026-10-12 — Fix asynchronous Food re-login assertion timing

- Full UI #38184159603 **FAILED** on `Food Library product missing or changed after sign-in`; Pages #38184159952 **SUCCEEDED**.
- Root issue under investigation: login loads normalized Food tables asynchronously (scheduled roughly 1.5 seconds after account activation), but the new record assertion ran immediately after the login gate closed.
- Test now explicitly awaits `window.__pxRefreshNutrition(true)` before comparing Food Library/Diary records to the mocked cloud rows, preserving the strict record-level assertions. Commit `7e67c673057eda15b00531b28b610b6e42e07070`.
- New CI not yet verified. No app runtime or Supabase production data changed; security checkpoint `SECURITY-DEFERRED-2026-10-12` remains paused.
- Next: review new CI logs; if records still absent, trace cloud mock row mapping/account hydration and fix actual defect rather than relaxing assertions.


### 2026-10-12 — Food Library and Diary record assertions after account re-login

- Verified Full UI #38184053542 and GitHub Pages #38184053395 both SUCCESS.
- Added record-level sign-out/sign-in assertions to `scripts/smoke-full-ui.cjs`: mock Food Library product `qa-outbox-retry` and Diary row `qa-offline-diary` must retain their IDs, calories/name and leave no stale queue items. Commit `e533f206bd467945717f74d13dd528720567052b`.
- New CI result pending; missing record is a genuine test regression to investigate, **not** proof of production data loss. Daily full account roundtrip still pending.
- No production user/database changes; `SECURITY-DEFERRED-2026-10-12` still deferred.


### 2026-10-12 — Account logout/login regression passed; Food state diagnostics added

- Full UI smoke [#38183861962](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38183861962) **SUCCESS**, including actual mocked-account sign out/in, Workout Schedule and Weight Goal persistence.
- Added Food Library/Diary in-memory and pending queue counts to account roundtrip diagnostics in `scripts/smoke-full-ui.cjs` (commit `5ee366c7e7f2ddf60cae7bbf779059787bd15dd8`); this is **observability only, not proof** of complete Food/Daily cloud roundtrip.
- Prior Pages run #38183861772 was still in progress at first inspection. Latest CI for new changes pending.
- Do not touch real production records or run paid staging. Deferred security checkpoint `SECURITY-DEFERRED-2026-10-12` continues.
- Next: verify CI, add stronger account roundtrip assertions for Food/Daily using isolated fixture after reviewing data source design.


### 2026-10-12 — Fix mocked snapshot payload crash in logout/login CI

- Full UI [#38183773942](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38183773942) **FAILED**: Playwright mock handler `Object.keys(savedCloudPayload)` raised TypeError on undefined/null during new logout/login scenario.
- Fixed **test fixture only** in `scripts/smoke-full-ui.cjs`: update mock snapshot payload only for proper `user_app_snapshots` POST body and tolerate absent snapshot values. Commit `53c9829090ab24d9285115b1a8758fbf0c4f1cec`.
- Previous Pages [#38183773691](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38183773691) succeeded. Fresh CI result pending; do not assert logout/login roundtrip success yet.
- No production app data or database changes. Security stage `SECURITY-DEFERRED-2026-10-12` remains deferred.
- Next: inspect new CI; fix any genuine snapshot persistence failure without masking lost records.


### 2026-10-12 — Logout/login persistence browser regression

- User confirmed on real phone that Settings and Insights mobile buttons now display correctly. Existing 320px/390px mock Chromium coverage passed.
- New Full UI Playwright scenario clicks actual Sign out, signs back in to mock Supabase account, and checks persisted Workout Schedule and Weight Goal after account activation. Commit `269c8b7aa7f9023b2ac76082d260163106822e93`.
- Food Library/Diary already covered by synthetic interrupted sync/reload tests; full real-account Food/Daily/Workout/Weight roundtrip still not verified. Fresh CI result pending.
- No production data, database, or security changes. Keep `SECURITY-DEFERRED-2026-10-12` on hold.
- Next: check CI logs, fix any failure; then expand account roundtrip to Food/Daily/Workout/Weight using isolated fixtures.


### 2026-10-12 — Latest mobile Insights/Settings smoke and Pages deployment green

- Full UI [#38183271469](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38183271469) **SUCCESS**.
- GitHub Pages [#38183271199](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38183271199) **SUCCESS**.
- Confirms automated 320px/390px mobile tab geometry and interactions on the primary index.html route. Actual phone visual validation remains outstanding.
- No production data/database changes; security review remains deferred at `SECURITY-DEFERRED-2026-10-12`.
- Next: request real phone screenshot if layout remains problematic; prioritize concrete mobile UI issues, not additional speculative code.


### 2026-10-12 — Insights mobile click regression verified

- Full UI Chromium [#38182994635](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38182994635) **SUCCESS** for Anatomy Atlas / Muscle Coverage tab clicks at both 320px and 390px, including selected-state checks.
- Separate Deploy ProgressXX Full App [#38182976604](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38182976604) succeeded for an earlier commit; latest Pages deployment #38182994916 was still in progress at inspection.
- No application/runtime/database writes in this task. User-data isolation and deferred security marker remain unchanged.
- Next: confirm latest Pages deployment completion and gather real-device check when available.


### 2026-10-12 — Real click regression for Insights anatomy mobile tabs

- Previous 320px and 390px tab height regression #38182804267 passed; verified prior Pages build #38182804147 succeeded.
- Added Chromium click assertions for the **Muscle Coverage** and **Anatomy Atlas** mobile tabs at both 320px and 390px; checks the selected panel state and `aria-pressed`, not only CSS heights. Commit `7d1a3c51475e27dfb88183b29041674da28a4459`.
- New CI still requires verification; synthetic mobile browsers only, no real-phone proof. No app runtime/production DB changes. Security checkpoint `SECURITY-DEFERRED-2026-10-12` remains deferred.
- Next: inspect CI, fix any tab interaction bug, then get a real-device screenshot check.


### 2026-10-12 — Mobile Settings and Insights height fix verified

- Full UI regression [#38182804267](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38182804267) **SUCCESS**: synthetic Chromium at 320px / 390px validates tab row and button heights for Settings and Insights.
- Pages [#38182804147](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38182804147) **SUCCESS**.
- CSS fix commit `786c9ffba74b22b463900f28c2c3d1d0aacea9c8`; computed-geometry test commit `8a307957d417797322fb8d5ad9212167027acdcd`.
- Real mobile screenshot verification still outstanding; CI is simulated only. No user data, database, or security changes; `SECURITY-DEFERRED-2026-10-12` remains on hold.
- Next: wait for user real phone check; prioritize any remaining Insights/Settings layout regressions.



### 2026-10-12 — Fix full-height mobile Settings & Insights tabs shown in screenshots

- User-provided screenshots exposed a visual issue missed by old width/visibility-only mobile tests: Settings quick-nav and Insights Anatomy Atlas/Muscle Coverage tab buttons stretched nearly full-screen in height.
- Fixed root `index.html` with explicit horizontal flex alignment and maximum nav height (68px), Settings button height (44px), Insights tab height (46px), including 320px/390px layouts. Commit `786c9ffba74b22b463900f28c2c3d1d0aacea9c8`.
- Expanded `scripts/smoke-full-ui.cjs` with actual computed bounding-rectangle height assertions for both mobile tab rows at 320px and 390px. Commit `8a307957d417797322fb8d5ad9212167027acdcd`.
- Await new Full UI CI and Pages deployment before declaring verified; real phone review recommended. No user data, Supabase or security migration changed.
- Next: inspect latest Actions; fix any CSS specificity issue if heights still fail. Deferred security remains `SECURITY-DEFERRED-2026-10-12`.



### 2026-10-12 — Food Diary queue reload and 320px UI CI passed

- Verified **Full UI** [#38182541980](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38182541980) **SUCCESS** on smoke covering queued Food Diary POST temporary 503, full reload, account-scoped pending/local/in-memory recovery and exactly one saved backend record after retry.
- Verified **GitHub Pages** [#38182542137](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38182542137) **SUCCESS**.
- New 320px checks for Settings and Insights primary controls passed. These are synthetic Playwright/mobile viewport tests, **not** verification on real Android/iOS or real Supabase users.
- No changes to production user data, schema or application runtime in this round. Security checkpoint `SECURITY-DEFERRED-2026-10-12` remains explicitly deferred.
- Next possible work: robust 320px Settings shortcut touch interaction, mobile landscape checks and account-scoped offline Food Diary across logout/login; do not use production test data.



### 2026-10-12 — 320px mobile and Food Diary queued restart regression

- Confirmed prior Full UI #38182388731 success and Pages #38182388594 success.
- Extended existing Chromium smoke on production root `index.html`: 320px phone viewport checks of Settings account buttons and Insights language input, restoring normal 390px viewport afterwards (commit `a5d6be017639536e3d1de665d65304fe6c2f4a1c`).
- Added Food Diary synthetic pending entry, mocked POST 503, reload check for queued + local + in-memory row, and retry exactly one backend write (commit `ec26b6bf509b08cd431e6b16dfb774dc7ecabb5b`). No genuine production Food entries involved.
- CI outcome for new changes pending. Do not claim these new assertions pass until run completes. No DB schema/production data changes. Security deferred `SECURITY-DEFERRED-2026-10-12`.
- Next inspect CI and fix any genuine mobile or Food Diary rehydration regression without weakening test.


### 2026-10-12 — Settings mobile tap interception fix verified

- Full UI smoke [#38182237311](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38182237311) **SUCCESS**, including the 390px Chromium click/scroll test for all five Settings shortcuts.
- GitHub Pages deployment [#38182236945](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38182236945) **SUCCESS**.
- Prior failure #38182112021 explicitly showed bottom navigation intercepting the Settings Account button. CSS fix in `index.html` commit `c0c39431f735351e69eb234b1c3d5939814d2d0e` now passes regression.
- No further app code or user database changes. Real-phone verification still advised; no paid staging or RLS testing until explicitly requested (`SECURITY-DEFERRED-2026-10-12`).
- Next: extend mobile confidence to narrow screen / landscape and Food Diary queued-entry recovery without data loss.



### 2026-10-12 — Fixed Settings shortcuts obscured by bottom mobile nav

- GitHub Actions #38182112021 FAILED in Chromium: Playwright click on `#settings .pxSettingsQuickNav button` was intercepted by `.bottomNav .navbtn[data-page=log]` (explicit job log).
- GitHub Pages #38182112010 SUCCEEDED separately; deployment success does not imply UI tests passed.
- Applied CSS in root `index.html` to make Settings quick nav sticky above content with elevated z-index and adequate mobile bottom clearance; commit `c0c39431f735351e69eb234b1c3d5939814d2d0e`.
- Next: check latest Full UI workflow, inspect click/scroll failures and correct them. No database or user data changes. `SECURITY-DEFERRED-2026-10-12` still deferred.



### 2026-10-12 — Settings shortcut click timeout diagnostics

- Previously confirmed: mobile smoke #38181874481 and Pages #38181874600 passed.
- New interactive Settings quick-navigation test run #38182006405 was still in progress at review (Full UI browser smoke step); not yet a proven pass or failure.
- Added a 6-second timeout to each Playwright shortcut click to avoid long silent hangs; commit `5a73b1e76a3fbc08ceed08bd1585a58c8c35a3a8` in `scripts/smoke-full-ui.cjs`.
- New CI result unverified. No production app or user database changes.
- Next: inspect finished workflow, diagnose any click or scroll failure; preserve `SECURITY-DEFERRED-2026-10-12` pause.


### 2026-10-12 — Mobile Settings shortcut interaction regression

- Prior mobile Settings shortcut CI #38181874481 passed, Pages #38181874600 succeeded.
- Updated `scripts/smoke-full-ui.cjs` to click all 5 Settings quick-navigation buttons in 390px Chromium and check corresponding target panel visible in viewport. Commits `8ff92fa978d112708347af1de721c728c4481bbc`, `8c0dd6e9f5d1e7a76579ddef9dac75e50ef78cdf`.
- New CI run result pending; this is synthetic UI data, not real-device validation. No runtime app or database data changed.
- Next: verify fresh GitHub Actions; fix any interaction or scroll failure; maintain security checkpoint `SECURITY-DEFERRED-2026-10-12` deferred.


### 2026-10-12 — Settings quick navigation after mobile CI success

- Confirmed Full UI run #38181679627 SUCCESS and Pages deploy #38181678866 SUCCESS for the prior mobile Settings/Insights build.
- Added touch-friendly Settings shortcuts to Account, Backup, Sync, Preferences and Schedule in production `index.html` (commit `948600c920bcc7975dc550d9e2140cb5b4737305`); links scroll to existing functional panels without changing stored values.
- Extended `tests/mobile-settings-insights-regression.cjs` to assert jump targets and styling (commit `45fa87f6b7d8e029cfce698d99fc9fd1c9843e77`). Fresh CI and Pages outcome not yet confirmed.
- No Supabase or user-data changes. Security checkpoint `SECURITY-DEFERRED-2026-10-12` remains paused.
- Next: inspect Actions for new commits and evaluate mobile Settings shortcut usability.


### 2026-10-12 — Mobile viewport regression for Settings and Insights

- Previous full UI test #38181404446 SUCCESS, Pages deployment #38181404262 SUCCESS.
- Updated `scripts/smoke-full-ui.cjs` (commit `f39578abc38ce38dcab1d25ef8c192745cbb4a0b`) to navigate to Settings and Insights on the 390px Playwright mobile viewport; verify account buttons/anatomy selector are visible, touch-sized, and not horizontally outside viewport.
- Pending new GitHub Actions outcome. Browser viewport simulation does not replace actual iOS/Android device review.
- No app runtime, Supabase data or permissions changed. `SECURITY-DEFERRED-2026-10-12` stays deferred.
- Next: inspect new CI failure/success and address any genuine mobile overflow.



### 2026-10-12 — Settings and Insights mobile UX refresh

- **Scope:** Production root `index.html`; commits `e3db54931a43a79a06a4307af05e3c7e5098633b`, `5b0420b19fdb7cf76bb329f25955ddeb5f538934`. Added an actual Settings account-and-sync panel with functional buttons routed to existing cloud sync/logout and live online/offline indicator. Existing settings backup, data health, device tools and appearance retained.
- **Clean-up:** Removed visible “Previous commercial data” link to `commercial-v1.html` from production root. Hid deprecated Google Sheets connection panels in Settings instead of exposing disabled controls. Updated inaccurate Appearance copy.
- **Responsive UI:** Changed fixed floating account controls to mobile-friendly inline two-button bar, added mobile layout guardrails for Settings and Insights including narrow phones.
- **Regression:** New `tests/mobile-settings-insights-regression.cjs`, commit `6ed2353bc0d6e5206d803d2ffe0539ee4af1f951`, wired into Full UI smoke workflow commit `d745e384e5973940019a03cb4e63f6ceb33077e5`. Fresh CI/deploy MUST be checked before asserting success.
- **Data impact:** No Supabase/database changes and no user data migration or deletion. `SECURITY-DEFERRED-2026-10-12` remains deferred.
- **Next:** Inspect GitHub CI and live mobile UI, correct regressions; verify Settings on real account/mobile. Also expand Food Diary pending restoration coverage.


### 2026-10-12 — Food queued-row recovery verified by CI

- Full UI regression run [#38180732086](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38180732086) **SUCCESS**, including Food offline queued-row reload recovery after runtime hydration fixes.
- GitHub Pages [#38180731906](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38180731906) **SUCCESS**.
- Runtime fix commits: `5c78be9afcf1318b29f8b5040a9ee5e459b87c31`, `4a2c9d22b0967283b215454b5a5f6706ee9e048b`.
- Tests simulate a backend; cross-device real-account confirmation remains outstanding. No direct production database writes by assistant.
- Next: strengthen regression for pending Food diary hydration and verify actual mobile UX; respect `SECURITY-DEFERRED-2026-10-12`.


### 2026-10-12 — Fix Food queued-row hydration after restart

- **Confirmed CI failure:** #38180555740: queue present, persisted Food product present, but in-memory `foodProducts` absent after reload. Failure was in account-scoped state hydration, not storage deletion.
- **Runtime code:** `index.html` commits `5c78be9afcf1318b29f8b5040a9ee5e459b87c31` and `4a2c9d22b0967283b215454b5a5f6706ee9e048b`: reconstruct queued Food products/logs in memory after account activation; fallback to scoped persisted payload before a pending flush; retain pending queue instead of discarding an unresolved missing payload.
- **Safety:** No database operations or legacy data deletions. This is a production app code change; fresh CI must pass before considering it verified.
- **Next:** Review latest full UI smoke and deploy results; if red, inspect exact job log and fix without weakening retention assertions. Security checkpoint `SECURITY-DEFERRED-2026-10-12` remains deferred.


### 2026-10-12 — Food restart issue confirmed, diagnostic added

- **CI:** [Full UI #38180431308](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38180431308) FAILED with `Food offline queue or local product lost across app restart`. Retrieved job log; failure at `scripts/smoke-full-ui.cjs:159`.
- **Deploy:** [GitHub Pages #38180431218](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38180431218) succeeded; do not confuse deployment success with app regression passing.
- **Code:** `scripts/smoke-full-ui.cjs` now emits structured queue, in-memory product and persisted product diagnostics on failure; commit `1ec489976ec4b145ea770b21515fcb0dbbdc8afa`. This is diagnostic-only, **not a confirmed fix**.
- **Data:** No production database writes; deferred security checkpoint remains on hold.
- **Next:** Retrieve the next failed/passing job logs, identify whether missing queue or missing local product and repair the correct startup hydration path; do not weaken assertions.


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
