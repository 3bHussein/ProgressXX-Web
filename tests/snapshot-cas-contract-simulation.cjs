const assert = require('node:assert/strict');
const fs = require('node:fs');

const sql = fs.readFileSync('supabase/proposals/20261012_snapshot_compare_and_swap_NOT_APPLIED.sql', 'utf8');
assert.match(sql, /for update/i);
assert.match(sql, /present_payload is distinct from expected_payload/i);
assert.match(sql, /return query select false,true,present_payload/i);
assert.match(sql, /security invoker/i);

// Deterministic specification of expected server-side CAS outcomes.
// This is a contract simulation, NOT an integration test with Supabase.
const copy = value => JSON.parse(JSON.stringify(value));
const reminders = list => JSON.stringify(list);
const initial = { 'progressx-reminders':reminders([{id:'qa',name:'Original',time:'08:00'}]), 'progressx-data-v19':'[]' };
let stored = copy(initial);
function simulatedCas(expected, next){
  if(JSON.stringify(stored)!==JSON.stringify(expected))return {applied:false,conflict:true,current_payload:copy(stored)};
  stored=copy(next);
  return {applied:true,conflict:false,current_payload:copy(stored)};
}
const desktopBase=copy(stored),phoneBase=copy(stored);
const desktopUpdate={...desktopBase,'progressx-reminders':reminders([{id:'qa',name:'Desktop edit',time:'08:00'}])};
const phoneUpdate={...phoneBase,'progressx-reminders':reminders([{id:'qa',name:'Original',time:'10:00'}])};
assert.equal(simulatedCas(desktopBase,desktopUpdate).applied,true,'First device saves');
const blocked=simulatedCas(phoneBase,phoneUpdate);
assert.equal(blocked.applied,false,'Stale second device must be rejected');
assert.equal(blocked.conflict,true);
assert.deepEqual(stored,desktopUpdate,'Rejecting stale write must preserve cloud state');
assert.deepEqual(blocked.current_payload,desktopUpdate,'Conflict response must expose latest same-account state');
// The user's unsynced edit is still present in the original local pending payload.
assert.equal(JSON.parse(phoneUpdate['progressx-reminders'])[0].time,'10:00');
assert.notDeepEqual(phoneUpdate,stored,'Conflict must not silently imply sync success');
// A user-approved resolution can be persisted ONLY against the latest baseline.
const resolved={...stored,'progressx-reminders':reminders([{id:'qa',name:'Desktop edit',time:'10:00'}])};
assert.equal(simulatedCas(blocked.current_payload,resolved).applied,true);
assert.deepEqual(stored,resolved);
console.log('PASS: simulated CAS prevents stale overwrite, preserves queued local edit and allows explicit resolution; no live RPC called');
