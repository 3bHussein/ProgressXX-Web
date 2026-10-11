const assert=require('node:assert/strict');
const fs=require('node:fs');
const html=fs.readFileSync('index.html','utf8');
const section=html.slice(html.indexOf('// Initialize only after the V2 anatomy'),html.indexOf('window.__legacyBoot=init;')+25);
for(const n of ['syncFromSheet','startupWorkoutSync','processWorkoutQueue','queueWorkoutOperation','pendingWorkoutCount']){
 assert.ok(!section.includes(n+'=async()=>true')&&!section.includes(n+'=()=>{}')&&!section.includes(n+'=()=>0'),'No-op override found for '+n);
}
assert.match(html,/await startupWorkoutSync\(\)/,'Login must load real workout table');
assert.match(html,/async function startupWorkoutSync\(\)/);
assert.match(html,/async function syncFromSheet\(/);
assert.match(html,/legacy_workout_entries\?select=source_id/);
console.log('PASS: Workout Log login/queue operate on real Supabase paths without disabling overrides');
