const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true});
 const uid='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
 let snapshot={},rejectA=false,failed=0,accepted=0;
 async function openDevice(label){
  const context=await browser.newContext();const page=await context.newPage();
  page.on('pageerror',err=>{throw Error(label+': '+err.message)});
  await page.route('**/auth/v1/**',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({access_token:'mock',refresh_token:'mock-refresh',expires_at:Math.floor(Date.now()/1000)+3600,user:{id:uid,email:'qa@example.test'}})}));
  await page.route('**/rest/v1/**',route=>{
   const req=route.request();
   if(req.url().includes('user_app_snapshots')){
    if(req.method()==='GET')return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(Object.keys(snapshot).length?[{payload:snapshot}]:[])});
    if(req.method()==='POST'){
     if(label==='A'&&rejectA){failed++;return route.fulfill({status:503,contentType:'application/json',body:'{"message":"synthetic failure"}'})}
     snapshot={...req.postDataJSON().payload};accepted++;
     return route.fulfill({status:201,contentType:'application/json',body:'[{}]'});
    }
   }
   return route.fulfill({status:200,contentType:'application/json',body:'[]'});
  });
  await page.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded'});
  await page.fill('#pxEmail','qa@example.test');await page.fill('#pxPassword','only-mock');await page.click('#pxSignin');
  await page.waitForFunction(()=>window.__pxCommercialReady?.()===true,null,{timeout:20000});
  return {page,context};
 }
 try{
  const b=await openDevice('B');
  await b.page.waitForFunction(()=>document.querySelector('#pxSyncPill')?.textContent.includes('Synced to Supabase'),null,{timeout:20000});
  const a=await openDevice('A');
  await a.page.waitForFunction(()=>document.querySelector('#pxSyncPill')?.textContent.includes('Synced to Supabase'),null,{timeout:20000});
  rejectA=true;
  const marker='cross-context-queued-edit';
  await a.page.evaluate(marker=>PXStore.setItem('progressx-reminders',JSON.stringify([{id:marker,text:'mock only'}])),marker);
  await a.page.waitForFunction(()=>document.querySelector('#pxSyncPill')?.textContent.includes('sync pending'),null,{timeout:20000});
  assert.ok(failed>0);assert.equal(JSON.stringify(snapshot).includes(marker),false,'Failed A write must not reach server');
  assert.equal(await b.page.evaluate(()=>String(PXStore.getItem('progressx-reminders')||'').includes('cross-context-queued-edit')),false);
  rejectA=false;
  await a.page.reload({waitUntil:'domcontentloaded'});
  await a.page.waitForFunction(()=>window.__pxCommercialReady?.()===true,null,{timeout:20000});
  await a.page.waitForFunction(()=>document.querySelector('#pxSyncPill')?.textContent.includes('Synced to Supabase'),null,{timeout:25000});
  assert.ok(JSON.stringify(snapshot).includes(marker),'Restored pending edit should automatically upload');
  const pendingKey='pxx:pending:'+uid;
  assert.equal(await a.page.evaluate(key=>localStorage.getItem(key),pendingKey),null,'A must clear pending only after successful remote confirmation');
  assert.equal(await b.page.evaluate(()=>String(PXStore.getItem('progressx-reminders')||'').includes('cross-context-queued-edit')),false,'B must not silently read A local storage before hydration');
  await b.page.reload({waitUntil:'domcontentloaded'});
  await b.page.waitForFunction(()=>window.__pxCommercialReady?.()===true,null,{timeout:20000});
  assert.equal(await b.page.evaluate(()=>String(PXStore.getItem('progressx-reminders')||'').includes('cross-context-queued-edit')),true);
  assert.ok(accepted>0);
  console.log('PASS: two isolated Chromium contexts recover pending changes on A reload and hydrate B after reload using fake Supabase');
  await a.context.close();await b.context.close();
 }finally{await browser.close()}
})().catch(err=>{console.error(err);process.exitCode=1});
