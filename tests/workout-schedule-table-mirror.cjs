const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync('index.html','utf8');
const start=html.indexOf(' const SCHEDULE_ROW_MARKER=');
const end=html.indexOf(' function scheduleCloudSync()',start);
assert.ok(start>0&&end>start,'Schedule mirror code missing');
const account='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const marker='progressxx-weekly-schedule-v1';
let rows=[{id:'legacy',user_id:account,weekday:0,title:'Existing program',notes:null}];
let id=0;
const calls=[];
async function cloud(path,method='GET',payload){
 calls.push({path,method,payload});
 const u=new URL('https://qa.example/rest/v1/'+path);
 if(method==='GET')return rows.filter(r=>r.user_id===account&&r.notes===marker);
 if(method==='POST'){
  rows.push({id:'managed-'+(++id),...payload});
  return [rows.at(-1)];
 }
 const rowid=u.searchParams.get('id')?.replace(/^eq\./,'');
 const row=rows.find(r=>r.id===rowid&&r.user_id===account&&r.notes===marker);
 if(method==='PATCH'&&row){Object.assign(row,payload);return [row]}
 if(method==='DELETE'&&row){rows=rows.filter(r=>r!==row);return null}
 throw Error('Unexpected call: '+method+' '+path);
}
const scope={account,cloud};
vm.runInNewContext(html.slice(start,end)+';globalThis.mirror=mirrorWorkoutScheduleToTable;',scope);
const send=x=>scope.mirror({'progressx-workout-schedule-v1':JSON.stringify(x)});
(async()=>{
 await send({mon:'Push',tue:'REST'});
 assert.equal(rows.length,3);
 assert.equal(rows.find(r=>r.id==='legacy').title,'Existing program');
 assert.equal(rows.find(r=>r.weekday===1).title,'Push');
 await send({mon:'Push',tue:'REST'});
 assert.equal(rows.length,3,'Idempotent retry duplicated rows');
 await send({mon:'Pull'});
 assert.equal(rows.find(r=>r.weekday===1).title,'Pull');
 assert.equal(rows.find(r=>r.weekday===2),undefined,'Removed weekday should delete managed row only');
 await send({});
 assert.deepEqual(rows.map(r=>r.id),['legacy'],'Clearing UI schedule must not delete existing program');
 assert.equal(calls.filter(c=>c.method==='DELETE').length,2);
 await scope.mirror({});
 assert.deepEqual(rows.map(r=>r.id),['legacy'],'Missing schedule snapshot must be no-op');
 console.log('PASS: schedule mirror create, idempotent upsert, edit, delete and legacy preservation');
})().catch(e=>{console.error(e);process.exitCode=1});
