const assert=require('node:assert/strict');
const fs=require('node:fs');
const source=fs.readFileSync('index.html','utf8');
const f=source.match(/async function flush\(\)\{[\s\S]*?\n \}/);
assert.ok(f,'Production snapshot flush missing');
assert.match(f[0],/user_app_snapshots\?on_conflict=user_id/);
assert.ok(!/expected_revision|compare.and.swap|rpc\//i.test(f[0]),'Update analysis if server CAS support is added');
function server(){let payload={},revision=0;return {
 read:()=>({payload:{...payload},revision}),
 unguardedWrite:p=>{payload={...p};revision++;return revision},
 guardedWrite:(base,p)=>{if(base!==revision)return {status:409,payload:{...payload},revision};payload={...p};revision++;return {status:200,revision}}
}}
const unsafe=server();const first=unsafe.read(),second=unsafe.read();
unsafe.unguardedWrite({...first.payload,daily:'REMOVED'});
unsafe.unguardedWrite({...second.payload,workout:'NEW'});
assert.equal(unsafe.read().payload.daily,undefined,'Illustrative erase should be observed');
const safe=server();const a=safe.read(),b=safe.read();
assert.equal(safe.guardedWrite(a.revision,{daily:'REMOVED'}).status,200);
assert.equal(safe.guardedWrite(b.revision,{workout:'NEW'}).status,409);
assert.equal(safe.read().payload.daily,'REMOVED');
console.log('PASS: documented two-device stale snapshot overwrite risk and hypothetical 409 CAS rejection');
console.log('OPEN: production flush still performs unconditional snapshot UPSERT; no real server CAS or RLS acceptance applied');
