# Frontend version and release policy — preparation

Root `index.html` is the production target. This policy introduces release tracking, not commercial approval, automatic paid services, staged traffic rollout or database migrations.

## Version identity

Use APP_VERSION in root as the frontend version and keep the newest numbered CHANGELOG heading identical. Diagnostics and full-backup app metadata already derive from this constant. Storage keys, server revision/CAS values and `backup_version` are independent data contracts; a patch release does not authorize changing them. Version 2.0.1 preserves backup format 3.

Use patch increments for compatible bug fixes, minor increments for compatible features and major increments only for explicitly reviewed incompatible changes. This is an internal numbering policy; future migrations still require separate approval/backups. A version must not be reused for a subsequent runtime release. CI checks valid matching/unique changelog identity; reviewers remain responsible for comparing the proposed version with the last runtime release. Historical 2.0.0 was reused before this policy and is distinguished by commit SHA, not reclassified as unique.

## Candidate to deployed release

1. Prepare a source branch, root version and changelog describing final behavior, risks and verified local results. Label pending evidence as pending; never infer tests from configuration.
2. Run relevant local mocks/static/browser regressions without live database/account initialization during the pause. Review the diff for data-format/storage/sync changes and scope exceptions.
3. Require actual successful PR checks before merging. The dedicated publisher must see successful Full UI/Fast/Cross-browser runs for the exact main artifact SHA before publishing. Keep Pages Source GitHub Actions; do not bypass the gate.
4. Observe dedicated deploy success and verify actual public root/worker bytes against tested source. Record commit SHA, PR/main run links, release version and any exclusions in the Development Log and handoff. A later docs-only evidence commit may leave runtime bytes unchanged; runtime proof belongs to the tested source/merge.
5. For a frontend rollback, follow the new-commit procedure in [operations runbook](OPERATIONS-RUNBOOK.md), revalidate and assign a new version to the newly released rollback runtime. Do not reset main history, clear user storage or execute a database rollback under this policy.

## Open acceptance

Live rollback rehearsal, staged rollout, assigned release/incident/support owners, physical-device/screen-reader testing and legal acceptance remain open. Real-account/database backup/restore experiments stay deferred until explicit owner resumption. P0 checks and an explicit owner GO decision are still required before commercial launch. No contact identity, RPO/RTO or support hours are invented here.

Automated contract: `tests/release-version-changelog.cjs` rejects missing/invalid runtime version, mismatched newest changelog, duplicate numbered versions and stale initial version badges. It does not enforce historical increments through shallow Git history or certify release content/legal correctness.


## 2026-10-14 Cairo — Frontend 2.0.1 navigation/release tracking and mock CI fix VERIFIED

[PR #33](https://github.com/3bHussein/ProgressXX-Web/pull/33), source `26c761a15261a8f78f47289220101161275bd2fe`, merge `6615fe6381984c08c5ebcd77d4a2e22eb0f8beaf`. All eight PR workflows SUCCESS. Matching main: [Fast conflict safety contracts #38472369045](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38472369045) SUCCESS, [Cross-browser frontend accessibility #38472368994](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38472368994) SUCCESS, [Deploy ProgressXX Full App #38472369015](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38472369015) SUCCESS, [Full ProgressXX migration smoke #38472368995](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38472368995) SUCCESS. Final local parallel suite **78/78 PASS**. New navigation/native-dialog regressions PASS in Chromium/Full UI and standard Firefox/WebKit PR/main; selected frontend matrix now twelve fixtures per engine. PR jobs115553304299/115553304973/115553304282 and main115554433094/115554432614/115554432975 explicitly record the new fixtures and release identity2.0.1.

Corrected full UI fixture logs exactly one expected pending-sync confirmation in local final suite, PR Full UI, main Full UI and dedicated deployment. It deliberately holds a mocked snapshot in flight and preserves all synthetic Food/Daily/Weight/Workout/Schedule/Goal relogin assertions. Native-dialog tests reject unrelated dialogs/pre-accept errors and verify disposal. Production logout/pending-data safeguards unchanged. The historical timing failures above remain evidence; no claim that every future CI flake is eliminated.

Dedicated deploy job115554433672 records Pages `build_type=workflow`, accepts same-SHA Full UI38472368995, Fast38472369045 and Cross-browser38472368994 before publishing, and passes the deterministic logout smoke with confirmations accepted1. No PostgreSQL or legacy Jekyll run at merge SHA. Actual root/worker HTTP200 bytes match tested source: root `ee0aae188fc55554dff8af6e3971f55df2ad36f8bf18b7a9e915b9b2ab086746`, worker `323f5022828b49efc6b39105e1c53e92716f73e74a9da738aec0dd1d56db4515`.

Completed selected Phase 3 navigation semantics and fixture reliability, plus Phase 4 frontend version/changelog/release policy tracking. Root APP_VERSION/initial badges/Diagnostics/backup app metadata are2.0.1, backup format3/storage/sync contracts unchanged. See [release policy](RELEASE-POLICY.md), [navigation acceptance](NAVIGATION-ACCESSIBILITY.md), [mock logout acceptance](MOCK-LOGOUT-CI-ACCEPTANCE.md), and [changelog](../CHANGELOG.md). Version increments remain reviewer responsibility; live rollback/staged rollout, owners/support, actual devices/screen readers, legal and P0 acceptance remain open. Phase 3 IN PROGRESS; Phase 4 PREPARATION / IN PROGRESS; Milestone 2 paused/incomplete; commercial launch NOT APPROVED. No live Supabase/SQL/account/staging/backup experiments, production schema/grants/RLS/migrations, stored fitness-data/sync changes or paid services. Final evidence commit is documentation-only; runtime proof belongs to tested merge above.
