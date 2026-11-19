# Compact Food and direct section navigation

Updated 19 November 2026 for [PR #53](https://github.com/3bHussein/ProgressXX-Web/pull/53). The redesign is in the root `index.html`.

## Food priorities and shorter default view

The original seven panels and their controls remain in source order. The first four priorities are Nutrition diary, Quick add food, Today's food, then Manage food library. Four 44px+ shortcuts open the chosen panel on its own, with Show all sections to return to the overview. The shared focus notice includes the selected diary date so a past diary day is not mistaken for today while its date field is hidden.

At widths up to 600px the calorie summary uses three tiles and the macro row shows protein, carbs and fat. The main Add food button opens Quick add and focuses the food selector. Search, Recent, Favorites and Scan barcode use the existing saved-food browser and scanner. The shared navigation opens the actual destination before moving focus, even when the user started in a different focused section.

The selected day’s diary follows the Add food button. Meals with entries can collapse independently. Their titles and totals stay visible, and the existing Add food actions still preselect the meal. Disclosure state belongs to the current diary view and resets on date or account changes. The library, saved meals, planner and history start as native closed disclosures. On desktop, Quick add and meal entries remain visible. The form IDs, data models and save handlers continue to serve both layouts.

## Repeat a historical amount

Quick add → Repeat previous food opens a native searchable dialog. It uses valid dated rows across loaded history, including older than 30 days, not just current favorites. Exact product ID + unit + amount + meal combinations are deduplicated to their latest dated entry. Eight results initially, Show more and full-list search. Names and amounts are rendered with textContent; literal user markup stays text.

Each result shows its recorded quantity/unit, meal and latest date. Use amount selects that exact compatible product, quantity and supported meal in the existing Quick add form. It is preview-only. The user separately presses Add, which uses the existing durable creation/outbox/Undo path and the currently selected diary date/current product nutrition. Historical nutrient snapshots and dates are not overwritten or copied as a new intake's time.

Deleted or archived products and changed units are unavailable; no name alias, automatic unarchive, guessed conversion or missing-product recreation. Invalid/future dates and invalid quantities are excluded without editing history. Click-time revalidation prevents an unavailable or removed result from being used. Search supports both historical and current names. Account changes close and clear the dialog before showing new sources.

## Across the app

The header's Sections control offers direct native buttons for the current page's real sections. Show only the selected section is enabled in that dialog, with an explicit checkbox to use a normal jump instead. A visible Show all sections control reverses focus mode. Selection is account-separated in memory and retained while navigating pages, returning to the default overview on reload/account change; it is not a new synced preference.

Food has its four primary shortcuts. Progress offers weight, weekly training and individual reference tools; the old exercise/overload/trend/session reference panels now live inside the existing closed More group. Calculators, Daily, Home and Insights expose their relevant targets. Settings retains its existing category directory. Routes with fewer than two meaningful sections do not show an empty/redundant section menu. Mobile shared headers/save-status chrome are shorter; save/retry/conflict details remain accessible. A 44px Back to top control appears after scrolling 600px, above the fixed navigation.

Existing Home, Food meal/search/product-form, calculator, Daily history and Insights evidence/check-in/weight/training shortcuts reveal their destination even if a different section was focused. Native disclosures and optional targets open for the explicit action without changing saved optional-section preferences. Escape closes each new dialog and returns focus; selection transfers focus to its actual destination. No separate document scroll container is imposed on the main page.

## Acceptance

`tests/compact-food-navigation-browser.cjs` checks original priority order, compact measured bounds, one-row usual foods, reversible single-section views and selected-date context, exact historical 125.5g preview, explicit mocked Add preserving old records, missing products/unit mismatch/future dates, full-list search/paging, native Escape/focus, old shortcuts after focus, account reset and EN/AR 320/390/768/1280. All external requests are blocked. Required Full UI and Firefox/WebKit workflows include this test with matching gated-deployment triggers. The browser fixtures explicitly open Quick add on mobile, as a user would. The release gate still requires validation of the exact main commit.

Automated fixtures do not certify physical touch devices or live multi-account authorization. No production records, authentication, RLS, schema or new backend API changes. Database experiments remain paused.


## November 19 verification

| Evidence | Result |
| --- | --- |
| [Original Full UI](https://github.com/3bHussein/ProgressXX-Web/actions/runs/44473981078), [Firefox/WebKit](https://github.com/3bHussein/ProgressXX-Web/actions/runs/44473981054), [Snapshot](https://github.com/3bHussein/ProgressXX-Web/actions/runs/44473980980), [Workout Log](https://github.com/3bHussein/ProgressXX-Web/actions/runs/44473981067) | Playwright 1.55.0 refused browser dependencies on Ubuntu 26.04. Test steps were skipped by the failed install. |
| [Runner pin](https://github.com/3bHussein/ProgressXX-Web/commit/0641179eab34a160f98761e3d843e121407b9910) | The four browser workflows and Pages smoke use Ubuntu 24.04. The first WebKit job installed successfully, then exposed a navigation regression because the draft replaced the native library ID. |
| [Mobile UI revision](https://github.com/3bHussein/ProgressXX-Web/commit/e8cf227d65f9e810690c2d76895476d7003a72b9) | Restored the original library ID and integrated Quick add with the shared navigation. [Cross-device Snapshot](https://github.com/3bHussein/ProgressXX-Web/actions/runs/44476912965), [Workout Log](https://github.com/3bHussein/ProgressXX-Web/actions/runs/44476912795) and [Fast Conflict Safety](https://github.com/3bHussein/ProgressXX-Web/actions/runs/44476912667) passed. [Firefox/WebKit](https://github.com/3bHussein/ProgressXX-Web/actions/runs/44476912718) exposed a repeat-meal fixture that still expected Quick add to open by default. The fixture now opens it before testing preview, duplicate protection and offline retries. [Full UI](https://github.com/3bHussein/ProgressXX-Web/actions/runs/44476912674) tracks the initial UI revision. |
| Local browser fixtures | Chromium and Firefox passed the 320/360/390/430px Arabic and English mobile checks, plus 768/1280px checks. Chromium, Firefox and WebKit passed the Food add/edit/delete/Undo fixture, including save and Cancel focus, pending uploads, retry and account scope assertions. WebKit passed repeat-food navigation and food browsing. |
| Release | Pending required checks and PR approval. No Pages deployment was made from this branch. See the PR for the latest check results. |

Camera hardware and touch on physical devices still need separate verification. The snapshot and conflict fixtures use synthetic state. Production CAS and real-device synchronization acceptance are tracked separately. No Supabase production records, permissions or schemas were modified.
