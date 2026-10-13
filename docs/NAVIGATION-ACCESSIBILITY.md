# Main navigation acceptance

Production target: root `index.html`. Main navigation now has a landmark name and `aria-current="page"` on exactly the active route button; inactive route markers are removed. Existing button semantics, IDs/routes and page hooks remain. Enter/Space continue to switch pages while focus remains on the same persistent navigation button.

`tests/navigation-current-page-browser.cjs` tests initial Home and all eight routes at320/390/768/1280 using keyboard activation, checks one current marker and one matching active section, retained focus, app version in Diagnostics and immutable empty synthetic workout/food arrays. External requests are blocked; account activation and page render/sync hooks are mocked explicitly. This isolates navigation semantics; it does not test the real page hooks, real-account data or synchronization. Existing full UI smoke provides separate mocked page coverage.

Final local full suite78/78 PASS, including this fixture and matching initial version badges2.0.1. Standard PR/main engine results and deployment pending actual runs. Real NVDA/VoiceOver/TalkBack and physical-device focus/scroll behavior, contrast and broader Arabic navigation remain open. No data changes/database experiments or commercial approval follow from this test.
