const assert=require('node:assert/strict'),fs=require('node:fs');
const read=f=>fs.readFileSync('.github/workflows/'+f,'utf8');const deploy=read('deploy-pages.yml');
const paths=s=>s.split('    paths:\n')[1].split(/\n  (?:pull_request|workflow_dispatch):/)[0].split('\n').map(l=>l.trim()).filter(l=>l.startsWith('- ')).map(l=>l.slice(2).replace(/^['"]|['"]$/g,''));
const gate=deploy.indexOf('Require successful validation of this artifact commit');assert(gate>0);
for(const action of ['actions/configure-pages@','actions/upload-pages-artifact@','actions/deploy-pages@'])assert(deploy.indexOf(action)>gate,action+' must follow gate');
assert.match(deploy,/sha: context\.sha/);assert.match(deploy,/head_sha: context\.sha/);assert.match(deploy,/actions: read/);assert.match(deploy,/node tests\/database-experiments-paused.cjs/);
assert(!deploy.includes('continue-on-error:'));assert(!deploy.includes('if: always()'));assert(!deploy.includes('ref: main'),'Checkout must stay pinned to event SHA');
for(const workflow of ['fast-conflict-contracts.yml','cross-browser-ui.yml']){const ps=paths(read(workflow));for(const p of paths(deploy))assert(ps.includes(p),workflow+' must trigger for deployment path '+p)}
assert(read('full-ui-smoke.yml').includes('tests/release-ci-gate.cjs'));assert(read('fast-conflict-contracts.yml').includes('node tests/release-ci-gate.cjs'));
console.log('PASS: gate precedes artifact/configuration/deployment, exact event SHA, read-only Actions, database pause, no bypass, matching validator push paths');
