// UI-only mobile acceptance across every route; synthetic storage, no remote account.
const assert=require('node:assert/strict'),fs=require('node:fs');
const {browserType,engine}=require('./helpers/browser-engine.cjs');
(async()=>{const b=await browserType.launch({headless:true});try{
 const context=await b.newContext({viewport:{width:390,height:844},serviceWorkers:'block',reducedMotion:'reduce'});let backend=0;
 await context.route('**/*',r=>{if(new URL(r.request().url()).hostname==='127.0.0.1')return r.continue();if(/supabase/.test(r.request().url()))backend++;return r.abort()});
 const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded'});
 await p.locator('#pxMobilePageTitle').waitFor();
 assert.equal(await p.locator('#pxEmail').evaluate(el=>el.labels.length),1);assert.equal(await p.locator('#pxPassword').evaluate(el=>el.labels.length),1);
 assert((await p.locator('#pxSignin').boundingBox()).height>=44);assert((await p.locator('.pxAuthBox').boundingBox()).width<=390);
 await p.evaluate(()=>{
  const m=new Map();window.__pxActiveStore={getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)};
  data=Array.from({length:8},(_,i)=>({id:'qa-workout-'+i,exercise:'Exercise '+(i+1),day:'QA training day',week:22,date:'2026-10-20',performance:'25*10,30*8 machine',notes:'Synthetic form and grip note',status:'Completed',time:'18:00'}));
  foodProducts=Array.from({length:12},(_,i)=>({id:'qa-food-'+i,name:'Food '+i,servingQty:100,servingUnit:'g',calories:200,protein:10,carbs:20,fat:8}));
  foodLog=[{id:'qa-entry',productId:'qa-food-0',name:'Food 0',meal:'Lunch',date:localDateKey(),time:'12:00',amount:100,servingQty:100,servingUnit:'g',calories:200,protein:10,carbs:20,fat:8}];
  dailyReminders=[{id:'qa-reminder',name:'Daily reminder',amount:'1 serving',time:'09:00',enabled:true}];
  saveProgressPhotos([{id:'local_qa-weight',date:'2026-10-20',weight:80,note:'Synthetic note',_pending:true}]);
  PXStore.setItem(KEY,JSON.stringify(data));PXStore.setItem(FOOD_PRODUCTS_KEY,JSON.stringify(foodProducts));PXStore.setItem(FOOD_LOG_KEY,JSON.stringify(foodLog));
  syncNutritionFromSheet=async()=>{};syncRemindersFromSheet=async()=>{};syncWeightCheckinsFromSheet=async()=>{};processWorkoutQueue=()=>{};scheduleAutoBackup=()=>{};scheduleCloudProfileSync=()=>{};
  $('pxCommercialGate').hidden=true;wire();rebuild();
  window.qaData=JSON.stringify({data,foodProducts,foodLog,weights:progressPhotos()});
 });
 const pages=['home','log','analytics','nutrition','daily','calculators','intelligence','settings'];
 const snapshotDir=process.env.PX_MOBILE_SCREENSHOTS;if(snapshotDir)fs.mkdirSync(snapshotDir,{recursive:true});
 for(const language of ['en','ar']){
  await p.evaluate(language=>pxSetUILanguage(language),language);
  for(const width of [320,390,768]){await p.setViewportSize({width,height:844});
   for(const id of pages){
    const nav=p.locator('.bottomNav [data-page="'+id+'"]');await nav.focus();await p.keyboard.press('Enter');
    assert.equal(await p.locator('.section.active').getAttribute('id'),id);
    assert.equal(await nav.getAttribute('aria-current'),'page');
    assert.equal(await p.locator('#pxMobilePageTitle').isVisible(),true);assert((await p.locator('#pxMobilePageTitle').textContent()).trim().length>0);
    const geometry=await p.locator('.bottomNav').evaluate(el=>{const r=el.getBoundingClientRect();return {top:r.top,bottom:r.bottom,scroll:el.scrollWidth,width:el.clientWidth,buttons:[...el.querySelectorAll('button')].map(b=>{const r=b.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,right:r.right}})}});
    assert.equal(geometry.buttons.length,8);assert(geometry.scroll<=geometry.width+1,'All destinations must be visible without nav scrolling');assert(geometry.buttons.every(r=>r.x>=0&&r.right<=width+1&&r.w>=44&&r.h>=44&&r.y>=geometry.top),'Thumb targets '+id+' '+width);
    assert.equal(new Set(geometry.buttons.map(r=>Math.round(r.y))).size,2,'Two visible navigation rows');
    assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),id+' '+language+' overflow '+width);
    if(id==='intelligence'){const top=await p.locator('#intelligence').evaluate(el=>el.getBoundingClientRect().top);assert(top<330,'Insights must not have an empty app padding gap');}
    if(id==='settings')assert.equal(await p.locator('.pxSettingsTile').first().isVisible(),true);
    if(snapshotDir&&width===390)await p.screenshot({path:snapshotDir+'/'+language+'-'+id+'.png'});
   }
  }
 }
 await p.setViewportSize({width:390,height:844});await p.evaluate(()=>pxSetUILanguage('en'));await p.locator('.bottomNav [data-page="settings"]').click();assert.equal(await p.locator('#settings').isVisible(),true);await p.locator('.bottomNav [data-page="calculators"]').click();
 assert.equal(await p.locator('#pxCalculatorShortcuts button').count(),10);
 await p.locator('#pxCalculatorShortcuts button').filter({hasText:'1RM estimator'}).click();
 assert((await p.locator('#pxCalcCard2').boundingBox()).y>=0);assert((await p.locator('#pxCalcCard2').boundingBox()).y<100,'Jump scrolls directly to the calculator');
 assert.equal(await p.locator('#rWeight').getAttribute('id'),'rWeight');assert(await p.locator('#rWeight').evaluate(el=>el.labels.length>0),'Filled calculator inputs retain visible labels');
 await p.locator('#rWeight').fill('50');await p.locator('#rReps').fill('8');await p.locator('[onclick="calc1RM()"]').click();assert.match(await p.locator('#rResult').textContent(),/62\.7/);
 await p.evaluate(()=>{go('log');openEditor()});assert.equal(await p.locator('#editorWrap').isVisible(),true);
 const editor=await p.locator('#editorWrap .modal').boundingBox();assert(editor.x>=0&&editor.x+editor.width<=390&&editor.height<=844);
 await p.evaluate(()=>closeEditor());
 await p.evaluate(()=>{go('log');workoutSession={day:'QA training day',week:22,date:'2026-10-24',exercises:['Exercise 1'],index:0,startedAt:new Date().toISOString()};$('workoutSessionOverlay').classList.add('show');$('sessionBody').classList.remove('hide');$('sessionDayPickerWrap').classList.add('hide');renderWorkoutSession()});
 assert.equal(await p.locator('#pxSessionAddSet').isVisible(),true);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await p.evaluate(()=>closeWorkoutSession());
 for(const theme of ['light','dark']){await p.evaluate(theme=>document.documentElement.dataset.theme=theme,theme);for(const id of pages){await p.evaluate(id=>go(id),id);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));if(snapshotDir)await p.screenshot({path:snapshotDir+'/'+theme+'-'+id+'.png'});}}
 assert.equal(await p.evaluate(()=>JSON.stringify({data,foodProducts,foodLog,weights:progressPhotos()})===qaData),true,'Presentation/navigation must preserve fitness records');
 assert.deepEqual(errors,[]);assert.equal(backend,0);
 console.log('PASS '+engine+': all eight mobile routes, two visible nav rows, 44px targets, EN/AR at 320/390/768, themes, calculator jump/labels/estimate, editor/session, unchanged fitness records');
 }finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
