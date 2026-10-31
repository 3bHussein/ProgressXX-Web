# Production Supabase table sync — safety audit

Reviewed 2026-10-11, **read-only**. This document does not assert complete table-level synchronization.

## Confirmed storage contract

- Browser account snapshot: `user_app_snapshots(user_id,payload)`. Workout Log, weekly Workout Schedule, Weight Check-ins, Daily, Anatomy mappings and Settings are represented by scoped storage keys.
- Direct Food Library table: `food_products`.
- Direct Today's Food table: `food_entries`.
- Specialized tables exist: `workout_schedule`, `weight_checkins`, `legacy_workout_entries`, `meal_templates`, `saved_meals`, `user_daily_settings`.
- RLS policies for `workout_schedule`, `weight_checkins` and `legacy_workout_entries` restrict rows to `auth.uid() = user_id`.

## Data-model conflict requiring care

The UI weekly schedule uses a sparse object keyed `sun, mon, tue, wed, thu, fri, sat`; values are a training-day name or `REST`. The table `workout_schedule` stores `weekday` integer 0..6, `title` and `notes`. There is already at least one production record; it must not be overwritten or mistaken for a UI schedule assignment.

## Required safeguards before enabling dual writes

1. Choose the authoritative source and a migration marker; never blindly overwrite pre-existing normalized rows.
2. Map weekdays explicitly (sun=0 through sat=6) and preserve REST semantics.
3. Add an ownership-safe and idempotent uniqueness constraint for the intended new records after inspecting existing duplicates. Never infer the user's record ID from weekday alone.
4. Treat deletion as an explicit operation with a tombstone/revision, so stale snapshots cannot resurrect deleted records.
5. Read/backfill only records created by the new sync contract, not arbitrary existing schedule/program rows.
6. Build authenticated, isolated CRUD tests for create/update/delete/read and two-device reload, including concurrent changes and offline replay.
7. Only then implement `weight_checkins` and `legacy_workout_entries`, with distinct stable client IDs and a non-destructive reconciliation strategy.
8. Keep pre-existing snapshots and table records intact until reconciliation can be verified using the same signed-in account.

## Verified vs unverified

- Existing browser smoke and isolated cross-browser tests verify selected snapshot keys and Food REST integrations with mocked network requests.
- They **do not** prove every specialized Supabase table is populated, that real-account data has been migrated, or that every app tab is synchronized.
- No production table mutation or schema migration was performed as part of this audit.
