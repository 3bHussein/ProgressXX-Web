const { chromium } = require('playwright');
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch({headless:true});
  try {
    const page = await browser.newPage();
    const failures = [];
    page.on('pageerror', error => failures.push(error.message));
    await page.addInitScript(() => {
      if (!sessionStorage.getItem('px-workout-smoke-seeded')) {
        localStorage.setItem('progressx-data-v19','[]');
        localStorage.setItem('progressx-workout-templates-v1','[]');
        sessionStorage.setItem('px-workout-smoke-seeded','1');
      }
    });
    await page.route('**/auth/v1/**', async route => {
      await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({
        access_token:'mock-auth-token',refresh_token:'mock-refresh-token',
        expires_at:Math.floor(Date.now()/1000)+3600,
        user:{id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',email:'qa@example.test'}
      })});
    });
    let cloudPayload={};
    await page.route('**/rest/v1/**', async route => {
      const req=route.request();
      if(req.method()==='POST'||req.method()==='PATCH'){
        try{const body=req.postDataJSON();if(body?.payload)cloudPayload=body.payload;}catch{}
      }
      await route.fulfill({status:200,contentType:'application/json',
        body: req.method()==='GET'?JSON.stringify(Object.keys(cloudPayload).length?[{payload:cloudPayload}]:[]):'[{}]'});
    });
    await page.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded'});
    await page.locator('#pxEmail').fill('qa@example.test');
    await page.locator('#pxPassword').fill('demo-password');
    await page.locator('#pxSignin').click();
    await page.waitForFunction(() => document.querySelector('#pxCommercialGate')?.hidden === true, null, {timeout:15000});
    await page.waitForFunction(() => typeof window.openEditor === 'function' && document.getElementById('fDay'));
    await page.evaluate(() => { closeAlarmPopup(); openEditor(); });
    assert.equal(await page.locator('#fDay').inputValue(),'','fresh account should start with no training day');
    page.once('dialog', dialog => dialog.accept('Push A'));
    await page.getByRole('button',{name:/New day/}).click();
    assert.equal(await page.locator('#fDay').inputValue(),'Push A');
    await page.locator('#fExercise').fill('Bench press test');
    await page.locator('#fPerformance').fill('25*8');
    await page.locator('#fStatus').selectOption('Completed');
    await page.getByRole('button',{name:'Save entry'}).click();
    await page.waitForFunction(() => {
      const rows=JSON.parse(localStorage.getItem('progressx-data-v19')||'[]');
      return rows.some(x=>x.day==='Push A'&&x.exercise==='Bench press test');
    });
    assert.equal(await page.locator('#editorWrap').evaluate(el=>el.classList.contains('open')),false);
    await page.reload({waitUntil:'domcontentloaded'});
    await page.waitForFunction(() => typeof window.openEditor === 'function');
    await page.evaluate(() => openEditor());
    assert.equal(await page.locator('#fDay').inputValue(),'Push A','saved training day must persist after refresh');
    assert.equal(await page.locator('#fExerciseSelect option').allTextContents().then(x=>x.some(t=>t.includes('Bench press test'))),true);
    assert.deepEqual(failures,[],'browser should not throw uncaught script errors');
    console.log('PASS: create training day, save workout, refresh and retain exercise.');
  } finally {
    await browser.close();
  }
})().catch(error=>{console.error(error);process.exitCode=1;});
