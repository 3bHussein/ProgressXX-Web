'use strict';
// Pure server-equivalent specification; NOT connected to production DB.
const clone=structuredClone;
function createVersionedStore(initial={}){
 const rows=new Map(Object.entries(initial).map(([owner,data])=>[owner,{version:0,payload:clone(data)}]));
 function read(owner){if(!owner)throw Error('Authenticated owner required');const row=rows.get(owner);return row?clone(row):{version:0,payload:{}}}
 function write({authenticatedOwner,requestedOwner,expectedVersion,payload}){
  if(!authenticatedOwner||requestedOwner!==authenticatedOwner)return {status:403};
  if(!Number.isSafeInteger(expectedVersion)||expectedVersion<0)return {status:400};
  if(!payload||typeof payload!=='object'||Array.isArray(payload))return {status:400};
  const old=read(authenticatedOwner);
  if(expectedVersion!==old.version)return {status:409,current:old};
  const next={version:old.version+1,payload:clone(payload)};
  rows.set(authenticatedOwner,next);
  return {status:200,current:clone(next)};
 }
 return {read,write};
}
module.exports={createVersionedStore};
