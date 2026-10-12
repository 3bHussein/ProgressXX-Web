const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true});
 let snapshot={'progressx-reminders':JSON.stringify([{id:'daily-qa-deleted',text:'test record'}])};
 const writes=[];let scheduleWrites=0;
 const account='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
 async function device(){
  const context=await browser.newContext();
  const page=await context.newPage();
  await page.route('**/auth/v1/**',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({access_token:'mock',refresh_token:'mock-refresh',expires_at:Math.floor(Date.now()/1000)+3600,user:{id:account,email:'qa@example.test'}})}));
  await page.route('**/rest/v1/**',r=>{
   const req=r.request();
   if(req.url().includes('user_app_snapshots')){
    if(req.method()==='GET')return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify([{payload:snapshot}])});
    if(req.method()==='POST'){snapshot={...req.postDataJSON().payload};writes.push(snapshot['progressx-reminders']);if(snapshot['progressx-workout-schedule-v1']==='{"mon":"REST"}')scheduleWrites++;return r.fulfill({status:201,contentType:'application/json',body:'[{}]'});}
   }
   return r.fulfill({status:200,contentType:'application/json',body:'[]'});
  });
  await page.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded'});
  await page.fill('#pxEmail','qa@example.test');
  await page.fill('#pxPassword','mock-pass');
  await page.click('#pxSignin');
  await page.waitForFunction(()=>document.querySelector('#pxCommercialGate')?.hidden===true,null,{timeout:15000});
  await page.waitForFunction(()=>document.querySelector('#pxSyncPill')?.textContent.includes('Synced to Supabase'),null,{timeout:20000});
  return {context,page};
 }
 try{
  const a=await device(),b=await device();
  const initial=await b.page.evaluate(()=>PXStore.getItem('progressx-reminders'));
  assert.match(initial,/daily-qa-deleted/,'Second device needs stale record in memory');
  await a.page.evaluate(()=>PXStore.setItem('progressx-reminders','[]'));
  const deadline=Date.now()+25000;
  while(snapshot['progressx-reminders']!=='[]'&&Date.now()<deadline)await a.page.waitForTimeout(200);
  assert.equal(snapshot['progressx-reminders'],'[]','Device A deletion must reach mock backend');
  await b.page.evaluate(()=>PXStore.setItem('progressx-workout-schedule-v1',JSON.stringify({mon:'REST'})));
  const limit=Date.now()+25000;
  while(scheduleWrites===0&&Date.now()<limit)await b.page.waitForTimeout(200);
  assert.ok(scheduleWrites>0,'Device B unrelated change must reach mock backend before assessing resurrection');
  const resurrected=typeof snapshot['progressx-reminders']==='string'&&snapshot['progressx-reminders'].includes('daily-qa-deleted');
  assert.equal(snapshot['progressx-workout-schedule-v1'],'{"mon":"REST"}');
  console.log(resurrected?'OBSERVED RISK: stale Daily record reintroduced in fake backend; NOT A FIX':'OBSERVED: no Daily resurrection in this specific mock sequence; NOT proof of server conflict safety');
  await a.context.close();await b.context.close();
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
