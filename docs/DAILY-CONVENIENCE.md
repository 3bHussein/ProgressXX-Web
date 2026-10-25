# Session drafts and repeating meals

## Session drafts

The existing account-scoped `progressx-active-workout-session-v1` record now carries a draft per exercise. It preserves raw performance, numeric/text rows (including incomplete and blank rows), notes, exercise time, current exercise and last edited set/field. Input/focus, exercise navigation, closing the overlay, page hiding and page exit capture synchronously. A successful explicit Save & Next or Skip clears that exercise draft; finishing clears the active session. Changing day asks before discarding drafts.

Drafts are **local to this device/account storage** and are not completed workout records or a promise of cross-device continuation. Save & Next uses the existing workout queue and record schema. Previous performance remains visible in the original session panel. A read-back check avoids silently claiming a draft was saved when storage fails. Home shows the saved session with week/day/exercise position and a Resume action.

## Repeat a previous meal

Food contains a closed, keyboard-accessible disclosure after the primary actions. It offers the latest eight date-and-meal groups before the selected diary date, from the history already loaded for the current account. It does not fetch or claim complete all-time history. Multiple entries in the same meal category on the same day form one group.

Preview lists each recorded amount/unit, the destination diary date and total recorded calories. Copying preserves the original whole-entry nutrition and quantities rather than recalculating from a changed/deleted food-library product. The new entries receive unique client IDs and the selected target date/current time. Nonpositive amounts or absent/invalid/negative nutrient totals disable copying; zero is valid when explicitly recorded. Existing entries in the destination meal trigger a duplicate-copy confirmation. Source rows are unchanged.

The existing verified local multi-key write helper persists diary rows, pending IDs and retry outbox together before changing in-memory rows. Existing food outbox and idempotent create path perform sync. Network failures retain the same rows and retry IDs across reload; no rollback or new ID is generated during retry. Storage failures report an unconfirmed save and ask the user to check the diary before retrying. No database/schema/API changes are included.

## Verification

`tests/session-drafts-repeat-meals-browser.cjs` covers real root UI interactions with synthetic account storage: partial/numeric/text session restoration after reload, focus and exercise navigation, explicit save/cleanup, silent storage denial, cancel-discard, Home resume, meal quantities/units/macros/escaping without library records, duplicate confirmation, offline reload, failed-then-successful outbox retries, local batch rollback, invalid missing nutrition, account-store separation and EN/AR widths 320/390/768/1280. No real account or backend writes. Optional `PX_CONVENIENCE_SCREENSHOTS=1` captures bilingual meal previews locally.

Local Chromium also passed existing session-mixed, Home, all-page mobile, Food portions, Insights/coaching, backup download/import/reload, language, training-day and mocked-auth save/reload/logout regressions. Catalogue, release-workflow and database-pause contracts pass. Exact final CI, deployment and live-file evidence is recorded in DEVELOPMENT-LOG.md. Real-account/device acceptance and existing commercial/security gates remain separate.
