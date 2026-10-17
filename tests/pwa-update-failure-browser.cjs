// Actual service worker lifecycle on a disposable loopback server; no account login.
const assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http');const {chromium}=require('playwright');
(async()=>{
 let version='v2',failAsset=false,networkOffline=false;const source=fs.readFileSync('sw.js','utf8'),root=fs.readFileSync('index.html','utf8');
 const server=http.createServer((req,res)=>{
  if(networkOffline){req.socket.destroy();return}
  const path=new URL(req.url,'http://localhost').pathname.replace(/^\/ProgressXX-Web\//,'');
  res.setHeader('Cache-Control','no-store');
  if(path==='sw.js'){res.setHeader('Content-Type','application/javascript');return res.end(source.replace(/const CACHE='progressxx-web-full-[^']+';/, "const CACHE='progressxx-web-full-"+version+"';"))}
  if(path==='icon-512.svg'&&failAsset){res.writeHead(503);return res.end('synthetic install failure')}
  const names=['manifest.webmanifest','icon-192.svg','icon-512.svg'];
  if(path===''||path==='index.html'){res.setHeader('Content-Type','text/html');return res.end(root.replace('<head>','<head><meta name="qa-shell" content="'+version+'">'))}
  if(names.includes(path)){res.setHeader('Content-Type',path.endsWith('.svg')?'image/svg+xml':'application/manifest+json');return res.end(fs.readFileSync(path))}
  res.writeHead(404);res.end();
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
  browser=await chromium.launch({headless:true});const context=await browser.newContext();let backend=0;const base='http://127.0.0.1:'+server.address().port+'/ProgressXX-Web/';
  await context.route('**/*',r=>{const u=new URL(r.request().url());if(u.origin===new URL(base).origin)return r.continue();if(u.hostname.endsWith('supabase.co'))backend++;return r.abort()});
  let page=await context.newPage();await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.evaluate(async()=>{
   await navigator.serviceWorker.register('./sw.js');await navigator.serviceWorker.ready;
   localStorage.setItem('pwa-update-draft','keep-me');
   const cache=await caches.open('pwa-unrelated-backup');await cache.put('./fixture-backup',new Response('keep-backup'));
   await new Promise((resolve,reject)=>{const req=indexedDB.open('pwa-update-fixture',1);req.onupgradeneeded=()=>req.result.createObjectStore('drafts');req.onerror=()=>reject(req.error);req.onsuccess=()=>{const db=req.result,tx=db.transaction('drafts','readwrite');tx.objectStore('drafts').put('keep-idb','pending');tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>reject(tx.error)}});
  });
  await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
  await page.evaluate(()=>window.qaOldController=navigator.serviceWorker.controller);
  version='qa-v3';
  await page.evaluate(async()=>{const reg=await navigator.serviceWorker.getRegistration();await reg.update()});
  await page.waitForFunction(async()=>{const keys=await caches.keys();return keys.includes('progressxx-web-full-qa-v3')&&!keys.includes('progressxx-web-full-v2')});
  await page.waitForFunction(async()=>{const reg=await navigator.serviceWorker.getRegistration();return reg.active?.state==='activated'&&navigator.serviceWorker.controller===reg.active&&navigator.serviceWorker.controller!==window.qaOldController});
  assert.equal(await page.evaluate(()=>localStorage.getItem('pwa-update-draft')),'keep-me','Update must not reload or erase drafts');
  // Fresh launch uses the active worker; the existing document is deliberately not auto-reloaded.
  await page.close();page=await context.newPage();
  networkOffline=true;await page.goto(base+'?offline=updated',{waitUntil:'domcontentloaded'});assert.equal(await page.locator('meta[name="qa-shell"]').getAttribute('content'),'qa-v3');
  networkOffline=false;version='qa-v4';failAsset=true;
  const failed=await page.evaluate(async()=>{
   const reg=await navigator.serviceWorker.getRegistration();
   return await new Promise(async(resolve,reject)=>{
    const timer=setTimeout(()=>reject(Error('Failed worker did not become redundant')),15000);
    const observe=worker=>{if(!worker)return;const check=()=>{if(worker.state==='redundant'){clearTimeout(timer);resolve(true)}};worker.addEventListener('statechange',check);check()};
    reg.addEventListener('updatefound',()=>observe(reg.installing),{once:true});
    try{await reg.update();observe(reg.installing)}catch(e){clearTimeout(timer);reject(e)}
   });
  });assert.equal(failed,true);
  networkOffline=true;await page.goto(base+'index.html?offline=failed',{waitUntil:'domcontentloaded'});assert.equal(await page.locator('meta[name="qa-shell"]').getAttribute('content'),'qa-v3','Failed install must keep the previous active shell');
  const saved=await page.evaluate(async()=>({
   draft:localStorage.getItem('pwa-update-draft'),backup:await (await (await caches.open('pwa-unrelated-backup')).match('./fixture-backup')).text(),
   idb:await new Promise((resolve,reject)=>{const req=indexedDB.open('pwa-update-fixture',1);req.onerror=()=>reject(req.error);req.onsuccess=()=>{const db=req.result,tx=db.transaction('drafts'),get=tx.objectStore('drafts').get('pending');get.onsuccess=()=>resolve(get.result);get.onerror=()=>reject(get.error);tx.oncomplete=()=>db.close()}})
  }));assert.deepEqual(saved,{draft:'keep-me',backup:'keep-backup',idb:'keep-idb'});assert.equal(backend,0);
  console.log('PASS: real scoped Chromium worker update and failed precache retain previous offline shell, localStorage/IndexedDB drafts and unrelated backup cache; no Supabase calls');
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r))}
})().catch(e=>{console.error(e);process.exitCode=1});
