const fs=require('node:fs'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const html=fs.readFileSync('index.html','utf8'),catalogue=JSON.parse(fs.readFileSync('docs/UI-LANGUAGE-CATALOGUE.json','utf8'));
assert.deepEqual(JSON.parse(html.match(/const PX_UI_AR=(.*);\nlet pxUILanguage/)[1]),catalogue,'Offline inline catalogue must match its maintained source');
const texts=JSON.parse(execFileSync('python3',['-c',`
import json,re
from html.parser import HTMLParser
class P(HTMLParser):
 def __init__(self):super().__init__();self.skip=0;self.texts=set()
 def handle_starttag(self,t,a):
  if t in ('script','style'):self.skip+=1
  if not self.skip:
   for k,v in a:
    if k in ('placeholder','aria-label','title') and v:self.texts.add(re.sub(r'\\s+',' ',v.strip()))
 def handle_endtag(self,t):
  if t in ('script','style'):self.skip=max(0,self.skip-1)
 def handle_data(self,d):
  if not self.skip:self.texts.add(re.sub(r'\\s+',' ',d.strip()))
p=P();p.feed(open('index.html').read());print(json.dumps(sorted(x for x in p.texts if re.search('[A-Za-z]{2}',x))))
`],{encoding:'utf8'}));
const unchanged=/^(?:ProgressX|ProgressXX|PROGRESSXX|ANATOMY|@3bHussein|v\d|20\d\d-|https?:|—|\d|[+−]?\d|kg$|kcal$|g$|cm$|mL$|lb$|mm$|CSV$|JSON$|MET$|RPE$|BMI$|BMR$|TDEE$)/;
const missing=texts.filter(s=>!catalogue[s]&&!unchanged.test(s));assert.deepEqual(missing,[],'Static UI strings need an Arabic entry or explicit unchanged unit/brand exemption');
for(const [en,ar] of Object.entries(catalogue)){assert(en.trim());assert.equal(typeof ar,'string');assert(ar.trim());}
console.log('PASS: maintained and offline inline language catalogues match; static UI coverage and nonempty translations verified ('+Object.keys(catalogue).length+' entries)');
