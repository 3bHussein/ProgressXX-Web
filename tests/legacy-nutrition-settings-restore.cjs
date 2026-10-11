const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync('index.html','utf8');
const a=html.indexOf(' window.__pxRestoreLegacySettings=async()=>{');
const b=html.indexOf(' window.__pxLoadReminderArchive=async()=>{',a);
assert.ok(a>0&&b>a,'Legacy settings loader missing');
const store={},requests=[];
const scope={window:{},ready:true,account:'owner',JSON,Set,String,Object,Array,Error,
 nodeStorage:{getItem:k=>store[k]??null,setItem:(k,v)=>{store[k]=v}},
 cloud:async path=>{requests.push(path);return [
 {setting_key:'progressx-nutrition-targets',setting_value:{calories:2006,protein:182,carbs:156,fat:73}},
 {setting_key:'progressx-meal-templates-v1',setting_value:[{id:'excelmeal:1',name:'d',items:[{name:'Fig تين'}]}]},
 {setting_key:'untrusted-key',setting_value:{dangerous:true}}
 ];}
};
vm.runInNewContext(html.slice(a,b),scope);
(async()=>{
 assert.equal(await scope.window.__pxRestoreLegacySettings(),2);
 assert.equal(JSON.parse(store['progressx-nutrition-targets']).calories,2006);
 assert.equal(JSON.parse(store['progressx-meal-templates-v1'])[0].items[0].name,'Fig تين');
 assert.equal(store['untrusted-key'],undefined);
 assert.equal(await scope.window.__pxRestoreLegacySettings(),0,'Existing saved settings must not be overwritten');
 assert.ok(requests.every(p=>p.includes('user_id=eq.owner')));
 assert.match(html.slice(html.indexOf('async function activate(next)'),html.indexOf("document.getElementById('pxLogin')")),/await window\.__pxRestoreLegacySettings\(\)/);
 console.log('PASS: archive restores only missing account-scoped nutrition/meal data');
})().catch(e=>{console.error(e);process.exitCode=1});
