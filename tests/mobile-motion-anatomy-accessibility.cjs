const {browserType,engine}=require('./helpers/browser-engine.cjs');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await browserType.launch({headless:true});
 try{
  for(const width of [320,390,768]){
   const page=await browser.newPage({viewport:{width,height:800},reducedMotion:'reduce'});
   const errors=[],privateRequests=[];
   page.on('pageerror',e=>errors.push(e.stack||e.message));
   await page.route('**/*',r=>{
    const url=r.request().url();
    if(url.startsWith('http://127.0.0.1:8765/'))return r.continue();
    if(url.includes('.supabase.co/'))privateRequests.push(url);
    if(url.startsWith('https://commons.wikimedia.org/'))return r.fulfill({status:200,contentType:url.includes('qaBroken=1')?'image/png':'image/svg+xml',body:url.includes('qaBroken=1')?'invalid image fixture':'<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="#93a4bb"/></svg>'});
    return r.fulfill({status:200,contentType:'application/javascript',body:''});
   });
   await page.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded'});
   const motion=await page.evaluate(()=>{
    const calls=[];Element.prototype.scrollIntoView=function(options){calls.push(options)};
    document.querySelector('#settings .pxSettingsQuickNav button').click();
    return {helper:pxScrollBehavior(),style:getComputedStyle(document.documentElement).scrollBehavior,calls};
   });
   assert.equal(motion.helper,'auto');assert.equal(motion.style,'auto');assert.equal(motion.calls[0].behavior,'auto');
   await page.emulateMedia({reducedMotion:'no-preference'});
   assert.equal(await page.evaluate(()=>pxScrollBehavior()),'smooth');
   await page.evaluate(()=>{
    // UI-only fixture on the production root; no auth, account activation or data writes.
    document.querySelector('#pxCommercialGate').hidden=true;
    const fixture=document.createElement('div');fixture.id='qaAnatomyFixture';
    fixture.innerHTML=pxAnatomyImage(0,'front',false)+pxAnatomyPartMedia(9,false);
    document.body.prepend(fixture);
   });
   const image=page.locator('#qaAnatomyFixture img').first();
   assert.equal(await image.getAttribute('role'),'button');assert.equal(await image.getAttribute('tabindex'),'0');
   assert.equal(await image.getAttribute('loading'),'lazy');assert.equal(await image.getAttribute('decoding'),'async');
   await page.waitForFunction(()=>{const img=document.querySelector('#qaAnatomyFixture img');return img?.complete&&img.naturalWidth>0&&!img.hidden});
   await image.focus();await page.keyboard.press('Enter');
   await page.waitForSelector('#pxAnatomyZoom');
   const dialog=page.locator('#pxAnatomyZoom');
   assert.equal(await dialog.getAttribute('aria-modal'),'true');assert.ok(await dialog.getAttribute('aria-label'));
   assert.equal(await page.evaluate(()=>document.activeElement.textContent.trim()),'✕ Close');
   await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.getAttribute('aria-label')),'Zoom out');
   await page.keyboard.press('Shift+Tab');assert.equal(await page.evaluate(()=>document.activeElement.textContent.trim()),'✕ Close');
   await page.locator('#pxAnatomyZoom [aria-label="Zoom in"]').click();
   assert.equal(await page.evaluate(()=>pxAnatomyZoomScale),1.25);
   const controls=await page.locator('#pxAnatomyZoom button').evaluateAll(nodes=>nodes.map(el=>{const r=el.getBoundingClientRect();return {width:r.width,height:r.height,left:r.left,right:r.right}}));
   assert.ok(controls.every(r=>r.width>=44&&r.height>=44&&r.left>=0&&r.right<=width),'Zoom control layout at '+width);
   await page.keyboard.press('Escape');assert.equal(await page.locator('#pxAnatomyZoom').count(),0);
   assert.equal(await image.evaluate(el=>document.activeElement===el),true,'Focus returns to triggering image');
   await page.keyboard.press('Space');await page.waitForSelector('#pxAnatomyZoom');
   await page.locator('#pxAnatomyZoom button').last().click();
   assert.equal(await image.evaluate(el=>document.activeElement===el),true);
   await image.click();await page.waitForSelector('#pxAnatomyZoom');
   assert.equal(await page.evaluate(()=>handleAndroidBack()),true,'Android back closes zoom before navigating');
   assert.equal(await page.locator('#pxAnatomyZoom').count(),0);
   assert.equal(await image.evaluate(el=>document.activeElement===el),true);
   await page.evaluate(()=>{document.querySelector('#qaAnatomyFixture img').src='https://commons.wikimedia.org/qa-image?qaBroken=1'});
   await page.waitForFunction(()=>{const img=document.querySelector('#qaAnatomyFixture img');return img?.hidden&&img.nextElementSibling?.hidden===false});
   assert.deepEqual(errors,[]);assert.deepEqual(privateRequests,[],'UI test must not contact Supabase');
   await page.close();
  }
  console.log('PASS ['+engine+']: root UI at 320/390/768, reduced-motion scroll, lazy async images, Enter/Space zoom, labelled modal, focus trap/restore 44px controls and actual image-error fallback; no Supabase requests');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
