const assert=require('node:assert/strict');
const fs=require('node:fs');
const production=fs.readFileSync('index.html','utf8');
assert.match(production,/user_app_snapshots\?on_conflict=user_id/,'Snapshot upsert behavior changed; revisit model');
const copy=x=>JSON.parse(JSON.stringify(x));
const baseline={
 'progressx-reminders':JSON.stringify([{id:'daily-1',name:'Water',time:'09:00'}]),
 'progressx-data-v19':JSON.stringify([{id:'workout-1',exercise:'Squat'}]),
 'progressx-progress-photos-v1':JSON.stringify([{id:'weight-1',weight:80}]),
 'progressx-food-log-v1':JSON.stringify([{id:'food-1',name:'Egg'}])
};
for(const [label,key] of Object.entries({
 Daily:'progressx-reminders',Workout:'progressx-data-v19',Weight:'progressx-progress-photos-v1',
 Food:'progressx-food-log-v1'
})){
 const remote=copy(baseline);
 const deviceA=copy(baseline),deviceB=copy(baseline);
 // A deletes its entry; B retains stale baseline then edits an unrelated key.
 deviceA[key]='[]';
 deviceB['unrelated-device-setting']='changed';
 Object.assign(remote,deviceA);
 Object.assign(remote,deviceB);
 assert.equal(remote[key],baseline[key],label+' stale whole-snapshot writer should demonstrate delete resurrection');
 // A concurrent edit to the same key must also not be silently treated as a safe merge.
 const changed=(x,y)=>JSON.stringify(x)!==JSON.stringify(y);
 assert.equal(changed(baseline[key],deviceA[key]),true);
 assert.equal(changed(baseline[key],deviceB[key]),false);
 console.log('KNOWN RISK: '+label+' deletion resurrected by stale whole-snapshot POST');
}
console.log('PASS: documented synthetic cross-device deletion resurrection risk; no production data modified');
