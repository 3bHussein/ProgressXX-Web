const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/auth/v1/**',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({access_token:'mock-token',refresh_token:'mock-refresh',expires_at:Math.floor(Date.now()/1000)+3600,user:{id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',email:'alarm@example.test'}})}));
  await page.route('**/rest/v1/**',r=>r.fulfill({status:200,contentType:'application/json',body:r.request().method()==='GET'?'[]':'[{}]'}));
  await page.route('https://unpkg.com/**',r=>r.abort());
  await page.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded'});
  await page.fill('#pxEmail','alarm@example.test');await page.fill('#pxPassword','mock-only');await page.click('#pxSignin');
  await page.waitForFunction(()=>window.__pxCommercialReady?.()===true,null,{timeout:20000});
  await page.evaluate(()=>{const button=document.getElementById('pxSyncNow');if(button.hidden||button.closest('[hidden]'))throw Error('Prior focus button is hidden');button.focus();if(document.activeElement!==button)throw Error('Prior focus setup failed');showAlarmPopup({id:'__test__',name:'Keyboard QA',time:'10:00',amount:'Only mock'});stopAlarmSound()});
  assert.equal(await page.locator('#alarmOverlay').getAttribute('role'),'dialog');
  assert.equal(await page.locator('#alarmOverlay').getAttribute('aria-modal'),'true');
  assert.equal(await page.evaluate(()=>document.activeElement.textContent.trim()),'✓ Done');
  const ids=await page.locator('#alarmOverlay button').evaluateAll(elements=>elements.map((e,i)=>{e.dataset.qaIndex=String(i);return e.textContent.trim()}));
  assert.ok(ids.length>=3);
  await page.keyboard.press('Shift+Tab');
  assert.equal(await page.evaluate(()=>document.activeElement.dataset.qaIndex),String(ids.length-1));
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(()=>document.activeElement.dataset.qaIndex),'0');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#alarmOverlay.show').count(),0);
  assert.equal(await page.evaluate(()=>document.activeElement.id),'pxSyncNow','Focus must return to previous control');
  assert.deepEqual(errors,[],'Unhandled page errors');
  console.log('PASS: full signed-in app Daily alarm focus, reverse Tab, Escape and restore at 390px');
 }finally{await browser.close()}
})().catch(err=>{console.error(err);process.exitCode=1});
