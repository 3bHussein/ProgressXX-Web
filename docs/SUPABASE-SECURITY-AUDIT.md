# Supabase Security Audit — 2026-10-12

**Target project:** `progressxx-production` · **Project ref:** `cleryiplpqhrtqzryhnx`  
**Method:** Read-only Supabase project introspection (tables, pg_policies, role grants, public function metadata, security advisor). **No user records read or modified; no DDL run.**

## Confirmed

- Public schema contains **20 tables**; RLS is enabled on **all 20**.
- Core private tables (food_entries/products, workout_sets/sessions/legacy entries, weight_checkins, saved_meals, workout_schedule, user_app_snapshots, daily history, reminder archive, legacy settings) have authenticated owner checks based on `auth.uid() = user_id` for their operations.
- Subscriptions are read-only to the owner for authenticated clients.
- Program catalog tables `program_templates`, `program_days` and `program_exercises` have authenticated SELECT grants with published-program policies; these intentionally expose published catalog content, not per-user private rows. Verify publication and editor model.
- No functions in `public` were returned by this metadata inspection (not a comprehensive audit of non-public schemas).
- Security advisor warns **Leaked Password Protection Disabled**: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

## High-priority finding — excessive table grants

`information_schema.role_table_grants` reports `TRUNCATE` and `TRIGGER` on multiple private tables for `authenticated` (and some for `anon`), despite RLS being enabled. **PostgreSQL TRUNCATE is not subject to RLS row filtering**, so this violates least privilege for a commercial app. PostgREST table API may not provide a truncate endpoint, but other authorized SQL execution paths/integrations could expose it; do not count on that API limitation as a security boundary.

**Affected grant pattern observed on:** `food_products`, `legacy_workout_entries`, `meal_templates`, `progressxx_daily_history`, `progressxx_legacy_settings`, `progressxx_reminder_archive`, `saved_meals`, `user_app_snapshots`, `user_daily_settings`, `user_workout_templates`, `workout_schedule`. Both `anon` and `authenticated` show excessive grants for most of these tables; specifically `legacy_workout_entries` and `food_products` also include `TRUNCATE`.

**Safe proposed fix (NOT APPLIED):** Use a reviewed, additive Supabase migration to revoke only `TRUNCATE`, `TRIGGER` and any unnecessary `REFERENCES` from `anon`/`authenticated` on audited private tables; preserve `SELECT/INSERT/UPDATE/DELETE` required by current UI and RLS. Confirm effective grants (including role memberships, schema defaults and future table default privileges), test app and two-user negative cases in staging before production application. Do not revoke normal CRUD indiscriminately.

## Not yet verified

- Live authenticated two-user negative SELECT/INSERT/UPDATE/DELETE tests. Metadata indicates policies, **not proof** of all effective authorization paths.
- Storage buckets/policies; access via other schemas, views or RPC, real subscriptions/payment entitlements.
- No-lost-data cross-device sync: Food / Food Library / Daily / Workout / Weight / Schedule / Saved Meals, offline retry and deletions.
- Individual account login using actual restored data, and authentication password-protection configuration.

## Next exact tasks

1. Review a narrowly scoped permission hardening migration and test it in non-production before deployment.
2. Run two-user, read/write negative RLS tests with synthetic accounts/records only; never modify owner records.
3. Audit storage policies and sync source of truth; record per-feature CRUD/reload/device evidence.
4. Enable leaked-password protection through supported Supabase Auth configuration after evaluating availability/impact.
5. Update [ROADMAP](../ROADMAP.md), [DEVELOPMENT-LOG](DEVELOPMENT-LOG.md) and handoff with results and final CI references.
