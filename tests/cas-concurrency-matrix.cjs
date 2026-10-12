'use strict';
const assert=require('node:assert/strict'), clone=structuredClone;
function server(initial){let revision=0,data=clone(initial);return {read:()=>({revision,data:clone(data)}),write(expected,next){if(expected!==revision)return {status:409,snapshot:this.read()};data=clone(next);revision++;return {status:200,snapshot:this.read()}}}}
const cases=[
['Daily deletion vs Food edit',{daily:{alarm:{id:'alarm'}},food:{lunch:'old'}},s=>delete s.daily.alarm,s=>s.food.lunch='new','food','daily','alarm'],
['Food deletion vs Weight edit',{food:{snack:{id:'snack'}},weight:{value:80}},s=>delete s.food.snack,s=>s.weight.value=79,'weight','food','snack'],
['Workout deletion vs Daily edit',{workout:{monday:{id:'monday'}},daily:{sleep:'ok'}},s=>delete s.workout.monday,s=>s.daily.sleep='great','daily','workout','monday'],
['Weight deletion vs Workout edit',{weight:{checkin:{id:'checkin'}},workout:{tuesday:'Rest'}},s=>delete s.weight.checkin,s=>s.workout.tuesday='Train','workout','weight','checkin']
];
for(const [name,initial,remove,edit,changed,deleted,id] of cases){
 const remote=server(initial),a=remote.read(),b=remote.read(),deletedDraft=clone(a.data),pending=clone(b.data);
 remove(deletedDraft); edit(pending);
 assert.equal(remote.write(a.revision,deletedDraft).status,200);
 const before=clone(pending),rejected=remote.write(b.revision,pending);
 assert.equal(rejected.status,409,name);
 assert.deepEqual(pending,before,'409 must retain pending changes');
 assert.equal(rejected.snapshot.data[deleted][id],undefined);
 const reviewed=clone(rejected.snapshot.data);reviewed[changed]=clone(pending[changed]);
 assert.equal(remote.write(rejected.snapshot.revision,reviewed).status,200);
 assert.equal(remote.read().data[deleted][id],undefined,'review cannot resurrect deleted data');
 assert.deepEqual(remote.read().data[changed],pending[changed]);
 assert.equal(remote.write(b.revision,pending).status,409,'stale replay rejected');
 assert.equal(remote.read().data[deleted][id],undefined);
 console.log('PASS: '+name);
}
const remote=server({daily:{note:'base'}}),base=remote.read(),a=clone(base.data),b=clone(base.data);
a.daily.note='phone';b.daily.note='desktop';
assert.equal(remote.write(base.revision,a).status,200);
assert.equal(remote.write(base.revision,b).status,409);
assert.equal(remote.read().data.daily.note,'phone');
console.log('PASS: same-version concurrent writes reject the stale writer');
console.log('SYNTHETIC ONLY: no live CAS, RLS, or production sync protection.');
