const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:390,height:844}});
 const errors=[];
 let savedCloudPayload={},cloudWrites=0,legacyGoogleCalls=0;
 page.on('request',req=>{if(/script\.google\.com|docs\.google\.com/.test(req.url()))legacyGoogleCalls++});
 page.on('pageerror',error=>errors.push(error.message));
 await page.route('**/auth/v1/**',async route=>{
  const url=route.request().url();
  await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({access_token:'mock-auth-token',refresh_token:'mock-refresh-token',expires_at:Math.floor(Date.now()/1000)+3600,user:{id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',email:'qa@example.test'}})});
 });
 await page.route('**/rest/v1/**',async route=>{
  if(route.request().method()==='POST'){savedCloudPayload=route.request().postDataJSON().payload;cloudWrites++}
  await route.fulfill({status:200,contentType:'application/json',body:route.request().method()==='GET'?JSON.stringify(Object.keys(savedCloudPayload).length?[{payload:savedCloudPayload}]:[]):'[{}]'});
 });
 await page.route('https://unpkg.com/**',route=>route.abort());
 await page.goto('http://127.0.0.1:8765/full-app.html',{waitUntil:'domcontentloaded'});
 await page.fill('#pxEmail','qa@example.test');
 await page.fill('#pxPassword','demo-password');
 await page.click('#pxSignin');
 await page.waitForFunction(()=>document.querySelector('#pxCommercialGate')?.hidden===true,{timeout:15000});
 if(errors.length)throw Error('Browser errors: '+errors.slice(0,5).join(' ; '));
 for(const id of ['home','log','analytics','nutrition','daily','calculators','settings','intelligence']){
  if(await page.locator('#'+id).count()!==1)throw Error('Missing original section '+id);
 }
 await page.evaluate(()=>PXStore.setItem('qa-sentinel','abc123'));
 const value=await page.evaluate(()=>PXStore.getItem('qa-sentinel'));
 if(value!=='abc123')throw Error('Scoped storage failed');
 const unscoped=await page.evaluate(()=>window.localStorage.getItem('qa-sentinel'));
 if(unscoped!==null)throw Error('Unscoped personal data leak');
 await page.waitForFunction(()=>document.querySelector('#pxSyncPill')?.textContent.includes('Saved to Supabase'),{timeout:10000});
 if(cloudWrites<1||savedCloudPayload['qa-sentinel']!=='abc123')throw Error('Snapshot was not persisted to the cloud endpoint');
 await page.reload({waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.querySelector('#pxCommercialGate')?.hidden===true,{timeout:15000});
 if(await page.evaluate(()=>PXStore.getItem('qa-sentinel'))!=='abc123')throw Error('Cloud reload lost the record');
 if(legacyGoogleCalls)throw Error('Called personal Google Sheets endpoint');
 if(errors.length)throw Error('Browser errors after reload: '+errors.slice(0,5).join(' ; '));
 console.log('PASS: full UI boot, auth gate, 8 tabs, isolated storage, Supabase save and reload, no personal Google requests');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
