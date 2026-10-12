const assert=require('node:assert/strict');const {chromium}=require('playwright');
(async()=>{const browser=await chromium.launch({headless:true});try{
 const context=await browser.newContext();let backend=0;
 await context.route('**/*',route=>{const url=new URL(route.request().url());if(url.hostname==='127.0.0.1')return route.continue();if(url.hostname.endsWith('supabase.co'))backend++;return route.abort()});
 const page=await context.newPage();await page.goto('http://127.0.0.1:8765/index.html');
 await page.evaluate(async()=>{await navigator.serviceWorker.register('./sw.js');await navigator.serviceWorker.ready;localStorage.setItem('pwa-test-draft','preserved')});
 await page.reload();await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
 await context.setOffline(true);
 for(const path of ['/?from=pwa','/index.html?from=pwa']){
  const response=await page.goto('http://127.0.0.1:8765'+path);assert.equal(response.status(),200);assert.match(await page.title(),/Progress/i);assert.equal(await page.evaluate(()=>localStorage.getItem('pwa-test-draft')),'preserved');
 }
 assert.equal(backend,0);await context.close();console.log('PASS: actual Chromium service worker loads root and query shell offline without changing draft storage or contacting Supabase');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
