const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
(async()=>{
 const listeners={},stores=new Map();let network=true,status=200,redirected=false,claimed=0,skipped=0;
 const base='https://example.test/ProgressXX-Web/';
 const caches={keys:async()=>[...stores.keys()],delete:async k=>stores.delete(k),open:async name=>{
  if(!stores.has(name))stores.set(name,new Map());const rows=stores.get(name);
  return {addAll:async urls=>{for(const u of urls)rows.set(u,new Response('installed:'+u))},put:async(k,v)=>rows.set(k,v),match:async k=>rows.get(k)?.clone()};
 }};
 vm.runInNewContext(fs.readFileSync('sw.js','utf8'),{URL,Response,caches,self:{location:{href:base+'sw.js'},addEventListener:(k,v)=>listeners[k]=v,skipWaiting:async()=>skipped++,clients:{claim:async()=>claimed++}},fetch:async()=>{if(!network)throw Error('offline');const r=new Response('network',{status});Object.defineProperty(r,'redirected',{value:redirected});return r}});
 async function lifecycle(name){let work;listeners[name]({waitUntil:p=>work=p});await work}
 stores.set('progressxx-web-full-v1',new Map());stores.set('user-backups',new Map([['saved','preserve']]));
 await lifecycle('install');assert.equal(skipped,1);await lifecycle('activate');assert.equal(claimed,1);assert(!stores.has('progressxx-web-full-v1'));assert.equal(stores.get('user-backups').get('saved'),'preserve');
 async function request(path,method='GET'){let response,work;listeners.fetch({request:{url:new URL(path,base).href,method},respondWith:p=>response=p,waitUntil:p=>work=p});if(!response)return null;const r=await response;await work;return r}
 network=false;
 for(const path of ['./','index.html','?source=installed','index.html?source=installed'])assert.match(await (await request(path)).text(),/installed:.*index.html$/);
 for(const path of ['manifest.webmanifest?version=2','icon-192.svg','icon-512.svg'])assert.match(await (await request(path)).text(),/installed:/);
 for(const path of ['api/account','other/index.html','https://backend.test/index.html'])assert.equal(await request(path),null);
 assert.equal(await request('index.html','POST'),null);
 network=true;assert.equal(await (await request('./?fresh=1')).text(),'network');network=false;assert.equal(await (await request('index.html')).text(),'network');
 network=true;status=503;assert.equal((await request('./')).status,503);network=false;assert.equal(await (await request('./')).text(),'network');
 network=true;status=200;redirected=true;await request('./');network=false;assert.equal(await (await request('./')).text(),'network');
 stores.clear();assert.equal((await request('./')).type,'error');
 console.log('PASS: scoped PWA root/query offline fallback, update, error/redirect retention, API exclusion and unrelated cache preservation');
})().catch(e=>{console.error(e);process.exitCode=1});
