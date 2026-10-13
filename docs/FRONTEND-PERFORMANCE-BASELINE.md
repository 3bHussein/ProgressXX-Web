# Root startup: optional barcode decoder

The external html5-qrcode 2.3.8 script used to block HTML parsing before the login UI. It now loads asynchronously when the barcode dialog is explicitly opened. A shared promise avoids duplicate downloads; failure/10-second timeout keeps manual input available and permits a later explicit retry. Closing during download prevents late camera startup. The first camera use now incurs the decoder download; startup no longer waits for it.

## Controlled measurement — 2026-10-13

Chromium headless, 390×844 viewport, five fresh contexts per version, local root server, all outside resources intercepted, a synthetic 1500 ms CDN delay, no account login and zero Supabase requests. Metric: `performance.now()` after DOMContentLoaded and the login email field becomes visible.

| Measure | Before | After |
| --- | --- | --- |
| Median login readiness | 1666.5 ms | 139.9 ms |
| Decoder requests during startup, each trial | 1 | 0 |
| Supabase requests, each trial | 0 | 0 |

Raw trials/source fingerprints: [startup-2026-10-13.json](performance/startup-2026-10-13.json). Reproduce the current version by serving root at `127.0.0.1:8765` and running `node scripts/measure-root-startup.cjs /tmp/progressx-root-startup.json`. Reproducing the before version requires its historical root source, fingerprinted in the report.

The measured difference is for this injected slow-CDN scenario. It is not a live-site speed guarantee, Core Web Vitals, authenticated-workspace benchmark or actual mobile-device measurement. Timing is not a CI pass/fail threshold; the regression checks the eliminated startup request and functional recovery instead.

`tests/barcode-lazy-library-browser.cjs` covers zero startup requests, shared on-demand load/reuse, close-before-load, failed download/retry and bounded timeout/manual fallback. Registered in default Chromium Full UI and the Firefox/WebKit frontend matrix. PR #23 and main Full UI/Fast/Deploy/Pages SUCCESS; performance root deployed byte-exact. Main Firefox matrix failed in the earlier anatomy image fixture, independently verified corrupt; corrective [PR #24](https://github.com/3bHussein/ProgressXX-Web/pull/24) SVG/decode-wait/failure-fallback fixture passed PR and main CI. The new decoder test passed standard PR Firefox/WebKit and main WebKit. Corrected main [Cross-browser 38364333014](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38364333014) (both engine jobs), [Full UI 38364332969](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38364332969) and Pages 38364331628 SUCCESS on 620b7c6, with identical root/worker bytes to runtime 1318aea.

No account/sync data, production schema/grants/RLS/migrations, database experiments or paid services changed. Existing root production target and database pause remain in force. Remaining performance work includes real-device/field data, LCP/CLS/interaction measurements, authenticated UI with local fixtures and large-list rendering.


## 2026-10-13 — Synthetic Workout Log responsiveness

Root `index.html` now appends only new cards when the rendered prefix is unchanged. It compares full escaped card content and DOM references, so same-ID edits, deletion, reordered or replaced snapshots fall back to a fresh render. No-op renders retain card nodes and focus. Search/filter input events share one animation-frame render; immediate filter/reset actions cancel queued work. Sorting, search fields, 24-record increments, stored data and synchronization are unchanged. No persistent search index or data cache was added.

Five cold Chromium contexts at 390×844, 5,000 synthetic in-memory records, external requests blocked: median cumulative synchronous work for 30 load-more calls **251.8 → 59.5 ms**; 12 input events in one task cause **12 → 1** renders and median time through two animation frames **48.9 → 13.0 ms**. Initial render **6.7 → 7.0 ms**, with no meaningful initial-render speed claim. This measures a local synthetic burst/DOM scenario, not normal keyboard event timing, physical devices, field responsiveness or Core Web Vitals. Raw five-trial results/source hashes: [workout-log-2026-10-13.json](performance/workout-log-2026-10-13.json). Reproduce with `scripts/measure-workout-log.cjs` against a local server; optional `PX_LOG_SOURCE` reads a local baseline HTML. Fixtures bind the production filter handler without account initialization. Zero backend requests in all ten measurements.

New `tests/workout-log-incremental-browser.cjs` verifies 5,000-record pagination, DOM/focus retention, input coalescing, immediate-action cancellation, same-reference edits, deletion, replacement snapshots, status/time search, escaping and unchanged input data. Registered in Full UI and Firefox/WebKit matrix. Local Chromium regression and 68/68 full UI/static checks PASS; remote checks pending at implementation time. Database experiments remain paused; Milestone 2 incomplete, Phase 3 IN PROGRESS, commercial launch NOT APPROVED. No Supabase/SQL, production permissions/migrations or paid services.
