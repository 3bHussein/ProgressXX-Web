const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('index.html','utf8');
const a=source.indexOf('function safeProgressXXRender(');
const b=source.indexOf('function save(changedRecord=null)',a);
assert.ok(a>0&&b>a);
const order=[],warnings=[],ctx={
 window:{},console:{error:(...args)=>warnings.push(args)},
 currentPage:'home',
 buildFilters:()=>{order.push('filters');throw TypeError("Cannot read properties of undefined (reading 'filter')")},
 renderHome:()=>order.push('home'),renderLog:()=>order.push('log'),renderAnalytics:()=>order.push('analytics'),
 buildEditorDays:()=>order.push('days'),buildExerciseOptions:()=>order.push('exercises'),renderNutritionHome:()=>order.push('nutrition')
};
vm.runInNewContext(source.slice(a,b),ctx);
assert.doesNotThrow(()=>ctx.rebuild());
assert.equal(order.join(','),'filters,home,log,analytics,days,exercises,nutrition');
assert.equal(warnings.length,1);
assert.equal(ctx.window.__pxBootRenderWarnings[0],'Workout filters');
assert.ok(source.includes("if(window.__pxBootRenderWarnings?.length)tell('Signed in"));
console.log('PASS: one broken UI panel cannot abort signed-in account initialization');
