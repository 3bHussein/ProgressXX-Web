const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true});
 let snapshot={'progressx-reminders':JSON.stringify([{id:'daily-qa-deleted',text:'test record'}])};
 const writes=[];let scheduleWrites=0;
 const account='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
 async function device(){
  const context=await browser.newContext();
  const page=await context.newPage();
  await page.route('**/auth/v1/**',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({access_token:'mock',refresh_token:'mock-refresh',expires_at:Math.floor(Date.now()/1000)+3600,user:{id:account,email:'qa@example.test'}})}));
  await page.route('**/rest/v1/**',r=>{
   const req=r.request();
   if(req.url().includes('user_app_snapshots')){
    if(req.method()==='GET')return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify([{payload:snapshot}])});
    if(req.method()==='POST'){snapshot={...req.postDataJSON().payload};writes.push(snapshot['progressx-reminders']);if(snapshot['progressx-workout-schedule-v1']==='{"mon":"REST"}')scheduleWrites++;return r.fulfill({status:201,contentType:'application/json',body:'[{}]'});}
   }
   return r.fulfill({status:200,contentType:'application/json',body:'[]'});
  });
  await page.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded'});
  await page.fill('#pxEmail','qa@example.test');
  await page.fill('#pxPassword','mock-pass');
  await page.click('#pxSignin');
  await page.waitForFunction(()=>document.querySelector('#pxCommercialGate')?.hidden===true,null,{timeout:15000});
  await page.waitForFunction(()=>{const state=window.__pxSaveState?.();return document.querySelector('#pxCommercialGate')?.hidden&&state?.ready&&!state.dirty&&!state.busy&&!state.conflict},null,{timeout:20000});
  return {context,page};
 }
 try{
  // B becomes the stale device only after its initial writes have settled.
  const b=await device(),a=await device();
  const initial=await b.page.evaluate(()=>PXStore.getItem('progressx-reminders'));
  assert.match(initial,/daily-qa-deleted/,'Second device needs stale record in memory');
  await a.page.evaluate(()=>PXStore.setItem('progressx-reminders','[]'));
  const deadline=Date.now()+25000;
  while(snapshot['progressx-reminders']!=='[]'&&Date.now()<deadline)await a.page.waitForTimeout(200);
  assert.equal(snapshot['progressx-reminders'],'[]','Device A deletion must reach mock backend');
  await b.page.evaluate(()=>PXStore.setItem('progressx-workout-schedule-v1',JSON.stringify({mon:'REST'})));
  await b.page.waitForFunction(()=>document.querySelector('#pxSyncPill')?.textContent.includes('Sync paused'),null,{timeout:20000});
  assert.equal(scheduleWrites,0,'Stale B must not upload its unrelated change over A deletion');
  assert.equal(snapshot['progressx-reminders'],'[]','Remote deletion must stay deleted');
  const pendingKey='pxx:pending:'+account;
  const pending=await b.page.evaluate(k=>JSON.parse(localStorage.getItem(k)),pendingKey);
  assert.equal(pending.payload['progressx-workout-schedule-v1'],'{"mon":"REST"}','B edit remains recoverable');
  await b.page.evaluate(()=>PXStore.setItem('qa-conflict-note','retained'));
  assert.match(await b.page.locator('#pxSyncPill').textContent(),/Sync paused/,'Local changes during hold must not hide conflict status');
  await b.page.reload({waitUntil:'domcontentloaded'});
  await b.page.waitForFunction(()=>document.querySelector('#pxSyncPill')?.textContent.includes('Sync paused'),null,{timeout:20000});
  assert.equal(snapshot['progressx-reminders'],'[]','Stale pending replay after reload must not resurrect deletion');
  await b.page.click('#pxReviewConflict');
  await b.page.waitForFunction(()=>document.querySelector('#pxSyncPill')?.textContent.includes('Conflict review:'),null,{timeout:10000});
  const downloadPromise=b.page.waitForEvent('download');
  await b.page.click('#pxExportConflictPair');
  const download=await downloadPromise;
  const fs=require('node:fs');
  const pair=JSON.parse(fs.readFileSync(await download.path(),'utf8'));
  assert.equal(pair.remote['progressx-reminders'],'[]');
  assert.equal(pair.local.payload['progressx-workout-schedule-v1'],'{"mon":"REST"}');
  assert.equal(scheduleWrites,0,'Review and export must remain read-only');
  console.log('PASS: full root app pauses visible stale-device writes, preserves remote deletion and local draft across reload, reviews and exports both versions; mock backend only, atomic server CAS still OPEN');
  await a.context.close();await b.context.close();
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
