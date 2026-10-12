# ProgressX private-beta acceptance matrix (disposable fixtures only)

**State:** NOT RUN / NOT VERIFIED. Do not run destructive scenarios on personal history or existing customer accounts.

## Preparation

- Use two distinct newly created test accounts (A and B) in an authorized test environment. Never publish their identifiers, emails, tokens or data exports.
- Capture an independently verified, restorable baseline before write tests.
- Record the exact deployed root URL, app SHA, browser/Android versions and UTC times.
- Use only clearly fake Food/Daily/Workout/Weight records; do not test against real imported W1–W19 data.

| Case | Steps | Pass criterion | Result |
| --- | --- | --- | --- |
| 01 A/B isolation | A creates test Food; B queries all applicable APIs and UI | B cannot read/edit/delete A item | NOT RUN |
| 02 Food lifecycle | A add/edit/delete Food and Food Library; refresh/relogin on two devices | Exact last acknowledged state; deleted item absent | NOT RUN |
| 03 Meals and Daily | Add/edit/delete Saved Meal and Daily reminder across devices | No phantom restore or missing values | NOT RUN |
| 04 Workout and weight | Repeat for Workout Log, Schedule, renames and Weight Check-in | Consistent IDs and no duplicates | NOT RUN |
| 05 Offline save | Disconnect device B, edit fixture, reconnect | Draft retained until acknowledged; correct retry | NOT RUN |
| 06 Stale concurrent edit | A/B load same base; A edits, B saves stale change | Server denies stale overwrite and B retains pending review | NOT RUN |
| 07 Delete resurrection | A deletes Daily; B makes unrelated offline Workout edit | Daily stays deleted, Workout edit survives explicit review | NOT RUN |
| 08 Restore | Restore sanitized backup in safe environment | Verified counts and content; no loss/cross-account bleed | NOT RUN |
| 09 Login legacy | Authenticate with migrated fixture containing malformed/empty Food/Daily | No undefined.filter; no data erased | NOT RUN |
| 10 Mobile/PWA | Browser+Android install, offline/online, refresh, basic accessibility | No broken navigation or stale overwrite | NOT RUN |
| 11 Rollback | Simulate failed update and documented rollback | App and pending drafts recover without wiping records | NOT RUN |
| 12 CI/deploy | Match same GitHub SHA across Full UI and Pages success | Evidence links show real success for deployed SHA | NOT RUN |

## Evidence template per case

`Case ID | UTC | Deployed SHA | Fixture IDs (sanitized) | Devices | Actual result | Issue link | Evidence location | Reviewer`

**Never mark PASS from a simulation or mock.** An actual server-side CAS and RLS review are still prerequisites, and the paid security/staging gate remains deferred until owner authorization.
