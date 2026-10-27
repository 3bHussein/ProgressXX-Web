# Daily, Progress and Insights: focused mobile workflows

Updated 27 October 2026. Root `index.html` only. No database, API, authentication or historical-record migration.

## Daily

Water, a compact supplement checklist, then closed previous-day history. The previous Reminders header, notification banner, test/permission buttons, technical background-alert explanation and per-item editing controls are in Settings → Preferences & tools → Supplements & notification settings. Daily's Manage shortcut opens that exact section. Removing notification management from Daily does not silently disable existing configured alerts or delete supplements/history.

Arrange exposes native labelled Move up / Move down buttons. Boundaries are disabled. An explicit move saves a reordered copy through the existing account-scoped `DAILY_REMINDERS_KEY` snapshot before replacing the in-memory list; storage rejection retains the original order and announces failure. IDs, quantities, times, enabled flags and completion history stay attached to their original items. The existing snapshot sync is used; no new endpoint or separate ordering store. Cross-device order follows that snapshot, with the existing account/conflict rules. Physical-device/cloud acceptance remains separate from mocked local persistence tests.

## Progress

Body weight and Training progress remain primary. Latest and previous valid individual readings, their dates and signed difference are visible immediately above the weight form. They are sorted by date, creation timestamp, then stable input order for indistinguishable timestamps. A same-date pair is labelled readings, not separate days. Future, invalid-date, duplicate-ID and nonpositive/invalid weight records are excluded from this comparison without changing history. Empty/one-reading states stay unknown rather than inventing a baseline. These individual readings remain distinct from the existing daily-balanced weekly trend.

Native shortcuts jump to weight/date, training/week or More. Measurements, calendar, goals and personal records are grouped under a closed disclosure. The existing View PRs shortcut reveals its exact reference target. Add, sync, delete, backup, weekly report and existing comparison/decision rules remain unchanged.

## Insights

Choose one question: My next session, My weight & food, or Today's check-in. Exactly one result card is shown; the original period selector, source validation, three models, evidence disclosures, recovery boundaries and advanced references remain. The prioritized lead is shown with training, avoiding an unrelated training instruction above food/check-in results.

Training shows up to four exact exercise/day pairs with dated Before/Latest raw performances and a direct action to the existing next-session review. Weight/food shows logged calorie and protein averages, each with its own observed-day count; missing fields/days are not zero. Existing matched-window weight rules and unknown-data treatment apply. Supplement wording reflects the checklist rather than promoting reminder management. Selection/focus survive local refresh; account changes reset the question and replace sources. Read-only analysis uses loaded domain records; normal navigation keeps existing refresh hooks.

## Verification

`tests/daily-progress-focus-browser.cjs`: actual reorder buttons, persisted order, completion identity, storage failure, management shortcut/edit reachability, language changes, same-day previous/latest weights, future exclusion, More and weight shortcuts, raw workout pairs, one visible question, refresh focus, account isolation, EN/AR 320/390/768/1280 and unchanged workout/weight/food fixtures. External requests blocked; no production account writes.

Existing linked Insights and Daily editing tests now navigate via the new visible question/Manage controls. Required Full UI and Firefox/WebKit workflows include the new acceptance file; gated deployment/Fast/Cross push paths match. Existing strict assertions and release gate remain.

## Suggested next improvements (not implemented here)

1. Edit an existing weight reading, with explicit confirmation of which date/record will change, instead of deleting and entering it again.
2. Save a user-chosen next-session rep/load target and show it inside Start workout alongside the actual prior performance. Keep planned targets distinct from recorded results and automated suggestions.
3. A short weekly reflection attached to its calendar period: what changed, why the user changed it, and the next review date. Do not infer causes from correlations or duplicate food/weight history.
