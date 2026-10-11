-- ProgressX SECURITY HARDENING: NOT APPLIED TO PRODUCTION
-- Reviewed target from read-only privileges audit 2026-10-12.
-- REVOKE is metadata-only; no rows are updated/deleted.
-- Preserve normal CRUD grants and all existing RLS policies.
-- Apply in staging first and validate API routes, then schedule production rollout.
-- REFERENCES left unchanged pending dependency review.
BEGIN;
REVOKE TRUNCATE, TRIGGER ON TABLE public.food_products FROM anon, authenticated;
REVOKE TRUNCATE, TRIGGER ON TABLE public.legacy_workout_entries FROM anon, authenticated;
REVOKE TRUNCATE, TRIGGER ON TABLE public.meal_templates FROM anon, authenticated;
REVOKE TRUNCATE, TRIGGER ON TABLE public.progressxx_daily_history FROM anon, authenticated;
REVOKE TRUNCATE, TRIGGER ON TABLE public.progressxx_legacy_settings FROM anon, authenticated;
REVOKE TRUNCATE, TRIGGER ON TABLE public.progressxx_reminder_archive FROM anon, authenticated;
REVOKE TRUNCATE, TRIGGER ON TABLE public.saved_meals FROM anon, authenticated;
REVOKE TRUNCATE, TRIGGER ON TABLE public.user_app_snapshots FROM anon, authenticated;
REVOKE TRUNCATE, TRIGGER ON TABLE public.user_daily_settings FROM anon, authenticated;
REVOKE TRUNCATE, TRIGGER ON TABLE public.user_workout_templates FROM anon, authenticated;
REVOKE TRUNCATE, TRIGGER ON TABLE public.workout_schedule FROM anon, authenticated;
COMMIT;
