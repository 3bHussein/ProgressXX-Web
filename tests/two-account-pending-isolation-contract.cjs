const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('index.html','utf8');
const match=source.match(/const pendingKey=id=>[\s\S]*?function readPending\(id\)\{[^\n]+\}/);
assert.ok(match,'Account-scoped production pending helpers missing');
const storage=new Map();
const browserStorage={setItem:(k,v)=>storage.set(k,v),getItem:k=>storage.get(k)??null,removeItem:k=>storage.delete(k)};
function session(account,values){
 const env={account,values,browserStorage,snapshotBaseline:'synthetic-base',Date,JSON};
 vm.runInNewContext(match[0]+'\nthis.ops={markPending,readPending,clearPending,pendingKey};',env);
 return env.ops;
}
const A='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const B='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const a=session(A,{'progressx-reminders':'[]','progressx-workout-schedule-v1':'{"mon":"REST"}'});
const b=session(B,{'progressx-reminders':'[{"id":"b-only"}]'});
a.markPending();b.markPending();
assert.equal(a.readPending(A)['progressx-reminders'],'[]');
assert.equal(b.readPending(B)['progressx-reminders'],'[{"id":"b-only"}]');
b.clearPending();
assert.equal(b.readPending(B),null);
assert.equal(a.readPending(A)['progressx-reminders'],'[]','B cleanup may not clear A');
const request=(caller,owner)=>caller===owner?{status:200}:{status:403};
assert.equal(request(A,B).status,403,'Different-account write must be rejected');
assert.equal(request(A,A).status,200);
assert.match(source,/user_app_snapshots\?on_conflict=user_id/);
console.log('PASS: production local pending helpers isolate accounts A/B and fake API contract rejects wrong owner');
console.log('LIMIT: fake API 403 is not real Supabase RLS proof; paid security acceptance remains OPEN');
