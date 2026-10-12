const assert=require('node:assert/strict');
function server(initial){let state={...initial},revision=0;return {read:()=>({revision,state:structuredClone(state)}),write:(expected,next)=>{if(expected!==revision)return {status:409,current:{revision,state:structuredClone(state)}};state=structuredClone(next);revision++;return {status:200,revision}}}}
function device(remote){let base=remote.read(),draft=null;return {edit(fn){draft=fn(structuredClone(base.state))},commit(){const result=remote.write(base.revision,draft);if(result.status===200){base=remote.read();draft=null}return result},pending:()=>structuredClone(draft),refresh(){base=remote.read()},stage(next){draft=structuredClone(next)},base:()=>structuredClone(base)}}
const backend=server({daily:{water:{id:'water',text:'Drink water'}},workout:{monday:'Rest'}});
const phone=device(backend),desktop=device(backend);
phone.edit(state=>{delete state.daily.water;return state});assert.equal(phone.commit().status,200);
desktop.edit(state=>{state.workout.monday='Gym';return state});
const stale=desktop.commit();assert.equal(stale.status,409,'Old snapshot must be rejected');
assert.ok(desktop.pending().daily.water,'Local draft must survive rejection until reviewed');
assert.equal(backend.read().state.daily.water,undefined,'Remote deletion must remain deleted');
const latest=stale.current.state;const reviewed={...latest,workout:{...latest.workout,monday:'Gym'}};
desktop.refresh();desktop.stage(reviewed);assert.equal(desktop.commit().status,200);
assert.equal(backend.read().state.daily.water,undefined,'Review must not resurrect remotely deleted Daily');
assert.equal(backend.read().state.workout.monday,'Gym');
const repeated=backend.write(0,{daily:{water:{id:'water'}}});assert.equal(repeated.status,409,'Repeated stale write must not undo confirmed review');
console.log('PASS: synthetic CAS rejects stale offline edit, preserves pending, and keeps remote deletion after reviewed unrelated edit');
console.log('NOT PRODUCTION PROOF: server CAS and real Supabase acceptance still not deployed.');
