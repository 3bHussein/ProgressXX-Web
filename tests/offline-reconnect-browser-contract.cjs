const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage();
  await page.goto('http://127.0.0.1:8765/prototypes/sync-delete-conflict-preview.html');
  const output=await page.evaluate(async()=>{
   // An isolated browser-only contract; no real Supabase endpoint.
   const journal=[];
   const pending=new Map();
   let online=false,revision=1;
   const send=event=>{
    if(!online)throw Error('offline');
    if(event.expected!==revision)return {status:409,revision};
    journal.push(event.id);revision++;return {status:200,revision};
   };
   const event={id:'delete-event-1',owner:'test-user',expected:1,op:'delete'};
   pending.set(event.id,event);
   try{send(event)}catch(e){if(e.message!=='offline')throw e}
   const offlineState={pending:pending.size,commits:journal.length};
   online=true;
   for(const [id,item] of [...pending]){
    const answer=send(item);
    if(answer.status===200)pending.delete(id);
   }
   const replay={pending:pending.size,commits:journal.length,revision};
   // Repeated delivery of same event must be suppressed by the client outbox.
   if(!pending.has(event.id)){}else throw Error('Outbox not acknowledged');
   const conflicting={id:'other-edit',expected:1,op:'restore'};
   const conflict=send(conflicting);
   return {offlineState,replay,conflict,stored:localStorage.length,session:sessionStorage.length};
  });
  assert.deepEqual(output.offlineState,{pending:1,commits:0});
  assert.deepEqual(output.replay,{pending:0,commits:1,revision:2});
  assert.equal(output.conflict.status,409);
  assert.equal(output.stored,0);assert.equal(output.session,0);
  console.log('PASS: offline browser mock retains pending operation; reconnect flush acknowledges once and stale replay conflicts');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
