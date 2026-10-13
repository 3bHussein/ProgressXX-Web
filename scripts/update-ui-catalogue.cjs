const fs=require('node:fs');
const source=fs.readFileSync('index.html','utf8'),dictionary=JSON.parse(fs.readFileSync('docs/UI-LANGUAGE-CATALOGUE.json','utf8'));
const encoded=JSON.stringify(dictionary).replaceAll('<','\\u003c');
const marker=/const PX_UI_AR=.*;\nlet pxUILanguage/;if(!marker.test(source))throw Error('Inline translation catalogue marker missing');
fs.writeFileSync('index.html',source.replace(marker,()=> 'const PX_UI_AR='+encoded+';\nlet pxUILanguage'));
