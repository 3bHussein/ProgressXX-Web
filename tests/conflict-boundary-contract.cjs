'use strict';
const assert=require('node:assert/strict');
const {createConflictBoundary}=require('../scripts/conflict-boundary.cjs');
(async()=>{
 const disk=new Map();
 const storage={getItem:k=>disk.has(k)?disk.get(k):null,setItem:(k,v)=>disk.set(k,v),removeItem:k=>disk.delete(k)};
 let reads=0;
 const make=id=>createConflictBoundary({accountId:id,storage,fetchLatest:async()=>{reads++;return {revision:9,data:{daily:{}}}}});
 const a=make('A'),b=make('B');
 const draft={daily:{water:{text:'keep'}}};
 assert.equal((await a.handle({status:200,draft})).handled,false);
 assert.equal(reads,0);
 assert.equal((await a.handle({status:409,draft})).reason,'needs-review');
 draft.daily.water.text='changed';
 assert.equal(a.pending().draft.daily.water.text,'keep');
 assert.equal(a.pending().revision,9);
 assert.equal(b.pending(),null);
 assert.equal((await make('A').handle({status:412,draft})).reason,'review-pending');
 assert.equal(reads,1);
 const bad=createConflictBoundary({accountId:'C',storage,fetchLatest:async()=>null});
 await assert.rejects(bad.handle({status:409,draft}),/Verified remote revision/);
 assert.equal(bad.pending(),null);
 for(const data of [undefined,null,[],42]){
  const invalid=createConflictBoundary({accountId:'invalid-'+String(data),storage,fetchLatest:async()=>({revision:9,data})});
  await assert.rejects(invalid.handle({status:409,draft:{daily:{a:1}}}),/Verified remote snapshot/);
  assert.equal(invalid.pending(),null);
 }
 const negative=createConflictBoundary({accountId:'negative',storage,fetchLatest:async()=>({revision:-1,data:{}})});
 await assert.rejects(negative.handle({status:409,draft:{daily:{a:1}}}),/Verified remote revision/);
 assert.equal(negative.pending(),null);
 console.log('PASS: isolated pending-conflict boundary has no replay, no account bleed and safe failed fetch');
 console.log('NOT LIVE: production index.html does not import the boundary');
})().catch(e=>{console.error(e);process.exitCode=1});
