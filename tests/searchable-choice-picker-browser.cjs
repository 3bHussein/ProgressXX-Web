const assert=require('node:assert/strict');
const {browserType,engine}=require('./helpers/browser-engine.cjs');
async function seed(page){
 await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
 await page.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded'});await page.locator('#pxEmail').waitFor();
 await page.evaluate(()=>{
  const map=new Map();window.__pxActiveStore={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,String(v)),removeItem:k=>map.delete(k)};
  scheduleCloudProfileSync=()=>{};scheduleAutoBackup=()=>{};syncNutritionFromSheet=async()=>{};
  data=[{id:'one',day:'Anterior',exercise:'Dumbbell Biceps Curl (3×10)',week:1,status:'Completed',date:'2026-10-12',performance:'20*8'},
   {id:'two',day:'Anterior',exercise:'تمرين الحنكه للكابل for forearm',week:1,status:'Completed',date:'2026-10-12',performance:'10*10'}];
  foodProducts=[{id:'rice',name:'Rice with a long descriptive saved food name',servingQty:100,servingUnit:'g',calories:130,protein:3,carbs:28,fat:0},
   {id:'milk',name:'Milk',servingQty:100,servingUnit:'ml',calories:60,protein:3,carbs:5,fat:3},
   {id:'unknown',name:'Saved food without calorie value',servingQty:100,servingUnit:'g',calories:null}];
  foodLog=[];window.qaBefore=JSON.stringify({data,foodLog,foodProducts});$('pxCommercialGate').hidden=true;go('log');openEditor();$('fDay').value='Anterior';buildExerciseOptions('Anterior');
 });
}
(async()=>{const browser=await browserType.launch({headless:true});try{
 const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));await seed(page);
 await page.locator('#fExerciseSelect').click();assert.equal(await page.locator('#pxChoiceDialog').isVisible(),true);assert.equal(await page.locator('.pxChoiceOption').count(),2);assert.equal(await page.locator('#pxChoiceClear').isVisible(),false);assert.equal(await page.locator('#pxChoiceSearch').evaluate(el=>el===document.activeElement),true);
 if(process.env.PX_PICKER_SCREENSHOTS)await page.screenshot({path:'/tmp/px-picker-exercise-en.png'});
 const keyboardBottom=await page.evaluate(()=>{pxChoiceViewport({height:420,offsetTop:0});return $('pxChoiceDialog').getBoundingClientRect().bottom});assert(keyboardBottom<=421,'Mobile sheet stays above the software keyboard');await page.evaluate(()=>pxChoiceViewport());
 await page.locator('#pxChoiceSearch').fill('biceps');assert.equal(await page.locator('.pxChoiceOption').count(),1);await page.locator('.pxChoiceOption').click();assert.equal(await page.locator('#fExercise').inputValue(),'Dumbbell Biceps Curl (3×10)');assert.equal(await page.locator('#pxChoiceDialog').isVisible(),false);assert.equal(await page.locator('#fExerciseSelect').evaluate(el=>el===document.activeElement),true);assert.match(await page.locator('#fPerformance').inputValue(),/20/);
 await page.locator('#fExerciseSelect').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('.pxChoiceOption[aria-pressed="true"]').count(),1);await page.locator('#pxChoiceSearch').fill('not-found');assert.match(await page.locator('#pxChoiceList').innerText(),/No matches/);await page.keyboard.press('Escape');assert.equal(await page.locator('#fExercise').inputValue(),'Dumbbell Biceps Curl (3×10)');assert.equal(await page.locator('#fExerciseSelect').evaluate(el=>el===document.activeElement),true);
 await page.locator('#fExercise').fill('Unsaved custom name');await page.locator('#fExerciseSelect').click();await page.locator('#pxChoiceSearch').fill('biceps');await page.locator('.pxChoiceOption').click();assert.equal(await page.locator('#fExercise').inputValue(),'Dumbbell Biceps Curl (3×10)','Explicit re-selection resolves a manually changed name');
 // Native programmatic selection remains compatible with all existing app handlers.
 await page.locator('#fExerciseSelect').selectOption({label:'تمرين الحنكه للكابل for forearm'});assert.match(await page.locator('#fExercise').inputValue(),/forearm/);
 await page.evaluate(()=>{closeEditor();go('nutrition');buildFoodQuickSelect()});
 await page.locator('#foodQuickProduct').selectOption('rice');const expected=await page.evaluate(()=>({amount:$('foodQuickAmount').value,preview:$('foodQuickPreview').textContent}));await page.locator('#foodQuickProduct').selectOption('milk');await page.locator('#foodQuickProduct').click();assert.equal(await page.locator('#pxChoiceTitle').textContent(),'Choose food');await page.locator('#pxChoiceSearch').fill('rice');assert.match((await page.locator('.pxChoiceOption').innerText()).replace(/[\u2066-\u2069]/g,''),/100 g · 130 kcal/);await page.locator('.pxChoiceOption').click();assert.deepEqual(await page.evaluate(()=>({amount:$('foodQuickAmount').value,preview:$('foodQuickPreview').textContent})),expected);assert.equal(await page.locator('#foodQuickProduct').inputValue(),'rice');
 await page.locator('#foodQuickProduct').click();assert.equal(await page.locator('.pxChoiceOption[aria-pressed="true"]').count(),1);await page.locator('#pxChoiceClear').click();assert.equal(await page.locator('#foodQuickProduct').inputValue(),'');
 await page.locator('#foodQuickProduct').click();await page.evaluate(()=>{$('foodQuickProduct').replaceChildren(...Array.from({length:85},(_,i)=>new Option('Food '+i,'q'+i)))});await page.waitForFunction(()=>$('pxChoiceCount').textContent.startsWith('40 / 85'));assert.equal(await page.locator('.pxChoiceOption').count(),40);await page.getByRole('button',{name:'Show more',exact:true}).click();assert.equal(await page.locator('.pxChoiceOption').count(),80);await page.keyboard.press('Escape');
 await page.evaluate(()=>buildFoodQuickSelect());
 for(const lang of ['en','ar'])for(const width of [320,390,1280]){
  await page.setViewportSize({width,height:844});await page.evaluate(lang=>pxSetUILanguage(lang),lang);await page.locator('#foodQuickProduct').click();assert.equal(await page.locator('#pxChoiceDialog').getAttribute('dir'),lang==='ar'?'rtl':'ltr');if(process.env.PX_PICKER_SCREENSHOTS&&width===390)await page.screenshot({path:'/tmp/px-picker-food-'+lang+'.png'});assert.equal(await page.locator('#pxChoiceDialog').evaluate(el=>el.scrollWidth<=el.clientWidth),true);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  assert.equal(await page.locator('.pxChoiceOption').evaluateAll(rows=>rows.every(el=>el.getBoundingClientRect().height>=44)),true);await page.keyboard.press('ArrowDown');assert.equal(await page.locator('.pxChoiceOption').first().evaluate(el=>el===document.activeElement),true);await page.keyboard.press('End');assert.equal(await page.locator('.pxChoiceOption').last().evaluate(el=>el===document.activeElement),true);await page.keyboard.press('Escape');
 }
 // An account change cannot apply a choice to the newly active account.
 await page.evaluate(()=>pxSetUILanguage('en'));await page.locator('#foodQuickProduct').click();await page.evaluate(()=>{window.qaOldStore=window.__pxActiveStore;window.__pxActiveStore={getItem:()=>null,setItem:()=>{throw Error('Unexpected cross-account write')}}});await page.locator('.pxChoiceOption').first().click();assert.equal(await page.locator('#pxChoiceDialog').isVisible(),false);assert.equal(await page.locator('#foodQuickProduct').inputValue(),'');await page.evaluate(()=>window.__pxActiveStore=qaOldStore);
 assert.equal(await page.evaluate(()=>JSON.stringify({data,foodLog,foodProducts})===qaBefore),true);assert.deepEqual(errors,[]);
 if(engine==='chromium'){
  const touch=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});await seed(touch);await touch.locator('#fExerciseSelect').tap();assert.equal(await touch.locator('#pxChoiceDialog').isVisible(),true);await touch.close();
 }
 console.log('PASS '+engine+': exercise/food shared picker, real selection/prefill/quantity parity, cancel, keyboard/focus, live options/paging, account guard, mobile touch, EN/AR 320–1280 and unchanged records; external requests blocked');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
