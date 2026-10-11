const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8');
const start=html.indexOf(" const WEIGHT_CLIENT_PREFIX='pxweight:'");
const end=html.indexOf(" const SCHEDULE_ROW_MARKER=",start);
assert.ok(start>0&&end>start);
const uid='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const existing={id:'11111111-1111-4111-8111-111111111111',client_id:null,measured_at:'2026-10-10T12:00:00Z',weight_kg:80,user_id:uid};
let records=[existing],writes=0;
const cloud=async(path,method='GET',body)=>{
 const url=new URL('https://qa.invalid/rest/v1/'+path);
 const filt=url.searchParams.get('client_id')?.replace(/^eq\./,'');
 const id=url.searchParams.get('id')?.replace(/^eq\./,'');
 const found=records.filter(x=>(!filt||x.client_id===filt)&&(!id||x.id===id));
 if(method==='GET')return found.map(({id,client_id,measured_at,weight_kg})=>({id,client_id,measured_at,weight_kg}));
 if(method==='POST'){writes++;const record={...body,id:'22222222-2222-4222-8222-'+String(writes).padStart(12,'0')};records.push(record);return [record]}
 if(method==='DELETE'){records=records.filter(x=>x.id!==id);return null}
 throw Error(method);
};
const sandbox={account:uid,ready:true,cloud,progressPhotos:()=>[],localDateKey:()=>'2026-10-11',Date,Number,String,Error,Array};
vm.runInNewContext(html.slice(start,end),sandbox);
(async()=>{
 let rows=await sandbox.__pxListWeightCheckins();
 assert.equal(rows.length,1);
 assert.equal(rows[0].weight,80);
 const input={id:'local_weight_stable',date:'2026-10-11',weight:79.7,note:'testing'};
 const a=await sandbox.__pxSaveWeightCheckin(input);
 const b=await sandbox.__pxSaveWeightCheckin(input);
 assert.equal(a.id,b.id,'retry must return same row');
 assert.equal(writes,1,'retry must not add a duplicate');
 assert.equal(records.find(x=>x.id===existing.id)?.weight_kg,80,'legacy record must be untouched');
 rows=await sandbox.__pxListWeightCheckins();
 assert.equal(rows.length,2);
 await sandbox.__pxDeleteWeightCheckin(a.id);
 rows=await sandbox.__pxListWeightCheckins();
 assert.equal(rows.length,1);
 assert.equal(records[0].id,existing.id);
 console.log('PASS: Weight Check-ins read / create / retry / delete without modifying existing records');
})().catch(e=>{console.error(e);process.exitCode=1});
