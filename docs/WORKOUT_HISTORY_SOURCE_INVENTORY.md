# Workout Log source inventory — 2026-10-11

Status: **read-only discovery**. This document contains counts and recovery paths, not customer records or credentials.

## Confirmed in Supabase production

| Source | Count / result | Interpretation |
| --- | ---: | --- |
| `user_app_snapshots` | 1 account snapshot | Contains key `progressx-data-v19` |
| `progressx-data-v19` | **1 workout entry** | Not the historical total displayed earlier by the client |
| `progressx-workout-sync-queue-v1` | **0 pending entries** | No unsent workout operations are represented in this particular account snapshot |
| `progressx-workout-deleted-ids-v1` | Not present | Cannot infer historical deletes |
| `legacy_workout_entries` | **0 rows** | No historical workout migration completed |
| `workout_sessions` | **15 rows** | A separate normalized session entity; not equivalent to legacy log count |

Counts were obtained by read-only SQL. The app previously displayed around 621 logged entries; **the full historical source is not yet identified**. Never run a migration that replaces historical state from this one-entry snapshot.

## Recovery paths supported by existing app

1. Previous **ProgressX full backup** download: `progressx-full-backup-*.json`. It has a top-level `workouts` array.
2. Workout-only JSON export/import, if available, with a top-level array.
3. `progressx-history.csv` export generated from Workout Log.
4. Historic Google Sheets/Apps Script source connected to the older `ProgressXX` backend, if retained.
5. Old signed-in browser/account-scoped local cache, or offline device that still has the historical entries.

**Do not use Restore full backup or Import JSON merely to inspect an old copy.** Both are mutating user actions in the app. A backup file can instead be inspected locally with a standalone read-only validator.

## Required before backfill

- Acquire a trusted source representing the historical record count; compare IDs, week, day, exercise, exact raw performance, notes, original date/time.
- Export and safely retain a backup of both the source file and current Supabase account snapshot.
- Compute dry-run counts for unique, invalid, tombstoned, and already-normalized records.
- Only then execute authenticated owner-scoped insertion in small idempotent batches after explicit verification.
- Never conflate `workout_sessions` with `legacy_workout_entries`.
