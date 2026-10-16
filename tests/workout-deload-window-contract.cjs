'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync('index.html','utf8');
const start=html.indexOf('const PX_DELOAD_BLOCKS=');
const end=html.indexOf('function renderWorkoutSession(){',start);
assert(start>=0&&end>start,'Deload block helper must exist');
const ctx={data:[],normWorkoutText:s=>String(s||'').trim().toLowerCase(),workoutDisplayTime:r=>r.time||'',
  parsePerformanceSets:raw=>String(raw||'').split(',').map(x=>{const n=Number(x.trim().split('*')[0]);return Number.isFinite(n)&&n>0?{weight:n}:{raw:x}})};
vm.createContext(ctx);
vm.runInContext(html.slice(start,end)+'\nthis.deload=suggestedSessionDeload;',ctx);
const row=(week,exercise,performance,day='Chest')=>({week,exercise,performance,day,status:'Completed'});
ctx.data=[row(24,'Bench Press','30*8'),row(25,'Bench Press','37*6'),
 row(26,'Bench Press','20*8'),row(25,'Incline Press','20*10')];
assert.equal(ctx.deload('Chest','Bench Press',25),'','No hint before block');
for(let week=26;week<=30;week++){
 const hint=ctx.deload('Chest','Bench Press',week);
 assert.match(hint,/37 kg/,'Must freeze last pre-deload weight');
 assert.match(hint,/20 kg/,'37kg -> 20kg rounded');
 assert.match(hint,/W26–W30/);
}
assert.equal(ctx.deload('Chest','Bench Press',31),'','Hint must expire after week 30');
assert.match(ctx.deload('Chest','Incline Press',28),/20 kg/,'Separate exercise baseline');
assert.equal(ctx.deload('Legs','Bench Press',28),'','No cross-day leak');
assert.equal(ctx.deload('Chest','Unknown',28),'','No guessed weight');
console.log('Deload window per-exercise contract PASS');
