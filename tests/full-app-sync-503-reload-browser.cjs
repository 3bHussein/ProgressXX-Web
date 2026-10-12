const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true});
 let failWrites=false,successWrites=0,failedWrites=0;
 let snapshot={};
 try{
  const page=await browser.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/auth/v1/**',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({access_token:'fake',refresh_token:'fake-refresh',expires_at:Math.floor(Date.now()/1000)+3600,user:{id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',email:'qa@example.test'}})}));
  await page.route('**/rest/v1/**',route=>{
   const req=route.request();
   if(req.url().includes('user_app_snapshots')){
    if(req.method()==='GET')return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify([{payload:snapshot}])});
    if(req.method()==='POST'){
     if(failWrites){failedWrites++;return route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({message:'mock unavailable'})})}
     snapshot=req.postDataJSON().payload;successWrites++;
     return route.fulfill({status:201,contentType:'application/json',body:'[{}]'});
    }
   }
   return route.fulfill({status:200,contentType:'application/json',body:'[]'});
  });
  await page.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded'});
  await page.fill('#pxEmail','qa@example.test');
  await page.fill('#pxPassword','only-mock');
  await page.click('#pxSignin');
  await page.waitForFunction(()=>window.__pxCommercialReady?.()===true,null,{timeout:20000});
  failWrites=true;
  await page.evaluate(()=>PXStore.setItem('progressx-reminders','[]'));
  await page.waitForFunction(()=>document.querySelector('#pxSyncPill')?.textContent.includes('sync pending'),null,{timeout:25000});
  assert.ok(failedWrites>=1,'Failure route must be reached');
  const pendingKey='pxx:pending:aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  assert.notEqual(await page.evaluate(key=>localStorage.getItem(key),pendingKey),null,'Failed sync must keep pending record');
  failWrites=false;
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__pxCommercialReady?.()===true,null,{timeout:20000});
  await page.locator('#pxSyncNow').click();
  const until=Date.now()+25000;
  while(snapshot['progressx-reminders']!=='[]'&&Date.now()<until)await page.waitForTimeout(250);
  assert.equal(snapshot['progressx-reminders'],'[]','Retry must reach mock database');
  await page.waitForFunction(key=>localStorage.getItem(key)===null,pendingKey,{timeout:20000});
  assert.ok(successWrites>=1);
  assert.deepEqual(errors,[],'Unhandled app errors');
  console.log('PASS: actual signed-in app keeps pending after HTTP 503, restores on reload, retries successfully to mocked Supabase');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
