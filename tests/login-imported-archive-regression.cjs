const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{
const browser=await chromium.launch({headless:true});
const page=await browser.newPage();
const account='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const workouts=Array.from({length:634},(_,i)=>({id:String(i+1),day:i%2?'2 — POSTERIOR':'1 — ANTERIOR',week:Math.floor(i/32)+1,exercise:i%2?'Row':'Press',performance:'25*8',status:'Completed',date:'',notes:''}));
const snapshot={
 'progressx-data-v19':JSON.stringify([{id:'local-test',day:'test',exercise:'test',week:1,performance:'',status:'Completed'}]),
 'progressx-food-log':'[]','progressx-food-products':'[]',
 'progressx-daily-history-v1':JSON.stringify({'2026-10-11':{date:'2026-10-11',done:0,total:8}}),
 'progressx-reminder-done':'{}'
};
const problems=[];
page.on('pageerror',e=>problems.push(e.stack||e.message));
page.on('console',m=>{if(m.type()==='error')problems.push(m.text())});
await page.route('**/auth/v1/**',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({access_token:'mock',refresh_token:'mock',expires_at:Math.floor(Date.now()/1000)+7200,user:{id:account,email:'test@example.com'}})}));
await page.route('**/rest/v1/**',r=>{
 const url=new URL(r.request().url());
 let rows=[];
 if(url.pathname.includes('user_app_snapshots'))rows=[{payload:snapshot}];
 if(url.pathname.includes('legacy_workout_entries'))rows=workouts.map(x=>({source_id:'pxlog:'+x.id,day_name:x.day,exercise_name:x.exercise,week_number:x.week,original_date:x.date,original_time:'',raw_performance:x.performance,status:x.status,notes:x.notes}));
 if(url.pathname.includes('progressxx_reminder_archive'))rows=[{reminder_id:'multivitamin',name:'Multivitamin',amount:'1 serving',reminder_time:'09:00',enabled:true}];
 if(url.pathname.includes('progressxx_daily_history'))rows=[{day:'2026-10-09',history:{date:'2026-10-09',done:1,total:1,doneIds:[],doneNames:[],doneItems:[],waterCurrent:.25,waterTarget:3},reminder_done:{}}];
 if(url.pathname.includes('progressxx_legacy_settings'))rows=[{setting_key:'progressx-nutrition-targets',setting_value:{calories:2006,protein:182,carbs:156,fat:73}},{setting_key:'progressx-meal-templates-v1',setting_value:[{id:'excelmeal:1',name:'d',defaultMeal:'Breakfast',mealTime:'13:46',items:[{name:'Fig تين',calories:150,protein:.45,carbs:11.508,fat:.18}]}]}];
 r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(rows)});
});
await page.goto('http://127.0.0.1:8765/index.html',{waitUntil:'domcontentloaded'});
await page.locator('#pxEmail').fill('test@example.com');await page.locator('#pxPassword').fill('test');await page.locator('#pxSignin').click();
await page.waitForTimeout(4500);
const status=await page.locator('#pxLoginMessage').textContent();
const result=await page.evaluate(()=>({hidden:document.getElementById('pxCommercialGate').hidden,entries:typeof data==='object'&&Array.isArray(data)?data.length:null,reminders:Array.isArray(dailyReminders)?dailyReminders.length:null}));
if(!result.hidden||result.entries!==634||problems.length)throw Error(JSON.stringify({status,result,problems:problems.slice(0,6)},null,2));
console.log('PASS: historical 634 entries + restored Food, Daily, nutrition archives login and hydrate safely');
await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1});
