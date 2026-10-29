"""Check every 3–7 letter permutation of every released wheel against the shipped lexicon."""
from pathlib import Path
import json,itertools,collections,hashlib,zipfile
p=Path(__file__).resolve().parents[1]
s=(p/'word-circle/levels.js').read_text(encoding='utf-8');levels=json.loads(s.split('window.WordCircleData = ',1)[1].strip().rstrip(';'))
manifest=json.loads((p/'word-circle/dictionary-manifest.json').read_text(encoding='utf-8'))
report={}
for lang,packs in levels.items():
 lex=set(json.loads((p/f'word-circle/lexicon-{lang}.json').read_text(encoding='utf-8')))
 with zipfile.ZipFile(p/f'word-circle/sources/{lang}-hunspell.zip') as source:
  for name,member in [('index.aff','index.aff'),('index.dic','index.dic'),('license','LICENSE')]:assert hashlib.sha256(source.read(member)).hexdigest()==manifest['languages'][lang]['sha256'][name],(lang,'source hash',name)
 with zipfile.ZipFile(p/'word-circle/sources/frequency.zip') as source:assert hashlib.sha256(source.read(lang+'_50k.txt')).hexdigest()==manifest['languages'][lang]['frequencySha256']
 count=0;main=set();bonus=set();signatures=set()
 for i,pack in enumerate(packs):
  wheel=pack['letters'];sig=''.join(sorted(wheel));assert sig not in signatures,(lang,'repeated wheel',wheel);signatures.add(sig)
  permutations={''.join(v) for size in range(3,len(wheel)+1) for v in itertools.permutations(wheel,size)}
  expected=permutations&lex;actual=set(pack['main'])|set(pack['bonus'])
  assert expected==actual,(lang,i,'missing',expected-actual,'extra',actual-expected)
  assert len(pack['main'])>=3 and len(set(pack['main']))==len(pack['main'])
  assert not set(pack['main'])&set(pack['bonus'])
  assert pack['id']==lang+':'+''.join(sorted(wheel.lower()))
  count+=len(permutations);main.update(pack['main']);bonus.update(pack['bonus'])
  for word in actual:assert not (collections.Counter(word)-collections.Counter(wheel)),(lang,i,word)
 report[lang]={'levels':len(packs),'permutations':count,'lexicon':len(lex),'mainWords':len(main),'playableWords':len(main|bonus)}
 assert len(packs)==manifest['languages'][lang]['levels']
 print('PASS',lang,json.dumps(report[lang]),flush=True)
(p/'test-results').mkdir(exist_ok=True)
(p/'test-results/word-circle-combinations.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print('PASS all physical tile permutations, valid bonus completeness, unique wheels, stable IDs')
