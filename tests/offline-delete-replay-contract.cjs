const assert=require('node:assert/strict');
// Offline deletion replay contract: synthetic versioned store, account-bound event IDs.
for(const category of ['Daily','Workout','Weight','Food']){
 let server={owner:'user-A',revision:1,records:new Map([['item-1',{value:'initial'}]])};
 const sent=new Set();const pending=[{eventId:category+'-delete-1',owner:'user-A',expected:1,op:'delete',id:'item-1'}];
 const push=e=>{
  if(e.owner!==server.owner)return {status:403};
  if(sent.has(e.eventId))return {status:200,duplicate:true,revision:server.revision};
  if(e.expected!==server.revision)return {status:409,revision:server.revision};
  if(e.op==='delete')server.records.delete(e.id);
  sent.add(e.eventId);server.revision++;return {status:200,revision:server.revision};
 };
 assert.equal(pending.length,1,'Offline queued delete must remain pending');
 const first=push(pending[0]);assert.equal(first.status,200);
 assert.equal(server.records.has('item-1'),false);
 assert.equal(push(pending[0]).duplicate,true,'Retry must not reapply event');
 assert.equal(server.revision,2,'Idempotent replay must not bump revision');
 assert.equal(push({eventId:'stale-resurrection',owner:'user-A',expected:1,op:'restore',id:'item-1'}).status,409);
 assert.equal(push({eventId:'intruder',owner:'user-B',expected:2,op:'restore',id:'item-1'}).status,403);
 assert.equal(server.records.has('item-1'),false);
 console.log('PASS: '+category+' mock offline delete replay, duplicate idempotency, stale and wrong owner blocked');
}
console.log('MOCK CONTRACT ONLY. Actual browser offline queue or production backend not modified.');
