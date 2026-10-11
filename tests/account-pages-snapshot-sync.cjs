const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true});
 let snapshot={};let writes=0;
 const keys={
  'Workout Log':'progressx-data-v19',
  'Workout Schedule':'progressx-workout-schedule-v1',
  'Weight Check-ins':'progressx-progress-photos-v1',
  'Daily Reminders':'progressx-reminders',
  'Anatomy links':'progressxx-anatomy-exercise-links-v1',
  'Workout Templates':'progressx-workout-templates-v1',
  'Goal Center':'progressx-goal-center-v1',
  'Body Measurements':'progressx-body-measurements-v1'
 };
 async function login(context){
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/auth/v1/**',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({
   access_token:'qa-token',refresh_token:'qa-refresh',expires_at:Math.floor(Date.now()/1000)+3600,
   user:{id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',email:'qa@example.test'}
  })}));
  await page.route('**/rest/v1/**',async route=>{
   const req=route.request(),url=req.url();
   if(url.includes('user_app_snapshots')){
    if(req.method()==='GET')return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(Object.keys(snapshot).length?[{payload:snapshot}]:[])});
    if(req.method()==='POST'){const body=req.postDataJSON();snapshot={...body.payload};writes++;return route.fulfill({status:201,contentType:'application/json',body:JSON.stringify([{user_id:body.user_id,payload:snapshot}])})}
   }
   return route.fulfill({status:200,contentType:'application/json',body:'[]'});
  });
  await page.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded'});
  await page.locator('#pxEmail').fill('qa@example.test');
  await page.locator('#pxPassword').fill('qa-password');
  await page.locator('#pxSignin').click();
  await page.waitForFunction(()=>document.querySelector('#pxCommercialGate')?.hidden===true,null,{timeout:15000});
  // Gate visibility changes before account boot and snapshot hydration finish.
  // Wait for a cloud-sync-ready state before evaluating cross-session records.
  await page.waitForFunction(()=>document.querySelector('#pxSyncPill')?.textContent.includes('Synced to Supabase'),null,{timeout:20000});
  return {page,errors};
 }
 try{
  const sampleValues={
   'Workout Log':'[]',
   'Workout Schedule':JSON.stringify({mon:'REST',tue:'REST'}),
   'Weight Check-ins':'[]',
   'Daily Reminders':'[]',
   'Anatomy links':'{}',
   'Workout Templates':'[]',
   'Goal Center':'[]',
   'Body Measurements':'[]'
  };
  const first=await browser.newContext();
  const a=await login(first);
  await a.page.evaluate(({keys,samples})=>{
   Object.entries(keys).forEach(([name,key])=>PXStore.setItem(key,samples[name]));
  },{keys,samples:sampleValues});
  // A stale "Synced" label may predate this batch of edits. Wait for actual
  // server-acknowledged values instead of a status label or fixed sleep.
  const deadline=Date.now()+25000;
  while(Object.entries(keys).some(([name,key])=>snapshot[key]!==sampleValues[name])&&Date.now()<deadline)
   await a.page.waitForTimeout(250);
  for(const [name,key] of Object.entries(keys))assert.equal(snapshot[key],sampleValues[name],'Missing cloud snapshot for '+name);
  assert.ok(writes>0,'No snapshot POST was sent');
  // A separate browser context simulates another device: no local storage is shared.
  const second=await browser.newContext();
  const b=await login(second);
  // Wait for actual second-context hydration, not only the sync status indicator.
  await b.page.waitForFunction(({keys,samples})=>
   Object.entries(keys).every(([name,key])=>PXStore.getItem(key)===samples[name]),
   {keys,samples:sampleValues},{timeout:20000});
  const restored=await b.page.evaluate(keys=>Object.fromEntries(Object.entries(keys).map(([n,k])=>[n,PXStore.getItem(k)])),keys);
  for(const [name,value] of Object.entries(restored))assert.equal(value,sampleValues[name],'Cross-device snapshot restore failed for '+name);
  assert.deepEqual(a.errors,[],'First-device JavaScript errors');
  assert.deepEqual(b.errors,[],'Second-device JavaScript errors');
  console.log('PASS: scoped snapshot values persisted and restored in a separate browser context for '+Object.keys(keys).length+' feature groups.');
  console.log('NOTE: Does not prove independent normalized-table writes or correctness of each feature UI.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
