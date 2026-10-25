# Insights: a result, evidence and a useful action

## What changed

The primary view replaces lifetime counts with one prioritized next step and three plain-language result cards: recorded training change, the food/weight evidence for the same calendar period, and today's self check-in/reminders/water. A native week selector gives an explicit date range. Each card offers closed evidence and a real drill-down. The four existing detailed/reference groups and error-recovery controls remain mounted and closed by default.

This is descriptive analysis of loaded records. It does not diagnose fatigue, infer body-fat change, prescribe calories or promise a heavier load. There is no new composite readiness/confidence score or guessed causal relationship.

## Period and source rules

Weeks start Monday. The current week ends today, while completed periods use Sunday. Initially select the most recent calendar week containing a completed workout in the last 28 inclusive days; otherwise select the latest observed period, or the current empty period. Up to 12 current/observed weeks remain selectable. The displayed range is always explicit; today's routine/check-in card is separately dated and does not become historical when another period is selected.

Read directly from the existing `data`, `foodLog`, `progressPhotos()`, `v2Checkins()`, active reminders/done map and today's saved water record. No imported copy of these domains is maintained. Invalid/future dated rows and duplicate nonempty IDs are excluded from the analysis, with inspectable counts. Sources remain unchanged. The last valid loaded occurrence wins for a repeated ID. A refresh is coalesced with requestAnimationFrame after visible-domain renders; opening Insights always reads the current in-memory state. Returning focus/visibility and day rollover also refresh local results without fetching or writing records. Language/refresh preserves expanded evidence and the focused selector/summary/action when that same target remains present; account changes clear the selected period and replace prior results.

## Training result

Match normalized exercise AND training day. For each pair with an entry inside the chosen period, compare its latest dated entry with a strictly earlier programme week, earlier date and no more than 84 days before that entry. The 84-day window is an explicit app scope, not a physiological rule.

Reuse `pxCompareRecordedSessions`: comparable positive numeric working loads, equal set counts, valid repetitions, date/week validity and deload context. More total reps at the same load or a higher load with corresponding reps maintained are recorded improvements. Same totals do not establish a plateau; altered reps/load, raw text, bodyweight, mixed loads, unmatched histories or deload require context. The UI shows the actual dates, programme weeks and raw records, without silently treating annotations as equivalent equipment.

The lead action prioritizes today's subjective review flag when the selected period includes today; otherwise lower/trade-off records, deload, recorded improvements, unchanged records, contextual entries and then missing food/weight evidence. Positive training evidence remains useful even if nutrition is incomplete. No new load-increase heuristic is introduced: the action opens the existing comparison/rep-target explanation.

A Progress drill-down is used only when both selected AND previous evidence agree with the existing programme-week review. Otherwise the action opens the source workout log filtered by exact training day, week and exercise, avoiding navigation to a different comparison.

## Food and weight

Both use the selected calendar window. Calories and protein validate independently: finite, nonnegative numbers or nonblank numeric strings; null, blank, boolean and nonnumeric values are unknown. Each nutrient mean is a sum of valid logged quantities divided by its own distinct observed-day count. No missing day or field is filled with zero. A day containing logged food is not assumed to contain every consumed meal. Nutrient coverage, unknown fields and a clearly labelled today's calorie subtotal remain inspectable. Historical weeks are never graded against current targets.

Weight uses the existing strict valid-source filter and equal-weight daily means. An incomplete current week compares the same weekdays in the prior week. A direction is labelled only if BOTH periods have at least three measured days, consistent with the existing display heuristic. Show the two date windows, means and day/reading coverage. A mean difference is not attributed to logged calories, body fat or any intervention.

Food actions set the actual diary date to the first missing calorie day (or the period's observed end). The weight action explicitly adds TODAY's measurement, with date set to today and focus on the existing input. These actions never create records automatically.

## Today's routine

Read the current saved self check-in and the existing subjective `ProgressXXV2.readiness` review classification, with numeric range validation. Missing values stay missing, including when the module is unavailable. Zero entered sleep remains an entered value. The rule is not recovery clearance.

Reminders use the existing enabled/done semantics. Water is shown only when an actual water record exists for today: a default/unentered value is not described as zero intake. Check-in actions reload the saved form only when its date has changed, then reveal the relevant optional detail group before focusing sleep; Daily actions open the actual Daily page. No score is derived from unchecked habits or workout timing.

## Mobile, privacy and verification

The anatomy reference retains button nodes for selection-only updates, preserving native scroll/focus in both LTR and RTL instead of rebuilding a focused scroller. Native controls/disclosures, 44px+ actions, bounded/wrapping names, LTR-isolated date ranges/fractions in Arabic, and no raw user content interpolated into new HTML. Details remain closed until requested. The analysis changes filters/focus only and adds no API endpoints or record writes. Drill-downs use normal page navigation, which retains the existing domain refresh/synchronization hooks. A source note states that loaded local records and pending sync may differ between devices, without asserting cloud completeness.

`tests/insights-evidence-actions-browser.cjs` covers exact-pair comparisons, lower/trade-off/deload/missing/positive priorities, current-vs-historical check-in scope, daily-balanced weight/matching partial periods, independent calorie/protein coverage, invalid/future/duplicate/unknown data and immutability. Browser actions verify the exact Progress evidence, source-log fallback, actual Food date, today's Weight input, hidden check-in reveal, Daily navigation, live source refresh, retained evidence, keyboard focus, account reset and EN/AR 320/390/768/1280 layouts. It is wired into Full UI, Firefox/WebKit and matching release triggers. Publication/CI evidence is recorded separately in the project logs. Physical-device and real-account/cloud/security gates remain separate.
