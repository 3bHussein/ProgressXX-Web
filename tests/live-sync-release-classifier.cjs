'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const html=fs.readFileSync(require('node:path').join(__dirname,'..','index.html'),'utf8');
const start=html.indexOf(' async function flush(){');
assert.ok(start>=0,'Production sync flush must exist');
const segment=html.slice(start,html.indexOf(' window.__pxRestoreLegacySettings',start));
assert.ok(segment.includes("user_app_snapshots?on_conflict=user_id"),'Production sync route changed: re-audit before release');
const unconditional=/await cloud\('user_app_snapshots\?on_conflict=user_id','POST',\{user_id:account,payload:\{\.\.\.values\},updated_at:new Date\(\)\.toISOString\(\)\}\)/.test(segment);
if(unconditional){
 console.log('RELEASE BLOCKED (EXPECTED): production still uses unconditional account snapshot upsert.');
 console.log('PASS: pre-release safety classifier correctly recognizes open P0 concurrency risk.');
}else{
 console.log('SYNC IMPLEMENTATION CHANGED: full two-device CAS acceptance and data-preservation audit REQUIRED.');
 process.exitCode=1;
}
