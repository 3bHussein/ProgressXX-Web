# Weekly weight and usual-food shortcuts

## Weekly weight

Progress weight check-ins now begin with a calendar-week comparison. The existing seven-entry average is retained, correctly labelled, inside a native Individual readings & weight goal disclosure along with the original chart/goal controls. Input/goal/history IDs and persistence remain intact. Training programme week numbers are not used for body-weight calendar weeks.

Weeks start Monday using date-key/UTC calendar arithmetic. A completed selected week compares its full Monday–Sunday range with the immediately preceding calendar week, never silently bridging a missing week. The current unfinished week compares Monday through today with the same weekdays of the previous week. Each card shows both dates, distinct measured-day coverage and reading count. Up to eight current/observed weeks can be selected and inspected in native weekly history.

Only positive finite weights on strict, valid, nonfuture calendar dates are used. Duplicate nonempty IDs use the last valid occurrence; absent IDs remain distinct readings. Ignored invalid/future/duplicate entries are counted, never rewritten or removed from source history. Legacy per-reading stats/chart now use the same valid-source filter, avoiding fabricated dates from the old migration helper in this analysis.

Multiple readings in one day first form a daily mean. The weekly value is the mean of those daily means, so frequently weighing on one day does not give that day extra influence. Incremental arithmetic avoids sum overflow with finite inputs. Displayed means are rounded to two decimals; the signed difference is calculated from those displayed values for consistency. No outlier/physiological range is invented or silently filtered.

A direction label requires at least three measured days in both compared periods. This is an explicit custom display threshold, not statistical confidence, a medical rule or evidence of body-fat change. Sparse periods still show their factual values and a limited-comparison label; an absent period has no delta. No calorie/diet change recommendation is generated.

## Usual foods and compatible portions

Quick add shows up to six current library products, ranked from the last 30 inclusive calendar days of loaded diary history: distinct days logged first, entry count second, then date/time recency and stable array-position ties. A derived index is built in a single pass with food-time metadata parsed once, instead of rescanning history per product or caching stale mutable objects. There is no new preferences table or history write. This does not claim complete all-time history beyond the already loaded account data.

Matching requires the exact product ID and current serving unit, a valid nonfuture date and a finite positive amount. Duplicate log IDs use their last valid appearance. Different products with identical names remain separate; removed products, mismatched units and future/invalid quantities do not populate these shortcuts. Shared Saved product/Favorites/Recent portion lookup follows this same rule; no name-based fallback or unit conversion is used. Recent/Favorite buttons now use native DOM text and closures for safe arbitrary IDs/names.

Choosing a usual food only prepares its last matching dated quantity and current-library nutrition preview. It preserves the selected meal and does not write a diary entry until Add. The previous-meal snapshot-copy feature remains separate. Home/Food Add actions focus the usual choices when available; otherwise the original product selector. Search all foods opens the existing search with the All filter. Long shortcut names are bounded to two visual lines, retained in the accessible text/title and full selected preview.

## Verification and limits

`tests/weekly-weight-usual-foods-browser.cjs` fixes the browser calendar to a known Sunday and uses synthetic, account-scoped fixtures with blocked remote requests. Covers daily balancing, rounded differences, coverage/reading counts, partial-week weekday alignment, Monday limits, missing prior week, historical full week, leap/year boundaries, invalid/future/duplicate entries, finite-input sum stability, 30-day boundary/ranking, same-name/different-ID and unit safety, preview with no write, meal preservation, actual add/Undo/reload, Home focus, All-search filter, native keyboard details, long names and EN/AR 320/390/768/1280. It verifies source-record immutability before intentional Add. Wired to Full UI and Firefox/WebKit CI.

Local Chromium also passes prior Food portions, weekly/coaching, Food/Weight browsing, Food Undo, session/meal drafts, Home/all-page mobile, language, backup download/import/reload and mocked-auth save/reload/logout regressions. Catalogue 876, release-workflow/database-pause and whitespace checks pass. EN/AR previews inspected. Exact-runtime CI/Pages and published-byte evidence is in DEVELOPMENT-LOG.md.

No database, schema, API/auth/RLS, live-account or saved-record changes were executed. Normal user Add uses the existing save/outbox/Undo path. Physical-device/real-account/commercial/security gates remain separate.
