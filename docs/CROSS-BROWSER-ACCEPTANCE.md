# Cross-browser frontend acceptance

Production target: root `index.html`. Playwright is pinned to the existing repository version, 1.55.0. `tests/helpers/browser-engine.cjs` selects `PX_BROWSER=chromium|firefox|webkit`, defaults to Chromium and rejects unknown values. The same assertions run in every selected engine.

| Fixture | Chromium local/CI | Firefox local/CI | WebKit local/CI | Coverage |
| --- | --- | --- | --- | --- |
| `mobile-motion-anatomy-accessibility.cjs` | PASS / PASS | PASS / PASS | PASS / PASS | 320/390/768, reduced-motion scroll, anatomy image keyboard/zoom/focus, 44px bounds |
| `mobile-barcode-keyboard-rtl-browser.cjs` | PASS / PASS | PASS / PASS | PASS / PASS | 320/390/768, barcode keyboard/focus/Enter, camera pending-start cleanup/reopen, Android back callback, Arabic/English transitions |
| `barcode-lazy-library-browser.cjs` | PASS / PASS | PASS / PASS | PASS / PASS | Zero startup decoder request, shared on-demand load/reuse, close-before-load, download failure/retry, timeout/manual fallback |
| `pwa-install-permission-recovery-browser.cjs` | PASS / PASS | PASS / PASS | PASS / PASS | Synthetic install events, prompt/choice errors, mocked notification/camera refusal and manual fallback |

Every fixture asserts zero Supabase requests, blocks external resources and does not sign in. Local results are **9/9 PASS**, after correcting environment-only browser installation problems. No application code fix was needed for these assertions.

Local Firefox required sandbox environment flags in the constrained executor. Local WebKit used separately extracted runtime libraries in its downloaded bundle; host dependency validation was skipped locally because its library-cache probe did not recognize the isolated libraries. Actual WebKit assertions executed and passed. These local arrangements are not included in repository code or CI.

`.github/workflows/cross-browser-ui.yml` adds separate Firefox/WebKit jobs using standard `playwright install --with-deps`, a ready-checked loopback server, read-only repository permissions, independent matrix results and the database-pause source guard. Existing Full UI runs the same fixtures in default Chromium. **Remote standard-runner CI VERIFIED:** [PR #22](https://github.com/3bHussein/ProgressXX-Web/pull/22), [PR matrix 38358078916](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38358078916), [main matrix 38358354281](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38358354281) and [main Chromium Full UI 38358354307](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38358354307) all SUCCESS. Both Firefox/WebKit jobs installed standard dependencies and completed all three fixtures.

This is a selected frontend matrix. Full authenticated E2E flows, cross-engine offline workers, native installation, OS permissions, actual Android/iPhone/Safari, screen readers, touch hardware and measured performance remain unverified. PWA events/permission responses and cameras are mocked; WebKit engine coverage does not certify iOS behavior. Database experiments remain paused, normal application sync stays enabled, and commercial launch remains NOT APPROVED.


PR #23 adds the lazy-decoder fixture; PR #24 fixes a corrupt legacy PNG in the anatomy fixture, waits for valid decode and separately asserts real image-error fallback. Corrected main [38364333014](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38364333014) Firefox/WebKit and Chromium Full UI [38364332969](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38364332969) SUCCESS: four selected fixtures per engine (12 CI fixture runs). Local full suite 67/67 passed before the test-only repair; both new/changed fixtures were independently verified locally in all three engines. The earlier 9/9 count refers to the initial three-fixture matrix.


## Workout Log matrix extension — validation pending

The 5,000-record incremental/search regression is now the fifth selected fixture in each Firefox/WebKit CI job, with default Chromium in Full UI. Checks data immutability, DOM/focus retention and fresh results after edits/deletion/replacement. No database experiments. New remote engine results pending; prior four-fixture evidence remains historical.
