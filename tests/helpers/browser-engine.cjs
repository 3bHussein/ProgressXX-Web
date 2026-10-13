const playwright=require('playwright');
const engine=process.env.PX_BROWSER||'chromium';
if(!['chromium','firefox','webkit'].includes(engine))throw Error('Unsupported PX_BROWSER: '+engine);
module.exports={engine,browserType:playwright[engine]};
