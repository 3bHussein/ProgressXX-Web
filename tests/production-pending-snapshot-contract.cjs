const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('index.html','utf8');
const marker=source.match(/const pendingKey=id=>[\s\S]*?function readPending\(id\)\{[^\n]+\}/);
assert.ok(marker,'Production pending snapshot helpers missing');
const stored=new Map();
const browserStorage={
 setItem:(key,value)=>stored.set(key,value),
 getItem:key=>stored.get(key)??null,
 removeItem:key=>stored.delete(key)
};
const context={account:'mock-account-A',values:{'progressx-reminders':'[]'},browserStorage,snapshotBaseline:'synthetic-base',Date,JSON,Object};
vm.runInNewContext(marker[0]+'\nthis.api={markPending,readPending,clearPending,pendingKey};',context);
context.api.markPending();
assert.equal(JSON.parse(stored.get('pxx:pending:mock-account-A')).payload['progressx-reminders'],'[]');
context.account='mock-account-B';
assert.equal(context.api.readPending('mock-account-B'),null,'Another user cannot inherit pending state');
assert.equal(context.api.readPending('mock-account-A')['progressx-reminders'],'[]','Queued deletion must survive simulated reload');
context.api.clearPending();
assert.equal(stored.has('pxx:pending:mock-account-A'),true,'Clearing active B cannot clear A pending data');
context.account='mock-account-A';
context.api.clearPending();
assert.equal(context.api.readPending('mock-account-A'),null,'Acknowledged pending must be clearable for current account');
// The current production protocol has no event idempotency key or server CAS.
assert.match(source,/user_app_snapshots\?on_conflict=user_id/);
assert.doesNotMatch(marker[0],/eventId|expected_revision|compare.and.swap/i);
console.log('PASS: extracted production pending helpers retain account-scoped deleted state and prevent cross-account clearing; server idempotency NOT IMPLEMENTED');
