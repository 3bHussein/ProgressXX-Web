const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage();const errors=[],requests=[];
  page.on('pageerror',e=>errors.push(e.stack||e.message));
  await page.route('**/rest/v1/**',r=>{requests.push(r.request().url());return r.fulfill({status:200,contentType:'application/json',body:'[]'})});
  await page.route('https://unpkg.com/**',r=>r.fulfill({status:200,contentType:'application/javascript',body:''}));
  await page.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>{
   window.dispatchEvent(new Event('focus'));
   window.dispatchEvent(new Event('pageshow'));
   window.dispatchEvent(new Event('online'));
   refreshDailyFromCloud();scheduleWorkoutHealthCheck(0);void refreshHomeNutritionFromCloud();
  });
  await page.waitForTimeout(800);
  assert.deepEqual(errors,[],'Locked-workspace events must not attempt authenticated storage');
  assert.deepEqual(requests,[],'Locked-workspace refreshes must not call private APIs');
  assert.equal(await page.evaluate(()=>window.__pxCommercialReady()),false);
  assert.equal(await page.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('pxx:full:')||k.startsWith('pxx:pending:')).length),0);
  console.log('PASS: locked root app focus/pageshow/online and refresh callbacks leave account storage and APIs untouched');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
