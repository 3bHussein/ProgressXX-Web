#!/usr/bin/env bash
set -euo pipefail
export PGHOST=127.0.0.1 PGPORT=5432 PGUSER=postgres PGPASSWORD=postgres PGDATABASE=postgres
psql -v ON_ERROR_STOP=1 -f tests/postgres-atomic-fixture.sql
psql -v ON_ERROR_STOP=1 -f supabase/migrations/20261011_progressxx_atomic_snapshot.sql
USER_ID=aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa
query() { psql -v ON_ERROR_STOP=1 -Atc "set role authenticated; set request.jwt.claim.sub='$USER_ID'; $1"; }
query "select public.progressxx_sync_snapshot('{\"progressx-data-v19\":\"[{\\\"id\\\":\\\"old\\\"},{\\\"id\\\":\\\"safe\\\"}]\"}'::jsonb,null);" >/dev/null
VERSION=$(psql -Atc "select updated_at from public.user_app_snapshots where user_id='$USER_ID'")
# Two writers start with exactly the same read version.
query "select public.progressxx_sync_snapshot('{\"progressx-workout-deleted-ids-v1\":\"[\\\"old\\\"]\"}'::jsonb,'$VERSION'::timestamptz);" >/dev/null &
P1=$!
query "select public.progressxx_sync_snapshot('{\"progressx-data-v19\":\"[{\\\"id\\\":\\\"old\\\"},{\\\"id\\\":\\\"safe\\\"}]\"}'::jsonb,'$VERSION'::timestamptz);" >/tmp/px-stale.out 2>/tmp/px-stale.err &
P2=$!
SUCCESS=0
wait "$P1" || SUCCESS=$((SUCCESS+1))
wait "$P2" || SUCCESS=$((SUCCESS+1))
if [[ "$SUCCESS" -ne 1 ]]; then
 echo "Expected one stale writer to fail; observed failures=$SUCCESS"; exit 1
fi
# Regardless of which writer wins, the next write must apply tombstones atomically.
NEW_VERSION=$(psql -Atc "select updated_at from public.user_app_snapshots where user_id='$USER_ID'")
query "select public.progressxx_sync_snapshot('{\"progressx-workout-deleted-ids-v1\":\"[\\\"old\\\"]\",\"progressx-data-v19\":\"[{\\\"id\\\":\\\"old\\\"},{\\\"id\\\":\\\"safe\\\"}]\"}'::jsonb,'$NEW_VERSION'::timestamptz);" >/dev/null
psql -v ON_ERROR_STOP=1 -Atc "select case when (payload->>'progressx-data-v19')::jsonb @> '[{\"id\":\"old\"}]'::jsonb then 1 else 0 end from public.user_app_snapshots where user_id='$USER_ID';" | grep -qx 0
psql -v ON_ERROR_STOP=1 -Atc "select case when (payload->>'progressx-data-v19')::jsonb @> '[{\"id\":\"safe\"}]'::jsonb then 1 else 0 end from public.user_app_snapshots where user_id='$USER_ID';" | grep -qx 1
echo "PASS: PostgreSQL rejects exactly one of two conflicting writers; tombstones filter old workouts."
