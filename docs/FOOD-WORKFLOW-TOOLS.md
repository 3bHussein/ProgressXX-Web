# Food workflow tools and weekly report

## Scope

Root index only: saved per-product portions; local archive/restore and possible-duplicate review; multi-selection diary meal/date moves; optional section visibility; a read-only calendar-week report with native print/PDF and text share/download. Existing numeric/raw workout, diary, backup, conflict and account pathways are preserved. No SQL, migration, RLS, auth or backend schema changes.

## Device preferences

`progressxx-food-workflow-prefs-v1:<encoded account scope>` is deliberately stored directly in browser localStorage, outside the account snapshot `values` map. It therefore does not schedule cloud profile writes, travel through account snapshots, or enter the explicit JSON backup. Every surface discloses this limitation. A stable signed-in account scope is needed for writes; the capture fixture explicitly supplies an isolated demonstration scope. The preference cache is invalidated by raw value or account changes.

Profiles use prefixed product-ID keys, not product names. A saved portion has an explicit name, positive finite base quantity and exact base-unit string. Multiplication must remain positive/finite; changing a product's base unit invalidates incompatible conversions. At most 12 active portions per product; a same-name portion replaces that product's matching portion. New temporary products must finish saving first. Applying a conversion changes only the existing base amount/preview, never adds a record automatically. The existing Add path stores the original base unit and nutritional snapshot.

Archive choices leave the product and every diary record intact. They filter normal library/quick/Favorite/Recent/usual/protein-suggestion choices; Show archived and Restore remain available. Existing saved-meal snapshots are retained. Possible duplicates are grouped by exact trimmed barcode, or normalized name when no barcode is present. They are review candidates, not evidence of identical nutritional content. No automatic merge or record reassignment.

## Batch moves

A closed disclosure exposes explicit row selection and destination meal/date controls. Dates must be valid and no later than today. An optional destination is allowed only when the other field changes. IDs must resolve uniquely to current selected-day rows. Amounts, nutrients, names, product IDs and times remain unchanged.

Known in-flight food writes, snapshot busy/conflict state, and selected rows already in the pending/outbox queues block another move. A local transaction uses the existing verified multi-key write/rollback helper for the new log, pending IDs, idempotent log upsert queue and dismissal of an older Undo notice. The feature does not claim an atomic remote transaction across multiple rows; each queued row uses the existing uploader. Offline/reload retry retains the local result. Storage errors ask users to review the diary before retrying instead of promising a write was confirmed. Selection resets when the account or selected diary day changes.

## Weekly report

Calendar weeks start Monday; the current week ends at the current observed day. Invalid/future dates are excluded and duplicate nonempty IDs use the last loaded record. Completed exercise entries and distinct training dates are separate counts, never mislabeled as sessions or sets. Food rows require finite, nonnegative calories/protein/carbs/fat; missing/null/blank nutrient data is excluded and counted. Means divide totals by distinct days with valid food records, not seven assumed complete days. Overflow yields an unknown value. Historical targets are unavailable, so the current target is never used to grade a previous week.

Weight reuses valid-source rows and daily-balanced means inside the exact chosen date window. Coverage is shown. No fat-loss/recovery/diet recommendation is inferred. The next action is to review missing records before changing a plan.

Native dialog: Escape/Close and focus return, EN/AR direction, Print/save PDF with report-only print CSS, and explicit navigator.share text with cancellation handling or a text-file fallback. Report data is generated on request, never uploaded. Account changes close and clear the dialog. Sharing is always a separate user action.

## Optional sections

Food library, saved meals, planner/history and the four detailed Insights groups can be hidden through Settings → Preferences & tools. Logging and save/recovery controls are not configurable away. Settings always retains the controls to reveal hidden sections. Direct library search/edit reveals the library for the task; this does not rewrite the stored preference.

## Verification

`tests/food-workflow-tools-browser.cjs` is wired to Full UI and Firefox/WebKit. Synthetic coverage: exact-unit portions and preview arithmetic, invalid/overflow inputs, reload, no snapshot preference key, archive/restore and immutable diary, duplicate review, actual checkbox/meal batch flow, invalid destinations, busy/conflict/pending/missing guards, atomic local rollback, queue/reload/mock upload, account-local options and report cleanup, calendar/arithmetic/missing-nutrient report rules, actual text download, print action, and EN/AR 320/390/768/1280 layouts. Chromium additionally generates a real PDF; extracted text was inspected. Documentation capture uses only synthetic in-memory fixtures and blocked external requests.

Required CI/Pages and physical-device acceptance are recorded separately in the project logs. No assistant production-record mutations. Backend security and wider real-account/device/commercial gates remain open.
