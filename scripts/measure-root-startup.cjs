// Controlled local startup measurement; serve root on 127.0.0.1:8765 first.
const fs=require('node:fs'),{chromium}=require('playwright');
(async()=>{const b=await chromium.launch({headless:true});const rows=[];try{for(let i=0;i<5;i++){
 const p=await b.newPage({viewport:{width:390,height:844}});let library=0,backend=0;
 await p.route('**/*',async r=>{const u=new URL(r.request().url());if(u.hostname==='127.0.0.1')return r.continue();if(u.hostname.endsWith('supabase.co'))backend++;if(u.hostname==='unpkg.com'){library++;await new Promise(resolve=>setTimeout(resolve,1500));return r.fulfill({status:200,contentType:'application/javascript',body:''})}return r.abort()});
 await p.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded'});await p.locator('#pxEmail').waitFor({state:'visible'});
 const timings=await p.evaluate(()=>{const n=performance.getEntriesByType('navigation')[0];return {readyMs:performance.now(),domInteractiveMs:n.domInteractive,domContentLoadedMs:n.domContentLoadedEventEnd}});
 rows.push({...timings,library,backend});await p.close();
}if(rows.some(r=>r.backend!==0))throw Error('Benchmark must not contact Supabase');const sorted=rows.map(r=>r.readyMs).sort((a,b)=>a-b);const report={scenario:'390x844, cold contexts, mocked CDN delay 1500ms, no account login',rows,medianReadyMs:sorted[2]};fs.writeFileSync(process.argv[2]||'/tmp/progressx-root-startup.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report))}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
