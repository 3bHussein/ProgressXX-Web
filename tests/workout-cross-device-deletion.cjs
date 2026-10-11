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


(async()=>{
 const flushStart=html.indexOf(' async function flush(){');
 const flushEnd=html.indexOf(' async function activate(next)',flushStart);
 assert.ok(flushStart>0&&flushEnd>flushStart);
 let sent,revision=1,savedRevision=0,uploading=false,scheduled=false;
 const values={
  [logKey]:JSON.stringify([stale,fresh]),
  [queueKey]:JSON.stringify([{op:'upsert',localId:'local_old',payload:{id:'local_old'}},{op:'upsert',localId:'local_new',payload:{id:'local_new'}}])
 };
 const rest={
  ready:true,uploading:false,navigator:{onLine:true},revision,savedRevision,
  account:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',values,Date,JSON,Set,String,Object,Array,Error,
  clearPending(){},tell(){},scheduleCloudSync(){scheduled=true},mirrorWorkoutScheduleToTable:async()=>{},
  nodeStorage:{setItem(k,v){values[k]=v;rest.revision++}},
  cloud:async(path,method,body)=>{
   if(method==='POST'){sent=body.payload;return [{payload:sent}]}
   return [{payload:{[deletedKey]:JSON.stringify(['local_old'])}}];
  }
 };
 vm.runInNewContext(html.slice(flushStart,flushEnd)+';globalThis.runFlush=flush;',rest);
 await rest.runFlush();
 assert.ok(sent,'No snapshot upload occurred');
 assert.deepEqual(JSON.parse(sent[logKey]).map(x=>x.id),['local_new']);
 assert.deepEqual(JSON.parse(sent[queueKey]).map(x=>x.localId),['local_new']);
 assert.deepEqual(JSON.parse(sent[deletedKey]),['local_old']);
 console.log('PASS: pre-upload check removes remotely deleted workout from stale queued snapshot');
})().catch(e=>{console.error(e);process.exitCode=1});


(async()=>{
 const start=html.indexOf(' async function flush(){');
 const end=html.indexOf(' async function activate(next)',start);
 assert.ok(start>0&&end>start);
 const calls=[];
 const values={
  [logKey]:JSON.stringify([stale,fresh]),
  [queueKey]:JSON.stringify([{op:'upsert',localId:'local_old',payload:{id:'local_old'}}])
 };
 const serverData={
  ...values,
  [deletedKey]:JSON.stringify(['local_old']),
  [logKey]:JSON.stringify([fresh]),
  [queueKey]:'[]'
 };
 const cache=new Map();
 const context={
  ready:true,uploading:false,revision:1,savedRevision:0,values,account:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  navigator:{onLine:true},Date,JSON,Set,String,Object,Array,Error,
  window:{__pxAtomicSnapshotReady:true},
  browserStorage:{setItem:(k,v)=>cache.set(k,v)},
  storagePrefix:id=>'pxx:full:'+id+':',
  nodeStorage:{setItem:(k,v)=>{values[k]=v;context.revision++;}},
  tell(){},clearPending(){},scheduleCloudSync(){},mirrorWorkoutScheduleToTable:async()=>{},
  cloud:async(path,method,body)=>{
   calls.push({path,method,body});
   if(path.startsWith('user_app_snapshots?select='))return [{payload:{[deletedKey]:JSON.stringify(['local_old'])}}];
   if(path==='rpc/progressxx_sync_snapshot')return serverData;
   throw Error('Unexpected network request '+method+' '+path);
  }
 };
 vm.runInNewContext(html.slice(start,end)+';globalThis.runFlush=flush;',context);
 await context.runFlush();
 assert.equal(calls.some(c=>c.path==='rpc/progressxx_sync_snapshot'&&c.method==='POST'),true);
 assert.equal(calls.some(c=>c.path.includes('on_conflict=user_id')),false,'RPC mode must never fall back to unsafe snapshot upsert');
 assert.deepEqual(JSON.parse(cache.get('pxx:full:'+context.account+':'+logKey)).map(x=>x.id),['local_new']);
 assert.deepEqual(JSON.parse(cache.get('pxx:full:'+context.account+':'+deletedKey)),['local_old']);
 console.log('PASS: opt-in atomic RPC uses one server write and applies server-confirmed deletions');
})().catch(e=>{console.error(e);process.exitCode=1});
