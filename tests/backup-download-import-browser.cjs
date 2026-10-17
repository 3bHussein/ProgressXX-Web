// Actual root download/file-picker/dialog/reload flow; synthetic browser storage only.
const assert=require('node:assert/strict'),fs=require('node:fs/promises');
const {browserType,engine}=require('./helpers/browser-engine.cjs');
(async()=>{const b=await browserType.launch({headless:true});let external=0;try{
 const context=await b.newContext({viewport:{width:390,height:844},acceptDownloads:true,serviceWorkers:'block'});
 await context.route('**/*',route=>{if(new URL(route.request().url()).hostname==='127.0.0.1')return route.continue();external++;return route.abort()});
 await context.addInitScript(()=>document.addEventListener('DOMContentLoaded',()=>{
  const prefix='qa-browser-restore:';
  window.__pxActiveStore={getItem:k=>localStorage.getItem(prefix+k),setItem:(k,v)=>localStorage.setItem(prefix+k,String(v)),removeItem:k=>localStorage.removeItem(prefix+k)};
  if(!localStorage.getItem(prefix+'fixture-ready')){
   const date=localDateKey();
   const rows={
    [KEY]:[{id:'qa-workout',week:25,day:'Push',exercise:'Bench',performance:'37*8',status:'Completed',date}],
    [FOOD_PRODUCTS_KEY]:[{id:'qa-oats',name:'Oats',servingQty:100,servingUnit:'g',calories:400,protein:12,carbs:60,fat:8}],
    [FOOD_LOG_KEY]:[{id:'qa-food',productId:'qa-oats',name:'Oats',meal:'Breakfast',amount:100,date,time:'09:00',calories:400,protein:12,carbs:60,fat:8}],
    [DAILY_REMINDERS_KEY]:[{id:'qa-reminder',name:'Vitamin',amount:'1 serving',enabled:true,time:'23:59'}],
    [DAILY_DONE_KEY]:{[date]:{'qa-reminder':true}},[WORKOUT_SCHEDULE_KEY]:{mon:'Push',sun:'REST'},
    [PROGRESS_PHOTOS_KEY]:[{id:'qa-weight',date,weight:80,note:'Synthetic'}],
    [NUTRITION_TARGETS_KEY]:{calories:2100,protein:120,carbs:230,fat:60}
   };for(const [key,value]of Object.entries(rows))PXStore.setItem(key,JSON.stringify(value));localStorage.setItem(prefix+'fixture-ready','1');
  }
  // Rehydrate the local-only fixture using the app's own loaders on every real navigation.
  data=loadLocalArray(KEY,[]);foodProducts=loadLocalArray(FOOD_PRODUCTS_KEY,[]);foodLog=loadLocalArray(FOOD_LOG_KEY,[]);
  dailyReminders=loadDailyReminders();mealTemplates=loadLocalArray(MEAL_TEMPLATES_KEY,[]);nutritionTargets=JSON.parse(PXStore.getItem(NUTRITION_TARGETS_KEY)||'{}');
  scheduleDailyStateSync=()=>{};scheduleReminderConfigSync=()=>{};scheduleCloudProfileSync=()=>{};scheduleAutoBackup=()=>{};
  $('pxCommercialGate').hidden=true;wire();rebuild();window.qaRestoreReady=true;
 }));
 const p=await context.newPage(),errors=[],downloads=[];let mode='reject',unexpected=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('download',d=>downloads.push(d));
 p.on('dialog',async d=>{
  if(d.type()==='confirm'&&d.message().startsWith('Restore this ProgressX backup?'))return mode==='accept'?d.accept():d.dismiss();
  if(d.type()==='alert'&&(/Could not restore backup:/.test(d.message())||d.message()==='Full backup restored successfully. ProgressX will reload now.'))return d.accept();
  unexpected.push(d.message());await d.dismiss();
 });
 await p.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>window.qaRestoreReady);
 await p.evaluate(()=>go('settings'));await p.locator('.pxSettingsTile').filter({hasText:'Backup & recovery'}).click();
 const exported=await Promise.all([p.waitForEvent('download'),p.locator('#pxSettingsBackup button[onclick="exportFullBackup()"]').click()]);
 const raw=await fs.readFile(await exported[0].path(),'utf8'),backup=JSON.parse(raw);
 assert.equal(backup.workouts[0].performance,'37*8');assert.equal(backup.food_log[0].amount,100);assert.equal(backup.workout_schedule.mon,'Push');assert.equal(backup.progress_photos[0].weight,80);
 const snapshot=()=>p.evaluate(()=>Object.fromEntries(Object.entries(localStorage).filter(([key])=>key.startsWith('qa-browser-restore:')).sort()));
 const before=await snapshot();let navigations=0;p.on('framenavigated',f=>{if(f===p.mainFrame())navigations++});
 for(const text of ['{bad',JSON.stringify({app:'ProgressX',workouts:[]})]){
  await p.locator('#restoreFullBackupFile').setInputFiles({name:'broken.json',mimeType:'application/json',buffer:Buffer.from(text)});
  await p.waitForFunction(()=>$('restoreFullBackupFile').value==='');assert.deepEqual(await snapshot(),before);assert.equal(navigations,0);assert.equal(downloads.length,1);
 }
 await p.locator('#restoreFullBackupFile').setInputFiles({name:'valid.json',mimeType:'application/json',buffer:Buffer.from(raw)});
 await p.waitForFunction(()=>$('restoreFullBackupFile').value==='');assert.deepEqual(await snapshot(),before);assert.equal(navigations,0);assert.equal(downloads.length,1,'Cancel must not export or overwrite');
 await p.evaluate(()=>{data=[{id:'qa-current',week:1,day:'Rest',exercise:'Current synthetic draft',performance:'5*5'}];PXStore.setItem(KEY,JSON.stringify(data));PXStore.setItem(FOOD_LOG_KEY,'[]');PXStore.setItem(WORKOUT_QUEUE_KEY,'[]');PXStore.setItem(FOOD_LOG_PENDING_KEY,'[]')});
 mode='accept';
 const [safety]=await Promise.all([p.waitForEvent('download'),p.waitForEvent('domcontentloaded'),p.locator('#restoreFullBackupFile').setInputFiles({name:'valid.json',mimeType:'application/json',buffer:Buffer.from(raw)})]);
 await p.waitForFunction(()=>window.qaRestoreReady);
 assert.match(safety.suggestedFilename(),/^progressx-safety-before-restore-/);
 const safetyBackup=JSON.parse(await fs.readFile(await safety.path(),'utf8'));assert.equal(safetyBackup.workouts[0].id,'qa-current','Safety file must hold pre-restore working data');
 const restored=await p.evaluate(()=>({backup:buildFullBackup(),queues:[PXStore.getItem(WORKOUT_QUEUE_KEY),PXStore.getItem(FOOD_LOG_PENDING_KEY)],log:data,food:foodLog}));
 for(const key of ['workouts','food_products','food_log','reminders','reminder_done','workout_schedule','progress_photos','nutrition_targets'])assert.deepEqual(restored.backup[key],backup[key],key+' browser round trip');
 assert.equal(restored.log[0].performance,'37*8');assert.equal(restored.food[0].amount,100);assert.deepEqual(restored.queues,[null,null]);assert.equal(navigations,1);assert.equal(downloads.length,2);
 assert.deepEqual(errors,[]);assert.deepEqual(unexpected,[]);assert.equal(external,0,'No external/auth/database request may leave browser');
 console.log('PASS ['+engine+']: actual root backup Blob download/file upload, invalid/cancel no-write, pre-restore safety download, real reload and local Food/Daily/Workout/Schedule/Weight/target round trip; zero external requests. Synthetic local store, not cloud restore or server authorization.');
 await context.close();
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
