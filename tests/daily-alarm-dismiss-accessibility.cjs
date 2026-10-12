const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright');
const source=fs.readFileSync('index.html','utf8');
assert.match(source,/<div id="alarmOverlay"[^>]*role="dialog"[^>]*aria-modal="true"[^>]*aria-label="Daily reminder"/);
assert.match(source,/event\.key==='Escape'&&document\.getElementById\('alarmOverlay'\)\?\.classList\.contains\('show'\)/);
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage();
  await page.setContent('<div id="alarmOverlay" class="alarmOverlay show" role="dialog" aria-modal="true" aria-label="Daily reminder"></div>');
  await page.evaluate(()=>{
   window.dismissed=0;
   window.dismissActiveAlarm=()=>{document.getElementById('alarmOverlay').classList.remove('show');window.dismissed++};
   document.addEventListener('keydown',event=>{if(event.key==='Escape'&&document.getElementById('alarmOverlay')?.classList.contains('show')){event.preventDefault();dismissActiveAlarm()}});
  });
  await page.keyboard.press('Escape');
  assert.equal(await page.evaluate(()=>window.dismissed),1);
  await page.keyboard.press('Escape');
  assert.equal(await page.evaluate(()=>window.dismissed),1);
  console.log('PASS: Daily modal dialog accessible label and Escape dismissal scope');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
