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
 vm.runInNewContext(match[0]+'\nthis.runFlush=flush;',context);
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
 console.log('PASS: extracted production flush retains pending state after simulated 503, acknowledges only after successful POST and mirror');
})().catch(e=>{console.error(e);process.exitCode=1});
