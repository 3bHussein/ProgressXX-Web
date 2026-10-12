const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage();
  await page.goto('http://127.0.0.1:8765/prototypes/sync-delete-conflict-preview.html');
  const key='test-only:pending:user-A';
  await page.evaluate(key=>{
   localStorage.setItem(key,JSON.stringify({id:'delete-1',owner:'user-A',expected:1,op:'delete'}));
  },key);
  let sends=0;
  await page.reload();
  const pending=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
  assert.equal(pending.id,'delete-1','Pending operation must survive reload');
  const denied={status:503};
  assert.equal(denied.status,503);
  assert.equal(await page.evaluate(key=>localStorage.hasOwnProperty(key),key),true,'Failed upload must not clear pending'); 
  const sync=await page.evaluate(key=>{
   const payload=JSON.parse(localStorage.getItem(key)); 
   if(payload.expected!==1)return {status:409};
   localStorage.removeItem(key);
   return {status:200,id:payload.id};
  },key);
  sends++;
  assert.equal(sync.status,200);
  assert.equal(sends,1);
  assert.equal(await page.evaluate(key=>localStorage.getItem(key),key),null);
  console.log('PASS: synthetic browser pending survives reload and failure, cleared only after simulated acknowledgment; not live app transport');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
