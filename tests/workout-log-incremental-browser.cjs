const assert=require('node:assert/strict'),{browserType,engine}=require('./helpers/browser-engine.cjs');
(async()=>{const b=await browserType.launch({headless:true});let backend=0;const errors=[];try{
 const p=await b.newPage({viewport:{width:390,height:844}});p.on('pageerror',e=>errors.push(e.message));
 await p.route('**/*',r=>{const u=new URL(r.request().url());if(u.hostname==='127.0.0.1')return r.continue();if(u.hostname.endsWith('supabase.co'))backend++;return r.abort()});
 await p.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded'});await p.locator('#pxEmail').waitFor({state:'visible'});
 const result=await p.evaluate(async()=>{
  bindLogFilters();$('pxCommercialGate').hidden=true;document.querySelectorAll('.section').forEach(s=>s.classList.toggle('active',s.id==='log'));
  data=Array.from({length:5000},(_,i)=>({id:'fixture-'+i,week:1+i%100,day:'Push',exercise:'Bench '+i,date:'2026-10-01',status:'Completed',performance:'40 x 10',notes:'Synthetic '+i}));activeDay='All';
  const originalData=JSON.stringify(data);renderLog(true);const first=$('logList').firstElementChild,button=first.querySelector('button');button.focus();loadMoreLogs();
  const reused=$('logList').firstElementChild===first,focusPreserved=document.activeElement===button,count=$('logList').children.length;renderLog(false);
  const noOp=$('logList').firstElementChild===first;
  const original=renderLog;let renders=0;renderLog=(...a)=>{renders++;return original(...a)};
  for(let i=0;i<12;i++){$('search').value=i===11?'bench 4999':'bench '+i;$('search').dispatchEvent(new Event('input',{bubbles:true}))}
  await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));renderLog=original;
  const burstCount=$('logList').children.length,burstText=$('logList').textContent,burstRenders=renders;
  $('search').value='obsolete';$('search').dispatchEvent(new Event('input',{bubbles:true}));clearFilters();loadMoreLogs();
  await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));const cancelCount=$('logList').children.length;
  const immutable=JSON.stringify(data)===originalData;
  // Same IDs and object references: edits must not leave stale content.
  data[4999].exercise='<img src=x onerror="window.qaInjected=1"> Unique';$('search').value='unique';renderLog(true);
  const edited=$('logList').textContent.includes('Unique'),escaped=!$('logList').querySelector('img')&&!window.qaInjected;
  data.splice(4999,1);renderLog();const deleted=$('resultCount').textContent==='0 matches';
  // Replacement snapshot and legacy note-time search remain correct.
  data=[{id:'fixture-4999',week:2,day:'Pull',exercise:'Restored',date:'2026-10-02',status:'Skipped',notes:'[[PXTIME:09:30]]'}];
  $('search').value='09:30';renderLog(true);const restored=$('logList').textContent.includes('Restored');
  $('statusFilter').value='Completed';renderLog(true);const filteredOut=$('resultCount').textContent==='0 matches';
  clearFilters();const reset=$('logList').textContent.includes('Restored');
  return {reused,focusPreserved,count,noOp,burstCount,burstText,burstRenders,cancelCount,immutable,edited,escaped,deleted,restored,filteredOut,reset};
 });
 for(const k of ['reused','focusPreserved','noOp','immutable','edited','escaped','deleted','restored','filteredOut','reset'])assert.equal(result[k],true,k);
 assert.equal(result.count,48);assert.equal(result.burstCount,1);assert.match(result.burstText,/Bench 4999/);assert.equal(result.burstRenders,1);assert.equal(result.cancelCount,48,'Immediate actions cancel pending reset');
 assert.equal(backend,0);assert.deepEqual(errors,[]);console.log('PASS ['+engine+']: 5000 synthetic logs, incremental DOM/focus retention, coalesced search, cancellation, edits/deletion/replacement/filter/time/escaping, data unchanged and zero backend calls');
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
