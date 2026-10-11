#!/usr/bin/env node
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const file=process.argv[2];if(!file){console.error('Usage: node scripts/audit-migration.mjs candidate.html');process.exit(2)}
const html=readFileSync(file,'utf8');
const failures=[];
function check(ok,reason){if(!ok)failures.push(reason)}
for(const name of ['home','log','analytics','nutrition','daily','calculators','settings','intelligence']){
 check(new RegExp('id=["\\x27]'+name+'["\\x27]').test(html),'Missing original '+name+' screen');
}
const blocked=[
 [/script\.google\.com\/macros\/s\//i,'Personal Google Apps Script URL'],
 [/docs\.google\.com\/spreadsheets\/d\//i,'Personal Google spreadsheet URL'],
 [/DEFAULT_APPS_SCRIPT_URL\s*=/i,'Legacy Apps Script default configuration'],
 [/prepareProgressXXPrivateSource\s*\(/i,'Legacy personal bootstrap present'],
 [/syncFromSheet\s*\(/i,'Legacy Google Sheet synchronization still reachable'],
 [/progressx-appscript-url-v19/i,'Legacy owner-scoped storage key remains'],
 [/AKfycb[A-Za-z0-9_-]{30,}/,'Potential personal Apps Script deployment ID'],
 [/service_role[\s"':=]/i,'Potential privileged Supabase key']
];
for(const [rx,label] of blocked)check(!rx.test(html),label);
check(/supabase\.co/i.test(html),'No Supabase endpoint');
check(/sign.?in|auth/i.test(html),'No Supabase sign-in/auth integration');
check(html.length>150_000,'UI unexpectedly truncated, likely not full legacy port');
const report={candidate:file,bytes:Buffer.byteLength(html),checks:'structure+secrets',failures,readyForRuntimeTests:failures.length===0};
console.log(JSON.stringify(report,null,2));
if(failures.length)process.exit(1);
