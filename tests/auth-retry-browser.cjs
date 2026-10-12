const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}});
  const errors=[];let attempts=0;let writes=0;
  page.on('pageerror',error=>errors.push(error.message));
  await page.route('**/auth/v1/**',async route=>{
   if(!route.request().url().includes('token?grant_type=password')){
    return route.fulfill({status:200,contentType:'application/json',body:'{}'});
   }
   attempts++;
   if(attempts===1)return route.fulfill({status:400,contentType:'application/json',body:JSON.stringify({error:'invalid_grant',error_description:'Invalid login credentials',msg:'Invalid login credentials'})});
   return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({access_token:'mock-retry-token',refresh_token:'mock-refresh',expires_at:Math.floor(Date.now()/1000)+3600,user:{id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',email:'retry@example.test'}})});
  });
  await page.route('**/rest/v1/**',async route=>{
   const req=route.request();
   if(req.method()!=='GET')writes++;
   return route.fulfill({status:200,contentType:'application/json',body:req.method()==='GET'?'[]':'[{}]'});
  });
  await page.route('https://unpkg.com/**',route=>route.abort());
  await page.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded'});
  await page.fill('#pxEmail','retry@example.test');
  await page.fill('#pxPassword','mock-only-password');
  await page.click('#pxSignin');
  await page.waitForFunction(()=>/Invalid login credentials/i.test(document.querySelector('#pxLoginMessage')?.textContent||''),null,{timeout:15000});
  assert.equal(await page.locator('#pxCommercialGate').isVisible(),true,'First invalid login must keep auth gate visible');
  assert.equal(await page.evaluate(()=>window.__pxCommercialReady?.()),false,'Failed login must not activate app');
  assert.equal(writes,0,'Failed auth unexpectedly wrote to database');
  await page.click('#pxSignin');
  await page.waitForFunction(()=>document.querySelector('#pxCommercialGate')?.hidden===true,null,{timeout:20000});
  assert.equal(attempts,2,'Expected exactly failed then successful mock sign-in');
  assert.equal(await page.evaluate(()=>window.__pxCommercialReady?.()),true,'Retry did not activate workspace');
  assert.deepEqual(errors,[],'Unhandled browser errors on auth retry');
  console.log('PASS: rejected mock login keeps gate closed to app and retry activates account');
  await page.close();
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
