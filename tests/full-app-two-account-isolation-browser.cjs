const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true});
 const accounts=[{id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',email:'first@example.test',marker:'first-only'},{id:'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',email:'second@example.test',marker:'second-only'}];
 const snapshots=new Map();
 try{
  const sessions=[];
  for(const user of accounts){
   const context=await browser.newContext();const page=await context.newPage();
   await page.route('**/auth/v1/**',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({access_token:'fake-'+user.id,refresh_token:'fake-refresh',expires_at:Math.floor(Date.now()/1000)+3600,user:{id:user.id,email:user.email}})}));
   await page.route('**/rest/v1/**',route=>{
    const req=route.request(),url=req.url();
    if(url.includes('user_app_snapshots')){
     if(req.method()==='GET')return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(snapshots.has(user.id)?[{payload:snapshots.get(user.id)}]:[])});
     if(req.method()==='POST'){
      const body=req.postDataJSON();
      if(body.user_id!==user.id)return route.fulfill({status:403,contentType:'application/json',body:'{"message":"mock forbidden"}'});
      snapshots.set(user.id,body.payload);return route.fulfill({status:201,contentType:'application/json',body:'[{}]'});
     }
    }
    return route.fulfill({status:200,contentType:'application/json',body:'[]'});
   });
   await page.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded'});
   await page.fill('#pxEmail',user.email);await page.fill('#pxPassword','mock-only');await page.click('#pxSignin');
   await page.waitForFunction(()=>window.__pxCommercialReady?.()===true,null,{timeout:20000});
   await page.evaluate(marker=>PXStore.setItem('progressx-reminders',JSON.stringify([{id:marker,text:marker}])),user.marker);
   sessions.push({context,page,user});
  }
  for(const {page,user} of sessions){
   await page.waitForFunction(marker=>document.querySelector('#pxSyncPill')?.textContent.includes('Synced to Supabase') && String(PXStore.getItem('progressx-reminders')).includes(marker),user.marker,{timeout:25000});
   assert.ok(JSON.stringify(snapshots.get(user.id)||{}).includes(user.marker));
   assert.ok(!JSON.stringify(snapshots.get(user.id)||{}).includes(accounts.find(u=>u.id!==user.id).marker));
  }
  for(const {page,user} of sessions){
   await page.reload({waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>window.__pxCommercialReady?.()===true,null,{timeout:20000});
   const value=await page.evaluate(()=>PXStore.getItem('progressx-reminders'));
   assert.ok(value.includes(user.marker));assert.ok(!value.includes(accounts.find(u=>u.id!==user.id).marker));
  }
  console.log('PASS: production app in two isolated contexts keeps fake user snapshots separate after write and reload; mock auth NOT production RLS proof');
  for(const {context} of sessions)await context.close();
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
