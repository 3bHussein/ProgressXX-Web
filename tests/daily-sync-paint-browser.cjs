const assert=require('node:assert/strict');
const {browserType,engine}=require('./helpers/browser-engine.cjs');
(async()=>{
 const browser=await browserType.launch({headless:true});
 const owner='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
 const today=new Date().toLocaleDateString('en-CA');
 let snapshot={'progressx-reminders':JSON.stringify([{id:'qa-daily',name:'Daily fixture',enabled:true}])},posts=0;
 async function device(width){
  const context=await browser.newContext({viewport:{width,height:900},serviceWorkers:'block'}),page=await context.newPage();
  await page.addInitScript(()=>{
   window.qaPaint=[];
   function sample(){if(document.body&&getComputedStyle(document.body).visibility!=='hidden')qaPaint.push({bg:getComputedStyle(document.documentElement).getPropertyValue('--bg').trim(),ready:document.documentElement.hasAttribute('data-px-interface-ready')});if(document.readyState!=='complete')requestAnimationFrame(sample)}
   requestAnimationFrame(sample);
  });
  await page.route('**/*',async route=>{
   const request=route.request(),url=request.url();
   if(new URL(url).hostname==='127.0.0.1')return route.continue();
   if(url.includes('/auth/v1/'))return route.fulfill({json:{access_token:'mock',refresh_token:'mock-refresh',expires_at:Math.floor(Date.now()/1000)+3600,user:{id:owner,email:'qa@example.test'}}});
   if(url.includes('/rest/v1/')){
    if(url.includes('user_app_snapshots')){
     if(request.method()==='GET')return route.fulfill({json:[{payload:{...snapshot}}]});
     if(request.method()==='POST'){snapshot={...request.postDataJSON().payload};posts++;return route.fulfill({status:201,json:[{}]})}
    }
    return route.fulfill({json:[]});
   }
   return route.abort();
  });
  await page.goto('http://127.0.0.1:8765/index.html');
  assert.equal(await page.evaluate(()=>getComputedStyle(document.body).visibility),'visible');
  assert(await page.evaluate(()=>qaPaint.every(x=>x.ready&&x.bg==='#101515')),'No visible old palette frame');
  assert.equal(await page.locator('body style:not(noscript style)').count(),0,'Static cascade precedes body');
  await page.fill('#pxEmail','qa@example.test');await page.fill('#pxPassword','mock-pass');await page.click('#pxSignin');
  await page.waitForFunction(()=>$('pxCommercialGate').hidden);
  await page.waitForFunction(()=>{const s=__pxSaveState();return !s.dirty&&!s.busy&&!s.conflict},null,{timeout:25000});
  return {context,page};
 }
 try{
  const a=await device(390),b=await device(1280);
  // Both start from the same settled snapshot; only one changes at a time.
  await a.page.evaluate(()=>{go('daily');toggleDailyDone('qa-daily');setWaterCurrent(1.25)});
  await a.page.waitForFunction(()=>!__pxSaveState().dirty&&!__pxSaveState().busy,null,{timeout:25000});
  const beforePull=posts;
  assert.equal(await b.page.evaluate(()=>__pxRefreshAccountDailyReminders()),'updated');
  assert.equal(await b.page.evaluate(()=>dailyIsDone('qa-daily')),true);
  assert.equal(await b.page.evaluate(()=>getWaterState().current),1.25);
  assert.equal(await b.page.evaluate(()=>dailyHistoryMap()[localDateKey()].waterCurrent),1.25);
  assert.equal(await b.page.evaluate(()=>__pxSaveState().dirty),false,'Pull/render does not create a queued write');
  await b.page.evaluate(()=>{go('daily');renderDaily();renderDailyHistory();renderDailyHistory()});
  assert.equal(posts,beforePull);assert.equal(await b.page.evaluate(()=>__pxSaveState().dirty),false);
  await b.page.evaluate(()=>{toggleDailyDone('qa-daily');setWaterCurrent(2)});
  await b.page.waitForFunction(()=>!__pxSaveState().dirty&&!__pxSaveState().busy,null,{timeout:25000});
  assert.equal(await a.page.evaluate(()=>__pxRefreshAccountDailyReminders()),'updated');
  assert.equal(await a.page.evaluate(()=>dailyIsDone('qa-daily')),false);assert.equal(await a.page.evaluate(()=>getWaterState().current),2);
  assert.equal(await a.page.evaluate(()=>__pxSaveState().conflict),false,'Adopted Daily baseline allows next-device edit');
  await a.page.reload();await a.page.waitForFunction(()=>$('pxCommercialGate').hidden);
  assert.equal(await a.page.evaluate(()=>getWaterState().current),2);
  for(const language of ['en','ar'])for(const width of [320,390,1280]){
   await a.page.setViewportSize({width,height:900});await a.page.evaluate(l=>{pxSetUILanguage(l);go('daily');pxRenderSavePanel()},language);
   const bounds=await a.page.locator('#pxSavePanel').boundingBox();if(width<821)assert(bounds.width<=46&&bounds.height<=46);
   assert.match(await a.page.locator('#pxSavePanel>summary').getAttribute('aria-label'),/sync|مزامنة/);
   await a.page.locator('#pxSavePanel>summary').click();assert((await a.page.locator('#pxMintSyncDialog').boundingBox()).height<=630);
   await a.page.keyboard.press('Escape');
   await a.page.locator('#dailyHistoryDate').click();assert.equal(await a.page.locator('#pxChoiceDialog').isVisible(),true);
   await a.page.keyboard.press('Escape');assert(await a.page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  }
  await a.context.setOffline(true);await a.page.evaluate(()=>setWaterCurrent(2.5));
  assert.equal(await a.page.evaluate(()=>__pxRefreshAccountDailyReminders()),'unavailable');
  snapshot={...snapshot,'progressx-water':JSON.stringify({date:today,current:3,target:3})};
  await a.context.setOffline(false);
  assert.equal(await a.page.evaluate(()=>__pxRefreshAccountDailyReminders()),'pending');
  assert.equal(await a.page.evaluate(()=>getWaterState().current),2.5,'Local pending edit retained');
  await a.context.close();await b.context.close();
  console.log('PASS '+engine+': first visible frame, compact status, Daily history picker, bidirectional done/water/history refresh, reload, clean read-only rendering, adopted baseline and pending protection');
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
