# ProgressX Product Roadmap

**Baseline:** 2026-10-11 · **Owner repo:** 3bHussein/ProgressXX-Web · **Target:** https://3bhussein.github.io/ProgressXX-Web/

## Status notation

- `[ ]` pending / not independently verified; `[x]` only after evidence is recorded.
- **P0:** blocks inviting outside users or any paid launch; **P1:** blocks broad beta/reliable operations; **P2:** product growth/commercial enhancements.
- This roadmap is **not** a claim that implementation is missing; a feature may exist yet remain unverified.

## Commercial readiness estimate and reporting rule — 2026-10-12

Owner requested a permanent commercial milestone tracker in [Development Log](docs/DEVELOPMENT-LOG.md). Baseline subjective engineering estimate: **55–65%** toward an initial saleable version; tentative **4–8 weeks private beta**, **10–16 weeks initial commercial launch** under sustained work and passed P0/P1 gates. These are **not verified completion scores or guaranteed schedules**. Full UI #38210119914 and Pages #38210118315 were green for previous baseline. **No sale approval.** See Development Log for the five milestone table and remaining acceptance criteria.

**Mandatory on each milestone:** append dated evidence in the Development Log; update that tracker and relevant Roadmap checkbox only when proven, sync Project Handoff, include commits, actual CI/deployment status and data impact, and revise timing only with justification. Paid staging/security work remains deferred until explicit owner approval.

## 2026-10-12 — P0 sync risk evidence: deletion resurrection

`tests/cross-device-delete-resurrection-regression.cjs` (`72be687`) shows a two-device stale whole-account snapshot may resurrect removed Daily, Workout, Weight or Food records after another unrelated edit. CI wiring `008dc95`; new CI not yet verified. This **does not correct production last-writer-wins behavior**; commercial milestone cross-device sync remains OPEN. Safe snapshot concurrency/CAS requires separate review and must not be silently deployed. Paid security deferral does not stop free synthetic QA.

## 2026-10-12 — Safe delete conflict resolution simulation (not deployed)

`tests/cross-device-safe-rebase-simulation.cjs` (`744f064`), CI registration `543aed3`, models version-based stale-write rejection and approved rebase without resurrecting records across Daily, Workout, Weight, Food. **Simulation only**: production remains vulnerable to stale whole-snapshot overwrite. Fresh CI not yet verified. Cross-device sync P0 remains OPEN and commercial percentage unchanged. Paid security checkpoint remains an exception for ongoing dev only.

## 2026-10-12 — Read-only delete conflict preview

New isolated `prototypes/sync-delete-conflict-preview.html` (`5d16187`), Chromium no-write/mobile regression `tests/sync-delete-conflict-preview-browser.cjs` (`66181f4`), CI integration `78d2912`. This covers four data domains and three preview choices, but **does not resolve or block live stale writes**. New CI NOT VERIFIED, sync P0 OPEN and rough 55–65% estimate unchanged. Continue development without paid security work.

## 2026-10-12 — Three no-cost deletion-conflict QA improvements

Mock API contract `tests/sync-delete-resolution-api-contract.cjs` (`69d783e`) specifies stale write 409, wrong owner 403, and deliberate current-version restoration for Daily/Workout/Weight/Food; browser preview reload assertion `1de6ddc` ensures no persisted choices; CI wiring `b1aef87`. New CI not verified. **Do not confuse synthetic 403 with Supabase RLS certification or mock 409 with deployed CAS**. P0 sync stays OPEN, commercial percent unchanged, paid security exception unchanged.

## 2026-10-12 — Mock offline delete replay, not production

`tests/offline-delete-replay-contract.cjs` (`2a6599c`) and CI `45db7a2` specify idempotent queued deletion replay, stale conflict and owner checks. **Mock only**; does not imply production support. Fresh CI unverified, P0 sync OPEN, readiness unchanged. Owner's paid-security deferral remains nonblocking for development.

## 2026-10-12 — Same-record offline editing and production acceptance gates

Mock concurrent same-record editing contract `tests/offline-same-record-conflict-contract.cjs` (`15cd7fd`), CI `0fe61f3`. Deployment/rollback, CAS, per-account RLS and restore test checklist: [SYNC-CONFLICT-PRODUCTION-ACCEPTANCE](docs/SYNC-CONFLICT-PRODUCTION-ACCEPTANCE.md), commit `3ab9b84`. CI of new tests not yet verified. These are **not production fixes**; cross-device data safety remains P0 OPEN, paid staging still explicitly deferred. 55–65% estimate unchanged.

## 2026-10-12 — In-memory browser offline-reconnect simulation

`tests/offline-reconnect-browser-contract.cjs` (`9a7e4aa`), CI `97aec49`: an isolated Chromium mock demonstrates offline pending operation, one reconnect acknowledgment and stale conflict rejection. Not an actual browser app offline replay test. New CI NOT VERIFIED, P0 sync OPEN, commercial progress estimate unchanged.

## 2026-10-12 — Pending snapshot helpers tested in synthetic runtime

`tests/production-pending-snapshot-contract.cjs` (`6e0027c`) executes real production pending-key functions against mock browser storage and separate account IDs. CI `b83861c`. Prior Full UI #38213339386 PASS, fresh test not verified. Does not solve server retry idempotency, offline queue replay or whole-snapshot stale overwrites; P0 sync remains OPEN and commercial readiness remains 55–65% rough estimate. Paid security remains deferred.

## 2026-10-12 — Simulated failed upload retention after reload

Added `tests/offline-upload-failure-reload-browser.cjs` (`8a00903`) and CI (`f0dc07c`) for synthetic localStorage pending retention across reload/503 and clearing after mock ack. Fresh CI not verified. **Not production flush verification**. Sync P0 OPEN, readiness unchanged, paid security exception unchanged.

## 2026-10-12 — Real flush mock retry test (not live sync)

New `tests/production-flush-failure-retry-contract.cjs` (`29d3d59`), CI `1b568c8`, executes production `flush()` under mocked 503 then success. Previous Full UI #38214335824 PASS, fresh CI NOT VERIFIED. It does not prove deployed cross-device CAS or offline idempotency. Sync P0 OPEN; commercial readiness 55–65% estimate unchanged.

## 2026-10-12 — Flush retry coverage extended

Expanded `tests/production-flush-failure-retry-contract.cjs` (`4218067`) for workout mirror failure and edits during upload; previous CI #38214690902 PASS, new run NOT VERIFIED. Synthetic only, no production release claim. Data sync P0 OPEN; commercial estimate unchanged.

## 2026-10-12 — Production flush exercised in Chromium with synthetic dependencies

`tests/production-flush-chromium-contract.cjs` (`83b530c`) and CI `f21cbfd` cover failed POST, retry acknowledgment and concurrent user edit using production `flush()` extracted into browser mock. Fresh CI not yet verified, not live Supabase or actual app route test. Commercial estimate 55–65% unchanged; sync P0 still OPEN and paid security exception unchanged.

## 2026-10-12 — Chromium partial upload/mirror failure QA

`tests/production-flush-chromium-contract.cjs` extended in `4a51dc4` with snapshot success and mock Workout Schedule mirror failure, asserting pending not cleared. Previous Full UI #38215604331 PASS; fresh CI NOT VERIFIED. This is synthetic browser test only; P0 sync OPEN and commercial estimate unchanged.

## 2026-10-12 — Full app network-route mock for failed sync/reload

`tests/full-app-sync-503-reload-browser.cjs` (`b4f06de`), CI `e6ebae2`: real browser opens production root with fake Supabase routes, verifies POST 503 preserves pending edit across reload, then manual successful retry. Fresh CI not verified; P0 data safety remains OPEN, percent 55–65% unchanged. Paid security exception remains nonblocking.

## 2026-10-12 — Two-device Daily deletion-resurrection browser contract

`tests/full-app-two-device-daily-resurrection.cjs` (`de851d5`) and CI (`e9a2f35`) use synthetic sessions on production root to reproduce known whole-snapshot stale-write risk. Fresh CI unverified. A passing regression **demonstrates an unresolved unsafe behavior**, not a production fix. P0 cross-device sync OPEN; readiness estimate remains 55–65%; paid security deferred.

## 2026-10-12 — Failed two-device browser test corrected

Full UI #38216603946 failure was from hard-coded resurrection expectation; mock result was false. Test `d9360d8` now confirms B's unrelated write reached mocked server and reports actual outcome. Production risk still open, not considered fixed; CI rerun pending, commercial readiness estimate unchanged.

## 2026-10-12 — Production cloud retry backoff

Production `index.html` (`6b52ba0`) reduces failed sync retry frequency with capped exponential backoff; synthetic regression `tests/production-sync-retry-backoff.cjs` (`fc0f28c`), CI `9054f72`. Fresh CI pending; cross-device conflict risk remains OPEN, estimate 55–65% unchanged, paid security stage deferred.

## 2026-10-12 — User-visible pending versus confirmed sync

Production root status UI updated in `5c94267`: show local save, pending remote sync and success only after last revision confirmed, including mid-flight edits. CI mock compatibility repaired. Prior CI failure due to mock scope issues; new run not verified. P0 cross-device sync OPEN, 55–65% readiness unchanged. Paid security deferred.

## Owner exception: paid security spending must not stall development (2026-10-12)

**Development may continue without budget approval:** free synthetic/mock security and sync tests, app correctness, CI, mobile QA, documentation and commercial prep. **Paid Supabase staging/privilege-migration testing remains deferred** until owner explicitly resumes it; no paid resources or permission modifications. This exception is NOT security certification and does NOT remove the P0 requirement before enrolling outside users or accepting paying customers. Update the Development Log after each completed part, including evidence and readiness-tracker effects. Percentage and timelines currently unchanged.

## Deferred security checkpoint — SECURITY-DEFERRED-2026-10-12

**On hold by owner, resume only on explicit request.** Paid staging and advanced two-account RLS/CRUD testing are deferred because of budget/priorities. Existing excessive TRUNCATE/TRIGGER grants remain; the migration is prepared but NOT applied. No commercial release sign-off is possible until this P0 gate is revisited and passed. See [development log](docs/DEVELOPMENT-LOG.md) and [Supabase security audit](docs/SUPABASE-SECURITY-AUDIT.md).

To resume: `Resume SECURITY-DEFERRED-2026-10-12` or `ارجع لاختبارات الأمان المؤجلة`.

## Phase 0 — Baseline / protect current data (P0)

- [ ] Capture current live deployed commit and green required Actions; confirm `index.html` is production target.
- [ ] Inventory Supabase schema/RLS/storage, Google Apps Script/Sheets integrations, local storage keys, sync paths and ownership model.
- [ ] Inventory all data types: Workout Log, exercises/renames, active session, Workout Schedule, weight, Food Library, Today's Food, Daily, saved meals, historical nutrition, settings and anatomy associations.
- [ ] Export sanitized schema and establish tested recovery/backup before migration; never export real personal records to public GitHub.
- [ ] Map historical workout imports (W1–W19) and their owner IDs; avoid record duplication.

**Exit:** signed-off data map + verified backup recovery + baseline CI/commit.

## Phase 1 — Authentication and isolation (P0)

- [ ] Re-test `undefined.filter` login exception using restored-account fixture and genuine production account, without exposing data.
- [ ] Signup, email confirmation, login, logout, expired session, password reset, refresh, offline auth and account deletion.
- [ ] Two independent accounts: account B cannot list/read/create/update/delete records of account A, even through direct API calls.
- [ ] Audit/enable Supabase RLS and ownership policies for every table, RPC, view, storage bucket and operation; negative security tests.
- [ ] Eliminate shared Apps Script data exposure, client-side secrets and any implicit global fallback.
- [ ] Add tests for malformed/empty/legacy data shape to every `.filter()`, `.map()` and login bootstrap path.

**Exit:** automated auth + isolation negative tests and manual device verification.

## Phase 2 — Persistence & sync correctness (P0)

- [ ] For **Food**, **Food Library**, **Daily**, **Saved Meals**: add/edit/delete -> reload -> logout/login -> second device -> confirm server source-of-truth.
- [ ] For **Workout**, exercise name changes, templates, sessions and **Workout Schedule**: repeat complete lifecycle.
- [ ] For **Weight Check-ins**, progress metrics and settings: repeat complete lifecycle.
- [ ] Test online/offline queue replay, timeout retry, idempotency, concurrent edits, delete resurrection, conflict resolution and eventual sync status.
- [ ] Check slow sync UX and size/load tests with hundreds or thousands of historical records (including 634+ workout rows).
- [ ] Confirm data migration paths from Sheets/Apps Script/local storage/Supabase with reconciled counts and no cross-account bleed.

**Exit:** zero unexplained loss, leakage or duplicate records in a documented repeatable matrix.

## Phase 3 — Cross-platform quality & CI gates (P1)

- [ ] E2E in Chromium, Firefox and WebKit; mobile widths and touch navigation; real Android devices.
- [ ] Verify Food, barcode manual/scanner, anatomy illustrations and workout library image links.
- [ ] Validate PWA install/update, service worker rollback, stale cached assets, offline mode and browser permission denial.
- [ ] Review GitHub Actions required check configuration so failing tests prevent production publish; do not assume current checks cover all scenarios.
- [ ] Error boundaries/recovery: a broken optional widget must not break login or core sync.
- [ ] Accessibility: keyboard, contrast, labels, Arabic RTL and reduced-motion support where relevant.

**Exit:** documented green release matrix with no open P0/P1 defect.

## Phase 4 — Operational and legal readiness (P1)

- [ ] Error monitoring with personally identifiable data redaction and an incident playbook.
- [ ] Database backup cadence, retention, recovery-point and recovery-time targets; restore drill.
- [ ] Performance baselines, rate limits, quotas and cost forecast (Supabase, Apps Script, food APIs).
- [ ] Privacy policy, terms, data export/deletion, contact/support and third-party data/image license review.
- [ ] Versioning, changelog, staged rollout, rollback and production incident ownership.
- [ ] New-user onboarding on an empty account without old owner's data.

**Exit:** safe beta enrollment and operational runbook.

## Phase 5 — Private Beta (P1)

- [ ] Enroll 5–10 opt-in testers using separate accounts.
- [ ] Track activation, daily session completion, logging speed, sync errors, crashes, support issues and retention.
- [ ] Triage issues weekly; block launch on unresolved P0/P1 defects; run full release gates.
- [ ] Expand only after baseline stability and owner approval.

## Phase 6 — Commercial launch (P2; only after P0/P1 exit gates)

- [ ] Pricing/Free vs Pro entitlement design and billing provider selection.
- [ ] Server-verified subscription entitlements and signed billing webhooks; no client-only paywall.
- [ ] Branding, custom domain, customer support, refund/cancellation flow, tax/legal compliance as applicable.
- [ ] Smart onboarding, coach suggestions, nutrition quality improvements and growth analytics with consent.

## Immediate next 5 tasks

1. **Auth bug verification:** investigate recent reported `undefined.filter` exception against deployed code and fresh/restored accounts; document result.
2. **Source-of-truth table audit:** Food, Daily, Food Library, Workout, Schedule, Weight, Saved Meals -> table, owner ID, CRUD, sync behavior.
3. **RLS two-account audit:** prove users cannot read/write one another's records.
4. **Sync replay tests:** offline -> edit/delete -> online -> second device -> reload, record conflicts/deduplication.
5. **CI audit:** inspect required checks on production branch and add gates for missing scenarios.

## Evidence template (update after each task)

| Date | Task | Commit/PR | Automated test/run | Manual verification | Result / remaining risk |
| --- | --- | --- | --- | --- | --- |
| 2026-10-11 | Initial roadmap and handoff documentation | Documentation commit | Not a functional test | Docs review | Baseline created |

| 2026-10-12 | Full UI failure triage and non-short-circuit CI reporting | [060d41b](https://github.com/3bHussein/ProgressXX-Web/commit/060d41b5a1f0b51ca5dd5b65153fe5addedaa0e2) | [#38189897407](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38189897407) failed at mock auth; updated workflow result NOT VERIFIED | Not required for CI-only change | Aggregates all test failures without weakening checks; auth intermittent error unresolved, no data changes |

| 2026-10-12 | Fix Chromium mock auth wait options | [9e05d56](https://github.com/3bHussein/ProgressXX-Web/commit/9e05d56ff3ffcf1e9ae8cbc9d66598da0e17b7af) | New Full UI run NOT VERIFIED; prior [#38190178638](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38190178638) passed | Not required: test-only change | Correct 15s auth wait; no production data or runtime change; intermittent auth still under observation |

| 2026-10-12 | Daily conflict preview read-only test strengthening | [34abfd21](https://github.com/3bHussein/ProgressXX-Web/commit/34abfd21f0faf145bc6ec3ff6bc8fd2c826bc5ca) | Prior Full UI #38190518693 SUCCESS; fresh CI NOT VERIFIED | Prototype only; no real-device test | Assert no write requests, local/session persistence or retained choice after reload; production conflict mitigation pending |

| 2026-10-12 | Prototype manual-merge reset regression | [d0a0169](https://github.com/3bHussein/ProgressXX-Web/commit/d0a0169b5eea77d4ad38b193f0ddde028f6127c7) | Prior Full UI #38190604096 SUCCESS; fresh run NOT VERIFIED | No live data tested | Merge controls must reset on reload; conflict CAS still not deployed |

| 2026-10-12 | Mock sign-in rejected then successful retry | [04f96b9](https://github.com/3bHussein/ProgressXX-Web/commit/04f96b99585bbf4590ca94621fc7cf9d75cbcaf9), [a6e6dad](https://github.com/3bHussein/ProgressXX-Web/commit/a6e6dad73ac322c19013471b536be44a051e7725) | Fresh CI NOT VERIFIED | No real-account test | Synthetic auth gate, retry, no DB writes and no JS errors; real auth remains pending |

| 2026-10-12 | Mock login session restore after reload | [eeb7747](https://github.com/3bHussein/ProgressXX-Web/commit/eeb774740e5d1641a66df79dc6d961a04af93621) | Prior Full UI #38190835357 SUCCESS; new CI NOT VERIFIED | Synthetic only | Assert same-account restore without duplicate password request; real session expiration unverified |

| 2026-10-12 | Prevent expired cached auth from unlocking workspace | [254b2c7](https://github.com/3bHussein/ProgressXX-Web/commit/254b2c72511bd6af1d63db0e6a2c2412b21cea92), [39c64cc](https://github.com/3bHussein/ProgressXX-Web/commit/39c64ccc1118dce295c7ec89707b0d30f8f8c282) | Prior Full UI #38204834720 SUCCESS; new CI NOT VERIFIED | Real account not tested | No account data cleared; expired browser session requires manual sign-in; token renewal still unverified |

| 2026-10-12 | Expired session renewal before restoring account | [98d17e2](https://github.com/3bHussein/ProgressXX-Web/commit/98d17e29d555590116a0aa8eb964ac531ab92c11), [191f91d](https://github.com/3bHussein/ProgressXX-Web/commit/191f91d1ad3cd6f2a83dd33f650e19f8c4a3fbac) | Fresh CI NOT VERIFIED | Real account renewal pending | Strict account ID check; renewal failures stay locked and preserve account data |

| 2026-10-12 | Prevent parallel token refresh conflicts | [e0fffa4](https://github.com/3bHussein/ProgressXX-Web/commit/e0fffa42843c3115a45ba677d46115cfbbd7df2f), [d724d93](https://github.com/3bHussein/ProgressXX-Web/commit/d724d930aeb941e7516bf116fc4434fd32305e1e) | CI NOT VERIFIED for update | Real concurrent refresh untested | One in-flight refresh, same-account checks, no database changes |

| 2026-10-12 | Browser test: concurrent Supabase token refresh | [8cca2f2](https://github.com/3bHussein/ProgressXX-Web/commit/8cca2f27a289e90cbb1c781b0e9336de23c296e5), [395a8c9](https://github.com/3bHussein/ProgressXX-Web/commit/395a8c9805dbcdef9d16b34f2fe578365a8a1975) | Prior Full UI #38209687913 PASS; fresh CI NOT VERIFIED | No real account | Three simultaneous mocked browser reads; one token rotation; production data unchanged |

Keep this table honest; a green CI run alone is not proof that the product is production-ready.
