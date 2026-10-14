# ProgressXX — Milestone 4 release candidate notes

Status: **PREPARATION ONLY — NOT APPROVED FOR COMMERCIAL RELEASE**.

## Included in the current functional baseline

- M1 core UI features closed for fast-track functional scope.
- M3 mobile and browser QA baseline closed with documented exclusions; owner confirmed basic physical-mobile navigation/buttons/bottom bar.
- Workout cloud refresh rejects outdated responses that would overwrite newer workout rows (PR #39).
- Mobile keyboard, RTL, barcode-modal, PWA-shell and accessibility regressions documented in `MOBILE-ACCESSIBILITY-ACCEPTANCE.md`.
- Non-destructive deployment preflight and frontend rollback procedures documented in `DEVELOPMENT-LOG.md`.

## Verified CI evidence

- PR #41 Full UI: https://github.com/3bHussein/ProgressXX-Web/actions/runs/38601525526 — SUCCESS.
- PR #41 Fast Conflict: https://github.com/3bHussein/ProgressXX-Web/actions/runs/38601525507 — SUCCESS.
- Post-merge main Full UI: https://github.com/3bHussein/ProgressXX-Web/actions/runs/38601928324 — IN PROGRESS when last checked; do not claim PASS.
- Prior Pages deployment: https://github.com/3bHussein/ProgressXX-Web/actions/runs/38574410043 — SUCCESS on earlier runtime commit, not proof of a new release deploy.

## Known exclusions and blockers

1. **M2 P0 OPEN:** real two-device CRUD and offline delete/reconnect, data restoration, authenticated server-side atomic CAS and direct API isolation remain unapproved/unverified on production.
2. Final security testing **DEFERRED / NOT PASSED** at owner request. No commercial safety certification.
3. No new measured physical-device LCP/CLS/interaction performance baseline; real camera and screen-reader acceptance not verified.
4. Database experiments paused. Do not alter production Supabase, RLS, grants, schema or records.

## Operator instructions

Only promote after matching commit CI, deploy evidence, safe non-destructive smoke and documented approval. For a frontend regression, revert the frontend commit by reviewed PR and verify deploy; never force-push main or erase client storage. Frontend rollback does not restore lost data.
