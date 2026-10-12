'use strict';
const assert=require('node:assert/strict');
const {handleRejectedSnapshot}=require('../scripts/snapshot-conflict-guard.cjs');
for(const status of [409,412]){
 let writes=0, review=0, saved=null;
 const local={daily:{a:{id:'a',text:'Local edit'}},food:{lunch:'Rice'}};
 const remote={revision:3,data:{daily:{},food:{lunch:'Rice'}}};
 const result=handleRejectedSnapshot({status,localDraft:local,serverSnapshot:remote,
 pendingStore:{save:d=>{saved=d;writes++}},onReview:({draft,remote:r})=>{review++;assert.ok(draft.daily.a);assert.equal(r.data.daily.a,undefined)}});
 assert.deepEqual(result,{handled:true,retry:false,pending:true,requiresReview:true});
 assert.equal(writes,1);assert.equal(review,1);assert.deepEqual(saved,local);
 saved.daily.a.text='changed';assert.equal(local.daily.a.text,'Local edit');
 assert.equal(remote.data.daily.a,undefined);
}
let saves=0;const unhandled=handleRejectedSnapshot({status:503,localDraft:{},pendingStore:{save:()=>saves++}});
assert.equal(unhandled.handled,false);assert.equal(saves,0);
assert.throws(()=>handleRejectedSnapshot({status:409,localDraft:{},pendingStore:null}),/recoverable/);
console.log('PASS: isolated 409/412 conflict guard preserves draft without retry/overwrite and invokes review once');
console.log('NOT LIVE: requires a separate approved server CAS rollout before production wiring.');
