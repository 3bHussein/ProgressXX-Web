# Compact Food and direct section navigation

Updated 27 October 2026. Production root `index.html`; existing records, endpoints, account sync and database contracts preserved.

## Food priorities and shorter default view

The original seven panels and their controls remain in source order. The first four priorities are Nutrition diary, Quick add food, Today's food, then Manage food library. Four 44px+ shortcuts open the chosen panel on its own, with Show all sections to return to the overview. The shared focus notice includes the selected diary date so a past diary day is not mistaken for today while its date field is hidden.

The default overview keeps the three primary workflows visible and the existing secondary disclosures closed. The calorie summary is compact; the duplicate full-width Calories macro card is visually omitted while the existing totals/status nodes remain. Protein/carbs/fat remain visible. Habitual-food cards occupy one horizontal row instead of several vertical rows. Food library search applies to the entire source list before paging, showing eight products initially and eight more on request. Query/archive/account changes reset that page size. No product or log is removed.

## Repeat a historical amount

Quick add → Repeat previous food opens a native searchable dialog. It uses valid dated rows across loaded history, including older than 30 days, not just current favorites. Exact product ID + unit + amount + meal combinations are deduplicated to their latest dated entry. Eight results initially, Show more and full-list search. Names and amounts are rendered with textContent; literal user markup stays text.

Each result shows its recorded quantity/unit, meal and latest date. Use amount selects that exact compatible product, quantity and supported meal in the existing Quick add form. It is preview-only. The user separately presses Add, which uses the existing durable creation/outbox/Undo path and the currently selected diary date/current product nutrition. Historical nutrient snapshots and dates are not overwritten or copied as a new intake's time.

Deleted or archived products and changed units are unavailable; no name alias, automatic unarchive, guessed conversion or missing-product recreation. Invalid/future dates and invalid quantities are excluded without editing history. Click-time revalidation prevents an unavailable or removed result from being used. Search supports both historical and current names. Account changes close and clear the dialog before showing new sources.

## Across the app

The header's Sections control offers direct native buttons for the current page's real sections. Show only the selected section is enabled in that dialog, with an explicit checkbox to use a normal jump instead. A visible Show all sections control reverses focus mode. Selection is account-separated in memory and retained while navigating pages, returning to the default overview on reload/account change; it is not a new synced preference.

Food has its four primary shortcuts. Progress offers weight, weekly training and individual reference tools; the old exercise/overload/trend/session reference panels now live inside the existing closed More group. Calculators, Daily, Home and Insights expose their relevant targets. Settings retains its existing category directory. Routes with fewer than two meaningful sections do not show an empty/redundant section menu. Mobile shared headers/save-status chrome are shorter; save/retry/conflict details remain accessible. A 44px Back to top control appears after scrolling 600px, above the fixed navigation.

Existing Home, Food meal/search/product-form, calculator, Daily history and Insights evidence/check-in/weight/training shortcuts reveal their destination even if a different section was focused. Native disclosures and optional targets open for the explicit action without changing saved optional-section preferences. Escape closes each new dialog and returns focus; selection transfers focus to its actual destination. No separate document scroll container is imposed on the main page.

## Acceptance

`tests/compact-food-navigation-browser.cjs` checks original priority order, compact measured bounds, one-row usual foods, reversible single-section views and selected-date context, exact historical 125.5g preview, explicit mocked Add preserving old records, missing products/unit mismatch/future dates, full-list search/paging, native Escape/focus, old shortcuts after focus, account reset and EN/AR 320/390/768/1280. All external requests are blocked. Required Full UI and Firefox/WebKit workflows include this test with matching gated-deployment triggers. Existing functional assertions and release gate are unchanged.

Automated fixtures do not certify physical touch devices or live multi-account authorization. No production records, authentication, RLS, schema or new backend API changes. Database experiments remain paused.
