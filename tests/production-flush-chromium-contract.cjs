const {chromium}=require('playwright');
const fs=require('node:fs');
const assert=require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8');
const match=html.match(/async function flush\(\)\{[\s\S]*?\n \}/);
assert.ok(match,'Production flush helper not found');
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage();
  await page.goto('http://127.0.0.1:8765/prototypes/sync-delete-conflict-preview.html');
  const outcome=await page.evaluate(async source=>{
   const events=[];
   const env={ready:true,uploading:false,revision:1,savedRevision:0,account:'qa-user',
    values:{'progressx-reminders':'[]'},navigator:{onLine:true},Date,JSON,Error,Object,
    cloud:async()=>{events.push('post');if(events.filter(x=>x==='post').length===1)throw Error('503')},
    mirrorWorkoutScheduleToTable:async()=>events.push('mirror'),
    clearPending:()=>events.push('clear'),
    tell:m=>events.push(String(m)),scheduleCloudSync:()=>events.push('schedule')};
   const flush=new Function('env','with(env){'+source+';return flush}')(env);
   await flush();
   const failed={saved:env.savedRevision,cleared:events.includes('clear'),reported:events.some(x=>x.includes('503'))};
   await flush();
   const restored={saved:env.savedRevision,clears:events.filter(x=>x==='clear').length};
   // A newer edit made before the original POST returns must remain unacknowledged.
   let unlock;const wait=new Promise(resolve=>unlock=resolve);
   const concurrent={...env,revision:1,savedRevision:0,uploading:false,
    values:{sample:'old'},cloud:async()=>wait,clearPending:()=>events.push('unexpected-clear'),
    mirrorWorkoutScheduleToTable:async()=>{},tell:()=>{},scheduleCloudSync:()=>{}};
   const inFlight=new Function('env','with(env){'+source+';return flush}')(concurrent);
   const running=inFlight();concurrent.revision=2;concurrent.values.sample='new';unlock();await running;
   // Snapshot succeeds, but workout schedule mirror fails: no acknowledgment allowed.
   const mirrorEvents=[];
   const mirrorEnv={...env,revision:1,savedRevision:0,uploading:false,
    cloud:async()=>mirrorEvents.push('snapshot-post'),
    mirrorWorkoutScheduleToTable:async()=>{mirrorEvents.push('mirror-attempt');throw Error('mock mirror 503')},
    clearPending:()=>mirrorEvents.push('incorrect-clear'),
    tell:m=>mirrorEvents.push(String(m)),scheduleCloudSync:()=>mirrorEvents.push('retry-scheduled')};
   const mirrorFlush=new Function('env','with(env){'+source+';return flush}')(mirrorEnv);
   await mirrorFlush();
   const mirrorFailure={saved:mirrorEnv.savedRevision,cleared:mirrorEvents.includes('incorrect-clear'),posted:mirrorEvents.includes('snapshot-post'),reported:mirrorEvents.some(x=>x.includes('mock mirror 503'))};
   return {failed,restored,latest:{saved:concurrent.savedRevision,revision:concurrent.revision,cleared:events.includes('unexpected-clear')},mirrorFailure};
  },match[0]);
  assert.deepEqual(outcome.failed,{saved:0,cleared:false,reported:true});
  assert.deepEqual(outcome.restored,{saved:1,clears:1});
  assert.deepEqual(outcome.latest,{saved:1,revision:2,cleared:false});
  assert.deepEqual(outcome.mirrorFailure,{saved:0,cleared:false,posted:true,reported:true});
  console.log('PASS: Chromium executes actual flush with mocked failed POST, recovery and concurrent edit retention');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
