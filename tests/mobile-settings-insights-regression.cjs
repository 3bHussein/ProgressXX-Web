const fs=require('node:fs'),assert=require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8');
assert(!html.includes('Previous commercial data'),'Legacy commercial link leaked into main app');
for(const id of ['settings','intelligence','pxAccountTools','pxSyncNow','pxLogout','pxSettingsSync','pxSettingsSignOut','pxSettingsConnection']){
 assert.match(html,new RegExp('id="'+id+'"'),'Missing '+id);
}
assert.match(html,/id="pxSettingsSync"[^>]+pxSyncNow/);
assert.match(html,/id="pxSettingsSignOut"[^>]+pxLogout/);
assert.match(html,/#pxAccountTools\{position:relative!important/);
assert.match(html,/#intelligence \.hero \.btn\{width:100%/);
assert.match(html,/#settings \.settingsGrid\{grid-template-columns:minmax\(0,1fr\)!important/);
for(const id of ['pxSettingsAccount','pxSettingsBackup','pxSettingsSyncCenter','pxSettingsHub','pxSettingsSchedule']) assert.match(html,new RegExp('id="'+id+'"'),'Missing Settings jump target '+id);
assert.match(html,/class="pxSettingsQuickNav"/);
assert.match(html,/#settings \.pxSettingsQuickNav button\{/);
console.log('PASS: account settings, no legacy commercial link, mobile account controls and Insights CSS');
