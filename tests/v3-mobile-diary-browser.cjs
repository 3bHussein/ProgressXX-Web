const assert=require('node:assert/strict'),{browserType,engine}=require('./helpers/browser-engine.cjs');
(async()=>{const b=await browserType.launch({headless:true});let external=0;try{
const p=await b.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[];
p.on('pageerror',e=>errors.push(e.message));await p.route('**/*',r=>{if(new URL(r.request().url()).hostname==='127.0.0.1')return r.continue();external++;return r.abort()});
await p.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded'});await p.locator('#pxEmail').waitFor({state:'visible'});
await p.evaluate(()=>{
 const m=new Map();window.__pxActiveStore={getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)};
 $('pxCommercialGate').hidden=true;data=[];foodProducts=[{id:'v3-oats',name:'Oats',servingQty:100,servingUnit:'g',calories:400,protein:12,carbs:60,fat:8}];
 foodLog=[{id:'v3-food',name:'Oats',productId:'v3-oats',date:localDateKey(),meal:'Breakfast',amount:100,calories:400,protein:12,carbs:60,fat:8}];nutritionTargets={calories:2000,protein:120,carbs:240,fat:60};
 dailyReminders=[{id:'v3-daily',name:'Vitamin',amount:'1 serving',time:'09:00',enabled:true}];scheduleDailyStateSync=()=>{};scheduleAutoBackup=()=>{};scheduleCloudProfileSync=()=>{};
 $('nutritionDate').value=localDateKey();window.qaOriginalFood=JSON.stringify(foodLog);renderNutrition();go('nutrition');
});
assert.equal(await p.locator('#nutrition .nutritionHero').evaluate(e=>getComputedStyle(e).gridTemplateColumns.split(' ').length),3,'Three macro columns on mobile');
assert.equal(await p.locator('#pxCaloriesRemaining').textContent(),'1600');assert.equal(await p.locator('#pxCalorieFood').textContent(),'400');assert.equal(await p.locator('#foodDiaryList .foodMealGroup').count(),4);
for(const meal of ['Breakfast','Lunch','Dinner','Snack']){
 const group=p.locator('.foodMealGroup').filter({hasText:meal==='Snack'?'Snacks':meal});await group.getByRole('button',{name:'＋ Add food',exact:true}).click();assert.equal(await p.locator('#foodQuickMeal').inputValue(),meal);assert.equal(await p.locator('#foodQuickProduct').evaluate(e=>e===document.activeElement),true);
}
await p.getByRole('button',{name:'Search food library',exact:true}).click();assert.equal(await p.locator('#foodSearch').evaluate(e=>e===document.activeElement),true);
await p.evaluate(()=>{nutritionTargets.calories=100;renderNutrition()});assert.equal(await p.locator('#pxCaloriesRemaining').textContent(),'-300');
await p.evaluate(()=>{nutritionTargets.calories=0;renderNutrition()});assert.equal(await p.locator('#pxCaloriesRemaining').textContent(),'—');
await p.evaluate(()=>{nutritionTargets.calories=2000;renderNutrition();go('daily');renderDaily()});
assert.equal(await p.locator('#daily .statGrid').evaluate(e=>getComputedStyle(e).display),'grid');
assert.equal(await p.locator('#pxDailyWeek button').count(),7);assert.equal(await p.locator('#pxDailyWeek [aria-current="date"]').count(),1);
assert.equal(await p.locator('#pxDailyWeek button').evaluateAll(es=>new Set(es.map(e=>e.getAttribute('aria-label'))).size),7,'Seven distinct local calendar dates');
const done=p.locator('#dailyReminderGrid .reminderTop button');await done.click();assert.equal(await done.getAttribute('aria-pressed'),'true');assert.equal(await p.locator('.pxDailyProgress').getAttribute('aria-valuenow'),'100');await done.click();assert.equal(await done.getAttribute('aria-pressed'),'false');
assert.equal(await p.locator('.pxReminderEdit input').first().isVisible(),false);await p.locator('.pxReminderEdit summary').click();await p.locator('.pxReminderEdit input').first().fill('Vitamin updated');await p.locator('.pxReminderEdit input').first().press('Tab');assert.equal(await p.locator('.reminderName').textContent(),'Vitamin updated');
await p.evaluate(()=>{go('settings');pxShowSettingsHome(false)});
assert.equal(await p.locator('.pxSettingsTile').count(),5);assert.equal(await p.locator('#pxSettingsSyncCenter').count(),0);assert.equal(await p.locator('#appScriptUrl').count(),0);
await p.locator('.pxSettingsTile').filter({hasText:'Account & sync'}).click();await p.locator('#pxSettingsRecovery > summary').click();assert.equal(await p.locator('#syncCenterWorkout').isVisible(),true);
await p.evaluate(()=>{pxShowSettingsHome(false)});await p.locator('.pxSettingsTile').filter({hasText:'Backup & recovery'}).click();assert.equal(await p.locator('#pxSettingsSnapshots').isVisible(),true);assert.equal(await p.locator('#pxSettingsHealth').isVisible(),true);assert.equal(await p.locator('#pxSettingsRepair').isVisible(),true);
for(const lang of ['en','ar'])for(const width of [320,390,768,1280]){
 await p.setViewportSize({width,height:900});await p.evaluate(lang=>pxSetUILanguage(lang),lang);
 for(const section of ['nutrition','daily','settings']){await p.evaluate(id=>{go(id);if(id==='settings')pxShowSettingsHome(false)},section);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${lang} ${section} ${width} overflow`);}
}
await p.evaluate(()=>pxSetUILanguage('en'));
const deload=await p.evaluate(()=>{
 const previous=data,week=activeWeek;try{
 data=[{id:'bench-base',week:25,day:'Push',exercise:'Bench',status:'Completed',performance:'37*8'},{id:'press-base',week:25,day:'Push',exercise:'Press',status:'Completed',performance:'20*10'},{id:'saved-deload',week:26,day:'Push',exercise:'Bench',status:'Completed',performance:'22.5*10'}];
 const before=JSON.stringify(data);PXStore.setItem(WORKOUT_SCHEDULE_KEY,JSON.stringify({mon:'Push'}));activeWeek=()=>26;renderWorkoutSchedule();const schedule=$('pxScheduleDeload').textContent;const card=compactWorkoutCard(data[2]);activeWeek=()=>31;renderWorkoutSchedule();
 return {schedule,card,hidden:$('pxScheduleDeload').hidden,unchanged:before===JSON.stringify(data)};
 }finally{data=previous;activeWeek=week;}
});
assert.match(deload.schedule,/Bench.*37 kg/);assert.match(deload.schedule,/Press.*20 kg/);assert.match(deload.card,/22\.5\*10/);assert.match(deload.card,/last working load 37 kg/);assert(deload.hidden&&deload.unchanged,'Deload guidance hides after cycle without changing saved sets');
assert.equal(await p.evaluate(()=>JSON.stringify(foodLog)===qaOriginalFood),true);assert.deepEqual(errors,[]);assert.equal(external,0,'No external or production requests');
console.log('PASS ['+engine+']: calorie arithmetic/zero target/over-goal, four meal add paths, search focus, Daily completion/edit/week dates, recovery reachability, EN/AR 320–1280px and immutable Food fixture; zero external requests');
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
