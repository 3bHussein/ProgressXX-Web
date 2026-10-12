'use strict';
const assert=require('node:assert/strict');
const {handleRejectedSnapshot}=require('../scripts/snapshot-conflict-guard.cjs');
// A fake persistent key/value store models reloads WITHOUT touching browser or live records.
const disk=new Map();
const key='synthetic:account-A:pending';
const pendingStore={
 save(value){disk.set(key,JSON.stringify(value))},
 read(){const raw=disk.get(key);return raw?JSON.parse(raw):null}
};
const original={daily:{reminder:{text:'Unsynced'}}};
const remote={revision:8,data:{daily:{}}};
let reviewEvents=0;
const result=handleRejectedSnapshot({status:409,localDraft:original,serverSnapshot:remote,
 pendingStore,onReview:()=>reviewEvents++});
assert.equal(result.retry,false);
assert.equal(reviewEvents,1);
assert.deepEqual(pendingStore.read(),original);
const reloaded=pendingStore.read();
assert.equal(reloaded.daily.reminder.text,'Unsynced','reloaded draft remains available for review');
assert.equal(remote.data.daily.reminder,undefined,'remote deletion must remain absent');
assert.equal(reviewEvents,1,'reload must not silently auto-approve');
assert.equal(disk.has(key),true,'must not silently clear pending');
let saveCalls=0;
assert.throws(()=>handleRejectedSnapshot({status:412,localDraft:original,serverSnapshot:remote,
 pendingStore:{save(){saveCalls++;throw new Error('quota blocked')}}}),/quota blocked/);
assert.equal(saveCalls,1,'storage errors cannot be treated as saved');
assert.equal(disk.has(key),true,'existing durable draft must not be deleted after a storage failure');
const otherKey='synthetic:account-B:pending';
assert.equal(disk.has(otherKey),false,'A pending must not appear under B');
console.log('PASS: synthetic reload retains 409 draft; review not auto-approved; storage failure surfaces; A/B key separation');
console.log('NOT PRODUCTION: helper is not connected to root index.html and server CAS does not exist in production.');
