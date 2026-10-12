'use strict';
const assert=require('node:assert/strict');
function classify({usesUnconditionalUpsert,serverCasVerified,rlsVerified,twoDeviceVerified,restoreVerified}) {
 const blockers=[];
 if(usesUnconditionalUpsert) blockers.push('unconditional-upsert');
 if(!serverCasVerified) blockers.push('server-cas-unverified');
 if(!rlsVerified) blockers.push('rls-unverified');
 if(!twoDeviceVerified) blockers.push('two-device-unverified');
 if(!restoreVerified) blockers.push('restore-unverified');
 return {saleReady:blockers.length===0,blockers};
}
for(const key of ['serverCasVerified','rlsVerified','twoDeviceVerified','restoreVerified']) {
 const input={usesUnconditionalUpsert:false,serverCasVerified:true,rlsVerified:true,twoDeviceVerified:true,restoreVerified:true};
 input[key]=false;
 assert.equal(classify(input).saleReady,false,'Missing '+key+' must block');
}
const risk=classify({usesUnconditionalUpsert:true,serverCasVerified:false,rlsVerified:false,twoDeviceVerified:false,restoreVerified:false});
assert.equal(risk.saleReady,false);
assert.equal(risk.blockers.length,5);
assert.equal(classify({usesUnconditionalUpsert:false,serverCasVerified:true,rlsVerified:true,twoDeviceVerified:true,restoreVerified:true}).saleReady,true);
console.log('PASS: release classifier requires all five independently verified data-safety gates');
console.log('RELEASE BLOCKED: current ProgressX production prerequisites are not verified.');
module.exports={classify};
