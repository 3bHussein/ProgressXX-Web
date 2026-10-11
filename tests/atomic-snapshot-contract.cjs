const fs=require('node:fs'),assert=require('node:assert/strict');
const sql=fs.readFileSync('supabase/migrations/20261011_progressxx_atomic_snapshot.sql','utf8');
for(const required of [
 'security invoker','auth.uid()','for update','p_expected_updated_at timestamptz','version conflict','is distinct from p_expected_updated_at','on conflict (user_id) do nothing',
 'progressx-workout-deleted-ids-v1','progressx-data-v19',
 'progressx-workout-sync-queue-v1','grant execute on function public.progressxx_sync_snapshot(jsonb) to authenticated'
])assert.ok(sql.toLowerCase().includes(required.toLowerCase()),'Missing atomic snapshot safety: '+required);
assert.ok(!/security definer/i.test(sql),'Function must not bypass RLS');
console.log('PASS: staged SQL declares owner-scoped row lock, tombstone union and authenticated execution');
