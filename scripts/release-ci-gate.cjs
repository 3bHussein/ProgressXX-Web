// Pure same-commit release policy plus an injected, bounded polling adapter.
const requiredWorkflows=['full-ui-smoke.yml','fast-conflict-contracts.yml','cross-browser-ui.yml'];
function assess({sha,repository,runsByWorkflow}){
 if(!/^[a-f0-9]{40}$/.test(sha||'')||!repository)throw Error('Invalid release identity');
 const checks=requiredWorkflows.map(workflow=>{
  const runs=runsByWorkflow[workflow];if(!Array.isArray(runs))throw Error('Malformed workflow response: '+workflow);
  const matching=runs.filter(r=>r.head_sha===sha&&r.head_branch==='main'&&['push','workflow_dispatch'].includes(r.event)&&r.head_repository?.full_name===repository);
  if(!matching.length)return {workflow,state:'pending',reason:'missing same-SHA main validation'};
  if(matching.some(r=>!Number.isSafeInteger(r.id)||r.id<=0))throw Error('Malformed run ID');
  const run=matching.reduce((a,b)=>a.id>b.id?a:b);
  if(run.status==='completed')return {workflow,id:run.id,state:run.conclusion==='success'?'passed':'blocked',reason:run.conclusion||'missing conclusion'};
  if(!['queued','in_progress','waiting','requested','pending'].includes(run.status)||run.conclusion!=null)throw Error('Malformed workflow state');
  return {workflow,id:run.id,state:'pending',reason:run.status};
 });
 return {state:checks.some(c=>c.state==='blocked')?'blocked':checks.every(c=>c.state==='passed')?'passed':'pending',checks};
}
async function waitForValidation({sha,repository,listRuns,now=Date.now,sleep=ms=>new Promise(r=>setTimeout(r,ms)),timeoutMs=900000,pollMs=20000,log=()=>{}}){
 if(!(timeoutMs>0&&pollMs>0))throw Error('Invalid polling bounds');
 const deadline=now()+timeoutMs;
 while(true){
  const entries=await Promise.all(requiredWorkflows.map(async w=>[w,await listRuns(w)]));
  const result=assess({sha,repository,runsByWorkflow:Object.fromEntries(entries)});log(JSON.stringify(result));
  if(result.state==='passed')return result;
  if(result.state==='blocked')throw Error('Release blocked: '+JSON.stringify(result.checks));
  if(now()>=deadline)throw Error('Release validation timeout: '+JSON.stringify(result.checks));
  await sleep(Math.min(pollMs,deadline-now()));
 }
}
module.exports={requiredWorkflows,assess,waitForValidation};
