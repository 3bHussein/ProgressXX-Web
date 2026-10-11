const assert=require('node:assert/strict');
const fs=require('node:fs');
const path='supabase/migrations/20261012_revoke_excess_table_privileges.sql';
const sql=fs.readFileSync(path,'utf8').replace(/^--.*$/gm,'').trim();
const lines=sql.split(';').map(x=>x.trim()).filter(Boolean);
assert.equal(lines[0].toUpperCase(),'BEGIN');
assert.equal(lines.at(-1).toUpperCase(),'COMMIT');
const revokes=lines.slice(1,-1);
const expected=['food_products','legacy_workout_entries','meal_templates','progressxx_daily_history','progressxx_legacy_settings','progressxx_reminder_archive','saved_meals','user_app_snapshots','user_daily_settings','user_workout_templates','workout_schedule'];
assert.equal(revokes.length,expected.length);
for(let i=0;i<expected.length;i++){
  const normalized=revokes[i].replace(/\s+/g,' ').trim();
  assert.equal(normalized,`REVOKE TRUNCATE, TRIGGER ON TABLE public.${expected[i]} FROM anon, authenticated`);
}
assert(!/\b(?:DROP|DELETE|UPDATE|INSERT|ALTER|CREATE|TRUNCATE|GRANT)\b/i.test(sql),'Unexpected destructive or permission-expanding SQL');
console.log('PASS: security migration contains exactly 11 scoped TRUNCATE/TRIGGER revocations; no data-changing SQL');
