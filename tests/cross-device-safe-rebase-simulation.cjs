const assert=require('node:assert/strict');
const fs=require('node:fs');
assert.match(fs.readFileSync('index.html','utf8'),/user_app_snapshots\?on_conflict=user_id/,'Review strategy when live snapshot changes');
const clone=x=>JSON.parse(JSON.stringify(x));
const datasets={
 Daily:'progressx-reminders',Workout:'progressx-data-v19',
 Weight:'progressx-progress-photos-v1',Food:'progressx-food-log-v1'
};
for(const [name,key] of Object.entries(datasets)){
 const row={id:name.toLowerCase()+'-1',name:'Record'};
 const baseline={[key]:JSON.stringify([row]),other:'untouched'};
 let server=clone(baseline),version=1;
 const deviceA=clone(baseline),deviceB=clone(baseline);
 // Device A deletes; B independently edits a setting while holding stale deleted record.
 deviceA[key]='[]';deviceB.other='changed';
 const cas=(expected,updated)=>expected!==version?{ok:false,conflict:true,current:clone(server),version}:
  (server=clone(updated),version++,{ok:true,conflict:false,current:clone(server),version});
 assert.equal(cas(1,deviceA).ok,true,name+' first delete');
 const blocked=cas(1,deviceB);
 assert.equal(blocked.ok,false,name+' stale save must be rejected');
 assert.equal(server[key],'[]',name+' deletion must remain after stale save');
 assert.equal(deviceB[key],baseline[key],name+' pending local state remains available');
 // Resolve only unrelated B edit against the new authoritative version, preserving A's deletion.
 const safe={...blocked.current,other:deviceB.other};
 assert.equal(cas(blocked.version,safe).ok,true,name+' approved rebase');
 assert.equal(server[key],'[]',name+' deletion preserved after rebase');
 assert.equal(server.other,'changed',name+' unrelated change saved');
 // Same-key concurrent edit must NOT silently merge.
 const editC={...baseline,[key]:JSON.stringify([{...row,name:'Changed on old copy'}])};
 assert.equal(cas(1,editC).conflict,true,name+' stale same-key edit rejected');
 console.log('PASS: '+name+' deletion survives stale writer, approved disjoint-key rebase, stale edit rejects');
}
console.log('SPECIFICATION ONLY: no production CAS or tombstones deployed, no database changes');
