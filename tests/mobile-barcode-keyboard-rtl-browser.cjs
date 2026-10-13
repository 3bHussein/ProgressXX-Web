const assert=require('node:assert/strict');const {chromium}=require('playwright');
(async()=>{const browser=await chromium.launch({headless:true});try{
 for(const width of [320,390,768]){
  const page=await browser.newPage({viewport:{width,height:844}}),errors=[],backend=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',r=>{const u=new URL(r.request().url());if(u.hostname==='127.0.0.1')return r.continue();if(u.hostname.endsWith('supabase.co'))backend.push(u.href);return r.abort()});
  await page.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>{
   // No account activation: UI-only fixture and controlled camera startup.
   $('pxCommercialGate').hidden=true;const trigger=document.createElement('button');trigger.id='qaBarcodeTrigger';trigger.textContent='Scan';trigger.onclick=()=>{window.qaOpen=openBarcodeScanner()};document.body.prepend(trigger);
   window.qaCamera={created:0,stopped:0,cleared:0,decoded:0,lookups:0};
   window.Html5Qrcode=class{constructor(){qaCamera.created++}start(config,options,callback){window.qaDecode=callback;return new Promise(r=>window.qaCameraReady=r)}async stop(){qaCamera.stopped++}async clear(){qaCamera.cleared++}};
   window.Html5QrcodeSupportedFormats={EAN_13:1,EAN_8:2,UPC_A:3,UPC_E:4,CODE_128:5};
   window.handleScannedBarcode=async()=>qaCamera.decoded++;window.lookupManualBarcode=()=>qaCamera.lookups++;
  });
  const trigger=page.locator('#qaBarcodeTrigger');await trigger.click();await page.waitForFunction(()=>!!window.qaCameraReady);
  const dialog=page.locator('#barcodeModal');assert.equal(await dialog.getAttribute('role'),'dialog');assert.equal(await dialog.getAttribute('aria-modal'),'true');
  assert.equal(await page.evaluate(()=>document.activeElement.id),'barcodeManualInput');assert.equal(await page.locator('#barcodeManualInput').getAttribute('dir'),'ltr');
  assert.equal(await page.locator('label[for="barcodeManualInput"]').count(),1);assert.equal(await page.locator('#barcodeScannerStatus').getAttribute('role'),'status');
  await page.fill('#barcodeManualInput','6224010103344');await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>qaCamera.lookups),1);
  await page.locator('#barcodeModal .barcodeManual button').focus();await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.getAttribute('aria-label')),'Close barcode scanner');
  await page.keyboard.press('Shift+Tab');assert.equal(await page.evaluate(()=>document.activeElement.textContent.trim()),'Search barcode');
  const controls=await page.locator('#barcodeModal button').evaluateAll(nodes=>nodes.map(el=>{const r=el.getBoundingClientRect();return {w:r.width,h:r.height,left:r.left,right:r.right}}));assert(controls.every(r=>r.w>=44&&r.h>=44&&r.left>=0&&r.right<=width),'44px controls fit '+width);
  await page.evaluate(()=>openBarcodeScanner());assert.equal(await page.evaluate(()=>qaCamera.created),1,'Repeated open cannot start another camera');
  await page.keyboard.press('Escape');assert.equal(await dialog.evaluate(el=>el.classList.contains('show')),false);assert.equal(await trigger.evaluate(el=>document.activeElement===el),true,'Focus returns immediately, while startup is pending');
  await page.evaluate(async()=>{qaCameraReady();await qaOpen;await barcodeScannerCleanup;qaDecode('1234567890')});
  assert.deepEqual(await page.evaluate(()=>({created:qaCamera.created,stopped:qaCamera.stopped,cleared:qaCamera.cleared,decoded:qaCamera.decoded})),{created:1,stopped:1,cleared:1,decoded:0});
  // Normal start, Android back and a second open must still work after pending-start cleanup.
  await trigger.click();await page.waitForFunction(()=>qaCamera.created===2);await page.evaluate(async()=>{qaCameraReady();await qaOpen});
  assert.equal(await page.evaluate(()=>handleAndroidBack()),true);await page.evaluate(()=>barcodeScannerCleanup);assert.equal(await trigger.evaluate(el=>document.activeElement===el),true);
  assert.equal(await page.evaluate(()=>qaCamera.stopped),2);assert.equal(await page.evaluate(()=>qaCamera.cleared),2);
  // Close and reopen before startup resolves: the next camera waits for cleanup.
  await trigger.click();await page.waitForFunction(()=>qaCamera.created===3);await page.evaluate(()=>{window.qaOldOpen=qaOpen});
  await page.keyboard.press('Escape');await trigger.click();assert.equal(await page.evaluate(()=>qaCamera.created),3);
  await page.evaluate(async()=>{qaCameraReady();await qaOldOpen});await page.waitForFunction(()=>qaCamera.created===4);
  await page.evaluate(async()=>{qaCameraReady();await qaOpen});await page.locator('#barcodeModal [aria-label="Close barcode scanner"]').click();await page.evaluate(()=>barcodeScannerCleanup);
  assert.equal(await page.evaluate(()=>qaCamera.stopped),4);assert.equal(await page.evaluate(()=>qaCamera.cleared),4);
  const rtl=await page.evaluate(()=>{
   const section=$('pxAnatomyDetail').closest('.section');if(section)section.style.display='block';$('pxAnatomyLang').value='ar';$('pxAnatomySearch').value='';pxRenderAnatomy();
   const arabic={dir:$('pxAnatomyDetail').dir,lang:$('pxAnatomyDetail').lang,listDir:$('pxAnatomyList').dir,title:$('pxAnatomyDetail').querySelector('h3').textContent,listDirection:getComputedStyle($('pxAnatomyList')).direction,listAlign:getComputedStyle($('pxAnatomyList').querySelector('button')).textAlign,englishDir:$('pxAnatomyDetail').querySelector('.pxAtlasSub').dir};
   $('pxAnatomyLang').value='en';$('pxAnatomySearch').value='qa-no-muscle-match-xyz';pxRenderAnatomy();
   const emptyEnglish={dir:$('pxAnatomyDetail').dir,lang:$('pxAnatomyDetail').lang,text:$('pxAnatomyDetail').textContent};
   $('pxAnatomyLang').value='ar';pxRenderAnatomy();return {arabic,emptyEnglish,emptyArabic:{dir:$('pxAnatomyDetail').dir,lang:$('pxAnatomyDetail').lang,text:$('pxAnatomyDetail').textContent}};
  });
  assert.equal(rtl.arabic.dir,'rtl');assert.equal(rtl.arabic.lang,'ar');assert.equal(rtl.arabic.listDir,'rtl');assert.equal(rtl.arabic.listDirection,'rtl');assert.equal(rtl.arabic.listAlign,'start');assert.match(rtl.arabic.title,/[\u0600-\u06ff]/);assert.equal(rtl.arabic.englishDir,'ltr');
  assert.deepEqual(rtl.emptyEnglish,{dir:'ltr',lang:'en',text:'No matching muscles'});assert.deepEqual(rtl.emptyArabic,{dir:'rtl',lang:'ar',text:'لا توجد نتائج مطابقة'});
  assert.deepEqual(errors,[]);assert.deepEqual(backend,[]);await page.close();
 }
 console.log('PASS: root barcode keyboard/focus/Enter/44px controls at 320/390/768, pending camera close cleanup/stale callback guard, Android back, Arabic RTL and empty-language transitions; zero Supabase requests');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
