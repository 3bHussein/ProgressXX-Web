// Cache only the public shell. Account/API data never enters this cache.
const CACHE='progressxx-web-full-v3-settings-directory';
const BASE=new URL('./',self.location.href);
const STATIC=['index.html','manifest.webmanifest','icon-192.svg','icon-512.svg'].map(path=>new URL(path,BASE).href);
const SHELL=STATIC[0];
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(STATIC)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('progressxx-web-full-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==BASE.origin)return;
 const canonical=new URL(url.pathname,BASE.origin).href;
 const key=url.pathname===BASE.pathname?SHELL:STATIC.find(path=>path===canonical);
 if(!key)return;
 const response=fetch(request).then(async result=>{
  // Error responses must not replace the last working shell.
  if(result.ok&&!result.redirected){
   try{await (await caches.open(CACHE)).put(key,result.clone())}catch(_){}
  }
  return result;
 }).catch(async ()=>{
  const cached=await (await caches.open(CACHE)).match(key);
  return cached||Response.error();
 });
 event.respondWith(response);
 event.waitUntil(response.then(()=>{}));
});
