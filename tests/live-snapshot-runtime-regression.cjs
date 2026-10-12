'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {fixture}=require('./helpers/production-snapshot-fixture.cjs');
const html=fs.readFileSync('index.html','utf8');
const flush=html.match(/async function flush\(\)\{[\s\S]*?\n \}/)[0];
const pending=html.match(/const pendingKey=id=>[\s\S]*?function readPending\(id\)\{[^\n]+\}/)[0];
function session(remote={}){
 const data=new Map(),notes=[];let writes=0;
 const base=fixture(remote),cloud=base.cloud;
 const env={...base,account:'synthetic-account',values:{...remote},ready:true,uploading:false,
  revision:1,savedRevision:0,navigator:{onLine:true},Date,JSON,Object,Error,
  browserStorage:{getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)},
  tell:m=>notes.push(m),scheduleCloudSync:()=>{},mirrorWorkoutScheduleToTable:async()=>{},
  cloud:async(...args)=>{if(args[1]==='POST')writes++;return cloud(...args)}};
 vm.runInNewContext('let syncRetryFailures=0;'+pending+'\n'+flush+'\nthis.api={flush,markPending,readPending};',env);
 return {env,data,notes,writes:()=>writes};
}
(async()=>{
 // An already-visible remote deletion blocks stale local replay, retaining both sides.
 const stale=session({daily:'old'});stale.env.values.workout='new';stale.env.api.markPending();
 stale.env.cloud=async(path,method='GET')=>{assert.equal(method,'GET','Conflict must never POST');return [{payload:{daily:'[]'}}]};
 await stale.env.api.flush();assert.equal(stale.env.syncConflictHold,true);
 assert.equal(stale.env.savedRevision,0);assert.equal(stale.env.api.readPending('synthetic-account').workout,'new');
 // A newer local edit made while POST is in flight must use the acknowledged baseline on reload.
 const active=session({daily:'old'});active.env.api.markPending();
 const cloud=active.env.cloud;let release,started;
 const wait=new Promise(r=>release=r),postStarted=new Promise(r=>started=r);
 active.env.cloud=async(...args)=>{if(args[1]==='POST'){started();await wait}return cloud(...args)};
 const run=active.env.api.flush();await postStarted;
 active.env.values.workout='new';active.env.revision++;active.env.api.markPending();release();await run;
 const record=JSON.parse(active.data.get('pxx:pending:synthetic-account'));
 assert.equal(record.payload.workout,'new');assert.equal(record.baseDigest,active.env.snapshotBaseline);
 assert.equal(active.env.savedRevision,1);assert.equal(active.env.revision,2);
 await active.env.api.flush();assert.equal(active.env.savedRevision,2);assert.equal(active.data.size,0);
 assert.equal(active.writes(),2);
 // A mirror failure after successful snapshot POST must retain the new baseline too.
 const mirror=session({daily:'old'});mirror.env.values.daily='new';mirror.env.api.markPending();
 mirror.env.mirrorWorkoutScheduleToTable=async()=>{throw Error('synthetic mirror failure')};
 await mirror.env.api.flush();
 const queued=JSON.parse(mirror.data.get('pxx:pending:synthetic-account'));
 assert.equal(queued.baseDigest,mirror.env.snapshotBaseline);assert.equal(queued.payload.daily,'new');
 assert.equal(mirror.env.savedRevision,0);assert.equal(mirror.env.syncConflictHold,false);
 console.log('PASS: actual production flush blocks visible stale writes and preserves newer edits with a reload-safe acknowledged baseline; non-atomic CAS limitation remains');
})().catch(e=>{console.error(e);process.exitCode=1});
