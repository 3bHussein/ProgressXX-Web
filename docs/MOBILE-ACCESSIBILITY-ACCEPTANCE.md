# Mobile keyboard and Arabic acceptance

Production target: root `index.html`. Keep database experiments paused. Automated checks use mock cameras and UI-only fixtures without account login, uploads or Supabase requests.

| Area | Verified by the local browser regression | Remaining limit |
| --- | --- | --- |
| Barcode modal | Named dialog/close control, input label, live status, initial manual-input focus, Tab/Shift+Tab containment, Escape and focus return | Real screen readers not verified |
| Mobile barcode controls | Buttons at least 44×44 px and within view at widths 320/390/768; numeric field remains LTR; Enter invokes manual lookup | Lookup is mocked; not food-provider availability or real camera decode |
| Camera lifecycle | Repeated open starts one scanner; close while startup is pending eventually stops/clears it; stale decode callback ignored; reopening waits for prior cleanup; Android back callback closes modal | Driver, permission prompt timing and physical Android hardware not verified |
| Arabic anatomy | Detail and muscle list have Arabic language/RTL; logical alignment and selection accent; English scientific subtitle stays LTR; empty-result language transitions reset direction | Full-app Arabic translation and all mixed-text layouts not certified |

Regression: `tests/mobile-barcode-keyboard-rtl-browser.cjs`, registered in Full UI CI. Existing anatomy zoom/reduced-motion checks remain in `tests/mobile-motion-anatomy-accessibility.cjs`; permission fallback checks remain in `tests/pwa-install-permission-recovery-browser.cjs`.

For a later owner-device check, use the production root and preserve storage. Open the scanner and close it while permission is pending, confirm the camera indicator stops after startup completes, reopen once, use manual entry after denying permission, and test Arabic anatomy search with and without results. Do not publish personal workout/food data in test reports.

These checks do not prove cross-device synchronization or authorize commercial launch. Firefox/WebKit, actual Android back handling, screen readers and real camera decoding remain open.


Selected frontend fixtures pass locally in Chromium, Firefox and WebKit (9/9 total across three scripts); PR #22 and matching main standard-runner matrix/Full UI CI also SUCCESS. See [cross-browser acceptance](CROSS-BROWSER-ACCEPTANCE.md). This does not close real-device, screen-reader or full authenticated engine acceptance.


## 2026-10-13 Cairo — Workout Log keyboard and screen-reader controls

Root-only frontend fix: load-more keeps its DOM button and keyboard focus between batches. On the final batch, the removed control transfers focus to the first newly added Edit button. Search/week/status/sort have accessible names, Edit identifies its exercise/week and result count is a polite atomic status. Stored data, sorting/search and synchronization unchanged. New UI-only browser regression uses Enter/Space to paginate 60 synthetic workouts, checks final focus, named controls, search and immutable input; zero backend calls. Registered in Full UI and Firefox/WebKit matrix. Local 69/69 Full UI/static checks PASS, including new Chromium regression; remote CI/deployment pending. Database experiments remain paused; Milestone 2 incomplete, Phase 3 IN PROGRESS, commercial launch NOT APPROVED. No SQL/production schema/grants/RLS/migrations, staging/backups or paid services.


## 2026-10-13 Cairo — Workout Log keyboard closeout VERIFIED

[PR #26](https://github.com/3bHussein/ProgressXX-Web/pull/26), source `161cae0e32b8957bf889afa2ad032646c7644849`, merge `7c57ab023bf4e92e050995240874ba9b342c7471`. All eight PR workflows SUCCESS. Main matching checks: [Fast conflict safety contracts #38426016008](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38426016008) SUCCESS, [Cross-browser frontend accessibility #38426016016](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38426016016) SUCCESS, [Deploy ProgressXX Full App #38426015973](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38426015973) SUCCESS, [Full ProgressXX migration smoke #38426015907](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38426015907) SUCCESS, [pages build and deployment #38426013812](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38426013812) SUCCESS. Local Full UI/static sweep **69/69 PASS**. New keyboard regression PASS in Chromium (local/Full UI), Firefox and WebKit (standard PR/main matrix); selected matrix now runs six frontend fixtures per engine. Accessible names/live status are browser assertions, not physical-device or assistive-technology acceptance.

Load-more retains keyboard focus between batches; final batch transfers focus to its first new Edit button. Search/week/status/sort and contextual Edit names plus polite result status verified. Production root/worker HTTP bytes exactly match tested source: root SHA-256 `cac731cccbe83f78fa10514df9ee93a58d435e0ea55faa9bb75a1ed37438262f`, worker `323f5022828b49efc6b39105e1c53e92716f73e74a9da738aec0dd1d56db4515`. No PostgreSQL workflow, SQL/Supabase/staging/backup experiments, production schema/grants/RLS/migrations, stored-data/sync changes or paid services. Database pause persists; Phase 3 IN PROGRESS, Milestone 2 paused/incomplete, commercial launch NOT APPROVED. Next: remaining frontend layout/accessibility or local LCP/CLS checks; real device/screen-reader acceptance remains open. This closeout is documentation-only; runtime CI proof belongs to the merge above.
