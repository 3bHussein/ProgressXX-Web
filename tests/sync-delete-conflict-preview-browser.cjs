const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  for(const width of [320,390,768]){
   const page=await browser.newPage({viewport:{width,height:800}});
   const errors=[],writes=[];
   page.on('pageerror',e=>errors.push(e.message));
   page.on('request',r=>{if(!['GET','HEAD'].includes(r.method()))writes.push(r.url())});
   await page.route('**/*',route=>route.request().url().startsWith('http://127.0.0.1:8765/')?route.continue():route.abort());
   await page.goto('http://127.0.0.1:8765/prototypes/sync-delete-conflict-preview.html');
   for(const domain of ['Daily','Workout','Weight','Food']){
    await page.locator('#domain').selectOption(domain);
    assert.match(await page.locator('#cloudState').innerText(),new RegExp(domain+' entry deleted'));
    await page.locator('[data-choice="keep-delete"]').click();
    assert.match(await page.locator('#status').innerText(),/deletion remains authoritative.*No changes saved/i);
    await page.locator('[data-choice="restore"]').click();
    assert.match(await page.locator('#status').innerText(),/explicit approval.*No changes saved/i);
    await page.locator('[data-choice="later"]').click();
    assert.match(await page.locator('#status').innerText(),/Review deferred.*No changes saved/i);
   }
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'Horizontal overflow at '+width);
   assert.deepEqual(await page.evaluate(()=>[localStorage.length,sessionStorage.length]),[0,0],'Storage must remain empty');
   assert.deepEqual(writes,[],'No mutation request permitted');
   assert.deepEqual(errors,[],'No JS errors permitted');
   await page.reload();
   assert.equal(await page.locator('#domain').inputValue(),'Daily','Preview should reset to Daily after reload');
   assert.match(await page.locator('#status').innerText(),/No action taken/);
   assert.deepEqual(await page.evaluate(()=>[localStorage.length,sessionStorage.length]),[0,0],'Reload must not recover saved decisions');
   await page.close();
  }
  console.log('PASS: isolated delete conflict UI mobile widths, four data types, three choices, no writes/storage/errors');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
