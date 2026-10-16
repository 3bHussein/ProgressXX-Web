const fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm');
const html=fs.readFileSync('index.html','utf8');
const start=html.indexOf('function pxWorkoutTimestamp('),end=html.indexOf('function filtered()',start);
assert(start>=0&&end>start,'Workout chronology functions missing');
const ctx={workoutDisplayTime:r=>r.time||'',console};
vm.runInNewContext(html.slice(start,end)+';globalThis.sorter=pxWorkoutChronological;',ctx);
const logs=[{date:'2026-10-15',time:'09:00',week:25},{date:'2026-10-16',time:'08:00',week:26},{date:'2026-10-16',time:'21:00',week:26}];
logs.sort(ctx.sorter);
assert.deepEqual(logs.map(r=>r.time),['21:00','08:00','09:00'],'Newest actual timestamp must win');
const undated=Array.from({length:60},(_,i)=>({week:1,id:'keyboard-'+i,exercise:'Bench '+i}));
undated.sort(ctx.sorter);
assert.equal(undated[48].exercise,'Bench 48','Undated same-week rows must retain stable keyboard pagination order');
const dstart=html.indexOf('function pxDeloadAdvice('),dend=html.indexOf('function prefillLastPerformance()',dstart);
assert(dstart>=0&&dend>dstart,'Deload functions missing');
const scope={data:[{week:25,exercise:'Bench',status:'Completed',performance:'37 kg x 8'}],normWorkoutText:x=>String(x).toLowerCase(),parsePerformanceSets:()=>[{weight:37}],pxWorkoutChronological:ctx.sorter};
vm.runInNewContext(html.slice(dstart,dend)+';globalThis.advice=pxDeloadAdvice;',scope);
for(const week of [26,27,28,29,30]){const v=scope.advice('Bench',week);assert(v&&v.base===37&&v.start===26&&v.end===30,'Expected fixed W26-30 guidance');}
assert.equal(scope.advice('Bench',25),null);
assert.equal(scope.advice('Bench',31),null);
assert.equal(scope.advice('Bench',35),null);
scope.data=[{week:35,exercise:'Bench',status:'Completed',performance:'45 kg x 6'}];
for(const week of [36,37,38,39,40]){const v=scope.advice('Bench',week);assert(v&&v.base===45&&v.start===36&&v.end===40,'Expected recurring W36-40 guidance');}
assert.equal(scope.advice('Bench',41),null);
assert.equal(scope.advice('Squat',36),null,'Do not reuse Bench load for another exercise');
scope.data=[{week:35,exercise:'Bench',status:'Skipped',performance:'45 kg x 6'}];
assert.equal(scope.advice('Bench',36),null,'Skipped exercise cannot be a load baseline');
scope.data=[{week:45,exercise:'Bench',status:'Completed',performance:'50 kg x 5'}];
for(const week of [46,47,48,49,50]){const v=scope.advice('Bench',week);assert(v&&v.base===50&&v.start===46&&v.end===50,'Expected recurring W46-50 guidance');}
assert.equal(scope.advice('Bench',51),null,'Hint must disappear immediately after deload');
scope.data=[{week:45,exercise:'Bench',status:'Completed',performance:'bodyweight'}];
assert.equal(scope.advice('Bench',46),null,'Missing positive numeric working load must not generate a weight recommendation');
console.log('PASS: date/time order, undated keyboard stability, per-exercise W26-W30/W36-W40/W46-W50 deload boundaries and skipped-history safety');
