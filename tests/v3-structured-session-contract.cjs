const fs=require('fs'),assert=require('assert');
const html=fs.readFileSync('index.html','utf8');
for(const needle of ['id="pxSessionSetEditor"','id="pxSessionAddSet"','function pxSessionRenderSetEditor()','function pxSessionReadSets()','function pxSessionAddSet()','function pxSessionRemoveSet(index)','pxSessionRenderSetEditor();','function pxDeloadAdvice(exercise,week)','id="pxSessionDeloadCard"','data-set-weight','data-set-reps','incompleteSets'])assert(html.includes(needle),'Missing V3 session contract: '+needle);
assert(/function persistSessionExercise\(status='Completed'\)\{[\s\S]{0,170}pxSessionReadSets\(\)/.test(html),'Save must serialize structured sets');
assert(/function sessionSaveNext\(\)\{[\s\S]{0,110}pxSessionReadSets\(\)/.test(html),'Save & Next must read pending edits');
assert(html.includes("const supported=parsed.every(set=>!set.raw)"),'Legacy raw notes must stay editable');
assert(html.includes("field.hidden=supported"),'Raw fallback must remain visible for unsupported records');
console.log('PASS: V3 structured set UI, save boundary, raw fallback and Smart Deload contracts');
