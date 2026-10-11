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
