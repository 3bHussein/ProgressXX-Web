const fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('index.html','utf8');
const digestSource=source.match(/const snapshotDigest=payload=>[^\n]+/)[0];
const ctx={};vm.runInNewContext(digestSource+';this.digest=snapshotDigest',ctx);
function fixture(payload={}){
 let remote={...payload};
 return {syncConflictHold:false,snapshotBaseline:ctx.digest(remote),snapshotDigest:ctx.digest,
  markPending:()=>{},
  cloud:async(path,method='GET',body)=>{
   if(method==='GET')return [{payload:{...remote}}];
   remote={...body.payload};return [{payload:remote}];
  }};
}
module.exports={fixture};
