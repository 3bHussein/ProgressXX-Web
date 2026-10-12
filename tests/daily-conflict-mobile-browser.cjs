const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  for(const width of [320,390,768]){
   const page=await browser.newPage({viewport:{width,height:780}});
   const errors=[];const writes=[];
   page.on('pageerror',e=>errors.push(e.message));
   page.on('request',req=>{if(!['GET','HEAD'].includes(req.method()))writes.push(req.method()+' '+req.url())});
   await page.route('**/*',route=>{
    if(route.request().url().startsWith('http://127.0.0.1:8765/'))return route.continue();
    return route.abort();
   });
   await page.goto('http://127.0.0.1:8765/prototypes/daily-conflict-recovery.html');
   await page.waitForSelector('[data-choice="later"]');
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1);
   assert.equal(overflow,false,'Horizontal overflow at '+width);
   for(const [choice,text] of [['cloud','cloud version selected'],['device','device version selected'],['later','Deferred']]){
    await page.locator('[data-choice="'+choice+'"]').click();
    assert.match(await page.locator('#status').innerText(),new RegExp(text,'i'),choice+' missing response at '+width);
   }
   await page.locator('[data-choice="manual"]').click();
   assert.equal(await page.locator('#merge').isVisible(),true);
   await page.locator('#mergeTime').selectOption('09:30');
   await page.locator('#previewMerge').click();
   assert.match(await page.locator('#status').innerText(),/09:30.*No changes saved/);
   assert.deepEqual(errors,[],'JS errors at '+width);
   assert.deepEqual(writes,[],'Unexpected HTTP write at '+width);
   const persistence=await page.evaluate(()=>({local:localStorage.length,session:sessionStorage.length,indexedDb:typeof indexedDB!=='undefined'}));
   assert.equal(persistence.local,0,'Prototype wrote localStorage at '+width);
   assert.equal(persistence.session,0,'Prototype wrote sessionStorage at '+width);
   await page.reload();
   assert.match(await page.locator('#status').innerText(),/No action taken/,'Prototype actions unexpectedly persisted at '+width);
   await page.close();
  }
  console.log('PASS: isolated conflict preview mobile widths 320/390/768, four actions, no overflow, browser errors, HTTP writes or persistent storage');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
