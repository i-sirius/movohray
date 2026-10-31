"""Cache short (<=20 words), attributed exact-headword excerpts for Ukrainian.
No runtime CORS proxy. --fetch updates a bounded local cache from SLOVNYK.ua;
normal builds use the bundled, reviewed snapshot and make no network requests.
"""
from pathlib import Path
import argparse,concurrent.futures,html,json,re,threading,time,tempfile,urllib.parse,urllib.request,unicodedata
ROOT=Path(__file__).resolve().parents[1]
def normalize(s):return unicodedata.normalize('NFC',re.sub('[\u0301\u0341]','',unicodedata.normalize('NFD',html.unescape(s).lower()))).strip()
def plain(s):return re.sub(r'\s+',' ',html.unescape(re.sub('<[^>]+>','',s))).strip()
def parse_page(page,word):
 canonical=re.search(r'<link\b[^>]*rel=["\']canonical["\'][^>]*href=["\']([^"\']+)',page,re.I)
 title=re.search(r'<h4\b[^>]*class=["\']text-uppercase["\'][^>]*>(.*?)</h4>',page,re.S|re.I)
 if not canonical or not title:return None
 target=urllib.parse.parse_qs(urllib.parse.urlparse(html.unescape(canonical[1])).query).get('swrd',[''])[0]
 if normalize(target)!=normalize(word) or normalize(plain(title[1]))!=normalize(word):return None
 block=page.split('toggle-sum',1)
 if len(block)<2:return None
 paragraph=re.search(r'<p\b[^>]*>(.*?)</p>',block[1],re.S|re.I)
 if not paragraph:return None
 head=re.search(r'<b\b[^>]*>(.*?)</b>',paragraph[1],re.S|re.I)
 if not head:return None
 headword=html.unescape(re.sub('<[^>]+>','',re.sub(r'<sup\b.*?</sup>','',head[1],flags=re.S|re.I))).strip()
 headword=re.sub(r'[0-9¹²³]+$','',headword)
 if normalize(headword)!=normalize(word):return None
 body=paragraph[1][head.end():];body=re.sub(r'<i\b[^>]*>.*?</i>','',body,flags=re.S|re.I);body=plain(body)
 start=re.search(r'[А-ЯІЇЄҐ][а-яіїєґ]',body)
 if not start:return None
 body=body[start.start():]
 body=re.split(r'(?<=[.!?])\s*(?=[(\[])',body,maxsplit=1)[0]
 # A short contextual excerpt, not the article or its examples.
 text=' '.join(body.split()[:20]);text=text.split('; ')[0].strip()
 if not text:return None
 if len(body.split())>20:text=text.rstrip(' ,;:')+'…'
 return {'word':word.upper(),'headword':normalize(headword),'text':text,'source':'СЛОВНИК.ua · СУМ','url':'https://slovnyk.ua/index.php?'+urllib.parse.urlencode({'swrd':word.lower()}),'kind':'excerpt','maxWords':20}
def build(fetch=False):
 data=json.loads((ROOT/'word-circle/levels.js').read_text(encoding='utf-8').split('window.WordCircleData = ',1)[1].strip().rstrip(';'))
 words=sorted({w.lower() for p in data['uk'] for w in p['main']+p['bonus']})
 snapshot=ROOT/'word-circle/sources/definitions-uk-slovnyk.json'
 entries=json.loads(snapshot.read_text(encoding='utf-8')) if snapshot.exists() else {}
 if fetch:
  cache=Path(tempfile.gettempdir(),'movohray-exact-slovnyk-v4');cache.mkdir(exist_ok=True)
  limiter=threading.Lock();next_time=[0.0]
  def get(word):
   path=cache/(word+'.json')
   if path.exists():return word,json.loads(path.read_text(encoding='utf-8'))
   with limiter:
    delay=max(0,next_time[0]-time.monotonic());next_time[0]=max(next_time[0],time.monotonic())+.125
   if delay:time.sleep(delay)
   url='https://slovnyk.ua/index.php?'+urllib.parse.urlencode({'swrd':word})
   try:
    req=urllib.request.Request(url,headers={'User-Agent':'Movohray dictionary exact-headword checker (https://i-sirius.github.io/movohray/)'})
    with urllib.request.urlopen(req,timeout=15) as r:page=r.read().decode('utf-8')
    result=parse_page(page,word);path.write_text(json.dumps(result,ensure_ascii=False),encoding='utf-8');return word,result
   except Exception as exc:return word,{'error':str(exc)}
  found=0;errors=0
  with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
   for i,(word,result) in enumerate(pool.map(get,words),1):
    if result and 'error' not in result:entries[word]=result;found+=1
    elif result:errors+=1
    if i%100==0:print('SLOVNYK',i,'/',len(words),'exact excerpts',found,'network errors',errors,flush=True)
  snapshot.write_text(json.dumps(entries,ensure_ascii=False,sort_keys=True,separators=(',',':')),encoding='utf-8')
 filtered={word:entries[word] for word in words if word in entries and normalize(entries[word]['headword'])==normalize(word)}
 (ROOT/'word-circle/definition-data.js').write_text('/* Exact-headword attributed excerpts, <=20 words each; see sources/definitions-uk-slovnyk.json. */\nwindow.WordCircleEntries = '+json.dumps({'uk':filtered},ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
 print('DEFINITIONS',len(filtered),'/',len(words),'exact cached Ukrainian entries',flush=True)
if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('--fetch',action='store_true');build(parser.parse_args().fetch)
