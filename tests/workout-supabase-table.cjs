const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync('index.html','utf8');
const start=html.indexOf(" const WORKOUT_SOURCE_PREFIX='pxlog:'"),end=html.indexOf(" const WEIGHT_CLIENT_PREFIX=",start);
assert.ok(start>0&&end>start,'Workout REST bridge missing');
const account='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const original={source_id:'prior-import',user_id:account,day_name:'OLD',exercise_name:'Historic exercise'};
let records=[original],calls=[];
async function cloud(path,method='GET',body){
 calls.push({path,method,body});
 const url=new URL('https://qa.invalid/rest/v1/'+path);
 const filter=url.searchParams.get('source_id');
 if(method==='GET')return records.filter(x=>!filter||(filter.startsWith('eq.')?x.source_id===filter.slice(3):filter.startsWith('like.')?x.source_id.startsWith(filter.slice(5,-1):true));
 if(method==='POST'){const index=records.findIndex(x=>x.source_id===body.source_id);if(index>=0)records[index]={...records[index],...body};else records.push({...body});return [records.find(x=>x.source_id===body.source_id)]}
 if(method==='DELETE'){records=records.filter(x=>x.source_id!==filter?.slice(3));return null}
 throw Error('Unexpected REST method '+method);
}
const scope={account,ready:true,cloud,workoutQueue:()=>[],data:[],Error,String,Number,Array,Date};
scope.window=scope;
vm.runInNewContext(html.slice(start,end),scope);
(async()=>{
 let listed=await scope.__pxListWorkoutEntries();
 assert.equal(listed.length,0,'Pre-existing unrelated table records must be hidden from new contract');
 const payload={__localId:'local_qasmoke',id:'',day:'Push',exercise:'Bench Press',week:5,date:'2026-10-11',performance:'25*8',status:'Completed',notes:''};
 let a=await scope.__pxSaveWorkoutEntry(payload);
 assert.equal(a.source_id,'pxlog:local_qasmoke');
 await scope.__pxSaveWorkoutEntry(payload);
 assert.equal(records.length,2,'Repeated upsert must not duplicate workout');
 payload.id='local_qasmoke';payload.performance='30*8';
 await scope.__pxSaveWorkoutEntry(payload);
 assert.equal(records.find(x=>x.source_id===a.source_id).raw_performance,'30*8');
 listed=await scope.__pxListWorkoutEntries();
 assert.equal(listed.length,1);
 assert.equal(listed[0].id,'local_qasmoke');
 await scope.__pxDeleteWorkoutEntry('local_qasmoke');
 assert.equal(records.length,1);
 assert.equal(records[0].source_id,'prior-import');
 console.log('PASS: workout list, stable ID, retry, update, delete and pre-existing row protection');
})().catch(e=>{console.error(e);process.exitCode=1});
