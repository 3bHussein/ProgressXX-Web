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
