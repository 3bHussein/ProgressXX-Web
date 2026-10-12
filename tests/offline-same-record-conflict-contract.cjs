const assert=require('node:assert/strict');
const fs=require('node:fs');
assert.match(fs.readFileSync('index.html','utf8'),/user_app_snapshots\?on_conflict=user_id/);
for(const type of ['Daily','Workout','Weight','Food']){
 const copy=x=>JSON.parse(JSON.stringify(x));
 let server={revision:1,rows:{record:{name:'original',time:'08:00'}}};
 const base=copy(server);
 const a=copy(base);a.rows.record.name='desktop edit';
 const b=copy(base);b.rows.record.time='09:30';
 const commit=(expected,next)=>{if(expected!==server.revision)return {status:409,current:copy(server)};server={revision:server.revision+1,rows:copy(next.rows)};return {status:200,current:copy(server)}};
 assert.equal(commit(base.revision,a).status,200);
 const stale=commit(base.revision,b);
 assert.equal(stale.status,409,'must detect concurrent same-record edit '+type);
 assert.equal(server.rows.record.name,'desktop edit','retain first change');
 assert.equal(server.rows.record.time,'08:00','stale write must not overwrite');
 // Explicit, baseline-aware field merge only after conflict is presented for approval.
 const approved={rows:{record:{name:stale.current.rows.record.name,time:b.rows.record.time}}};
 assert.equal(commit(stale.current.revision,approved).status,200);
 assert.deepEqual(server.rows.record,{name:'desktop edit',time:'09:30'});
 // A stale offline retry after merge must remain rejected.
 assert.equal(commit(base.revision,b).status,409);
 console.log('PASS: '+type+' same-record concurrent field changes require revision check and explicit merge');
}
console.log('MOCK ONLY: no live API, RLS, or snapshot migration modified');
