const assert=require('node:assert/strict');const {browserType,engine}=require('./helpers/browser-engine.cjs');
const sdk=`window.qaCamera={starts:0,stops:0,clears:0};window.Html5Qrcode=class{async start(){qaCamera.starts++}async stop(){qaCamera.stops++}async clear(){qaCamera.clears++}};window.Html5QrcodeSupportedFormats={EAN_13:1,EAN_8:2,UPC_A:3,UPC_E:4,CODE_128:5};`;
(async()=>{const browser=await browserType.launch({headless:true});try{
 let page=await browser.newPage({viewport:{width:390,height:844}}),requests=0,backend=0,release,windowRequestReady,errors=[];
 const requested=new Promise(r=>windowRequestReady=r);
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',async route=>{const u=new URL(route.request().url());if(u.hostname==='127.0.0.1')return route.continue();if(u.hostname.endsWith('supabase.co'))backend++;if(u.hostname==='unpkg.com'){requests++;await new Promise(r=>{release=r;windowRequestReady()});return route.fulfill({status:200,contentType:'application/javascript',body:sdk})}return route.abort()});
 await page.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded'});await page.locator('#pxEmail').waitFor({state:'visible'});
 assert.equal(requests,0,'Startup must not request the optional decoder');assert.equal(await page.locator('script[src*="html5-qrcode"]').count(),0);
 await page.evaluate(()=>{$('pxCommercialGate').hidden=true;window.qaOpen=openBarcodeScanner()});await page.waitForFunction(()=>!!document.getElementById('pxBarcodeLibrary'));
 assert.equal(await page.locator('#barcodeManualInput').isEnabled(),true,'Manual input works while loading');
 await requested;assert.equal(requests,1);await page.evaluate(()=>openBarcodeScanner());assert.equal(requests,1,'Concurrent opens share one library request');
 await page.evaluate(()=>closeBarcodeScanner());release();await page.evaluate(()=>qaOpen);await page.waitForFunction(()=>!!window.qaCamera);
 assert.equal(await page.evaluate(()=>qaCamera.starts),0,'Closed dialog must not start a late-loaded camera');
 await page.evaluate(()=>openBarcodeScanner());assert.equal(await page.evaluate(()=>qaCamera.starts),1);assert.equal(requests,1,'Loaded decoder is reused');await page.evaluate(()=>closeBarcodeScanner());assert.equal(await page.evaluate(()=>qaCamera.stops),1);await page.close();
 // Failed download clears the cached failure and supports another explicit attempt.
 page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));let attempts=0;
 await page.route('**/*',route=>{const u=new URL(route.request().url());if(u.hostname==='127.0.0.1')return route.continue();if(u.hostname.endsWith('supabase.co'))backend++;if(u.hostname==='unpkg.com'){attempts++;return attempts===1?route.abort():route.fulfill({status:200,contentType:'application/javascript',body:sdk})}return route.abort()});
 await page.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded'});await page.evaluate(()=>{$('pxCommercialGate').hidden=true;return openBarcodeScanner()});
 assert.match(await page.locator('#barcodeScannerStatus').innerText(),/could not load.*manually/);assert.equal(await page.locator('#barcodeManualInput').isEnabled(),true);assert.equal(await page.locator('#pxBarcodeLibrary').count(),0);
 await page.evaluate(()=>closeBarcodeScanner());await page.evaluate(()=>openBarcodeScanner());assert.equal(attempts,2);assert.equal(await page.evaluate(()=>qaCamera.starts),1);await page.evaluate(()=>closeBarcodeScanner());await page.close();
 // A hung CDN has a bounded timeout. Accelerate only that timer in the fixture.
 page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));let hanging;
 await page.route('**/*',async route=>{const u=new URL(route.request().url());if(u.hostname==='127.0.0.1')return route.continue();if(u.hostname.endsWith('supabase.co'))backend++;if(u.hostname==='unpkg.com'){await new Promise(r=>hanging=r);return route.abort()}return route.abort()});
 await page.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded'});
 await page.evaluate(()=>{const original=window.setTimeout;window.setTimeout=(fn,ms,...args)=>original(fn,ms===10000?150:ms,...args);$('pxCommercialGate').hidden=true;window.qaTimeout=openBarcodeScanner()});
 await page.evaluate(()=>qaTimeout);assert.match(await page.locator('#barcodeScannerStatus').innerText(),/could not load.*manually/);assert.equal(await page.locator('#barcodeManualInput').isEnabled(),true);if(hanging)hanging();await page.evaluate(()=>closeBarcodeScanner());await page.close();
 assert.equal(backend,0);assert.deepEqual(errors,[]);console.log('PASS ['+engine+']: no startup decoder request, on-demand single load/reuse, late-close guard, failed download retry and bounded timeout/manual fallback; zero Supabase calls');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
