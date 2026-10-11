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
   const clientFilter=new URL(req.url()).searchParams.get('client_id');
   const matching=clientFilter?.startsWith('eq.')?foodEntryWrites.filter(x=>x.client_id===clientFilter.slice(3)):foodEntryWrites;
   const rows=matching.map((x,i)=>({id:'cccccccc-cccc-4ccc-8ccc-'+String(i+1).padStart(12,'0'),...x}));
   await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(rows)});return;
  }
  if(req.url().includes('/food_entries')&&req.method()==='DELETE'){
   const clientId=new URL(req.url()).searchParams.get('client_id')?.replace(/^eq\./,'');
   foodEntryWrites=foodEntryWrites.filter(x=>x.client_id!==clientId);
   await route.fulfill({status:204,body:''});return;
  }
  if(isPost&&req.url().includes('/food_entries')){
   const row=req.postDataJSON();foodEntryWrites.push(row);
   await route.fulfill({status:201,contentType:'application/json',body:JSON.stringify([{id:'cccccccc-cccc-4ccc-8ccc-cccccccccccc',...row}])});
   return;
  }
  if(product&&req.method()==='GET'){
   const filter=new URL(req.url()).searchParams.get('source_id');
   const found=filter?.startsWith('eq.')?productWrites.filter(x=>x.source_id===filter.slice(3)):productWrites;
   await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(found.map(x=>({id:'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',...x})))});return;
  }
  if(product&&req.method()==='DELETE'){
   const filter=new URL(req.url()).searchParams.get('source_id');
   productWrites=productWrites.filter(x=>x.source_id!==filter?.slice(3));
   await route.fulfill({status:204,body:''});return;
  }
  if(isPost&&product){
   const row=req.postDataJSON();productWrites.push(row);
   await route.fulfill({status:201,contentType:'application/json',body:JSON.stringify([{id:'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',...row}])});
   return;
  }
  if(isPost&&req.url().includes('/user_app_snapshots')){const body=req.postDataJSON();if(body?.payload&&typeof body.payload==='object'){savedCloudPayload=body.payload;cloudWrites++}}
  await route.fulfill({status:200,contentType:'application/json',body:req.method()==='GET'?JSON.stringify(Object.keys(savedCloudPayload||{}).length?[{payload:savedCloudPayload}]:[]):'[{}]'});
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
 await page.waitForTimeout(2000);
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
 await page.waitForTimeout(2000);
 if(savedCloudPayload['offline-sentinel']!=='survive-reload')throw Error('Offline edit did not reconcile to cloud');
 // Legacy Food API must no longer try the disabled Google Sheets transport.
 // Explicit offline->online retry for Food Library and Food Diary: no phantom success/writes offline.
 const productPostsBeforeOffline=productWrites.length;
 const foodPostsBeforeOffline=foodEntryWrites.length;
 await page.context().setOffline(true);
 const offlineReplies=await page.evaluate(async()=>({
   product:await apiCall('food_product_upsert',{name:'QA only',id:'qa-test-record'}),
   food:await apiCall('food_log_upsert',{name:'QA only',id:'qa-log-record'})
 }));
 if(offlineReplies.product?.ok||offlineReplies.food?.ok)throw Error('Offline Food writes falsely reported success');
 if(productWrites.length!==productPostsBeforeOffline||foodEntryWrites.length!==foodPostsBeforeOffline)throw Error('Offline Food write unexpectedly reached cloud');
 await page.context().setOffline(false);
 const productReply=await page.evaluate(async()=>apiCall('food_product_upsert',{name:'QA only',id:'qa-test-record'}));
 if(!productReply?.ok)throw Error('Food product Supabase bridge failed: '+JSON.stringify(productReply));
 if(!productWrites.length||productWrites.at(-1).name!=='QA only'||productWrites.at(-1).source_id!=='qa-test-record')throw Error('No real food_products table upsert request');
 const library=await page.evaluate(async()=>apiCall('food_products_list'));
 if(!library.ok||!library.products.some(x=>x.id==='qa-test-record'))throw Error('Food library not fetched from database');
 const deleted=await page.evaluate(async()=>apiCall('food_product_delete',{id:'qa-test-record'}));
 if(!deleted.ok||productWrites.some(x=>x.source_id==='qa-test-record'))throw Error('Food product not deleted in database');
 const again=await page.evaluate(async()=>apiCall('food_products_list'));
 if(again.products.some(x=>x.id==='qa-test-record'))throw Error('Deleted product was resurrected');
 // A stale cached item must never be uploaded again merely by signing in.
 await page.evaluate(()=>{
   PXStore.setItem('progressx-food-products',JSON.stringify([{id:'qa-test-record',name:'QA only',servingQty:100,servingUnit:'g',calories:100}]));
   PXStore.setItem('progressx-food-offline-outbox-v1','[]');
 });
 const postsBefore=productWrites.length;
 await page.reload({waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.querySelector('#pxCommercialGate')?.hidden===true,null,{timeout:12000});
 await page.evaluate(()=>window.__pxRefreshNutrition());
 const afterReload=await page.evaluate(()=>({products:foodProducts.map(x=>x.id),foodCount:document.querySelector('#foodEntryCount')?.textContent}));
 if(afterReload.products.includes('qa-test-record'))throw Error('Stale local product appeared after refresh');
 if(productWrites.length!==postsBefore)throw Error('Stale cached products were re-uploaded to database');

 // Offline outbox conflict checks: tombstoned products must never be resurrected.
 const queueProbe=await page.evaluate(async()=>{
   const dead='qa-outbox-deleted',alive='qa-outbox-active';
   foodProducts.push({id:dead,name:'Removed while offline',servingQty:1,servingUnit:'serving',calories:10});
   foodProducts.push({id:alive,name:'Queued fresh food',servingQty:1,servingUnit:'serving',calories:20});
   PXStore.setItem('pxx-food-deleted-ids',JSON.stringify([dead]));
   pxFoodQueue('product',dead);
   pxFoodQueue('product',alive);
   pxFoodQueue('product',alive);
   const before=pxFoodOutbox().length;
   await pxFlushFoodOutbox();
   return {before,after:pxFoodOutbox(),dead,alive};
 });
 if(queueProbe.before!==2||queueProbe.after.length)throw Error('Food outbox did not deduplicate and drain after reconnect');
 if(productWrites.some(x=>x.source_id===queueProbe.dead))throw Error('Tombstoned Food product was resurrected by outbox');
 if(productWrites.filter(x=>x.source_id===queueProbe.alive).length!==1)throw Error('Outbox retry failed to save active product exactly once');
 // Simulate a transient server rejection: pending Food write remains queued for retry.
 await page.route('**/rest/v1/food_products?**',async route=>{
   if(route.request().method()==='POST'){
     return route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({message:'temporary outage'})});
   }
   return route.fallback();
 });
 const retry=await page.evaluate(async()=>{
   const id='qa-outbox-retry';
   foodProducts.push({id,name:'Retry food',servingQty:1,servingUnit:'serving',calories:11});
   PXStore.setItem(FOOD_PRODUCTS_KEY,JSON.stringify(foodProducts));
   pxFoodQueue('product',id);
   await pxFlushFoodOutbox();
   const pendingAfterFailure=pxFoodOutbox().some(x=>x.id===id&&x.type==='product');
   return {pendingAfterFailure};
 });
 if(!retry.pendingAfterFailure)throw Error('Food outbox lost operation after temporary server failure');
 // Simulate app restart between failure and retry: both queued operation and local row must survive.
 await page.reload({waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.querySelector('#pxCommercialGate')?.hidden===true,null,{timeout:15000});
 const pendingAfterRestart=await page.evaluate(()=>({
   queued:pxFoodOutbox().some(x=>x.id==='qa-outbox-retry'&&x.type==='product'),
   local:foodProducts.some(x=>x.id==='qa-outbox-retry'),
   storedProduct:(JSON.parse(PXStore.getItem('progressx-food-products')||'[]')).some(x=>x.id==='qa-outbox-retry'),
   pending: pxFoodOutbox().map(x=>({type:x.type,id:x.id})),
   nutritionSync:document.querySelector('#nutritionSyncState')?.textContent
 }));
 if(!pendingAfterRestart.queued||!pendingAfterRestart.local)throw Error('Food offline queue or local product lost across app restart: '+JSON.stringify(pendingAfterRestart));
 await page.unroute('**/rest/v1/food_products?**');
 await page.evaluate(()=>pxFlushFoodOutbox());
 const pendingAfterSuccess=await page.evaluate(()=>pxFoodOutbox().some(x=>x.id==='qa-outbox-retry'&&x.type==='product'));
 if(pendingAfterSuccess)throw Error('Food outbox failed to retry after app restart');
 if(productWrites.filter(x=>x.source_id==='qa-outbox-retry').length!==1)throw Error('Food outbox retry duplicated or lost product');
 // Recover an unsynced Food Diary entry after app restart.
 await page.route('**/rest/v1/food_entries?**',route=>route.request().method()==='POST'
   ?route.fulfill({status:503,contentType:'application/json',body:'{"message":"temporary outage"}'})
   :route.fallback());
 const queuedDiary=await page.evaluate(async()=>{
   const id='qa-offline-diary';
   foodLog.push({id,name:'Queued QA meal',meal:'Dinner',date:'2026-10-11',time:'19:30',calories:320,protein:22,carbs:30,fat:11});
   PXStore.setItem(FOOD_LOG_KEY,JSON.stringify(foodLog));
   pxFoodQueue('log',id);
   await pxFlushFoodOutbox();
   return pxFoodOutbox().some(x=>x.id===id&&x.type==='log');
 });
 if(!queuedDiary)throw Error('Food Diary queue disappeared during 503 outage');
 await page.reload({waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.querySelector('#pxCommercialGate')?.hidden===true,null,{timeout:15000});
 const diaryState=await page.evaluate(()=>({
   queued:pxFoodOutbox().some(x=>x.id==='qa-offline-diary'&&x.type==='log'),
   loaded:foodLog.some(x=>x.id==='qa-offline-diary'),
   stored:loadLocalArray(FOOD_LOG_KEY,[]).some(x=>x.id==='qa-offline-diary')
 }));
 if(!diaryState.queued||!diaryState.loaded||!diaryState.stored)throw Error('Food Diary restart recovery failed: '+JSON.stringify(diaryState));
 await page.unroute('**/rest/v1/food_entries?**');
 await page.evaluate(()=>pxFlushFoodOutbox());
 if(await page.evaluate(()=>pxFoodOutbox().some(x=>x.id==='qa-offline-diary'&&x.type==='log')))
   throw Error('Food Diary queue not cleared after retry');
 if(foodEntryWrites.filter(x=>x.client_id==='pxlegacy:qa-offline-diary').length!==1)
   throw Error('Food Diary recovery duplicated or lost entry');
 const logReply=await page.evaluate(async()=>apiCall('food_log_upsert',{name:'QA only',id:'qa-log-record'}));
 if(!logReply?.ok)throw Error('Food log Supabase bridge failed: '+JSON.stringify(logReply));
 if(!foodEntryWrites.some(x=>x.client_id==='pxlegacy:qa-log-record'&&x.food_name==='[Snack] QA only'))throw Error('No real food_entries database upsert');
 if(productWrites.filter(x=>x.source_id==='qa-test-record').length!==0)throw Error('Deleted Food Library item reappeared after offline-to-online retry');
 if(foodEntryWrites.filter(x=>x.client_id==='pxlegacy:qa-log-record').length!==1)throw Error('Food Diary retry created duplicate');
 // Deletion must reach Supabase and remain deleted after a second page load.
 const removed=await page.evaluate(async()=>apiCall('food_log_delete',{id:'qa-log-record'}));
 if(!removed?.ok)throw Error('Food Diary delete not confirmed: '+JSON.stringify(removed));
 if(foodEntryWrites.some(x=>x.client_id==='pxlegacy:qa-log-record'))throw Error('Deleted Food Diary entry remained in cloud fixture');
 await page.reload({waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.querySelector('#pxCommercialGate')?.hidden===true,null,{timeout:15000});
 if(foodEntryWrites.some(x=>x.client_id==='pxlegacy:qa-log-record'))throw Error('Deleted Food Diary entry resurrected after account refresh');

 const readReply=await page.evaluate(async()=>apiCall('food_products_list'));
 if(!readReply?.ok)throw Error('Food products read bridge failed');
 // Core feature smoke: schedule, weight goal and workout log operate in the real index.html.
 const feature=await page.evaluate(()=>{
   const saved=JSON.stringify({sun:'REST',mon:'REST'});
   PXStore.setItem('progressx-workout-schedule-v1',saved);
   renderWorkoutSchedule();
   if(document.querySelector('#schedule_sun')?.value!=='REST')throw Error('Schedule UI failed to read saved data');
   const first=document.querySelector('#schedule_tue');
   if(!first)throw Error('Weekly schedule selector missing');
   first.value='REST';saveWorkoutSchedule();
   if(workoutSchedule().tue!=='REST')throw Error('Schedule failed to save');
   const goal=document.querySelector('#weightGoalInput');
   if(!goal)throw Error('Weight goal input missing');
   goal.value='80';saveWeightGoal();renderWeightTrend();
   if(Number(PXStore.getItem('progressx-weight-goal-v1'))!==80)throw Error('Weight goal failed to persist');
   renderLog();
   if(!document.querySelector('#logList'))throw Error('Workout Log missing');
   return {schedule:workoutSchedule(),goal:PXStore.getItem('progressx-weight-goal-v1')};
 });
 await page.reload({waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.querySelector('#pxCommercialGate')?.hidden===true,null,{timeout:15000});
 const afterFeatureReload=await page.evaluate(()=>({schedule:workoutSchedule(),goal:PXStore.getItem('progressx-weight-goal-v1')}));
 if(afterFeatureReload.schedule.tue!=='REST'||Number(afterFeatureReload.goal)!==80)throw Error('Core feature data lost after reload');
 // Account logout/login regression: retain account-scoped Workout Schedule and Weight Goal.
 // Use mock Supabase credentials and data only; do not touch production accounts.
 await page.locator('#pxLogout').click();
 await page.waitForFunction(()=>document.querySelector('#pxCommercialGate')?.hidden===false,null,{timeout:15000});
 await page.fill('#pxEmail','qa@example.test');
 await page.fill('#pxPassword','demo-password');
 await page.click('#pxSignin');
 await page.waitForFunction(()=>document.querySelector('#pxCommercialGate')?.hidden===true,null,{timeout:15000});
 const afterRelogin=await page.evaluate(()=>({
   schedule:workoutSchedule(),
   goal:PXStore.getItem('progressx-weight-goal-v1'),
   foodProducts:foodProducts.length,
   foodLog:foodLog.length,
   queuedFoodProducts:pxFoodOutbox().filter(x=>x.type==='product').length,
   queuedFoodDiary:pxFoodOutbox().filter(x=>x.type==='log').length
 }));
 if(!Array.isArray(foodEntryWrites)||!Array.isArray(productWrites))
   throw Error('Food mock table state was lost during account roundtrip');
 // Refresh normalized Supabase Food tables before assessing account re-login.
 // Login triggers this asynchronously after a delay; the test must await completion.
 await page.evaluate(()=>window.__pxRefreshNutrition(true));
 // Real record assertions, not counts: Food Library and Diary must survive sign-out/sign-in.
 const foodRoundtrip=await page.evaluate(()=>({
   product:foodProducts.find(x=>String(x.id)==='qa-outbox-retry'),
   entry:foodLog.find(x=>String(x.id)==='qa-offline-diary'),
   queued:pxFoodOutbox().filter(x=>x.id==='qa-outbox-retry'||x.id==='qa-offline-diary')
 }));
 if(!foodRoundtrip.product||Number(foodRoundtrip.product.calories)!==11)
   throw Error('Food Library product missing or changed after sign-in: '+JSON.stringify(foodRoundtrip));
 if(!foodRoundtrip.entry||foodRoundtrip.entry.name!=='Queued QA meal')
   throw Error('Food Diary record missing or changed after sign-in: '+JSON.stringify(foodRoundtrip));
 if(foodRoundtrip.queued.length)throw Error('Already synced Food items unexpectedly pending after sign-in');
 if(afterRelogin.schedule.tue!=='REST'||Number(afterRelogin.goal)!==80)
   throw Error('Schedule or Weight Goal lost on account logout/login: '+JSON.stringify(afterRelogin));
 // Mobile touch layout regression for the signed-in account and Insights/Settings.
 for(const section of ['settings','intelligence']){
   await page.evaluate(name=>go(name),section);
   const layout=await page.evaluate(name=>{
     const sectionEl=document.getElementById(name);
     const viewport=document.documentElement.clientWidth;
     const ids=name==='settings'?['pxSettingsSync','pxSettingsSignOut']:['pxAnatomyLang'];
     const controls=ids.map(id=>{
       const el=document.getElementById(id),r=el?.getBoundingClientRect();
       return {id,visible:!!r&&r.width>0&&r.height>0,left:r?.left,right:r?.right,width:r?.width,height:r?.height};
     });
     return {viewport,sectionWidth:sectionEl?.getBoundingClientRect().width,controls};
   },section);
   if(layout.controls.some(x=>!x.visible||x.left< -2||x.right>layout.viewport+2||x.height<35))throw Error('Mobile '+section+' control overflow: '+JSON.stringify(layout));
 }
 // Narrow-phone regression: controls stay usable at 320px.
 await page.setViewportSize({width:320,height:700});
 for(const section of ['settings','intelligence']){
   await page.evaluate(name=>go(name),section);
   const bounds=await page.evaluate(name=>(name==='settings'?['pxSettingsSync','pxSettingsSignOut']:['pxAnatomyLang']).map(id=>{
     const r=document.getElementById(id)?.getBoundingClientRect();
     return {id,left:r?.left,right:r?.right,height:r?.height,width:document.documentElement.clientWidth};
   }),section);
   if(bounds.some(x=>!x.height||x.height<35||x.left< -2||x.right>x.width+2))throw Error('320px control overflow: '+JSON.stringify(bounds));
 }
 await page.setViewportSize({width:390,height:844});
 // Guard against full-screen-height mobile tabs observed on real devices.
 for(const width of [320,390]){
   await page.setViewportSize({width,height:780});
   for(const name of ['settings','intelligence']){
     await page.evaluate(section=>go(section),name);
     const metrics=await page.evaluate(section=>{
       const selector=section==='settings'?'#settings .pxSettingsQuickNav':'#intelligence .pxAnatomyMobileTabs';
       const row=document.querySelector(selector);
       return {section,rowHeight:row?.getBoundingClientRect().height,
         buttonHeights:[...row.querySelectorAll('button')].map(b=>b.getBoundingClientRect().height)};
     },name);
     if(!metrics.rowHeight||metrics.rowHeight>85||metrics.buttonHeights.some(h=>h<40||h>55))
       throw Error('Oversized mobile navigation tabs: '+JSON.stringify(metrics));
   }
 }
 await page.setViewportSize({width:390,height:844});
 // Exercise real mobile anatomy tab clicks at narrow and standard phone sizes.
 for(const width of [320,390]){
   await page.setViewportSize({width,height:780});
   await page.evaluate(()=>go('intelligence'));
   for(const [id,expected] of [['pxAnatomyTabCoverage','coverage'],['pxAnatomyTabAtlas','atlas']]){
     await page.locator('#'+id).click({timeout:6000});
     const state=await page.evaluate(buttonId=>({
       active:document.querySelector('.pxAnatomyPanel')?.dataset.mobileTab,
       pressed:document.getElementById(buttonId)?.getAttribute('aria-pressed')
     }),id);
     if(state.active!==expected||state.pressed!=='true')
       throw Error('Mobile anatomy tab click did not select '+expected+' at '+width+'px: '+JSON.stringify(state));
   }
 }
 await page.setViewportSize({width:390,height:844});
 // Real mobile Settings shortcut interaction: each control must scroll to its target.
 await page.evaluate(()=>go('settings'));
 for(const id of ['pxSettingsAccount','pxSettingsBackup','pxSettingsSyncCenter','pxSettingsHub','pxSettingsSchedule']){
   const target=page.locator('#'+id);
   if(await target.count()!==1)throw Error('Missing Settings shortcut destination '+id);
   const index=['pxSettingsAccount','pxSettingsBackup','pxSettingsSyncCenter','pxSettingsHub','pxSettingsSchedule'].indexOf(id);
   await page.locator('#settings .pxSettingsQuickNav button').nth(index).click({timeout:6000});
   await page.waitForTimeout(400);
   const check=await target.evaluate(el=>({top:el.getBoundingClientRect().top,height:el.getBoundingClientRect().height,viewport:window.innerHeight}));
   if(check.height<1||check.top>check.viewport)throw Error('Settings shortcut did not navigate to '+id+': '+JSON.stringify(check));
 }
 await page.evaluate(()=>go('home'));
 if(legacyGoogleCalls)throw Error('Called personal Google Sheets endpoint');
 if(errors.length)throw Error('Browser errors after reload: '+errors.slice(0,5).join(' ; '));
 console.log('PASS: full UI boot, auth gate, 8 tabs, isolated storage, Supabase save and reload, no personal Google requests');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
