// Execute the actual root app exporter/restore boundary in a disposable VM store.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('index.html','utf8');
const keys=['KEY','WORKOUT_TEMPLATES_KEY','DAILY_REMINDERS_KEY','DAILY_DONE_KEY','DAILY_DONE_TIME_KEY','DAILY_HISTORY_KEY','DAILY_WATER_KEY','FOOD_PRODUCTS_KEY','FOOD_LOG_KEY','MEAL_TEMPLATES_KEY','MEAL_PLANNER_KEY','FOOD_TIME_META_KEY','FOOD_FAVORITES_KEY','NUTRITION_TARGETS_KEY','TDEE_PROFILE_KEY','PROGRESS_PHOTOS_KEY','WEIGHT_GOAL_KEY','REST_DAY_KEY','BODY_MEASUREMENTS_KEY','WORKOUT_SCHEDULE_KEY','GOAL_CENTER_KEY','V2_CHECKIN_KEY','V2_MUSCLE_OVERRIDE_KEY','DAILY_LAST_DATE_KEY','REST_TIMER_DEFAULT_KEY','WORKOUT_QUEUE_KEY','FOOD_LOG_PENDING_KEY'];
const store=new Map(),downloads=[],alerts=[];let consent=true,reloads=0;
const ctx={JSON,Date,Number,String,Array,Object,Error,APP_VERSION:'test',data:[{id:'synthetic-workout',week:25,performance:'37*8'}],foodProducts:[{id:'synthetic-product',servingQty:100}],foodLog:[{id:'synthetic-food',meal:'Lunch',amount:150}],dailyReminders:[{id:'synthetic-reminder',enabled:true}],mealTemplates:[],nutritionTargets:{calories:2100},clone:structuredClone,
 PXStore:{getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)},
 $:()=>null,download:(name,raw)=>downloads.push({name,raw}),confirm:()=>consent,alert:msg=>alerts.push(msg),location:{reload:()=>reloads++},
 workoutTemplates:()=>[{id:'synthetic-template'}],dailyDoneMap:()=>({'2026-10-17':{'synthetic-reminder':true}}),dailyDoneTimeMap:()=>({}),dailyHistoryMap:()=>({'2026-10-17':{done:1}}),getWaterState:()=>({current:1,target:3}),mealPlanner:()=>[],foodTimeMeta:()=>({byId:{},byKey:{}}),foodFavoriteIds:()=>[],loadTdeeProfile:()=>null,progressPhotos:()=>[{id:'synthetic-weight',weight:80}],weightGoal:()=>75,restDayMap:()=>({}),bodyMeasurements:()=>[],workoutSchedule:()=>({mon:'Push'}),progressGoals:()=>[],v2Checkins:()=>({}),v2MuscleOverrides:()=>({})};
keys.forEach(k=>ctx[k]=k);store.set('theme','dark');store.set('auth-token','must-not-be-exported');
vm.createContext(ctx);vm.runInContext(source.slice(source.indexOf('function buildFullBackup(){'),source.indexOf('function resetData(){')),ctx);
(async()=>{
 ctx.exportFullBackup();assert.equal(downloads.length,1);const raw=downloads[0].raw,backup=JSON.parse(raw);
 assert(!raw.includes('must-not-be-exported'));assert.equal(backup.food_log[0].amount,150);assert.equal(backup.workout_schedule.mon,'Push');
 const exported=JSON.stringify(backup),before=[...store];
 async function restore(text){const input={files:[{text:async()=>text}],value:'test.json'};await ctx.restoreFullBackup({target:input});assert.equal(input.value,'');}
 consent=false;await restore(raw);assert.deepEqual([...store],before);assert.equal(downloads.length,1);assert.equal(reloads,0);
 consent=true;await restore('{invalid');assert.deepEqual([...store],before);assert.equal(reloads,0);
 store.clear();store.set('WORKOUT_QUEUE_KEY','stale');store.set('FOOD_LOG_PENDING_KEY','stale');await restore(raw);
 assert.equal(downloads.length,2);assert.match(downloads[1].name,/safety-before-restore/);assert.equal(reloads,1);
 for(const [key,value] of Object.entries({KEY:backup.workouts,DAILY_REMINDERS_KEY:backup.reminders,DAILY_DONE_KEY:backup.reminder_done,DAILY_HISTORY_KEY:backup.daily_history,FOOD_PRODUCTS_KEY:backup.food_products,FOOD_LOG_KEY:backup.food_log,NUTRITION_TARGETS_KEY:backup.nutrition_targets,PROGRESS_PHOTOS_KEY:backup.progress_photos,WORKOUT_SCHEDULE_KEY:backup.workout_schedule}))assert.deepEqual(JSON.parse(store.get(key)),value,key);
 assert.equal(store.get('theme'),'dark');assert(!store.has('WORKOUT_QUEUE_KEY'));assert(!store.has('FOOD_LOG_PENDING_KEY'));assert.equal(JSON.stringify(backup),exported);assert.equal(ctx.data[0].performance,'37*8');
 console.log('PASS: actual root export/restore functions; synthetic Food/Daily/Workout/Schedule/Weight round trip, cancelled/invalid no writes, safety export, clean queues, unchanged source and no auth tokens. VM only; no production DB or browser-account restore.');
})().catch(e=>{console.error(e);process.exitCode=1});
