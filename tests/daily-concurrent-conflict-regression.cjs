const assert=require('node:assert/strict');
const fs=require('node:fs');
const source=fs.readFileSync('index.html','utf8');
assert.match(source,/user_app_snapshots\?on_conflict=user_id/,'Snapshot upsert changed; re-evaluate conflict test');
function copy(x){return JSON.parse(JSON.stringify(x))}
let remote={ 'progressx-reminders':JSON.stringify([{id:'r1',name:'Original',time:'09:00'}]), 'progressx-data-v19':'[]'};
const desktop=copy(remote),phone=copy(remote);
// Two independent devices read the same baseline.
desktop['progressx-reminders']=JSON.stringify([{id:'r1',name:'Desktop edit',time:'09:00'}]);
phone['progressx-reminders']=JSON.stringify([{id:'r1',name:'Original',time:'10:00'}]);
// Current whole-snapshot upsert is last-writer-wins.
remote=copy(desktop);remote=copy(phone);
assert.equal(JSON.parse(remote['progressx-reminders'])[0].name,'Original','Demonstrate lost desktop edit');
assert.equal(JSON.parse(remote['progressx-reminders'])[0].time,'10:00');
function changed(a,b){return JSON.stringify(a)!==JSON.stringify(b)}
function conflict(base,local,current){return changed(base,local)&&changed(base,current)&&changed(local,current)}
assert.equal(conflict(JSON.parse(desktop['progressx-reminders']),JSON.parse(phone['progressx-reminders']),JSON.parse(remote['progressx-reminders'])),false);
// Correct three-way conflict identification must compare both edits to their SAME baseline.
const base=[{id:'r1',name:'Original',time:'09:00'}];
assert.equal(conflict(base,JSON.parse(desktop['progressx-reminders']),JSON.parse(phone['progressx-reminders'])),true);
assert.equal(conflict(base,base,JSON.parse(phone['progressx-reminders'])),false);
console.log('PASS: regression reproduces concurrent Daily lost-update risk; baseline-aware conflict detection specified (not yet enforced)');
