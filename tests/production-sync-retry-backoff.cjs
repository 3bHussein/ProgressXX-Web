const {fixture}=require('./helpers/production-snapshot-fixture.cjs');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync('index.html','utf8');
const schedule=html.match(/let syncRetryFailures=0;[\s\S]*?function scheduleCloudSync\(\)\{[^\n]+\}/);
const flush=html.match(/async function flush\(\)\{[\s\S]*?\n \}/);
assert.ok(schedule&&flush,'Production retry helpers missing');
const delays=[];let pending=true,attempt=0;
const env={...fixture(),timer:null,ready:true,uploading:false,revision:1,savedRevision:0,account:'mock',
 values:{'progressx-reminders':'[]'},navigator:{onLine:true},
 clearTimeout:()=>{},setTimeout:(fn,delay)=>{delays.push(delay);return 1},
 cloud:async(path,method='GET')=>{if(method==='GET')return [{payload:{}}];if(++attempt<=3)throw Error('synthetic 503');return []},
 mirrorWorkoutScheduleToTable:async()=>{},
 clearPending:()=>{pending=false},tell:()=>{},Date,JSON,Math,Error,Object};
vm.runInNewContext(schedule[0]+'\n'+flush[0]+'\nthis.go=flush;this.getFailures=()=>syncRetryFailures;',env);
(async()=>{
 for(let i=0;i<3;i++){await env.go();assert.equal(pending,true)}
 assert.deepEqual(delays,[2400,4800,9600]);
 assert.equal(env.savedRevision,0);
 await env.go();
 assert.equal(env.savedRevision,1);assert.equal(pending,false);
 assert.equal(env.getFailures(),0);
 console.log('PASS: production flush retries increase delay on mock 503 and reset on success; pending survives failure');
})().catch(e=>{console.error(e);process.exitCode=1});
