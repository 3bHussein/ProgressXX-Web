const assert=require('node:assert/strict'),{browserType,engine}=require('./helpers/browser-engine.cjs');
(async()=>{const b=await browserType.launch({headless:true});let backend=0;try{const p=await b.newPage();await p.route('**/*',r=>{const u=new URL(r.request().url());if(u.hostname==='127.0.0.1')return r.continue();if(u.hostname.endsWith('supabase.co'))backend++;return r.abort()});await p.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded'});await p.locator('#pxEmail').waitFor({state:'visible'});
const r=await p.evaluate(async()=>{
 const store=new Map([['keep-fitness','private-workout']]);window.__pxActiveStore={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)};
 const seed=[{at:'2026-10-13T20:00:00.000Z',type:'runtime_error',message:'secret-email@example.com',url:'https://private.test/?token=secret',stack:'private-workout',extra:{password:'secret-password'}},{at:'secret-email@example.com',type:'https://private.test/?token=secret'},null];store.set(PX_DIAG_KEY,JSON.stringify(seed));const before=store.get(PX_DIAG_KEY);
 const report=JSON.parse(pxDiagnosticReport()),readOnly=store.get(PX_DIAG_KEY)===before;
 window.dispatchEvent(new ErrorEvent('error',{message:'secret-password',filename:'https://private.test/',error:new Error('private-workout')}));window.dispatchEvent(new Event('unhandledrejection'));
 const logged=JSON.parse(pxDiagnosticReport()).events;
 pxLogDiagnostic('secret-email@example.com');const last=JSON.parse(store.get(PX_DIAG_KEY)).at(-1);
 store.set(PX_DIAG_KEY,JSON.stringify(Array.from({length:80},()=>seed[0])));const capped=JSON.parse(pxDiagnosticReport()).events.length;
 store.set(PX_DIAG_KEY,JSON.stringify({secret:'secret-password'}));const malformed=JSON.parse(pxDiagnosticReport()).events;
 store.set(PX_DIAG_KEY,JSON.stringify(seed));let copied;Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>copied=text}});pxCopyDiagnostics();await Promise.resolve();
 pxClearDiagnostics();const cleared=!store.has(PX_DIAG_KEY),kept=store.get('keep-fitness')==='private-workout';
 return {report,readOnly,logged,last,capped,malformed,copied,cleared,kept};
});assert(r.readOnly&&r.cleared&&r.kept);assert.equal(r.capped,50);assert.deepEqual(r.malformed,[]);assert.deepEqual(r.report.events,[{at:'2026-10-13T20:00:00.000Z',type:'runtime_error'},{at:null,type:'other'},{at:null,type:'other'}]);assert.deepEqual(r.logged.slice(-2).map(e=>e.type),['runtime_error','unhandled_rejection']);assert.equal(r.last.type,'other');for(const report of [JSON.stringify(r.report),r.copied])for(const secret of ['secret-email','private.test','private-workout','secret-password','token=','stack','message'])assert(!report.includes(secret),secret+' must not escape');assert.equal(backend,0);console.log('PASS ['+engine+']: allowlisted diagnostic projection, legacy/malformed events, bounded report, local generic error capture, sanitized clipboard, diagnostic-only clearing, no fitness-data changes/backend calls');
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
