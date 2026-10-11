# ProgressX — Read-only RLS Negative-Read Probe (2026-10-12)

**Project:** progressxx-production (`cleryiplpqhrtqzryhnx`)  
**Safety:** Both queries ran in `BEGIN READ ONLY` transactions with local role changes and `ROLLBACK`. No records accessed beyond aggregate counts; no database mutations.

## Confirmed results

1. With `SET LOCAL ROLE authenticated` and `request.jwt.claim.sub` set to a synthetic non-existent UUID, returned **0 visible records** from `food_entries`, `food_products`, `legacy_workout_entries`, `weight_checkins`, `user_app_snapshots`, and `progressxx_daily_history`.
2. With `SET LOCAL ROLE anon`, returned **0 visible records** from `food_products`, `legacy_workout_entries`, `user_app_snapshots`, and `progressxx_daily_history`.
3. GitHub [Full migration smoke #38178220700](https://github.com/3bHussein/ProgressXX-Web/actions/runs/38178220700) completed SUCCESS; that includes the static security migration guard. This does NOT mean the permission migration was applied.

## Limitations

- A synthetic missing identity is not the same as two real independent users.
- This only probes SELECT visibility for a subset of tables; it does not establish negative INSERT/UPDATE/DELETE permissions.
- This is a SQL role/claim simulation, not an end-to-end authenticated client API test.
- Existing excessive `TRUNCATE`/`TRIGGER` table grants still exist until an approved migration is applied after staging verification.
- Cross-device, offline retry, data deletion, and billing checks are still outstanding.

## Next action

Get a cost-approved Supabase staging environment, run the narrow privilege migration there, verify effective permissions and regular app CRUD, then test two separate synthetic accounts against actual authenticated REST operations. Preserve production data. See `docs/SUPABASE-SECURITY-AUDIT.md` and `ROADMAP.md`.
