# ProgressX real-device account sync verification

Status: **MANUAL — NOT YET VERIFIED**. Updated 2026-10-12.

## Safety
- Use the **same personal account** on phone and desktop at https://3bhussein.github.io/ProgressXX-Web/.
- This test writes one small, clearly labelled test record to the **real account** if performed. Only the account owner should do it; never use service-role keys or bypass RLS.
- Before starting, export a backup through Settings > Backup & Recovery. Keep the exported file private.
- Do not sign out while the app reports pending sync. Wait for cloud confirmation before opening the other device.
- If any record seems missing, **do not import, clear storage, reset, or overwrite the account**. Stop and capture the UI/status screenshots.

## Exact manual steps
1. On **desktop**, sign in, open Settings, verify account and cloud connection. Note the current Workout Schedule value for Tuesday (do not edit it).
2. In **Food Library** create **one test item** with an unmistakable name such as `SYNC-QA-20261012`, 11 kcal, 1 serving. Record its name and calories.
3. Wait for Food sync to finish and verify that the item is visible after one normal page refresh.
4. On **phone** in a separate browser session, sign in to the same account. Check that the exact Food Library item appears with 11 kcal (allow a manual refresh/reopen of Food if necessary). **Do not create a duplicate.**
5. On the phone, add one Food Diary entry for that item. Note the date, meal, time, and calories. Wait for confirmed sync.
6. On desktop refresh Food Diary for the same date. Confirm **exactly one** matching record (no duplicates), with the correct time and calories.
7. On desktop open Workout Log, Daily, and Weight. Verify previously existing records are still present. Do **not** change them for this verification.
8. On the phone check that the same existing Workout Log, Daily History, and Weight Check-ins are visible. Note mismatches without modifying either side.
9. When fully validated, delete **only your labelled test product and test diary entry** using the application's normal delete UI, then verify deletion on both devices. Skip cleanup if deletion is uncertain.

## Report back
For each row mark PASS / FAIL / NOT TESTED: desktop cloud status; item after desktop refresh; item on phone; diary on desktop; no duplicate diary; pre-existing Workout/Daily/Weight. Include browser type, device, approximate sync delay, errors, and screenshots *without account secrets*.

## Engineering evidence (automated, not equivalent to this test)
- Synthetic account sign-out/sign-in for Food, Daily, Workout and Weight: Playwright smoke regression.
- Independent Chromium contexts, eight snapshot feature groups with mocked Supabase: [Full UI #38185774877](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38185774877) SUCCESS.
- Real devices, real account, and real RLS isolation remain **untested**. Paid staging/security testing explicitly deferred (`SECURITY-DEFERRED-2026-10-12`).
