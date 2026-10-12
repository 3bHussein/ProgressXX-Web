'use strict';
// Offline-only backup integrity utility; never uploads, writes or restores records.
const crypto=require('node:crypto');
function verifyBackup(raw){
 if(typeof raw!=='string'||!raw.trim())throw Error('Backup JSON required');
 const data=JSON.parse(raw);
 if(!data||typeof data!=='object'||Array.isArray(data))throw Error('Backup must be an object');
 const bytes=Buffer.byteLength(raw,'utf8');
 const digest=crypto.createHash('sha256').update(raw,'utf8').digest('hex');
 const keys=Object.keys(data).sort();
 return {valid:true,bytes,sha256:digest,topLevelKeys:keys,recordCounts:Object.fromEntries(keys.filter(k=>Array.isArray(data[k])).map(k=>[k,data[k].length]))};
}
module.exports={verifyBackup};
