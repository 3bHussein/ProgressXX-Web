# Cross-browser frontend acceptance

Production target: root `index.html`. Playwright is pinned to the existing repository version, 1.55.0. `tests/helpers/browser-engine.cjs` selects `PX_BROWSER=chromium|firefox|webkit`, defaults to Chromium and rejects unknown values. The same assertions run in every selected engine.

| Fixture | Chromium local | Firefox local | WebKit local | Coverage |
| --- | --- | --- | --- | --- |
| `mobile-motion-anatomy-accessibility.cjs` | PASS | PASS | PASS | 320/390/768, reduced-motion scroll, anatomy image keyboard/zoom/focus, 44px bounds |
| `mobile-barcode-keyboard-rtl-browser.cjs` | PASS | PASS | PASS | 320/390/768, barcode keyboard/focus/Enter, camera pending-start cleanup/reopen, Android back callback, Arabic/English transitions |
| `pwa-install-permission-recovery-browser.cjs` | PASS | PASS | PASS | Synthetic install events, prompt/choice errors, mocked notification/camera refusal and manual fallback |

Every fixture asserts zero Supabase requests, blocks external resources and does not sign in. Local results are **9/9 PASS**, after correcting environment-only browser installation problems. No application code fix was needed for these assertions.

Local Firefox required sandbox environment flags in the constrained executor. Local WebKit used separately extracted runtime libraries in its downloaded bundle; host dependency validation was skipped locally because its library-cache probe did not recognize the isolated libraries. Actual WebKit assertions executed and passed. These local arrangements are not included in repository code or CI.

`.github/workflows/cross-browser-ui.yml` adds separate Firefox/WebKit jobs using standard `playwright install --with-deps`, a ready-checked loopback server, read-only repository permissions, independent matrix results and the database-pause source guard. Existing Full UI runs the same fixtures in default Chromium. **Remote CI is pending until linked closeout evidence is recorded.**

This is a selected frontend matrix. Full authenticated E2E flows, cross-engine offline workers, native installation, OS permissions, actual Android/iPhone/Safari, screen readers, touch hardware and measured performance remain unverified. PWA events/permission responses and cameras are mocked; WebKit engine coverage does not certify iOS behavior. Database experiments remain paused, normal application sync stays enabled, and commercial launch remains NOT APPROVED.
