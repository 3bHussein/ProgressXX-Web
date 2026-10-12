'use strict';
const {createReviewQueue}=require('./conflict-review-queue.cjs');
function createConflictBoundary({accountId,storage,fetchLatest}) {
 if(typeof fetchLatest!=='function')throw Error('Latest snapshot reader required');
 const queue=createReviewQueue({accountId,storage});
 async function handle({status,draft}) {
  if(status!==409 && status!==412)return {handled:false};
  if(queue.load())return {handled:true,blocked:true,reason:'review-pending'};
  const latest=await fetchLatest();
  if(!latest||!Number.isInteger(latest.revision))throw Error('Verified remote revision required');
  queue.capture({draft,remote:latest.data,revision:latest.revision});
  return {handled:true,blocked:true,reason:'needs-review'};
 }
 return {handle,pending:queue.load};
}
module.exports={createConflictBoundary};
