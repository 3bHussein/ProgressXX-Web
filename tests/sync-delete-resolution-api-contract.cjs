const assert=require('node:assert/strict');
const fs=require('node:fs');
assert.match(fs.readFileSync('index.html','utf8'),/user_app_snapshots\?on_conflict=user_id/,'Reevaluate contract when live write protocol changes');
// Mock API contract only; no connection to production, no migration applied.
const deep=x=>JSON.parse(JSON.stringify(x));
for(const type of ['Daily','Workout','Weight','Food']){
 let server={revision:1,owner:'account-A',rows:[{id:'x1',label:type}]};
 const state=()=>deep(server);
 function mutate({owner,expected,op,id,value}){
  if(owner!==server.owner)return {status:403,error:'wrong owner'};
  if(expected!==server.revision)return {status:409,error:'stale revision',current:state()};
  if(op==='delete')server.rows=server.rows.filter(row=>row.id!==id);
  if(op==='restore'&&!server.rows.some(row=>row.id===id))server.rows.push({id,value});
  server.revision++;
  return {status:200,current:state()};
 }
 const base=state();
 const deleted=mutate({owner:'account-A',expected:base.revision,op:'delete',id:'x1'});
 assert.equal(deleted.status,200);
 assert.deepEqual(deleted.current.rows,[]);
 assert.equal(mutate({owner:'account-A',expected:base.revision,op:'restore',id:'x1',value:'stale'}).status,409,'stale restore must conflict: '+type);
 assert.deepEqual(server.rows,[],'stale restore must not recreate record');
 assert.equal(mutate({owner:'account-B',expected:server.revision,op:'restore',id:'x1',value:'intruder'}).status,403,'wrong-owner write blocked');
 assert.deepEqual(server.rows,[],'wrong-owner write must not mutate records');
 const approved=mutate({owner:'account-A',expected:server.revision,op:'restore',id:'x1',value:'approved'});
 assert.equal(approved.status,200,'explicit current-version restore');
 assert.equal(server.rows[0].value,'approved');
 assert.equal(mutate({owner:'account-A',expected:approved.current.revision-1,op:'delete',id:'x1'}).status,409,'stale delete must not undo restore');
 assert.equal(server.rows.length,1);
 console.log('PASS: '+type+' stale restore/delete 409, cross-account 403, explicit restore only on current revision');
}
console.log('MOCK CONTRACT ONLY: production API not changed or security-certified.');
