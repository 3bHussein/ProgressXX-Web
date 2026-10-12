# ProgressX Product Roadmap

**Baseline:** 2026-10-11 · **Owner repo:** 3bHussein/ProgressXX-Web · **Target:** https://3bhussein.github.io/ProgressXX-Web/

## Status notation

- `[ ]` pending / not independently verified; `[x]` only after evidence is recorded.
- **P0:** blocks inviting outside users or any paid launch; **P1:** blocks broad beta/reliable operations; **P2:** product growth/commercial enhancements.
- This roadmap is **not** a claim that implementation is missing; a feature may exist yet remain unverified.

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

Keep this table honest; a green CI run alone is not proof that the product is production-ready.
