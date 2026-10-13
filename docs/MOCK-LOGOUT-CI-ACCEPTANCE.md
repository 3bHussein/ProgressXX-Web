# Mock logout CI acceptance

## Evidenced intermittent failure

`scripts/smoke-full-ui.cjs` sometimes timed out waiting for the signed-out gate after clicking logout. Root logout first attempts flush, then prompts if its revision is not saved. Browser automation without a dialog handler dismisses the confirm; the app cancels logout as designed. This can occur when flush is already in flight. Source trace and a native-dialog fixture reproduce the default-dismiss mechanism; no production logout logic is changed.

Reference: [official Playwright dialogs](https://playwright.dev/docs/dialogs).

## Fixture repair and regressions

`tests/helpers/logout-dialog.cjs` attaches only around the mock logout segment. It accepts the exact known pending-sync confirm and tracks acceptance count. Unknown confirmation/alert is dismissed and makes validation fail; errors are not silently accepted. Listener is removed in finally. A failed pre-accept hook also dismisses the dialog and fails validation, instead of leaving a modal open. The remaining real-record assertions for synthetic Food Library/Diary, Daily, Weight, Workout, Schedule and Goal are preserved; we do not replace them with count-only assertions.

`tests/logout-dialog-policy-browser.cjs` uses actual native browser dialogs on a blank page: expected confirm returns true, unrelated confirm returns false and validation fails, unrelated alert fails validation, and disposal restores default dismissal. Zero network requests and no account/data/database activation. It also checks pre-accept callback failure. Registered in Full UI and Firefox/WebKit matrix.

A separate integration run deterministically held the final synthetic snapshot in flight, accepted exactly one real pending-sync confirmation, released the mock snapshot response and passed all existing relogin assertions. Final parallel full suite78/78 PASS, full smoke logged confirmations accepted1; remote CI/deployment pending actual results. A corrected fixture is not proof that all future CI timing failures are eliminated. Real sign-out/re-login with live accounts and pending server writes remains deferred under the owner database pause. This work makes no live query, grants/RLS/migration change or commercial approval.
