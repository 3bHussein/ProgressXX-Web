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

`tests/barcode-lazy-library-browser.cjs` covers zero startup requests, shared on-demand load/reuse, close-before-load, failed download/retry and bounded timeout/manual fallback. Registered in default Chromium Full UI and the Firefox/WebKit frontend matrix. Remote CI/deployment pending until closeout evidence is linked.

No account/sync data, production schema/grants/RLS/migrations, database experiments or paid services changed. Existing root production target and database pause remain in force. Remaining performance work includes real-device/field data, LCP/CLS/interaction measurements, authenticated UI with local fixtures and large-list rendering.
