const {chromium}=require('playwright');
const fs=require('node:fs');
const assert=require('node:assert/strict');
(async()=>{
 const html=fs.readFileSync('index.html','utf8');
 const extract=html.match(/let refreshInFlight=null;[\s\S]*?\n async function cloud\(path,method='GET',body\)\{[\s\S]*?\n \}/);
 assert.ok(extract,'Expected production refreshToken/cloud functions');
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  const page=await browser.newPage();
  await page.goto('http://127.0.0.1:8765/prototypes/daily-conflict-recovery.html');
  const outcome=await page.evaluate(async source=>{
   const runs=[];
   const auth={user:{id:'mock-user'},refresh_token:'old-refresh',access_token:'expired-access',expires_at:1};
   const persisted=[];
   const local={auth,SESSION_KEY:'synthetic',sessionStorage:{setItem:(key,value)=>persisted.push({key,value})},
    tokenRequest:async(path,body)=>{
     runs.push({type:'refresh',path,token:body.refresh_token});
     await new Promise(resolve=>setTimeout(resolve,35));
     return {user:{id:'mock-user'},refresh_token:'rotated-refresh',access_token:'new-access',expires_at:Math.floor(Date.now()/1000)+3600};
    },
    headers:()=>({'Authorization':'Bearer '+local.auth.access_token}),
    BASE:'https://example.invalid',Error,Date,JSON,Number,Promise,
    fetch:async(url,options)=>{
     runs.push({type:'read',url,authorization:options.headers.Authorization});
     return {ok:true,status:200,json:async()=>[]};
    }};
   const factory=new Function('env','with(env){'+source+';return {cloud,refreshToken}}');
   const funcs=factory(local);
   const [one,two,three]=await Promise.all([funcs.cloud('one'),funcs.cloud('two'),funcs.cloud('three')]);
   return {runs,results:[one,two,three],persisted,token:local.auth.access_token};
  },extract[0]);
  assert.equal(outcome.runs.filter(r=>r.type==='refresh').length,1,'Three concurrent browser cloud calls must share one refresh');
  assert.equal(outcome.runs.filter(r=>r.type==='read').length,3,'All requests must continue');
  assert.ok(outcome.runs.filter(r=>r.type==='read').every(r=>r.authorization==='Bearer new-access'),'All reads must use renewed auth');
  assert.equal(outcome.persisted.length,1,'Rotated session should be stored once');
  assert.equal(outcome.token,'new-access');
  console.log('PASS: browser executes production cloud/refresh functions with three concurrent requests and one token rotation');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
