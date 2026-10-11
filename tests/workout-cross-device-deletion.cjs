const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync('index.html','utf8');
const start=html.indexOf('  const merged=pending?{...cloudValues,...pending}:cloudValues;');
const end=html.indexOf('  values={};',start);
assert.ok(start>0&&end>start,'Offline restore reconciliation is missing');
const code=html.slice(start,end)+'\nglobalThis.result=merged;';
const logKey='progressx-data-v19',queueKey='progressx-workout-sync-queue-v1',deletedKey='progressx-workout-deleted-ids-v1';
const stale={id:'local_old',day:'Push',exercise:'Bench',week:1};
const fresh={id:'local_new',day:'Pull',exercise:'Row',week:2};
const cloudValues={
 [deletedKey]:JSON.stringify(['local_old']),
 [logKey]:JSON.stringify([fresh])
};
const pending={
 [logKey]:JSON.stringify([stale,fresh]),
 [queueKey]:JSON.stringify([{op:'upsert',localId:'local_old',payload:{id:'local_old'}},{op:'upsert',localId:'local_new',payload:{id:'local_new'}}])
};
const scope={cloudValues,pending,JSON,Set,String,Array};
vm.runInNewContext(code,scope);
const restored=scope.result;
assert.deepEqual(JSON.parse(restored[deletedKey]),['local_old']);
assert.deepEqual(JSON.parse(restored[logKey]).map(x=>x.id),['local_new']);
assert.deepEqual(JSON.parse(restored[queueKey]).map(x=>x.localId),['local_new']);
assert.equal(JSON.parse(pending[logKey]).length,2,'Input must not be mutated');
console.log('PASS: stale device offline edits cannot restore workouts deleted in newer cloud snapshot');
