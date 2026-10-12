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

Keep this table honest; a green CI run alone is not proof that the product is production-ready.
