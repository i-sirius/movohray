import os,shutil,importlib.util,sys,functools,http.server,threading,tempfile,subprocess,time,json,urllib.request
from pathlib import Path
p=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('daily_browser',p/'tests/daily-word-browser.py');h=importlib.util.module_from_spec(spec);spec.loader.exec_module(h)
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(h.Handler,directory=str(p)))
threading.Thread(target=server.serve_forever,daemon=True).start()
profile=tempfile.mkdtemp(prefix='slovokolo-test-')
browser=os.environ.get('MOVOHRAY_BROWSER') or (r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe' if os.name=='nt' else shutil.which('chromium') or shutil.which('google-chrome'))
assert browser,'Set MOVOHRAY_BROWSER to an installed Chromium browser'
proc=subprocess.Popen([browser,'--headless=new','--no-first-run','--no-default-browser-check','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,creationflags=getattr(subprocess,'CREATE_NO_WINDOW',0))
try:
 portfile=Path(profile)/'DevToolsActivePort'
 for _ in range(150):
  try:
   port=int(portfile.read_text().splitlines()[0]);break
  except (FileNotFoundError,PermissionError,ValueError,IndexError):time.sleep(.2)
 else:raise AssertionError('Browser debugging endpoint did not become ready')
 targets=json.load(urllib.request.urlopen(f'http://127.0.0.1:{port}/json'))
 page=h.CDP(next(t['webSocketDebuggerUrl'] for t in targets if t['type']=='page'))
 page.call('Runtime.enable');page.call('Page.enable');page.call('Network.enable')
 for f in list(p.glob('*.js'))+list((p/'word-circle').glob('*.js')):
  page.js('new Function('+json.dumps(f.read_text(encoding='utf-8'))+');true')
 print('PASS JavaScript parsing',flush=True)
 page.call('Page.navigate',{'url':os.environ.get('MOVOHRAY_TEST_URL') or f'http://127.0.0.1:{server.server_port}/'})
 page.wait("typeof Slovokolo!=='undefined' && typeof wordGuessAchievementsState!=='undefined'")

 page.wait("!document.body.classList.contains('required-update-open') && Boolean(document.querySelector('.mode-card-slovokolo'))")
 page.wait('Boolean(navigator.serviceWorker.controller)')
 def check(name,condition=True):
  assert condition,name
  print('PASS',name,flush=True)
 def wc(expr):return page.js("(()=>{const r=document.getElementById('slovokoloScreen').shadowRoot;"+expr+"})()")
 def saved(lang):return page.js("JSON.parse(localStorage.getItem('slovokolo-v5-current-"+lang+"'))")
 def click(id):wc("r.getElementById("+json.dumps(id)+").click();return true")
 def pick(word):
  wc("const used=new Set();for(const ch of "+json.dumps(word)+"){const b=[...r.querySelectorAll('.letter')].find(b=>b.textContent===ch&&!used.has(b));if(!b)throw Error('Missing tile '+ch);used.add(b);b.click();}r.getElementById('submit').click();return true")
 check('definition parser extracts Ukrainian meaning',page.js("WordCircleDefinitions.extract('<h3>Значення</h3><ol><li>Рідкісне слово.<dl><dd>Приклад</dd></dl></li></ol><h3>Переклад</h3>','uk')")=="Рідкісне слово.")
 check('definition parser restricts English language',page.js("WordCircleDefinitions.extract('<h2>English</h2><h3>Noun</h3><ol><li>A steep inlet.</li></ol><h3>References</h3><ol><li>Citation.</li></ol><h2>French</h2><ol><li>Autre sens.</li></ol>','en')")=="A steep inlet.")
 check('offline brief meaning available',page.js("WordCircleDefinitions.lookup('uk','КАР',new AbortController().signal)").startswith('Чашоподібна'))
 stats=page.js("Object.fromEntries(Object.entries(WordCircleData).map(([l,p])=>[l,{packs:p.length,words:new Set(p.flatMap(x=>[...x.main,...x.bonus])).size}]))")
 manifest=json.loads((p/'word-circle/dictionary-manifest.json').read_text(encoding='utf-8'))
 check('audited dictionary counts',all(stats[l]['packs']==manifest['languages'][l]['levels'] and stats[l]['words']==manifest['languages'][l]['playableWords'] for l in stats))
 print(json.dumps(stats),flush=True)
 check('new game follows the existing five menu cards',page.js("modeConfigs.filter(m=>m.available).map(m=>m.id)")==['explain','charades','wordguess','whoami','battle','slovokolo'])
 check('RAB is a main word in the BRAK circle',page.js("WordCircleData.uk.some(p=>p.id==='uk:\u0430\u0431\u043a\u0440'&&p.main.includes('\u0420\u0410\u0411'))"))
 original=page.js('WORD_GUESS_ACHIEVEMENTS.length')
 check('446 unique shared achievements',original==446 and page.js('new Set(WORD_GUESS_ACHIEVEMENTS.map(x=>x.id)).size===446'))
 # Exercise all languages through the existing global language selector.
 page.js('wordGuessLabsUnlocked=true;localStorage.setItem(WORD_GUESS_LABS_STORAGE_KEY,"true")')
 for lang,title in [('uk','Словоколо'),('ru','Словокруг'),('en','Word Circle')]:
  page.js('wordGuessLabsUnlocked=true;showScreen("menu");selectWordGuessLanguage('+json.dumps(lang)+')')
  page.js("localStorage.setItem('slovokolo-wallet-v1',JSON.stringify({balance:5,earned:WordCircleAchievements.get().bonuses}))")
  page.click('.mode-card-slovokolo')
  page.wait("Boolean(document.getElementById('slovokoloScreen').shadowRoot?.querySelector('.letter'))")
  check(lang+' inherits global language',wc("return r.querySelector('h1').textContent")==title and wc("return r.getElementById('language').hidden"))
  check(lang+' playable grid',wc("return r.querySelectorAll('.cell:not(.blank)').length>0"))
  # Require a pack with an explicit bonus so every language exercises bonus scoring.
  for attempt in range(100):
   candidate=saved(lang)
   if page.js('WordCircleData['+json.dumps(lang)+']['+str(candidate['packIndex'])+'].bonus.length>0'):break
   click('newPuzzle')
  else:raise AssertionError('No bonus pack for '+lang)
  time.sleep(.3) # Allow the stylesheet and screen scroll to settle before physical coordinates.
  data=saved(lang);word=data['board'][0]['word']
  # Pointer taps use real browser mouse input; all later words also exercise accessible click.
  click('clear')
  used=set()
  for ch in word:
   idx=next(i for i,c in enumerate(data['tiles']) if c==ch and i not in used);used.add(idx)
   pos=wc("const b=r.querySelectorAll('.letter')["+str(idx)+"];b.scrollIntoView({block:'center'});const x=b.getBoundingClientRect();return {x:x.x+x.width/2,y:x.y+x.height/2}")
   page.call('Input.dispatchMouseEvent',{'type':'mousePressed','button':'left','clickCount':1,**pos})
   page.call('Input.dispatchMouseEvent',{'type':'mouseReleased','button':'left','clickCount':1,**pos})
  click('submit')
  if word not in saved(lang)['solved']:print('POINTER FAILURE',word,wc("return {message:r.getElementById('message').textContent,selected:r.getElementById('current').textContent}"),flush=True)
  check(lang+' physical pointer taps accepted',word in saved(lang)['solved'])
  # selected tile removal and Backspace.
  click('clear');wc("r.querySelector('.letter').click();r.querySelector('.letter').click();return true")
  check(lang+' tap again removes tile',wc("return r.querySelectorAll('.chosen').length===0"))
  wc("r.querySelector('.letter').click();return true")
  page.call('Input.dispatchKeyEvent',{'type':'keyDown','key':'Backspace'})
  check(lang+' Backspace removes tile',wc("return r.querySelectorAll('.chosen').length===0"))
  wallet_before=page.js("JSON.parse(localStorage.getItem('slovokolo-wallet-v1')).balance")
  click('hint');check(lang+' hint spends 3 points',page.js("JSON.parse(localStorage.getItem('slovokolo-wallet-v1')).balance")==wallet_before-3);before=saved(lang);click('newLayout');after=saved(lang)
  check(lang+' layout preserves solves and hint usage',after['solved']==before['solved'] and after['usedHint'] is True)
  click('shuffle');check(lang+' shuffle preserves solves',saved(lang)['solved']==before['solved'])
  pack=page.js('WordCircleData['+json.dumps(lang)+']['+str(after['packIndex'])+']')
  for bonus in pack['bonus'][:1]:
   balance=page.js("JSON.parse(localStorage.getItem('slovokolo-wallet-v1')).balance")
   pick(bonus);check(lang+' bonus accepted',bonus in saved(lang)['bonusFound'])
   check(lang+' new bonus earns one point',page.js("JSON.parse(localStorage.getItem('slovokolo-wallet-v1')).balance")==balance+1)
   pick(bonus);check(lang+' duplicate bonus earns nothing',page.js("JSON.parse(localStorage.getItem('slovokolo-wallet-v1')).balance")==balance+1)
  if lang=='uk':
   click('hint');hinted=saved(lang)['hinted'];balance=page.js("JSON.parse(localStorage.getItem('slovokolo-wallet-v1')).balance")
   click('hint');check('insufficient points never reveal a letter',saved(lang)['hinted']==hinted and page.js("JSON.parse(localStorage.getItem('slovokolo-wallet-v1')).balance")==balance)

  before=saved(lang)
  # Exit uses shared back navigation; confirm dialog when applicable.
  click('back')
  if page.js('!exitMenuModal.hidden'):page.click('#confirmExitMenuBtn')
  check(lang+' back control returns to menu',page.js('getCurrentAppScreenName()')=='menu')
  page.click('.mode-card-slovokolo')
  check(lang+' reentry restores progress',saved(lang)['solved']==before['solved'] and saved(lang)['bonusFound']==before['bonusFound'] and saved(lang)['usedHint'])
  for w in pack['main']:pick(w)
  check(lang+' completed once',len(WordCircleCompleted:=page.js('WordCircleAchievements.get().completed'))==(['uk','ru','en'].index(lang)+1))
  displayed=wc("return [...r.getElementById('wordbookWords').querySelectorAll('button')].map(b=>b.textContent)")
  check(lang+' unfound bonuses remain hidden after completion',set(displayed)==set(saved(lang)['solved']+saved(lang)['bonusFound']))
  check(lang+' completed circle exposes dictionary',wc("return !r.getElementById('wordbook').hidden && r.getElementById('wordbookWords').children.length>0"))
  check(lang+' journey progress visible',wc("return r.getElementById('journey').textContent.includes('1')"))
  n=len(WordCircleCompleted);pick(pack['main'][0])
  check(lang+' duplicate response stays visible after completion',wc("return r.getElementById('message').textContent.includes("+json.dumps(pack['main'][0])+")"))
  pick(pack['bonus'][0])
  check(lang+' bonus response stays visible after completion',wc("return r.getElementById('message').textContent.includes("+json.dumps(pack['bonus'][0])+")"))
  click('newLayout')
  for w in pack['main']:pick(w)
  check(lang+' replay does not duplicate completion',page.js('WordCircleAchievements.get().completed.length')==n)
  page.call('Page.reload');page.wait("Boolean(document.querySelector('.mode-card-slovokolo')) && !document.body.classList.contains('required-update-open')")
  page.click('.mode-card-slovokolo')
  check(lang+' HTTP reload preserves completion',page.js('WordCircleAchievements.get().completed.length')==n)
  check(lang+' reload language retained',wc("return r.querySelector('h1').textContent")==title)
  check(lang+' completed session restored',len(saved(lang)['solved'])==len(pack['main']))
 check('shared first crossword and polyglot awards',page.js('Boolean(wordGuessAchievementsState.unlocked["wordcircle-wfirst"]&&wordGuessAchievementsState.unlocked["wordcircle-polyglot"])'))
 page.js('showScreen("menu");openWordGuessAchievementsModal({gameId:"slovokolo"})')
 check('shared collection displays localized awards',page.js('document.getElementById("achievementsModalGrid").textContent.includes("First crossword")'))
 page.js('closeWordGuessAchievementsModal()')
 # A new puzzle has a fresh set; swipe must wait until release.
 page.click('.mode-card-slovokolo');time.sleep(.3);click('newPuzzle');data=saved('en');word=data['board'][0]['word'];used=set();points=[]
 for ch in word:
  idx=next(i for i,c in enumerate(data['tiles']) if c==ch and i not in used);used.add(idx)
  points.append(wc("const b=r.querySelectorAll('.letter')["+str(idx)+"];b.scrollIntoView({block:'center'});const x=b.getBoundingClientRect();return {x:x.x+x.width/2,y:x.y+x.height/2}"))
 # Keep the wheel within the viewport, then recompute all centers.
 points=[]
 used=set()
 for ch in word:
  idx=next(i for i,c in enumerate(data['tiles']) if c==ch and i not in used);used.add(idx)
  points.append(wc("const x=r.querySelectorAll('.letter')["+str(idx)+"].getBoundingClientRect();return {x:x.x+x.width/2,y:x.y+x.height/2}"))
 page.call('Input.dispatchMouseEvent',{'type':'mousePressed','button':'left','clickCount':1,**points[0]})
 for point in points[1:]:page.call('Input.dispatchMouseEvent',{'type':'mouseMoved','button':'left','buttons':1,**point})
 check('swipe not credited before release',word not in saved('en')['solved'])
 page.call('Input.dispatchMouseEvent',{'type':'mouseReleased','button':'left','clickCount':1,**points[-1]})
 if word not in saved('en')['solved']:print('SWIPE FAILURE',word,wc("return {message:r.getElementById('message').textContent,selected:r.getElementById('current').textContent}"),points,flush=True)
 check('swipe accepted on release',word in saved('en')['solved'])
 # Real touch events use the same physical tile positions and do not reuse tiles.
 page.call('Emulation.setTouchEmulationEnabled',{'enabled':True,'maxTouchPoints':1})
 click('newPuzzle');data=saved('en');word=data['board'][0]['word'];used=set()
 wc("r.getElementById('wheel').scrollIntoView({block:'center'});return true")
 for ch in word:
  idx=next(i for i,c in enumerate(data['tiles']) if c==ch and i not in used);used.add(idx)
  point=wc("const x=r.querySelectorAll('.letter')["+str(idx)+"].getBoundingClientRect();return {x:x.x+x.width/2,y:x.y+x.height/2}")
  page.call('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[point]})
  page.call('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
 click('submit');check('real touch taps accepted',word in saved('en')['solved'])
 page.call('Emulation.setTouchEmulationEnabled',{'enabled':False})
 # Keyboard activation and selected-tile removal work inside the shadow root.
 click('clear');wc("r.querySelector('.letter').focus();return true")
 page.call('Input.dispatchKeyEvent',{'type':'keyDown','key':' ','code':'Space'})
 check('keyboard selects letter',wc("return r.querySelectorAll('.chosen').length===1"))
 page.call('Input.dispatchKeyEvent',{'type':'keyDown','key':' ','code':'Space'})
 check('keyboard removes selected letter',wc("return r.querySelectorAll('.chosen').length===0"))
 # Responsive light/dark, no document or board overflow at required widths.
 artifacts=p/'test-results';artifacts.mkdir(exist_ok=True)
 for width,height in [(360,800),(390,844),(430,900),(768,1024),(1280,1000)]:
  page.call('Emulation.setDeviceMetricsOverride',{'width':width,'height':height,'deviceScaleFactor':1,'mobile':width<600})
  page.js('window.scrollTo(0,0);window.dispatchEvent(new Event("resize"))')
  time.sleep(.15)
  check(str(width)+'px smaller letter wheel',wc("return r.getElementById('wheel').getBoundingClientRect().width<="+str(210 if width<=720 else 270)))
  check(str(width)+'px no horizontal overflow',page.js('document.documentElement.scrollWidth<=innerWidth') and wc("return r.getElementById('crossword').getBoundingClientRect().width<=r.getElementById('gridWrap').clientWidth"))
  check(str(width)+'px hidden grid cells have visible backgrounds',wc("const c=r.querySelector('.cell:not(.blank):not(.revealed):not(.hinted)');return !c||!['rgba(0, 0, 0, 0)','transparent'].includes(getComputedStyle(c).backgroundColor)"))
  if width==390:
   page.js('document.body.dataset.theme="dark"');page.js('window.scrollTo(0,0)')
   image=page.call('Page.captureScreenshot',{'format':'png','captureBeyondViewport':False})
   import base64
   (artifacts/'slovokolo-mobile-dark.png').write_bytes(base64.b64decode(image['data']))
   page.js('document.body.dataset.theme="light"')
  if width==1280:
   image=page.call('Page.captureScreenshot',{'format':'png','captureBeyondViewport':False});(artifacts/'slovokolo-desktop.png').write_bytes(base64.b64decode(image['data']))
 # Other games still open after leaving; no hidden game responds to keys.
 page.js('showScreen("menu")');before=saved('en')
 page.call('Input.dispatchKeyEvent',{'type':'keyDown','key':'Enter'})
 check('leaving removes game keyboard listeners',saved('en')==before)
 for selector,screen in [('.mode-card-wordguess','wordGuessSettings'),('.mode-card-whoami','whoAmISettings'),('.mode-card-explain','settings'),('.mode-card-charades','settings'),('.mode-card-battle','slovesnyiSetup')]:
  page.js('showScreen("menu")');page.click(selector);page.wait('getCurrentAppScreenName()==='+json.dumps(screen));check('other mode '+selector)
 page.js('showScreen("menu");Slovokolo.open()')
 # All critical assets must be available before testing offline restart.
 check('word-circle assets precached',page.js("caches.open(DATA_CACHE).then(c=>Promise.all(['style.css','view.js','game.js','levels.js','achievements.js','integration.js','definitions.js'].map(f=>c.match('./word-circle/'+f+'?rev='+ASSET_REVISION)))).then(v=>v.every(Boolean))"))
 page.call('Network.emulateNetworkConditions',{'offline':True,'latency':0,'downloadThroughput':0,'uploadThroughput':0})
 page.call('Page.reload');page.wait("Boolean(document.querySelector('.mode-card-slovokolo'))")
 page.click('.mode-card-slovokolo');page.wait("Boolean(document.getElementById('slovokoloScreen').shadowRoot?.querySelector('.letter'))")
 check('offline reload opens game and restores progress',len(saved('en')['solved'])>0)
 # Standalone demo remains usable with the same engine.
 page.call('Network.emulateNetworkConditions',{'offline':False,'latency':0,'downloadThroughput':-1,'uploadThroughput':-1})
 page.call('Page.navigate',{'url':(os.environ.get('MOVOHRAY_TEST_URL') or f'http://127.0.0.1:{server.server_port}/').rstrip('/')+'/slovokolo.html'})
 page.wait('Boolean(document.querySelector(".letter"))')
 check('standalone demo still opens',page.js('document.querySelectorAll("#crossword .cell:not(.blank)").length>0'))
 for lang in ['ru','en','uk']:
  page.js('document.getElementById("language").value='+json.dumps(lang)+';document.getElementById("language").dispatchEvent(new Event("change"))')
  check('standalone '+lang,page.js('document.documentElement.lang')==lang)
 page.js("localStorage.setItem('slovokolo-v5-current-en','{broken')")
 page.call('Page.navigate',{'url':os.environ.get('MOVOHRAY_TEST_URL') or f'http://127.0.0.1:{server.server_port}/'})
 page.wait("Boolean(document.querySelector('.mode-card-slovokolo')) && !document.body.classList.contains('required-update-open')")
 page.click('.mode-card-slovokolo')
 page.wait("Boolean(document.getElementById('slovokoloScreen').shadowRoot?.querySelector('.letter'))")
 data=saved('en');check('corrupt session recovers to a playable full board',len(data['board'])==page.js('WordCircleData.en['+str(data['packIndex'])+'].main.length'))
 ids=[]
 for _ in range(12):
  data=saved('en');ids.append(data['packId']);click('newPuzzle')
 check('progression does not repeat circles prematurely',len(set(ids))==len(ids))
 # A bonus must never earn twice after starting another session of the same circle.
 data=saved('en');pack=page.js('WordCircleData.en['+str(data['packIndex'])+']')
 if pack['bonus']:
  bonus=pack['bonus'][0];pick(bonus)
  balance=page.js("JSON.parse(localStorage.getItem('slovokolo-wallet-v1')).balance")
  page.js("showScreen('menu');const v=JSON.parse(localStorage.getItem('slovokolo-v5-current-en'));v.bonusFound=[];localStorage.setItem('slovokolo-v5-current-en',JSON.stringify(v));Slovokolo.open()")
  pick(bonus);check('replayed bonus cannot farm points',page.js("JSON.parse(localStorage.getItem('slovokolo-wallet-v1')).balance")==balance)
  check('found word opens meaning with source',wc("return !r.querySelector('.meaning-panel').hidden && r.querySelector('.meaning-panel a').href.startsWith('https://en.wiktionary.org/wiki/')"))
 # Extractor strips embedded markup rather than rendering remote HTML in the app.
 check('definition content is plain text',page.js("WordCircleDefinitions.extract('<h3>Значение</h3><ol><li><b>Смысл</b><sup>1</sup><dl><dd>пример</dd></dl></li></ol>','ru')")=="Смысл")
 check('no uncaught browser errors',not page.errors)
 print('ALL INTEGRATION CHECKS PASSED',flush=True)
finally:
 proc.terminate();server.shutdown()
