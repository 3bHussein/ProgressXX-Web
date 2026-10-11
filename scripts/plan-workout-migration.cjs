'use strict';
/**
 * Read-only migration plan for historical Workout Log snapshots.
 * Pure logic: this file never performs database writes or contacts a server.
 */
function planWorkoutMigration(snapshot, existingSourceIds=[], batchSize=100) {
  const payload=snapshot&&typeof snapshot==='object'&&!Array.isArray(snapshot)?snapshot:{};
  const decode=(key)=>{
    const raw=payload[key];
    if(raw==null)return [];
    let list;
    try{list=typeof raw==='string'?JSON.parse(raw):raw}catch{throw Error('Malformed snapshot '+key)}
    if(!Array.isArray(list))throw Error('Snapshot '+key+' must be an array');
    return list;
  };
  if(!Number.isInteger(batchSize)||batchSize<1||batchSize>500)throw Error('Invalid batch size');
  const rows=decode('progressx-data-v19');
  const deleted=new Set(decode('progressx-workout-deleted-ids-v1').map(String));
  const existing=new Set(existingSourceIds.map(String));
  const seen=new Set();
  const batches=[];
  const stats={total:rows.length,eligible:0,deleted:0,alreadySynced:0,duplicates:0,invalid:0};
  let batch=[];
  for(const r of rows){
    if(!r||typeof r!=='object'){stats.invalid++;continue}
    const id=String(r.id??'').trim();
    if(!id||id.length>250||!String(r.exercise||'').trim()){stats.invalid++;continue}
    if(deleted.has(id)){stats.deleted++;continue}
    const source='pxlog:'+id;
    if(seen.has(source)){stats.duplicates++;continue}
    seen.add(source);
    if(existing.has(source)){stats.alreadySynced++;continue}
    const row={
      source_id:source,day_name:String(r.day||''),exercise_name:String(r.exercise||''),
      week_number:Number(r.week)||null,original_date:String(r.date||''),original_time:String(r.time||''),
      raw_performance:String(r.performance||''),status:String(r.status||''),notes:String(r.notes||'')
    };
    batch.push(row);stats.eligible++;
    if(batch.length===batchSize){batches.push(batch);batch=[]}
  }
  if(batch.length)batches.push(batch);
  return {stats,batches,sourceIds:[...seen]};
}
module.exports={planWorkoutMigration};
