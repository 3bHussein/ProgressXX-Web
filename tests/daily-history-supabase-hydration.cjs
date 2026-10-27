const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const s=fs.readFileSync('index.html','utf8');
const start=s.indexOf(' window.__pxLoadDailyHistory=async()=>{'),end=s.indexOf(' async function activate(next)',start);
assert.ok(start>0&&end>start,'Account-scoped Daily history loader missing');
const saved={},today='2026-10-11',calls=[];
const rows=[
 {day:'2026-10-09',history:{date:'2026-10-09',done:4,waterCurrent:.25},reminder_done:{creatine:true}},
 {day:'2026-10-10',history:{date:'2026-10-10',done:4,waterCurrent:1.25},reminder_done:{creatine:true}},
 {day:'2026-10-11',history:{date:'2026-10-11',done:1},reminder_done:{creatine:false}}
];
saved['progressx-daily-history-v1']=JSON.stringify({'2026-10-10':{date:'2026-10-10',done:7}});
saved['progressx-reminder-done']=JSON.stringify({'2026-10-10':{creatine:false}});
const ctx={window:{},ready:true,account:'test-account',JSON,Array,Object,String,Error,Date,
 localDateKey:()=>today,
 nodeStorage:{getItem:k=>saved[k]??null,setItem:(k,v)=>{saved[k]=v;calls.push(['write',k])}},
 cloud:async url=>{assert.match(url,/progressxx_daily_history\?select=day,history,reminder_done&user_id=eq/);return rows},
 renderDailyHistory:()=>calls.push(['render'])
};
vm.runInNewContext(s.slice(start,end),ctx);
(async()=>{
 assert.equal(await ctx.window.__pxLoadDailyHistory(),3);
 let h=JSON.parse(saved['progressx-daily-history-v1']),d=JSON.parse(saved['progressx-reminder-done']);
 assert.equal(h['2026-10-09'].waterCurrent,.25);
 assert.equal(h['2026-10-10'].done,7,'Existing historical edits must win');
 assert.equal(h['2026-10-11'],undefined,'Never replace live today');
 assert.equal(d['2026-10-10'].creatine,false);
 const previous=calls.length;
 await ctx.window.__pxLoadDailyHistory();
 assert.equal(calls.length,previous,'Repeat hydration must be idempotent');
 assert.match(s.slice(s.indexOf('async function activate(next)'),s.indexOf("document.getElementById('pxLogin')")),/await window\.__pxLoadDailyHistory\(\)/);
 console.log('PASS: Daily history imported from owner-scoped Supabase, newer local state protected, idempotent');
})().catch(e=>{console.error(e);process.exitCode=1});

const remindersStart=s.indexOf(' window.__pxLoadReminderArchive=async()=>{');
const remindersEnd=s.indexOf(' window.__pxLoadDailyHistory=async()=>{',remindersStart);
assert.ok(remindersStart>0&&remindersEnd>remindersStart,'Reminder archive loader missing');
let archiveCalls=0;
const store={};
const reminderCtx={
 window:{},ready:true,account:'account',JSON,Array,Object,String,Error,
 nodeStorage:{getItem:k=>store[k]??null,setItem:(k,v)=>{store[k]=v}},
 cloud:async url=>{archiveCalls++;assert.match(url,/progressxx_reminder_archive\?select/);return [{reminder_id:'multivitamin',name:'Multivitamin',amount:'1 serving',reminder_time:'12:24',enabled:true}]}
};
vm.runInNewContext(s.slice(remindersStart,remindersEnd),reminderCtx);
(async()=>{
 assert.equal(await reminderCtx.window.__pxLoadReminderArchive(),1);
 assert.equal(JSON.parse(store['progressx-reminders'])[0].time,'12:24');
 assert.equal(await reminderCtx.window.__pxLoadReminderArchive(),0);
 assert.equal(archiveCalls,1,'Existing reminder edits must not be overwritten');
 console.log('PASS: archived reminders hydrate only when account has no saved reminder list');
})().catch(e=>{console.error(e);process.exitCode=1});

const loaderStart=s.indexOf('function loadDailyReminders(){');
const loaderEnd=s.indexOf('function saveDailyReminders(){',loaderStart);
assert.ok(loaderStart>0&&loaderEnd>loaderStart,'Daily reminder loader missing');
const reminderStore={'progressx-reminders':'[]'};
const reminderLoadCtx={DAILY_REMINDERS_KEY:'progressx-reminders',PXStore:{getItem:key=>reminderStore[key]??null},JSON,Array,clone:x=>JSON.parse(JSON.stringify(x)),DEFAULT_DAILY_REMINDERS:[{id:'default'}]};
vm.runInNewContext(s.slice(loaderStart,loaderEnd),reminderLoadCtx);
assert.equal(reminderLoadCtx.loadDailyReminders().length,0,'Explicitly empty account reminder list must remain empty');
reminderStore['progressx-reminders']=JSON.stringify([{id:'qa-on-device',name:'User saved reminder'}]);
assert.equal(reminderLoadCtx.loadDailyReminders()[0].id,'qa-on-device','Saved reminder should load from account');
delete reminderStore['progressx-reminders'];
assert.equal(reminderLoadCtx.loadDailyReminders()[0].id,'default','Defaults should appear only with missing account list');
assert.match(s,/dailyReminders=loadDailyReminders\(\);\s*await window\.__legacyBoot\(\)/,'Rehydrate in-memory reminders after account login before rendering');
console.log('PASS: account Daily reminder list loads saved and intentionally empty values before UI boot');

const refreshStart=s.indexOf(' window.__pxRefreshAccountDailyReminders=async()=>{');
const refreshEnd=s.indexOf(' window.__pxLoadProducts=async()=>{',refreshStart);
assert.ok(refreshStart>0&&refreshEnd>refreshStart,'Supabase Daily reminder refresh missing');
const syncStart=s.indexOf('async function syncRemindersFromSheet(force=false){');
const syncEnd=s.indexOf('// Cross-device Daily sync:',syncStart);
assert.ok(syncStart>0&&syncEnd>syncStart,'Daily refresh entrypoint missing');
assert.doesNotMatch(s.slice(syncStart,syncEnd),/appScriptUrl|reminders_get|Google Sheet|Apps Script URL is missing/,'Daily must not use retired Apps Script');
(async()=>{
 let rows=[{payload:{'progressx-reminders':JSON.stringify([{id:'qa-one',name:'QA one'}])}}];
 let calls=0,renders=0,dirty=false;
 const cache={};
 const state={window:{},syncConflictHold:false,snapshotBaseline:'[]',snapshotDigest:payload=>JSON.stringify(Object.entries(payload||{}).sort(([a],[b])=>a.localeCompare(b))),renderNutritionHome:()=>{},DAILY_REMINDERS_KEY:'progressx-reminders',DAILY_DONE_KEY:'progressx-reminder-done',DAILY_DONE_TIME_KEY:'progressx-daily-done-times-v1',DAILY_WATER_KEY:'progressx-water',DAILY_HISTORY_KEY:'progressx-daily-history-v1',DAILY_LAST_DATE_KEY:'progressx-daily-last-date-v1',ready:true,account:'qa-account',navigator:{onLine:true},uploading:false,revision:0,savedRevision:0,
  JSON,Array,Object,String,Error,encodeURIComponent,readPending:()=>dirty,
  cloud:async()=>{calls++;return rows},
  browserStorage:{setItem:(k,v)=>{cache[k]=v},removeItem:k=>delete cache[k]},storagePrefix:()=> 'user:',
  values:{},dailyReminders:[],loadDailyReminders:()=>JSON.parse(state.values['progressx-reminders']||'[]'),renderDaily:()=>{renders++}
 };
 vm.createContext(state);
 vm.runInContext(s.slice(refreshStart,refreshEnd),state);
 assert.equal(await state.window.__pxRefreshAccountDailyReminders(),'updated');
 assert.equal(state.dailyReminders[0].id,'qa-one');
 assert.equal(await state.window.__pxRefreshAccountDailyReminders(),'unchanged');
 rows=[{payload:{'progressx-reminders':'[]'}}];
 assert.equal(await state.window.__pxRefreshAccountDailyReminders(),'updated','Cloud deletion must clear former reminders');
 assert.equal(state.dailyReminders.length,0,'Removed reminders must not resurrect');
 assert.equal(cache['user:progressx-reminders'],'[]');
 rows=[{payload:{'progressx-reminders':JSON.stringify([{id:'remote-stale'}])}}];
 dirty=true;
 assert.equal(await state.window.__pxRefreshAccountDailyReminders(),'pending','Queued local change must not be overwritten');
 assert.equal(state.dailyReminders.length,0,'Pending local change must stay untouched');
 dirty=false;
 state.revision=1;
 assert.equal(await state.window.__pxRefreshAccountDailyReminders(),'pending','Unsynced local revision must not be overwritten');
 assert.equal(state.dailyReminders.length,0);
 assert.ok(calls>=3&&renders===2);
 state.revision=state.savedRevision=0;
 state.snapshotBaseline=state.snapshotDigest({'unrelated':'old','progressx-reminders':'[]'});
 rows=[{payload:{'unrelated':'new','progressx-reminders':'[]','progressx-reminder-done':'{"2026-10-27":{"qa":true}}','progressx-water':'{"date":"2026-10-27","current":2,"target":3}','progressx-daily-done-times-v1':'{}','progressx-daily-history-v1':'{}','progressx-daily-last-date-v1':'2026-10-27'}}];
 assert.equal(await state.window.__pxRefreshAccountDailyReminders(),'updated');
 assert.equal(JSON.parse(state.values['progressx-water']).current,2);
 assert.equal(JSON.parse(state.values['progressx-reminder-done'])['2026-10-27'].qa,true);
 assert.equal(Object.fromEntries(JSON.parse(state.snapshotBaseline)).unrelated,'old','Never acknowledge unrelated remote fields that were not adopted');
 assert.equal(state.revision,0,'Read adoption must not queue another write');
 const retained=JSON.stringify(state.values);
 rows=[{payload:{'progressx-reminders':'[]','progressx-water':'invalid'}}];
 await assert.rejects(state.window.__pxRefreshAccountDailyReminders(),/Invalid cloud Daily/);
 assert.equal(JSON.stringify(state.values),retained,'Validate whole Daily group before adopting any field');
 rows=[{payload:{'progressx-reminders':'[]'}}];
 assert.equal(await state.window.__pxRefreshAccountDailyReminders(),'updated');
 assert.equal(state.values['progressx-water'],undefined,'Missing remote Daily fields clear stale cached fields');
 state.cloud=async()=>{state.account='other-account';return [{payload:{'progressx-reminders':'[{"id":"wrong-owner"}]'}}]};
 assert.equal(await state.window.__pxRefreshAccountDailyReminders(),'unavailable');
 assert.equal(state.values['progressx-reminders'],'[]','Reject response after account switch');
 console.log('PASS: Supabase Daily list refresh applies deletions and protects unsynced edits');
})().catch(e=>{console.error(e);process.exitCode=1});

// Recording a successful read must not itself queue another cloud write.
{
 const code=s.slice(s.indexOf('const pxDeviceSyncTimes=new Map();'),s.indexOf('function formatSyncAge'));
 const local=new Map(),metaScope={window:{__pxSaveState:()=>({scope:'owner-A'})},PXStore:{setItem:()=>{throw Error('Sync status must not write account snapshot')}},localStorage:{getItem:k=>local.get(k)||null,setItem:(k,v)=>local.set(k,v)},renderSyncCenter:()=>{}};
 vm.createContext(metaScope);vm.runInContext(code,metaScope);metaScope.markSyncSuccess('daily');
 assert(metaScope.syncMeta().daily>0);
 metaScope.window.__pxSaveState=()=>({scope:'owner-B'});
 assert.equal(metaScope.syncMeta().daily,undefined,'Device sync timestamps stay account scoped');
 console.log('PASS: sync success metadata stays device/account local and never queues a snapshot');
}

assert.doesNotMatch(s.slice(s.indexOf('function renderDaily(){'),s.indexOf('function getWaterState(){')),/snapshotDailyHistory|PXStore\.setItem/,'Daily rendering must not persist a checkpoint');
assert.doesNotMatch(s.slice(s.indexOf('function renderDailyHistory(){'),s.indexOf('function dailyIsDone(')),/PXStore\.setItem/,'History browsing must be read-only');
