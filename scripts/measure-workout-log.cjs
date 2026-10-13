// Synthetic UI-only benchmark. Serve root on 127.0.0.1:8765 first.
const fs=require('node:fs'),{chromium}=require('playwright');
(async()=>{const browser=await chromium.launch({headless:true}),rows=[];let backend=0;try{
 for(let trial=0;trial<5;trial++){
  const p=await browser.newPage({viewport:{width:390,height:844}});
  await p.route('**/*',r=>{const u=new URL(r.request().url());if(u.hostname==='127.0.0.1'){
   if(process.env.PX_LOG_SOURCE&&u.pathname==='/index.html')return r.fulfill({contentType:'text/html',body:fs.readFileSync(process.env.PX_LOG_SOURCE,'utf8')});return r.continue();
  }if(u.hostname.endsWith('supabase.co'))backend++;return r.abort()});
  await p.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded'});await p.locator('#pxEmail').waitFor({state:'visible'});
  rows.push(await p.evaluate(async()=>{
   if(typeof bindLogFilters==='function')bindLogFilters();else ['search','weekFilter','statusFilter','logSort'].forEach(id=>$(id).addEventListener('input',()=>renderLog(true)));
   $('pxCommercialGate').hidden=true;document.querySelectorAll('.section').forEach(s=>s.classList.toggle('active',s.id==='log'));
   data=Array.from({length:5000},(_,i)=>({id:'synthetic-'+i,week:1+i%100,day:'Push',exercise:'Bench '+i,date:'2026-10-01',status:'Completed',performance:'40 x 10',notes:'Synthetic note '+i}));activeDay='All';
   const t=performance.now();renderLog(true);const initialMs=performance.now()-t;
   const start=performance.now();for(let i=0;i<30;i++)loadMoreLogs();const load30Ms=performance.now()-start;
   const original=renderLog;let renders=0;renderLog=(...args)=>{renders++;return original(...args)};
   const burst=performance.now();for(let i=0;i<12;i++){$('search').value=i===11?'Bench 4999':'Bench '+i;$('search').dispatchEvent(new Event('input',{bubbles:true}))}
   await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));renderLog=original;
   return {initialMs,load30Ms,burstMs:performance.now()-burst,burstRenders:renders,matches:filtered().length,visible:document.querySelectorAll('#logList .compactLogRow').length};
  }));await p.close();
 }
 if(backend)throw Error('Unexpected backend request');const median=k=>rows.map(r=>r[k]).sort((a,b)=>a-b)[2];
 const result={scenario:'390x844 Chromium; 5000 synthetic records; 30 load-more calls; 12 input events in one task; external requests blocked; no login',rows,medianInitialMs:median('initialMs'),medianLoad30Ms:median('load30Ms'),medianBurstMs:median('burstMs'),backendRequests:backend};
 fs.writeFileSync(process.argv[2]||'/tmp/progressx-workout-log.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
