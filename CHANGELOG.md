# ProgressX changelog

Production: root `index.html`. Version labels identify frontend releases; they do not approve commercial launch or change data formats. Exact commits and CI/deployment evidence are recorded in `docs/DEVELOPMENT-LOG.md`.

## 2.1.0 — 2026-10-14 — frontend candidate

- Preserve Food portion metadata across confirmed refreshes; show explicit calorie units and whole-entry quantities when a physical portion is unknown.
- Manage training-day names and future exercise plans without deleting saved history.
- Readable Settings categories with device-level Arabic/English selection, RTL layout and protected user/protocol values across eight pages.
- Add regression coverage for Food refresh/editing, training-plan recovery, language persistence and category keyboard access.
- No production database migration or commercial launch approval.

## 2.0.1 — 2026-10-14 — frontend release candidate

- Main navigation now identifies its current page for assistive technology; keyboard selection retains button focus.
- Fix the mock full-UI logout harness to explicitly handle only the expected pending-sync confirmation; production sign-out behavior is unchanged.
- Establish frontend version/changelog policy. Diagnostics and backup metadata use the same APP_VERSION; backup format remains version 3.
- Verified preceding work carried into this candidate: Food priority/collapsible layout and alphabetical quick-add ([PR #29](https://github.com/3bHussein/ProgressXX-Web/pull/29)); sanitized local Diagnostics and operations runbook ([#30](https://github.com/3bHussein/ProgressXX-Web/pull/30)); independent Insights error recovery ([#31](https://github.com/3bHussein/ProgressXX-Web/pull/31)); named anatomy/Insights controls and keyboard focus/scroll retention ([#32](https://github.com/3bHussein/ProgressXX-Web/pull/32)).
- Local full suite78/78 PASS, including a deterministic one-confirmation mock logout and preserved synthetic records. [PR #33](https://github.com/3bHussein/ProgressXX-Web/pull/33) merged as6615fe6; all eight PR/four matching main checks SUCCESS and deployed bytes verified. Full UI PR/main/deploy each logged one expected pending confirmation. See [Development Log](docs/DEVELOPMENT-LOG.md) for exact runs and limits. Existing data and sync contracts unchanged; database experiments remain paused. Full accessibility/physical-device and P0 acceptance remain open. Commercial launch NOT APPROVED.

## 2.0.0 — previous frontend baseline

Historical runtime label used before version/changelog policy was introduced. Multiple earlier commits share this label; use their recorded commit SHAs to distinguish them. This entry does not invent a release date or retroactively certify earlier deployments.
