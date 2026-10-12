'use strict';
const assert=require('node:assert/strict');
// Pure readiness policy, NOT evidence that any production gate has passed.
function classify(input={}) {
 const blockers=[];
 if(input.usesUnconditionalUpsert!==false)blockers.push('unconditional-upsert-not-disproved');
 if(input.serverCasVerified!==true)blockers.push('server-cas-unverified');
 if(input.rlsVerified!==true)blockers.push('rls-unverified');
 if(input.twoDeviceVerified!==true)blockers.push('two-device-unverified');
 if(input.restoreVerified!==true)blockers.push('restore-unverified');
 return {saleReady:blockers.length===0,blockers};
}
const verified={usesUnconditionalUpsert:false,serverCasVerified:true,rlsVerified:true,twoDeviceVerified:true,restoreVerified:true};
assert.deepEqual(classify().blockers.length,5,'Missing evidence must fail closed');
assert.equal(classify(verified).saleReady,true,'Hypothetical complete evidence allows passing');
for(const key of Object.keys(verified)){
 const missing={...verified};delete missing[key];
 assert.equal(classify(missing).saleReady,false,'Missing '+key+' must block');
 const invalid={...verified,[key]:key==='usesUnconditionalUpsert'?'false':'true'};
 assert.equal(classify(invalid).saleReady,false,'String '+key+' must not count as verification');
}
assert.equal(classify({...verified,usesUnconditionalUpsert:true}).saleReady,false);
assert.equal(classify({...verified,rlsVerified:1}).saleReady,false);
console.log('PASS: five-gate release policy fails closed on missing, invalid and incomplete evidence');
console.log('RELEASE BLOCKED: this synthetic policy test is NOT proof of live CAS/RLS/device/restore readiness.');
module.exports={classify};
