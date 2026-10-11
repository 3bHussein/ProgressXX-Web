-- Read-only preflight and postflight verification (run separately, not embedded in migration)
-- Before applying: expect the targeted tables listed with TRUNCATE/TRIGGER grants.
-- After applying: expect zero results for targeted tables.
SELECT table_name, grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND grantee IN ('anon','authenticated')
  AND privilege_type IN ('TRUNCATE','TRIGGER')
  AND table_name IN ('food_products', 'legacy_workout_entries', 'meal_templates', 'progressxx_daily_history', 'progressxx_legacy_settings', 'progressxx_reminder_archive', 'saved_meals', 'user_app_snapshots', 'user_daily_settings', 'user_workout_templates', 'workout_schedule')
ORDER BY table_name, grantee, privilege_type;

-- Make sure RLS remains enabled on every private audited table.
SELECT c.relname AS table_name, c.relrowsecurity AS rls_enabled
FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE n.nspname='public' AND c.relname IN ('food_products', 'legacy_workout_entries', 'meal_templates', 'progressxx_daily_history', 'progressxx_legacy_settings', 'progressxx_reminder_archive', 'saved_meals', 'user_app_snapshots', 'user_daily_settings', 'user_workout_templates', 'workout_schedule')
ORDER BY c.relname;

-- These postflight checks do not replace two-user authenticated SELECT/INSERT/UPDATE/DELETE negative tests.
