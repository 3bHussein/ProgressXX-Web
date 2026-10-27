const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync('index.html','utf8');
const start=html.indexOf(' const SCHEDULE_ROW_MARKER=');
const end=html.indexOf(' function scheduleCloudSync()',start);
assert.ok(start>0&&end>start,'Schedule mirror code missing');
// Daily deletion must remain an intentional empty list across reloads and sync.
const dailyLoader=html.slice(html.indexOf('function loadDailyReminders(){'),html.indexOf('function saveDailyReminders(){'));
assert.match(dailyLoader,/Array\.isArray\(x\)\?x:clone\(DEFAULT_DAILY_REMINDERS\)/,'Empty Daily reminders must not be repopulated by defaults');
const dailyDelete=html.slice(html.indexOf('function deleteDailyReminder(id){'),html.indexOf('function renderDaily(){'));
assert.match(dailyDelete,/dailyReminders=dailyReminders\.filter\(x=>x\.id!==id\)/,'Daily deletion must remove the matching reminder');
assert.match(dailyDelete,/saveDailyReminders\(\)/,'Daily deletion must persist and queue sync');
const dailySave=html.slice(html.indexOf('function saveDailyReminders(){'),html.indexOf('function dailyDoneMap(){'));
assert.match(dailySave,/scheduleReminderConfigSync\(\)/,'Daily edits must enqueue reminder config sync');
assert.match(dailySave,/scheduleDailyStateSync\(\)/,'Daily edits must enqueue Daily state sync');
// Execute the real Daily loader against an isolated in-memory store. In
// particular, [] is a deliberate deletion state, not missing data.
const dailyStore=new Map();
const dailyScope={
 PXStore:{getItem:key=>dailyStore.has(key)?dailyStore.get(key):null},
 DAILY_REMINDERS_KEY:'qa-daily-reminders',
 DEFAULT_DAILY_REMINDERS:[{id:'starter',name:'Starter'}],
 clone:x=>JSON.parse(JSON.stringify(x))
};
vm.runInNewContext(dailyLoader+';globalThis.load=loadDailyReminders;',dailyScope);
assert.equal(dailyScope.load().length,1,'Missing Daily state should use defaults');
dailyStore.set(dailyScope.DAILY_REMINDERS_KEY,'[]');
assert.equal(dailyScope.load().length,0,'Deleted Daily reminders resurrected after reload');
dailyStore.set(dailyScope.DAILY_REMINDERS_KEY,JSON.stringify([{id:'keep',name:'Saved'}]));
assert.equal(dailyScope.load()[0].id,'keep','Saved Daily state must win over defaults');
// Supabase Daily must not activate legacy Apps Script timers or dirty flags,
// which previously prevented the next cross-device refresh indefinitely.
const dailyScheduler=html.slice(html.indexOf('function scheduleReminderConfigSync(){'),html.indexOf('async function syncReminderConfigToSheet(){'));
assert.match(dailyScheduler,/if\(window\.__pxCommercialReady\?\.\(\)\)return;/,'Signed-in reminder config must skip legacy Sheets timer');
assert.match(dailyScheduler,/if\(window\.__pxCommercialReady\?\.\(\)\)\{[\s\S]*?dailyStateDirty=false;/,'Signed-in Daily must not leave legacy dirty state blocking cloud refresh');
// Execute both scheduler branches without timers or network access.
let scheduled=[],cleared=[],dirty=true;
const schedulerScope={
 window:{__pxCommercialReady:()=>true},
 navigator:{onLine:true},
 reminderSheetSaveTimer:11,dailySheetSaveTimer:12,
 dailyStateDirty:true,
 clearTimeout:id=>cleared.push(id),
 setTimeout:(fn,delay)=>{scheduled.push(delay);return 99},
 syncReminderConfigToSheet:()=>{},syncDailyStateToSheet:()=>{},
 updateConnectionBanner:()=>{},connectionPendingCount:()=>0,
 $:()=>null
};
vm.runInNewContext(dailyScheduler+';globalThis.runReminder=scheduleReminderConfigSync;globalThis.runDaily=scheduleDailyStateSync;',schedulerScope);
schedulerScope.runReminder();
schedulerScope.runDaily();
assert.equal(schedulerScope.dailyStateDirty,false,'Supabase Daily dirty flag must clear');
assert.equal(scheduled.length,0,'Supabase Daily must not schedule Google Sheets timers');
assert.equal(cleared.includes(12),true,'Old Daily timer must be cancelled');
schedulerScope.window.__pxCommercialReady=()=>false;
schedulerScope.runReminder();
schedulerScope.runDaily();
assert.equal(schedulerScope.dailyStateDirty,true,'Legacy branch must retain its own dirty flag');
assert.deepEqual(scheduled,[350,120],'Legacy scheduler timing changed unexpectedly');
// Exercise the real account reminder pull guard with a mocked Supabase snapshot.
// Local unsynced edits must always win until uploaded, including deleted [].
const refreshStart=html.indexOf(' window.__pxRefreshAccountDailyReminders=async()=>{');
const refreshEnd=html.indexOf(' window.__pxLoadProducts=async()=>{',refreshStart);
assert.ok(refreshStart>=0&&refreshEnd>refreshStart,'Account Daily cloud refresh missing');
const refreshCode=html.slice(refreshStart,refreshEnd);
let revision=2,savedRevision=1,uploading=false,remoteReads=0,rendered=0;
const refreshValues={'progressx-reminders':'[]'};
const refreshStorage=new Map();
const refreshScope={
 window:{},syncConflictHold:false,snapshotBaseline:'[]',snapshotDigest:payload=>JSON.stringify(Object.entries(payload||{}).sort(([a],[b])=>a.localeCompare(b))),renderNutritionHome:()=>{},DAILY_REMINDERS_KEY:'progressx-reminders',DAILY_DONE_KEY:'progressx-reminder-done',DAILY_DONE_TIME_KEY:'progressx-daily-done-times-v1',DAILY_WATER_KEY:'progressx-water',DAILY_HISTORY_KEY:'progressx-daily-history-v1',DAILY_LAST_DATE_KEY:'progressx-daily-last-date-v1',ready:true,account:'qa-account',navigator:{onLine:true},
 uploading,revision,savedRevision,
 readPending:()=>false,
 cloud:async()=>{remoteReads++;return [{payload:{'progressx-reminders':JSON.stringify([{id:'remote'}])}}]},
 values:refreshValues,browserStorage:{setItem:(k,v)=>refreshStorage.set(k,v)},
 storagePrefix:x=>x+':',
 loadDailyReminders:()=>JSON.parse(refreshValues['progressx-reminders']),
 renderDaily:()=>{rendered++},dailyReminders:[]
};
vm.runInNewContext(refreshCode,refreshScope);
async function checkDailyCloudRefresh(){
 assert.equal(await refreshScope.window.__pxRefreshAccountDailyReminders(),'pending','Pending local deletion must block remote resurrection');
 assert.equal(remoteReads,0,'Pending local deletion must not read cloud');
 refreshScope.savedRevision=2;
 assert.equal(await refreshScope.window.__pxRefreshAccountDailyReminders(),'updated','Clean local state should accept remote changes');
 assert.equal(refreshScope.dailyReminders.length,1);
 assert.equal(rendered,1);
}
const account='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const marker='progressxx-weekly-schedule-v1';
let rows=[{id:'legacy',user_id:account,weekday:0,title:'Existing program',notes:null}];
let id=0;
const calls=[];
async function cloud(path,method='GET',payload){
 calls.push({path,method,payload});
 const u=new URL('https://qa.example/rest/v1/'+path);
 if(method==='GET')return rows.filter(r=>r.user_id===account&&r.notes===marker);
 if(method==='POST'){
  // Model PostgREST's unique (user_id, weekday) upsert when another device
  // inserts the row after our initial GET but before our POST.
  const existing=rows.find(r=>r.user_id===payload.user_id&&r.weekday===payload.weekday);
  if(existing){
   assert.equal(u.searchParams.get('on_conflict'),'user_id,weekday','Concurrent insert must use the unique-key upsert');
   Object.assign(existing,payload);
   return [existing];
  }
  rows.push({id:'managed-'+(++id),...payload});
  return [rows.at(-1)];
 }
 const rowid=u.searchParams.get('id')?.replace(/^eq\./,'');
 const row=rows.find(r=>r.id===rowid&&r.user_id===account&&r.notes===marker);
 if(method==='PATCH'&&row){Object.assign(row,payload);return [row]}
 if(method==='DELETE'&&row){rows=rows.filter(r=>r!==row);return null}
 throw Error('Unexpected call: '+method+' '+path);
}
const scope={account,cloud};
vm.runInNewContext(html.slice(start,end)+';globalThis.mirror=mirrorWorkoutScheduleToTable;',scope);
const send=x=>scope.mirror({'progressx-workout-schedule-v1':JSON.stringify(x)});
(async()=>{
 await checkDailyCloudRefresh();
 await send({mon:'Push',tue:'REST'});
 assert.equal(rows.length,3);
 assert.equal(rows.find(r=>r.id==='legacy').title,'Existing program');
 assert.equal(rows.find(r=>r.weekday===1).title,'Push');
 await send({mon:'Push',tue:'REST'});
 assert.equal(rows.length,3,'Idempotent retry duplicated rows');
 await send({mon:'Pull'});
 assert.equal(rows.find(r=>r.weekday===1).title,'Pull');
 assert.equal(rows.find(r=>r.weekday===2),undefined,'Removed weekday should delete managed row only');
 await send({});
 assert.deepEqual(rows.map(r=>r.id),['legacy'],'Clearing UI schedule must not delete existing program');
 assert.equal(calls.filter(c=>c.method==='DELETE').length,2);
 await scope.mirror({});
 assert.deepEqual(rows.map(r=>r.id),['legacy'],'Missing schedule snapshot must be no-op');
 // A second device can create Monday between GET and POST. The upsert must
 // converge to one weekday row rather than throw a duplicate-key error.
 const beforeRace=cloud;
 scope.cloud=async(path,method='GET',payload)=>{
  if(method==='POST'&&payload?.weekday===1&&!rows.some(r=>r.weekday===1)){
   rows.push({id:'concurrent-device',user_id:account,weekday:1,title:'Other device',notes:marker});
  }
  return beforeRace(path,method,payload);
 };
 await send({mon:'Race winner'});
 assert.equal(rows.filter(r=>r.user_id===account&&r.weekday===1).length,1,'Concurrent creation duplicated Monday');
 assert.equal(rows.find(r=>r.weekday===1).title,'Race winner','Upsert did not converge on latest requested schedule');
 assert.equal(rows.find(r=>r.id==='legacy').title,'Existing program','Concurrent upsert must preserve unrelated schedule');
 // Retrying the same schedule after the collision must not create extra rows.
 await send({mon:'Race winner'});
 assert.equal(rows.filter(r=>r.user_id===account&&r.weekday===1).length,1,'Retry after concurrent insert duplicated weekday');
 // Removing the collided weekday must only remove the managed row.
 await send({});
 assert.equal(rows.some(r=>r.id==='concurrent-device'),false,'Clearing collided weekday left a stale managed row');
 assert.equal(rows.find(r=>r.id==='legacy').title,'Existing program','Clearing collided weekday changed unrelated schedule');
 // Re-adding after deletion must still produce exactly one managed row.
 await send({mon:'After retry'});
 assert.equal(rows.filter(r=>r.user_id===account&&r.weekday===1).length,1,'Re-create after collision duplicated weekday');
 assert.equal(rows.find(r=>r.weekday===1).title,'After retry');


 console.log('PASS: schedule mirror create, idempotent upsert, edit, delete, concurrent insert, retry and legacy preservation');
})().catch(e=>{console.error(e);process.exitCode=1});
