# PWA frontend acceptance

Production source: root `index.html`, `sw.js` and `manifest.webmanifest`. Database experiments are paused by the owner. These tests do not sign in or access real accounts.

| Check | Automated evidence | Limit |
| --- | --- | --- |
| Root/query shell fallback, scoped cache keys, errors/redirects, unrelated caches | `tests/pwa-shell-cache-contract.cjs` | VM lifecycle contract |
| Root/query offline navigation | `tests/pwa-offline-shell-browser.cjs` | Chromium browser offline emulation |
| Install prompt pending/dismissal/synchronous and asynchronous failure/choice rejection/accepted/completed | `tests/pwa-install-permission-recovery-browser.cjs` | Actual root UI with synthetic browser events; not OS installation |
| Notification denied/unsupported/request failure; camera refusal/manual fallback | Same permission recovery test | Mock browser APIs; no real device permissions or barcode lookup |
| Successful worker update, failed asset precache, fresh-launch fallback | `tests/pwa-update-failure-browser.cjs` | Actual Chromium lifecycle at `/ProgressXX-Web/`; disposable server refuses connections for outage verification |
| Draft retention across worker update/failure | Same update test | Synthetic localStorage, IndexedDB and unrelated CacheStorage fixtures |

The update fixture changes only its temporary worker/cache version and HTML marker. After activation it opens a fresh tab: existing documents are not automatically reloaded, to avoid interrupting work. It does not certify a live deployment rollback, every in-flight navigation during a worker transition, authenticated offline data, or other browser engines.

## Remaining owner-device checks

Use the production root URL and preserve existing browser storage. Check Android/Chrome installation and dismissal, launcher opening, browser/OS notification denial, camera denial with manual input still usable, and a later app update while a draft is open. Do not clear storage or unregister service workers as a default remedy. Record device/browser versions and observed results without publishing personal fitness data.

Real Android, Firefox/WebKit, background notifications with the app closed, live rollback and commercial data-safety gates remain unverified. Passing this frontend matrix does not approve commercial launch or resume database work.
