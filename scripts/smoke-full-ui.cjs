const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:390,height:844}});
 const errors=[];
 let savedCloudPayload={},cloudWrites=0,legacyGoogleCalls=0,productWrites=[],foodEntryWrites=[];
 page.on('request',req=>{if(/script\.google\.com|docs\.google\.com/.test(req.url()))legacyGoogleCalls++});
 page.on('pageerror',error=>errors.push(error.message));
 await page.route('**/auth/v1/**',async route=>{
  const url=route.request().url();
  await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({access_token:'mock-auth-token',refresh_token:'mock-refresh-token',expires_at:Math.floor(Date.now()/1000)+3600,user:{id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',email:'qa@example.test'}})});
 });
 await page.route('**/rest/v1/**',async route=>{
  const req=route.request(),isPost=req.method()==='POST',product=req.url().includes('/food_products');
  if(req.url().includes('/food_entries')&&req.method()==='GET'){
   if(req.url().includes('select=id%2Cclient_id')||req.url().includes('select=id,client_id')){
    const record={id:'dddddddd-dddd-4ddd-8ddd-dddddddddddd',client_id:'pxlegacy:cloud-qa-food',logged_at:'2026-10-11T10:53:00+00:00',food_name:'[Snack] Cloud QA Oats',calories:389,protein_g:16.9,carbs_g:66.3,fat_g:6.9};
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify([record])});return;
   }
   const rows=foodEntryWrites.length?[{id:'cccccccc-cccc-4ccc-8ccc-cccccccccccc',...foodEntryWrites.at(-1)}]:[];
   await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(rows)});return;
  }
  if(isPost&&req.url().includes('/food_entries')){
   const row=req.postDataJSON();foodEntryWrites.push(row);
   await route.fulfill({status:201,contentType:'application/json',body:JSON.stringify([{id:'cccccccc-cccc-4ccc-8ccc-cccccccccccc',...row}])});
   return;
  }
  if(isPost&&product){
   const row=req.postDataJSON();productWrites.push(row);
   await route.fulfill({status:201,contentType:'application/json',body:JSON.stringify([{id:'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',...row}])});
   return;
  }
  if(isPost){savedCloudPayload=req.postDataJSON().payload;cloudWrites++}
  await route.fulfill({status:200,contentType:'application/json',body:req.method()==='GET'?JSON.stringify(Object.keys(savedCloudPayload).length?[{payload:savedCloudPayload}]:[]):'[{}]'});
 });
 await page.route('https://unpkg.com/**',route=>route.abort());
 await page.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded'});
 await page.fill('#pxEmail','qa@example.test');
 await page.fill('#pxPassword','demo-password');
 await page.click('#pxSignin');
 await page.waitForFunction(()=>document.querySelector('#pxCommercialGate')?.hidden===true,{timeout:15000});
 await page.waitForFunction(()=>document.querySelector('#foodDiaryList')?.textContent.includes('Cloud QA Oats'),null,{timeout:12000});
 const readback=await page.evaluate(()=>({rows:JSON.parse(PXStore.getItem('progressx-food-log')||'[]'),shown:document.querySelector('#foodDiaryList')?.textContent}));
 if(!readback.rows.some(x=>x.id==='cloud-qa-food'&&x.date==='2026-10-11'&&x.time==='13:53'))throw Error('Cloud Food Diary row missing after load or timezone conversion wrong');
 if(errors.length)throw Error('Browser errors: '+errors.slice(0,5).join(' ; '));
 for(const id of ['home','log','analytics','nutrition','daily','calculators','settings','intelligence']){
  if(await page.locator('#'+id).count()!==1)throw Error('Missing original section '+id);
 }
 await page.evaluate(()=>PXStore.setItem('qa-sentinel','abc123'));
 const value=await page.evaluate(()=>PXStore.getItem('qa-sentinel'));
 if(value!=='abc123')throw Error('Scoped storage failed');
 const unscoped=await page.evaluate(()=>window.localStorage.getItem('qa-sentinel'));
 if(unscoped!==null)throw Error('Unscoped personal data leak');
 await page.waitForFunction(()=>document.querySelector('#pxSyncPill')?.textContent.includes('Synced to Supabase'),{timeout:10000});
 if(cloudWrites<1||savedCloudPayload['qa-sentinel']!=='abc123')throw Error('Snapshot was not persisted to the cloud endpoint');
 await page.reload({waitUntil:'domcontentloaded'});
 try{await page.waitForFunction(()=>document.querySelector('#pxCommercialGate')?.hidden===true,null,{timeout:10000})}catch(error){console.error('Reload failure diagnostics:',await page.evaluate(()=>({status:document.querySelector('#pxLoginMessage')?.textContent,gateHidden:document.querySelector('#pxCommercialGate')?.hidden,session:sessionStorage.getItem('pxx_commercial_auth_preview_v1')?.slice(0,160),sync:document.querySelector('#pxSyncPill')?.textContent})),errors.slice(-8));throw error}
 if(await page.evaluate(()=>PXStore.getItem('qa-sentinel'))!=='abc123')throw Error('Cloud reload lost the record');
 // Simulate an interrupted debounce before cloud save, then recover from local pending data.
 await page.evaluate(()=>PXStore.setItem('offline-sentinel','survive-reload'));
 await page.reload({waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.querySelector('#pxCommercialGate')?.hidden===true,null,{timeout:15000});
 if(await page.evaluate(()=>PXStore.getItem('offline-sentinel'))!=='survive-reload')throw Error('Offline queued edit lost after reload');
 await page.waitForFunction(()=>document.querySelector('#pxSyncPill')?.textContent.includes('Synced to Supabase'),null,{timeout:15000});
 if(savedCloudPayload['offline-sentinel']!=='survive-reload')throw Error('Offline edit did not reconcile to cloud');
 // Legacy Food API must no longer try the disabled Google Sheets transport.
 const productReply=await page.evaluate(async()=>apiCall('food_product_upsert',{name:'QA only',id:'qa-test-record'}));
 if(!productReply?.ok)throw Error('Food product Supabase bridge failed: '+JSON.stringify(productReply));
 if(!productWrites.length||productWrites.at(-1).name!=='QA only'||productWrites.at(-1).source_id!=='qa-test-record')throw Error('No real food_products table upsert request');
 const logReply=await page.evaluate(async()=>apiCall('food_log_upsert',{name:'QA only',id:'qa-log-record'}));
 if(!logReply?.ok)throw Error('Food log Supabase bridge failed: '+JSON.stringify(logReply));
 if(!foodEntryWrites.some(x=>x.client_id==='pxlegacy:qa-log-record'&&x.food_name==='[Snack] QA only'))throw Error('No real food_entries database upsert');
 const readReply=await page.evaluate(async()=>apiCall('food_products_list'));
 if(!readReply?.ok)throw Error('Food products read bridge failed');
 if(legacyGoogleCalls)throw Error('Called personal Google Sheets endpoint');
 if(errors.length)throw Error('Browser errors after reload: '+errors.slice(0,5).join(' ; '));
 console.log('PASS: full UI boot, auth gate, 8 tabs, isolated storage, Supabase save and reload, no personal Google requests');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
