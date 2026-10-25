# Insights and weekly coaching audit — 24 October 2026

> Update 26 October: the primary overview now uses linked result/evidence/action cards. See [Insights evidence and actions](INSIGHTS-EVIDENCE-ACTIONS.md) for current date/source/comparison/navigation rules. The load-decision audit below remains the existing conservative heuristic.

## Scope and factual corrections

| Area | Reviewed behavior |
| --- | --- |
| Insights layout | Three summaries first; training, food/body, check-in/history and anatomy are four closed native disclosure groups. Existing controls and render/error-recovery handlers stay mounted. |
| Nutrition | Summary and detailed Insights totals include only entries with today's local diary date. They are logged totals, not a claim about complete dietary intake. |
| Exercise load advice | Removed the former automatic +2.5 kg suggestion based solely on a >1% estimated-1RM increase. The primary view now explains the records and missing information. |
| Muscle history | Removed elapsed-time percentage bars and the `rested` display classification. Elapsed days do not establish physiological recovery. Name-based muscle mapping remains approximate and can be corrected manually. |
| Dates | Invalid calendar dates and future calendar dates cannot support a load decision. A date-only entry dated today is valid; its approximate noon display timestamp is not treated as a future session. Date-only history uses noon as an approximation for elapsed-time displays. |
| Self check-in | Explicit zero sleep is recognized as an entered value; null/empty values are missing. Review flags are simple subjective app heuristics, not a diagnosis or training clearance. |
| Food amount | A product selection reuses the most recent dated/time-ordered positive portion for that product ID in the same unit. Same-minute ties use later entry order. Missing/incompatible portions fall back to the saved serving. Explicit manual amounts remain in control. |

## Product rule for the next-session explanation

This is a conservative, inspectable **application heuristic**, not a validated prediction model or an individualized training prescription.

1. Match the exact normalized exercise **and training day**, considering entries up to the selected week.
2. Read a sets/reps target only when it is explicitly present in the exercise name, for example `(3x8-12)`. Use the upper end of a range. Do not infer a repetition target from performed sets or arbitrary text; timed exercises are not interpreted as repetitions.
3. Annotated, nonnumeric, bodyweight, incomplete or mixed-load records do not establish a comparable working-load baseline. Warm-up sets are not guessed.
4. Respect configured current/next-week deload advice. Do not promise a heavier load on a particular calendar week.
5. If the target was missed, explain what is missing. If only one comparable success exists, repeat before considering a change. Duplicate same-date entries are not evidence of two successful sessions.
6. Only when two comparable entries meet the recorded target at the same load, show **consider a small increase**, conditional on controlled technique/effort and absence of pain. No specific kilogram increment is invented. A review flag in today's self check-in takes precedence for the latest week.
7. Missing data produces an explicit uncertainty message. Historical e1RM, workload and PR comparisons remain in a separate advanced disclosure and cannot provide a recovery measurement.

### Scientific context, without attributing the app heuristic to a guideline

The [2026 ACSM update](https://acsm.org/resistance-training-guidelines-update-2026/) emphasizes consistency and individualized programming rather than universal prescriptions. The [2009 position stand](https://pubmed.ncbi.nlm.nih.gov/19204579/) describes progression relative to the intended repetition workload and individual context. Neither source validates this app's two-record decision rule. The app does not assess technique, equipment differences, injury status or actual physiological recovery.

## Verification

`tests/simple-insights-coaching-browser.cjs` exercises 17 decision/data-quality branches, default closed disclosures, today-only nutrition totals, readable food selection, unit-safe portion restoration, real local add/reload, bilingual responsive layout and unchanged workout records. Existing Anatomy control and panel-failure fixtures explicitly open the new disclosures before verifying their content/actions; the main signed-in smoke follows the same anatomy disclosure flow. No test uses production credentials or health records.

Cross-browser CI and final publication evidence are recorded in `DEVELOPMENT-LOG.md` after verification. Real account/device acceptance is separate from synthetic tests. No database schema, account or existing fitness records were edited for this release.
