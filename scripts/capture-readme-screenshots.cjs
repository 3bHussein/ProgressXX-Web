// Local documentation capture only. No account, real records or external requests.
// Start `python3 -m http.server 8765 --bind 127.0.0.1`, then run this script.
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true});try{
 const context=await browser.newContext({viewport:{width:430,height:1000},deviceScaleFactor:1,serviceWorkers:'block',reducedMotion:'reduce'});
 await context.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
 await context.addInitScript(()=>{if(location.hostname!=='127.0.0.1')return;const RealDate=Date;window.Date=class extends RealDate{constructor(...args){super(...(args.length?args:['2026-10-25T12:00:00Z']))}static now(){return new RealDate('2026-10-25T12:00:00Z').getTime()}}});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded'});await page.locator('#pxEmail').waitFor();
 await page.evaluate(()=>{
  window.__pxSaveState=()=>({scope:'documentation-demo',ready:false,busy:false,conflict:false,dirty:false,confirmedAt:0});const store=new Map();window.__pxActiveStore={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
  scheduleAutoBackup=()=>{};scheduleCloudProfileSync=()=>{};scheduleDailyStateSync=()=>{};processWorkoutQueue=()=>{};
  syncNutritionFromSheet=async()=>{};syncRemindersFromSheet=async()=>{};syncWeightCheckinsFromSheet=async()=>{};
  apiCall=async()=>{throw Error('Network writes disabled for documentation')};
  const exercises=[['Bench Press (3x8)',60,62.5],['Lat Pulldown (3x10)',45,45],['Leg Press (3x10)',100,100]];
  data=exercises.flatMap(([exercise,old,now],i)=>[21,22].map(week=>({id:'demo-workout-'+i+'-'+week,day:'Full Body',exercise,week,date:week===21?'2026-10-17':'2026-10-24',time:'18:30',status:'Completed',performance:Array(3).fill((week===21?old:now)+'*'+(i===0?8:10)).join(','),notes:''})));
  foodProducts=[{id:'demo-oats',name:'Rolled oats',servingQty:100,servingUnit:'g',calories:380,protein:13,carbs:62,fat:7},{id:'demo-yogurt',name:'Greek yogurt',servingQty:100,servingUnit:'g',calories:70,protein:10,carbs:4,fat:1.5},{id:'demo-chicken',name:'Chicken breast',servingQty:100,servingUnit:'g',calories:165,protein:31,carbs:0,fat:3.6}];
  foodLog=foodProducts.flatMap((p,i)=>['2026-10-24','2026-10-25'].map(date=>{const amount=[60,200,150][i],factor=amount/100;return {id:'demo-food-'+i+'-'+date,productId:p.id,name:p.name,date,time:['08:00','10:30','14:00'][i],meal:['Breakfast','Snack','Lunch'][i],amount,servingQty:100,servingUnit:'g',calories:p.calories*factor,protein:p.protein*factor,carbs:p.carbs*factor,fat:p.fat*factor}}));
  nutritionTargets={calories:2200,protein:160,carbs:240,fat:70};
  dailyReminders=[{id:'demo-habit',name:'Evening walk',amount:'20 minutes',time:'19:00',enabled:true}];
  saveProgressPhotos([['2026-10-12',80.4],['2026-10-14',80.1],['2026-10-16',80.2],['2026-10-19',80],['2026-10-21',79.9],['2026-10-23',79.8]].map(([date,weight],i)=>({id:'demo-weight-'+i,date,weight,createdAt:date+'T08:00:00Z',note:''})));
  PXStore.setItem(WORKOUT_SCHEDULE_KEY,JSON.stringify({[weekdayKey()]:'Full Body'}));
  $('pxCommercialGate').hidden=true;wire();rebuild();$('nutritionDate').value=localDateKey();pxSetUILanguage('en',false);go('home');
 });
 const out=path.resolve(__dirname,'../docs/screenshots');fs.mkdirSync(out,{recursive:true});const shots=[];
 async function capture(name,route,selector,setup){await page.setViewportSize({width:430,height:selector?2200:1000});await page.evaluate(r=>go(r),route);if(setup)await setup();await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Overflow: '+name);const target=selector?page.locator(selector):page;await target.screenshot({path:path.join(out,name+'.jpg'),type:'jpeg',quality:86,animations:'disabled'});shots.push({file:name+'.jpg',route,region:selector||'viewport',viewport:page.viewportSize(),language:await page.evaluate(()=>document.documentElement.lang)})}
 await capture('home-mobile','home');
 await capture('food-mobile','nutrition');
 await capture('food-quick-add','nutrition','#nutrition .nutritionOrderQuick',async()=>page.evaluate(()=>{$('foodQuickProduct').value='demo-oats';$('foodQuickAmount').value='60';updateFoodQuickPreview()}));
 await capture('progress-weekly-review','analytics','#pxWeeklyCoach',async()=>page.evaluate(()=>{$('weeklyReviewWeek').value='22';renderWeeklyReview()}));
 await capture('weight-weekly-trend','analytics','#pxWeeklyWeight');
 await capture('settings-mobile','settings',null,async()=>page.evaluate(()=>pxShowSettingsHome(false)));
 await page.evaluate(()=>pxSetUILanguage('ar',false));await capture('food-quick-add-ar','nutrition','#nutrition .nutritionOrderQuick');
 await page.evaluate(()=>{pxSetUILanguage('en',false);pxSaveFoodPortion('demo-oats','One scoop',30)});await capture('saved-portions','nutrition','#pxPortionTools',async()=>page.evaluate(()=>{$('foodQuickProduct').value='demo-oats';updateFoodQuickPreview();$('pxPortionTools').open=true}));
 await capture('food-batch-move','nutrition','#nutrition .nutritionOrderToday',async()=>page.evaluate(()=>{$('pxFoodBatch').open=true;pxBatchSelection=new Set(['demo-food-0-2026-10-25','demo-food-1-2026-10-25']);pxRenderFoodBatch()}));
 await capture('weekly-share-report','analytics','#pxWeeklyReportDialog',async()=>page.evaluate(()=>pxOpenWeeklyReport()));await page.evaluate(()=>$('pxWeeklyReportDialog').close());
 await page.evaluate(()=>pxSetUILanguage('en',false));await capture('insights-decisions','intelligence','#pxInsightOverview',async()=>page.evaluate(()=>{pxRenderInsightSummary();document.querySelectorAll('#pxInsightOverview details').forEach(d=>d.open=false)}));
 await page.evaluate(()=>pxSetUILanguage('ar',false));await capture('insights-decisions-ar','intelligence','#pxInsightOverview',async()=>page.evaluate(()=>{pxRenderInsightSummary();document.querySelectorAll('#pxInsightOverview details').forEach(d=>d.open=false)}));
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify({source:'index.html',sourceSha256:crypto.createHash('sha256').update(fs.readFileSync(path.resolve(__dirname,'../index.html'))).digest('hex'),fixtureDate:'2026-10-25',viewport:{width:430,height:1000},data:'Synthetic in-memory demonstration. No login or production data. External requests blocked.',screenshots:shots},null,2)+'\n');
 console.log('Captured '+shots.length+' actual root UI screenshots with synthetic in-memory fixtures; no account login or production writes.');
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
