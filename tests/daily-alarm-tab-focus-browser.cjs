const {chromium}=require('playwright');const assert=require('node:assert/strict');const fs=require('node:fs');
const html=fs.readFileSync('index.html','utf8');const start=html.indexOf("document.addEventListener('keydown',event=>{\n  const dialog=document.getElementById('alarmOverlay')");assert.ok(start>0,'Production modal keyboard handler missing');const end=html.indexOf("\nfunction snoozeActiveAlarm(",start);assert.ok(end>start);const handler=html.slice(start,end);
(async()=>{const browser=await chromium.launch({headless:true});try{
const page=await browser.newPage();await page.setContent('<button id="before">Previous focus</button><div id="alarmOverlay" class="show" role="dialog"><button id="done">Done</button><button id="snooze">Snooze</button><button id="dismiss">Dismiss</button></div><button id="outside">Outside</button>');
await page.evaluate(code=>{window.dismissActiveAlarm=()=>document.getElementById('alarmOverlay').classList.remove('show');(0,eval)(code)},handler);
const active=()=>page.evaluate(()=>document.activeElement.id);
await page.focus('#dismiss');await page.keyboard.press('Tab');assert.equal(await active(),'done','Tab wraps last to first');
await page.keyboard.press('Shift+Tab');assert.equal(await active(),'dismiss','Shift Tab wraps first to last');
await page.focus('#done');await page.keyboard.press('Tab');assert.equal(await active(),'snooze','Middle navigation remains native');
await page.focus('#outside');await page.keyboard.press('Tab');assert.equal(await active(),'done','Tab from outside is contained');
await page.keyboard.press('Escape');assert.equal(await page.locator('#alarmOverlay.show').count(),0);
await page.focus('#dismiss');await page.keyboard.press('Tab');assert.equal(await active(),'outside','Hidden dialog no longer traps keyboard');
console.log('PASS: production Daily dialog handler traps Tab, reverse Tab, outside focus and releases after Escape');
}finally{await browser.close()}})().catch(err=>{console.error(err);process.exitCode=1});
