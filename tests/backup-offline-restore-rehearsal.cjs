'use strict';
// Synthetic offline restore rehearsal only: no network, disk writes or production data.
const assert=require('node:assert/strict');
const {verifyBackup}=require('../scripts/backup-integrity.cjs');
function restoreIntoEmptyFixture(raw){
 const metadata=verifyBackup(raw);
 const parsed=JSON.parse(raw);
 const restored=structuredClone(parsed);
 assert.deepEqual(restored,parsed);
 assert.equal(verifyBackup(JSON.stringify(restored)).recordCounts.daily,parsed.daily.length);
 return {restored,metadata};
}
const fixture={daily:[{id:'d1',done:true}],food:[{id:'f1',name:'test'}],workout:[{id:'w1'}],weight:[]};
const raw=JSON.stringify(fixture);
const first=restoreIntoEmptyFixture(raw);
assert.deepEqual(first.restored,fixture);
first.restored.daily[0].done=false;
assert.equal(fixture.daily[0].done,true,'source must not mutate');
const second=restoreIntoEmptyFixture(raw);
assert.equal(second.restored.daily[0].done,true,'fresh rehearsal independent');
assert.equal(first.metadata.sha256,second.metadata.sha256);
assert.throws(()=>verifyBackup('{bad json'),SyntaxError);
console.log('PASS: synthetic offline round-trip and integrity checks; no real backup or database restored.');
