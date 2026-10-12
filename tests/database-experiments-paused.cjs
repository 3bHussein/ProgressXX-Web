const fs=require('node:fs'),assert=require('node:assert/strict');
const source=fs.readFileSync('.github/workflows/postgres-cas-integration.yml','utf8');
const triggers=source.slice(source.indexOf('\non:')+1,source.indexOf('\njobs:'));
assert.match(triggers,/workflow_dispatch:/);
assert.doesNotMatch(triggers,/\b(push|pull_request|schedule):/,'Database experiments must not run automatically');
assert.match(triggers,/resume_database_tests:[\s\S]*type: boolean[\s\S]*default: false/);
assert.match(source,/if: \$\{\{ github\.event_name == 'workflow_dispatch' && inputs\.resume_database_tests == true \}\}/);
console.log('PASS: database workflow paused; explicit manual owner opt-in required; no SQL executed');
