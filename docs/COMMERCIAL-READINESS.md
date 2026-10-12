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
| QA-01 | P1 | Latest required Full UI, fast contracts and Pages runs green for same deployed SHA | NOT VERIFIED |
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
