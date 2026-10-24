const assert=require('node:assert/strict');
const {browserType,engine}=require('./helpers/browser-engine.cjs');
(async()=>{const b=await browserType.launch({headless:true});try{
 const c=await b.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});let api=0;
 await c.route('**/*',r=>{if(new URL(r.request().url()).hostname==='127.0.0.1')return r.continue();if(/supabase/.test(r.request().url()))api++;return r.abort()});
 const p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded'});
 await p.evaluate(()=>{
  const m=new Map();window.__pxActiveStore={getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)};window.qaStore=m;
  foodProducts=Array.from({length:22},(_,i)=>({id:'qa-'+i,name:i===0?'Completed':i===1?'طعام تجريبي':'Food '+i,servingQty:100,servingUnit:'g',calories:200+i,protein:10,carbs:20,fat:8}));
  foodLog=[{id:'qa-log',productId:'qa-4',name:'Food 4',amount:100,servingUnit:'g',date:'2026-10-20',time:'12:00',meal:'Lunch'}];data=[];
  PXStore.setItem(FOOD_FAVORITES_KEY,JSON.stringify(['qa-5']));
  saveProgressPhotos(Array.from({length:28},(_,i)=>({id:'local_qa-'+i,date:i<14?'2026-09-'+String(i+1).padStart(2,'0'):'2026-10-'+String(i-13).padStart(2,'0'),weight:80-i/10,createdAt:'2026-10-01T12:00:00Z',note:i===27?'Completed <b>literal note</b>':'',_pending:true})));
  scheduleCloudProfileSync=()=>{};scheduleAutoBackup=()=>{};$('pxCommercialGate').hidden=true;
  wire();go('nutrition');renderNutrition();window.qaBefore=JSON.stringify([...m]);window.qaFoods=JSON.stringify(foodProducts);
 });
 await p.locator('#pxFoodBrowse summary').click();
 assert.equal(await p.locator('.pxQuickFood').count(),8);
 await p.locator('#pxQuickFoodMore').click();assert.equal(await p.locator('.pxQuickFood').count(),16);
 await p.locator('#pxQuickFoodSearch').fill('Food 21');assert.equal(await p.locator('.pxQuickFood').count(),1);assert.equal(await p.locator('#pxQuickFoodMore').isVisible(),false);
 await p.locator('#pxQuickFoodSearch').fill('unknown');assert.match(await p.locator('#pxQuickFoodList').textContent(),/No matching/);
 await p.locator('#pxQuickFoodSearch').fill('');await p.locator('[data-quick-filter="favorites"]').click();assert.match(await p.locator('.pxQuickFood').textContent(),/Food 5/);
 await p.locator('[data-quick-filter="recent"]').click();assert.equal(await p.locator('.pxQuickFood').count(),1);assert.match(await p.locator('.pxQuickFood').textContent(),/Food 4/);
 await p.locator('.pxQuickFood').click();assert.equal(await p.locator('#foodQuickProduct').inputValue(),'qa-4');assert.equal(await p.locator('#foodQuickAmount').inputValue(),'100');assert.match(await p.locator('#foodQuickPreview').textContent(),/204 kcal/);assert.equal(await p.locator('#foodQuickAmount').evaluate(el=>el===document.activeElement),true);
 await p.evaluate(()=>{go('analytics');renderProgressPhotos()});
 assert.equal(await p.locator('.pxWeightEntry').count(),12);assert.match(await p.locator('.pxWeightEntry').first().textContent(),/77.3/);assert.match(await p.locator('.pxWeightEntry').first().textContent(),/-0.1 kg/);
 assert.equal(await p.locator('.pxWeightNote b').count(),0,'Notes must remain escaped text');
 await p.locator('#pxWeightHistoryMore').click();assert.equal(await p.locator('.pxWeightEntry').count(),24);
 await p.locator('#pxWeightMonth').selectOption('2026-09');assert.equal(await p.locator('.pxWeightEntry').count(),12);await p.locator('#pxWeightHistoryMore').click();assert.equal(await p.locator('.pxWeightEntry').count(),14);assert.equal(await p.locator('#pxWeightHistoryMore').isVisible(),false);
 assert.match(await p.locator('.pxWeightEntry').last().textContent(),/First check-in/);
 assert.equal(await p.evaluate(()=>JSON.stringify([...qaStore])===qaBefore),true,'Browsing must never mutate stored data');
 await p.evaluate(()=>pxSetUILanguage('ar'));assert.equal(await p.locator('html').getAttribute('dir'),'rtl');assert.match(await p.locator('.pxWeightHistoryHead h3').textContent(),/سجل/);
 await p.locator('#pxWeightMonth').selectOption('');
 for(const width of [320,390,768,1280]){await p.setViewportSize({width,height:900});await p.evaluate(()=>go('nutrition'));await p.evaluate(()=>$('pxFoodBrowse').open=false);await p.locator('#pxFoodBrowse summary').click();await p.locator('[data-quick-filter="all"]').click();assert.equal(await p.locator('.pxQuickFoodName').filter({hasText:'Completed'}).textContent(),'Completed');assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Food RTL overflow '+width);await p.evaluate(()=>go('analytics'));assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Weight RTL overflow '+width);}
 await p.evaluate(()=>{pxSetUILanguage('en');go('analytics');renderProgressPhotos()});
 p.once('dialog',d=>d.dismiss());await p.locator('[data-weight-delete]').first().click();assert.equal(await p.evaluate(()=>progressPhotos().length),28);
 p.once('dialog',d=>d.accept());await p.locator('[data-weight-delete]').first().click();assert.equal(await p.evaluate(()=>progressPhotos().length),27);
 assert.equal(await p.evaluate(()=>JSON.stringify(foodProducts)===qaFoods),true);assert.equal(api,0);assert.deepEqual(errors,[]);
 // Screenshots are temporary QA output, never real user data.
 await p.setViewportSize({width:390,height:844});await p.evaluate(()=>{go('analytics');$('pxWeightMonth').scrollIntoView({behavior:'instant',block:'start'})});await p.screenshot({path:'/tmp/px-weight-history.png'});
 await p.evaluate(()=>{go('nutrition');$('pxFoodBrowse').open=true;$('pxFoodBrowse').scrollIntoView({behavior:'instant',block:'start'})});await p.screenshot({path:'/tmp/px-quick-food.png'});
 console.log('PASS '+engine+': food search/filter/choose/paging, weight month/delta/paging/delete, escaped user text, AR/EN and 320–1280 widths, browsing storage unchanged');
 }finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
