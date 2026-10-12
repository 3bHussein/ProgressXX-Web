const assert=require('node:assert/strict');
function mockServer(initial={}){
 let payload={...initial},version=0;
 return {
  get:()=>({version,payload:{...payload}}),
  compareAndSwap:(expected,next)=>{
   if(expected!==version)return {status:409,current:{version,payload:{...payload}}};
   payload={...next};version++;return {status:200,version};
  }
 };
}
function client(server){let base=server.get(),pending={};return {
 edit:(k,v)=>{pending[k]=v},
 sync:()=>{
  let result=server.compareAndSwap(base.version,{...base.payload,...pending});
  if(result.status===409){
   const latest=result.current;
   // A conflict is never silently overwritten: require explicit user review before retry.
   return {status:'conflict',localChanges:{...pending},remote:latest,canAutoOverwrite:false};
  }
  base=server.get();pending={};return {status:'synced'};
 },
 refreshAfterReview:(reviewed)=>{base=server.get();pending={...reviewed}},
 pending:()=>({...pending})
 }}
const server=mockServer({daily:'original',workout:'old'});
const laptop=client(server),phone=client(server);
laptop.edit('daily','deleted');assert.equal(laptop.sync().status,'synced');
phone.edit('workout','new');const conflict=phone.sync();
assert.equal(conflict.status,'conflict');
assert.deepEqual(conflict.localChanges,{workout:'new'});
assert.equal(conflict.remote.payload.daily,'deleted');
assert.equal(conflict.canAutoOverwrite,false);
assert.equal(server.get().payload.daily,'deleted');
phone.refreshAfterReview(conflict.localChanges);
assert.equal(phone.sync().status,'synced');
assert.deepEqual(server.get().payload,{daily:'deleted',workout:'new'});
console.log('PASS: synthetic 409 conflict preserves local edits, blocks blind overwrite and permits reviewed retry');
console.log('NOT IMPLEMENTED: server CAS and real UI conflict review are release blockers.');
