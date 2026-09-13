"""c6 UX acceptance; Edge automation. --live also checks deployed PWA/offline.
Screenshots and geometry are saved in TEMP/movohray-c6-checks.
"""
import functools,http.server,threading,json,sys,tempfile,os
from pathlib import Path
from playwright.sync_api import sync_playwright
os.environ['PW_TEST_SCREENSHOT_NO_FONTS_READY']='1'
ART=Path(tempfile.gettempdir())/'movohray-c6-checks';ART.mkdir(exist_ok=True)
KEY='movohray-alias-swipe-learning-v1'
REV='0.6.7-20260913-c6'
CACHE='movohray-cache-v0.6.7-b20260913-c6'
class Handler(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Handler,directory=str(Path.cwd())))
threading.Thread(target=server.serve_forever,daemon=True).start()
URL='https://i-sirius.github.io/movohray/' if '--live' in sys.argv else 'http://127.0.0.1:%s/'%server.server_port
def start(page):
 page.locator('.mode-card-explain').click();page.wait_for_selector('#startRoundBtn')
 page.wait_for_function('categories.length>0')
 page.locator('#startRoundBtn').click();page.locator('#startTeamRoundBtn').click()
 page.wait_for_function('roundTimerIsActive && currentEntry && !isSwipeLocked')
def swipe(page,up=True):
 page.wait_for_function('!isSwipeLocked')
 r=page.locator('#wordCardMotion').bounding_box();x=r['x']+r['width']/2;y=r['y']+r['height']/2
 page.mouse.move(x,y);page.mouse.down();page.mouse.move(x,y+(-95 if up else 95),steps=8);page.mouse.up()
 page.wait_for_function('!isSwipeLocked')
def large(page):return 'is-learning' in page.locator('#swipeHint').get_attribute('class')
def finish(page):
 page.locator('#finishEarlyBtn').click();page.wait_for_selector('#roundReviewScreen.active')
def shot(page,name):
 page.screenshot(path=str(ART/name),animations='disabled',timeout=10000)
def clear(page):
 page.wait_for_function('''() => {document.querySelectorAll('.word-guess-achievement-toast-close').forEach(b=>b.click());return !wordGuessAchievementToastActive&&!wordGuessAchievementToastQueue.length&&!wordGuessAchievementToastPendingBatch.length&&!compactAchievementToast}''',timeout=60000)
def run(browser):
 context=browser.new_context(viewport={'width':390,'height':844},has_touch=True,reduced_motion='reduce')
 page=context.new_page();errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(URL);page.wait_for_selector('.mode-card-explain');assert page.evaluate('DATA_REVISION')==REV
 start(page);assert large(page)
 # Real pointer and button paths, two complete rounds.
 shot(page,'alias-fresh-390.png')
 page.locator('#correctBtn').click();page.wait_for_function('!isSwipeLocked')
 page.locator('#skipBtn').click();page.wait_for_function('!isSwipeLocked')
 assert page.evaluate('aliasSwipeLearning.totalSwipeGestures')==0
 swipe(page);assert large(page)
 swipe(page,False);assert large(page)
 for _ in range(4):swipe(page)
 assert large(page)
 finish(page);assert page.evaluate('aliasSwipeLearning.completedAliasRounds')==1
 page.locator('#confirmRoundBtn').click();page.locator('#startTeamRoundBtn').click();assert large(page)
 finish(page);assert page.evaluate('hasLearnedAliasSwipes()')
 page.locator('#confirmRoundBtn').click();page.locator('#startTeamRoundBtn').click();assert not large(page)
 shot(page,'alias-learned-390.png')
 stored=page.evaluate('localStorage.getItem(ALIAS_SWIPE_LEARNING_KEY)')
 page.reload();page.wait_for_selector('.mode-card-explain');start(page);assert not large(page)
 # Compact unlock: use actual achievement core with a locked definition.
 clear(page)
 ids=page.evaluate('WORD_GUESS_ACHIEVEMENTS.filter(a=>!wordGuessAchievementsState.unlocked[a.id]).slice(0,5).map(a=>a.id)')
 page.locator('#correctBtn').focus()
 before=page.evaluate('({focus:document.activeElement.id,deadline:roundTimerDeadlineMs,time:timeLeft})')
 page.evaluate('''()=>{window.c6Sounds=[];const play=playGameSound;playGameSound=function(name){c6Sounds.push(name);return play.apply(null,arguments)}}''')
 page.evaluate('(id)=>unlockWordGuessAchievement(id)',ids[0])
 page.wait_for_selector('.achievement-compact-toast')
 assert page.locator('.word-guess-achievement-toast').count()==0
 assert page.locator('.achievement-compact-toast').evaluate('(e)=>getComputedStyle(e).pointerEvents')=='none'
 assert page.evaluate('document.activeElement.id')==before['focus']
 page.evaluate('(ids)=>ids.forEach(id=>unlockWordGuessAchievement(id))',ids[1:])
 assert '5' in page.locator('.achievement-compact-toast').inner_text()
 assert page.evaluate('wordGuessAchievementToastQueue.length')==0
 assert not page.evaluate('c6Sounds.some(name=>name==="medal"||name==="reveal")')
 shot(page,'alias-compact-390.png')
 page.wait_for_selector('.achievement-compact-toast',state='detached',timeout=3000)
 assert page.evaluate('roundTimerDeadlineMs')==before['deadline']
 assert page.evaluate('timeLeft')<before['time']
 assert page.evaluate('(ids)=>ids.every(id=>wordGuessAchievementsState.unlocked[id].unlockedAt && isWordGuessAchievementNew(id))',ids)
 saved=page.evaluate('JSON.stringify(wordGuessAchievementsState.unlocked)')
 finish(page);page.wait_for_timeout(300);assert page.locator('.word-guess-achievement-toast').count()==0
 # Rich still allowed on review; conversion if a round starts while rich is showing.
 id=page.evaluate('WORD_GUESS_ACHIEVEMENTS.find(a=>!wordGuessAchievementsState.unlocked[a.id]).id')
 page.evaluate('(id)=>unlockWordGuessAchievement(id)',id);page.wait_for_selector('.word-guess-achievement-toast')
 page.locator('#confirmRoundBtn').click();page.locator('#startTeamRoundBtn').click()
 assert page.locator('.word-guess-achievement-toast').count()==0
 page.wait_for_selector('.achievement-compact-toast');clear(page)
 # Mobile/tablet/desktop geometry, both themes and every language; no scrolling needed in portrait.
 page.evaluate('setRoundPaused(true)')
 reports=[]
 for w,h in [(360,800),(375,812),(390,844),(393,852),(430,932),(768,1024),(1600,900),(844,390),(360,640)]:
  page.set_viewport_size({'width':w,'height':h})
  page.wait_for_function('([w,h])=>innerWidth===w&&innerHeight===h',arg=[w,h])
  page.evaluate('syncAppViewportHeight()')
  page.wait_for_timeout(350)
  for lang in ['uk','ru','en']:
   for theme in ['light','dark']:
    page.evaluate('''([lang,theme])=>{selectedWordGuessLanguage=lang;applyTheme(theme);aliasSwipeLearning={totalSwipeGestures:0,usedSwipeUp:false,usedSwipeDown:false,completedAliasRounds:0};renderAliasSwipeHint();updateWordCardMotionWidth()}''',[lang,theme])
    page.wait_for_timeout(350)
    report=page.evaluate('''() => {const rect=s=>{const r=document.querySelector(s).getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,h:r.height}};return {hint:rect('#swipeHint'),word:rect('#wordText'),token:rect('#wordCardMotion'),buttons:rect('#skipBtn'),end:rect('#finishEarlyBtn'),hud:rect('#gameScreen .game-hud'),overflow:document.documentElement.scrollWidth>innerWidth,font:getComputedStyle(swipeHint).fontSize}}''')
    assert not report['overflow'],(w,h,report)
    assert report['hint']['y']>=report['word']['bottom'],(w,h,report)
    assert report['hint']['bottom']<=report['buttons']['y'] or report['hint']['right']<=report['buttons']['x'],(w,h,report)
    if h>=800:assert report['end']['bottom']<=h,(w,h,report,page.locator('#swipeHint').get_attribute('class'),page.evaluate('[innerWidth,innerHeight,visualViewport.height,getComputedStyle(document.documentElement).getPropertyValue("--app-viewport-height")]'))
    if w<600 and h>=800:assert float(report['font'][:-2])>=17,(w,h,lang,theme,report,page.evaluate('document.body.dataset.screen'),page.locator('#swipeHint').get_attribute('class'))
    if lang=='uk' and theme=='light':
     page.evaluate('setRoundPaused(false)');shot(page,f'alias-fresh-{w}x{h}.png');page.evaluate('setRoundPaused(true)')
    reports.append([w,h,lang,theme,report])
 (ART/'alias-layouts.json').write_text(json.dumps(reports,ensure_ascii=False,indent=2),encoding='utf-8')
 # Pause/resume unchanged.
 page.set_viewport_size({'width':390,'height':844})
 page.evaluate('setRoundPaused(true)');remaining=page.evaluate('roundTimerRemainingMs');page.wait_for_timeout(1100)
 assert page.evaluate('roundTimerRemainingMs')==remaining
 page.evaluate('setRoundPaused(false)');assert page.evaluate('roundTimerIsActive && !isRoundPaused')
 page.reload();page.wait_for_selector('.mode-card-explain')
 assert page.evaluate('hasLearnedAliasSwipes() && aliasSwipeLearning.totalSwipeGestures===6')
 assert page.evaluate('(saved)=>Object.keys(JSON.parse(saved)).every(id=>JSON.stringify(wordGuessAchievementsState.unlocked[id])===JSON.stringify(JSON.parse(saved)[id]))',saved)
 page.wait_for_timeout(700);assert page.locator('.achievement-compact-toast,.word-guess-achievement-toast').count()==0
 # Reset follows the actual global confirmation flow.
 page.on('dialog',lambda d:d.accept());page.evaluate('resetMovohrayProgressAndSettings()')
 page.wait_for_timeout(1000);page.wait_for_selector('.mode-card-explain');start(page);assert large(page)
 assert page.evaluate('aliasSwipeLearning.totalSwipeGestures')==0
 assert not errors,errors
 # Fresh PWA and offline reload; live and local use identical revision assertions.
 page.evaluate('navigator.serviceWorker.ready');page.wait_for_function('navigator.serviceWorker.controller!==null')
 assert CACHE in page.evaluate('caches.keys()')
 context.set_offline(True);page.reload();page.wait_for_selector('.mode-card-explain');start(page);assert large(page)
 assert not errors,errors
 context.close()
 # Corrupt and unavailable storage in real page initialization.
 for unavailable in [False,True]:
  c=browser.new_context(service_workers='block');p=c.new_page()
  p.add_init_script('''if (UNAVAILABLE) {const get=Storage.prototype.getItem,set=Storage.prototype.setItem;Storage.prototype.getItem=function(k){if(k==='movohray-alias-swipe-learning-v1')throw Error('blocked');return get.call(this,k)};Storage.prototype.setItem=function(k,v){if(k==='movohray-alias-swipe-learning-v1')throw Error('blocked');return set.call(this,k,v)}} else localStorage.setItem('movohray-alias-swipe-learning-v1','bad JSON')'''.replace('UNAVAILABLE',str(unavailable).lower()))
  p.goto(URL);p.wait_for_selector('.mode-card-explain');start(p);assert large(p);swipe(p);assert large(p);c.close()
 print('PASS c6 onboarding, real gestures/buttons, rounds/reload/reset/storage, compact aggregation/timer/focus/persistence/no duplicates, 54 layouts, pause/resume, PWA/offline; runtime errors: 0',flush=True)
with sync_playwright() as p:
 b=p.chromium.launch(channel='msedge',headless=True)
 run(b);b.close()
server.shutdown()
