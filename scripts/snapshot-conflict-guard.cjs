'use strict';
// Standalone opt-in helper. NOT connected to production snapshot flush.
function handleRejectedSnapshot({status, localDraft, serverSnapshot, pendingStore, onReview}) {
  if(status !== 409 && status !== 412) return {handled:false};
  if(!localDraft || !pendingStore || typeof pendingStore.save !== 'function')
    throw new Error('Conflict requires a recoverable local draft and pending store');
  const draft=structuredClone(localDraft);
  pendingStore.save(draft);
  const remote=serverSnapshot && structuredClone(serverSnapshot);
  if(typeof onReview==='function') onReview({draft:structuredClone(draft), remote});
  return {handled:true, retry:false, pending:true, requiresReview:true};
}
module.exports={handleRejectedSnapshot};
