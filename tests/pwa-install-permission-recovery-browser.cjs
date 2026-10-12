const assert=require('node:assert/strict');const {chromium}=require('playwright');
(async()=>{const browser=await chromium.launch({headless:true});try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[],backend=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',r=>{const u=new URL(r.request().url());if(u.hostname==='127.0.0.1')return r.continue();if(u.hostname.endsWith('supabase.co'))backend.push(u.href);return r.abort()});
 await page.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded'});
 // Mount production PWA behavior without signing in or starting account hydration.
 await page.evaluate(()=>setupPwa());
 assert.equal(await page.locator('#pwaInstallInfo').getAttribute('role'),'status');
 assert.doesNotMatch(await page.locator('#pwaInstallInfo').innerText(),/requires HTTPS/,'Loopback is supported');
 const install=await page.evaluate(async()=>{
  let calls=0,resolveChoice;const choice=new Promise(r=>resolveChoice=r);
  function offer(prompt,userChoice){const e=new Event('beforeinstallprompt',{cancelable:true});e.prompt=prompt;e.userChoice=userChoice;window.dispatchEvent(e);return e.defaultPrevented}
  const prevented=offer(async()=>{calls++},choice),pending=installProgressX();
  await installProgressX();
  const busy={disabled:$('pwaInstallBtn').disabled,aria:$('pwaInstallBtn').getAttribute('aria-busy')};
  resolveChoice({outcome:'dismissed'});await pending;
  const dismissed=$('pwaInstallInfo').textContent;
  offer(()=>{throw Error('blocked')},Promise.resolve({outcome:'dismissed'}));await installProgressX();
  const rejected=$('pwaInstallInfo').textContent;
  offer(async()=>{throw Error('async prompt failure')},Promise.resolve({outcome:'dismissed'}));await installProgressX();
  const asyncRejected=$('pwaInstallInfo').textContent;
  offer(async()=>{},Promise.reject(Error('choice failure')));await installProgressX();
  const choiceRejected=$('pwaInstallInfo').textContent;
  offer(async()=>{},Promise.resolve({outcome:'accepted'}));await installProgressX();
  const accepted={info:$('pwaInstallInfo').textContent,status:$('pwaInstallStatus').textContent};
  window.dispatchEvent(new Event('appinstalled'));
  return {prevented,calls,busy,dismissed,rejected,asyncRejected,choiceRejected,accepted,installed:$('pwaInstallStatus').textContent,disabled:$('pwaInstallBtn').disabled};
 });
 assert.equal(install.prevented,true);assert.equal(install.calls,1);assert.deepEqual(install.busy,{disabled:true,aria:'true'});
 assert.match(install.dismissed,/dismissed/);assert.match(install.rejected,/could not open/);assert.match(install.asyncRejected,/could not open/);assert.match(install.choiceRejected,/could not open/);assert.match(install.accepted.info,/accepted/);assert.notEqual(install.accepted.status,'Installed');assert.equal(install.installed,'Installed');assert.equal(install.disabled,false);
 const permissions=await page.evaluate(async()=>{
  const original=window.Notification;
  const set=N=>Object.defineProperty(window,'Notification',{value:N,configurable:true,writable:true});
  function Fake(){}Fake.permission='denied';Fake.requestPermission=async()=>'denied';set(Fake);
  await requestDailyNotifications();const denied={text:$('notifyBannerText').textContent,disabled:$('notifyBannerBtn').disabled,notice:$('dailyNotice').textContent};
  Fake.permission='default';Fake.requestPermission=async()=>{throw Error('permission unavailable')};await requestDailyNotifications();const rejected=$('dailyNotice').textContent;
  delete window.Notification;await requestDailyNotifications();const unsupported={text:$('notificationState').textContent,notice:$('dailyNotice').textContent};set(original);
  let cleared=0;window.Html5Qrcode=class{async start(){throw Error('NotAllowedError')}async clear(){cleared++}};
  window.Html5QrcodeSupportedFormats={EAN_13:1,EAN_8:2,UPC_A:3,UPC_E:4,CODE_128:5};
  await openBarcodeScanner();const camera={text:$('barcodeScannerStatus').textContent,manualDisabled:$('barcodeManualInput').disabled};await closeBarcodeScanner();
  return {denied,rejected,unsupported,camera,cleared,modalOpen:$('barcodeModal').classList.contains('show')};
 });
 assert.match(permissions.denied.text,/blocked/);assert.equal(permissions.denied.disabled,true);assert.match(permissions.denied.notice,/still work/);
 assert.match(permissions.rejected,/remain active/);assert.match(permissions.unsupported.text,/unavailable/);assert.match(permissions.unsupported.notice,/already active/);
 assert.match(permissions.camera.text,/Manual barcode search still works/);assert.equal(permissions.camera.manualDisabled,false);assert.equal(permissions.cleared,1);assert.equal(permissions.modalOpen,false);
 assert.deepEqual(errors,[]);assert.deepEqual(backend,[]);console.log('PASS: real root install single prompt/dismiss/error/accepted/installed, notification denied/unsupported/error, camera denied manual fallback; zero Supabase calls');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
