'use strict';
// Isolated opt-in concurrency draft utility; intentionally NOT loaded by index.html.
const clone=structuredClone;
function keyFor(accountId){if(typeof accountId!=='string'||!accountId.trim())throw Error('Account ID required');return 'px-conflict:'+encodeURIComponent(accountId.trim())}
function createReviewQueue({accountId,storage}){
 if(!storage||typeof storage.getItem!=='function'||typeof storage.setItem!=='function')throw Error('Storage adapter required');
 const key=keyFor(accountId);
 function load(){const raw=storage.getItem(key);if(raw===null)return null;const record=JSON.parse(raw);if(!record||record.accountId!==accountId||record.status!=='awaiting-review'||!record.draft)throw Error('Invalid conflict record');return clone(record)}
 function capture({draft,remote,revision}){if(!draft||typeof draft!=='object')throw Error('Draft required');const existing=load();if(existing)throw Error('Pending conflict already exists; review before replacing');const record={accountId,status:'awaiting-review',draft:clone(draft),remote:remote==null?null:clone(remote),revision:revision??null};storage.setItem(key,JSON.stringify(record));return load()}
 function clearAfterAcknowledgement(approved){if(approved!==true)throw Error('Explicit acknowledged approval required');const existing=load();if(!existing)return false;if(typeof storage.removeItem!=='function')throw Error('Remove adapter required');storage.removeItem(key);return true}
 return {load,capture,clearAfterAcknowledgement,key};
}
module.exports={createReviewQueue};
