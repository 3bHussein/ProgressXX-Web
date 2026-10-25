# Practical weekly review and exercise records

## Scope

Progress now leads with three filterable counts and one selected exercise rather than rendering a long list of every load decision. Counts are unique completed exercise/training-day pairs logged in the selected week, not sessions or a health score. Skipped entries and active-session drafts are excluded. A comparison is against the most recently dated completed record in an earlier numbered week for the same normalized full exercise name and training day. Weeks need not be consecutive. Renamed exercises and different days remain separate. The latest chronologically dated record in the selected week represents that pair. Dates and week labels remain visible.

Insights' exercise panel also displays this recorded comparison and up to six raw recent records through the selected week. History is a native closed disclosure. Existing advanced weekly metrics/PRs remain inside Detailed weekly numbers. No existing workout records, targets, formulas, storage, API contracts, queues or database schema are changed.

## Comparison rules

Both records require valid distinct nonfuture calendar dates in chronological order, week integers 1–999, clean numeric sets, positive finite load, integer reps 1–100, at most 30 sets, a uniform load within each record and equal set counts. Text, zero/bodyweight, mixed-load/warm-up, partial or absent entries receive an explicit context message. No estimated 1RM or volume multiplier forces an improvement verdict.

| Recorded change | Category | Meaning |
| --- | --- | --- |
| Same load and set count, more total reps | Improved records | More recorded reps; technique/effort unmeasured |
| Higher load and every corresponding set keeps at least its previous reps | Improved records | Heavier recorded work with maintained reps |
| Same load, set count and total reps | Same recorded result | Set-level distribution can differ; not proof of plateau |
| Same load with fewer reps, or lower load with no set increasing reps | Needs context | Lower recorded work; the reason is unknown |
| Heavier with fewer reps / lighter with more reps | Needs context | Trade-off, no forced win/loss |
| Changed set count, invalid/missing data or deload | Needs context | Not a reliable progression verdict |

The comparable-numeric count includes valid trade-offs and lower work, so it differs from the improved count. Needs context is not a failure label. Either record in the app's existing recurring deload block (W26–30, W36–40, etc.) suppresses a progression verdict. A prior deload also suppresses a new increase display: review planned working sets and recent normal weeks instead.

## Next step and limitations

For normal comparisons, the existing explainable sets/rep-target next-session rule remains unchanged, including its conditions, uncertainty, current check-in and deload checks. The recorded-change comparison is separate from permission to increase a load. Numeric improvement alone does not validate technique, effort, recovery or pain status. The older custom coaching rule is documented in INSIGHTS-LOGIC-AUDIT.md; this change is not a newly validated physiological predictor or a training prescription.

Changing a summary filter or exercise updates one comparison and one explanation; selection/filter persist during same-week language changes and reset appropriately for another week. Empty categories and weeks are explained. EN/AR text, directional signed numbers, keyboard filters/native history and bounded long-name selectors are included.

## Verification

New `tests/practical-weekly-progress-browser.cjs`: 25 comparison cases plus weekly unique-pair counts, keyboard filters/focus, exact load/rep evidence, unchanged-total rep redistribution, nonconsecutive weeks, different-day identity, deload display guard, escaped and long names, native history, empty week, Insights integration, EN/AR 320/390/768/1280 and immutable source records. Synthetic data and blocked external traffic; no real backend writes. Wired to Full UI and Firefox/WebKit CI.

Local Chromium also passes existing 17 coaching/data-quality cases, all-page mobile, Insights panel failure/retry and Anatomy controls, language, session drafts/meal repeats and mocked-auth save/reload/logout smoke. Translation catalogue (876), release-workflow/database-pause and whitespace checks pass. Exact final CI/publication evidence belongs in DEVELOPMENT-LOG.md. Real-account and physical-device acceptance remain separate.
