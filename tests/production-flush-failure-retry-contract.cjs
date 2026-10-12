const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync('index.html','utf8');
const match=html.match(/async function flush\(\)\{[\s\S]*?\n \}/);
assert.ok(match,'Production flush function missing');
(async()=>{
 const calls=[],notes=[];
 let attempt=0,pending=true,ready=true,uploading=false,revision=1,savedRevision=0;
 const context={
  ready,uploading,revision,savedRevision,account:'synthetic-user',
  values:{'progressx-reminders':'[]'},navigator:{onLine:true},
  cloud:async()=>{attempt++;if(attempt===1)throw Error('HTTP 503');calls.push('cloud')},
  mirrorWorkoutScheduleToTable:async()=>{calls.push('mirror')},
  clearPending:()=>{pending=false;calls.push('clear')},
  tell:message=>notes.push(message),scheduleCloudSync:()=>calls.push('scheduled'),
  Date,JSON,Error,Object
 };
 vm.runInNewContext('let syncRetryFailures=0;\n'+match[0]+'\nthis.runFlush=flush;',context);
 await context.runFlush();
 assert.equal(pending,true,'Failed POST must preserve local pending data');
 assert.equal(context.savedRevision,0,'Failed POST must not acknowledge revision');
 assert.match(notes.at(-1),/Unsynced changes: HTTP 503/);
 await context.runFlush();
 assert.equal(pending,false,'Successful POST and mirror should clear pending');
 assert.equal(context.savedRevision,1);
 assert.deepEqual(calls.filter(x=>x==='cloud'),['cloud']);
 assert.deepEqual(calls.filter(x=>x==='mirror'),['mirror']);
 assert.deepEqual(calls.filter(x=>x==='clear'),['clear']);
 // Mirror failure after successful snapshot POST must retain pending for retry.
 const mirrorCtx={ready:true,uploading:false,revision:1,savedRevision:0,account:'test',
  values:{sample:'one'},navigator:{onLine:true},Date,JSON,Error,Object,
  cloud:async()=>{},mirrorWorkoutScheduleToTable:async()=>{throw Error('mirror failed')},
  clearPending:()=>{throw Error('Must not clear pending after mirror failure')},
  tell:()=>{},scheduleCloudSync:()=>{}};
 vm.runInNewContext(match[0]+'\nthis.runFlush=flush;',mirrorCtx);
 await mirrorCtx.runFlush();
 assert.equal(mirrorCtx.savedRevision,0,'Failed workout mirror must leave snapshot pending');
 // If user edits during upload, prior acknowledgment must never clear their new edit.
 let release;
 const waiting=new Promise(resolve=>release=resolve);
 let clears=0;
 const concurrentCtx={ready:true,uploading:false,revision:1,savedRevision:0,account:'test',
  values:{sample:'old'},navigator:{onLine:true},Date,JSON,Error,Object,
  cloud:async()=>{await waiting},mirrorWorkoutScheduleToTable:async()=>{},
  clearPending:()=>{clears++},tell:()=>{},scheduleCloudSync:()=>{}};
 vm.runInNewContext(match[0]+'\nthis.runFlush=flush;',concurrentCtx);
 const inflight=concurrentCtx.runFlush();
 concurrentCtx.revision=2;concurrentCtx.values.sample='new';release();
 await inflight;
 assert.equal(clears,0,'Edit made during upload must keep pending record');
 assert.equal(concurrentCtx.savedRevision,1,'Only old revision is acknowledged');
 assert.equal(concurrentCtx.revision,2,'Latest edit remains unsynced');
 console.log('PASS: extracted production flush retains pending state after simulated 503, acknowledges only after successful POST and mirror; protects mirror failures and concurrent edits');
})().catch(e=>{console.error(e);process.exitCode=1});
