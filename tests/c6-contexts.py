"""Presentation integration in real game phases, including rich-to-compact transitions."""
import functools,http.server,threading,sys,tempfile,os
from pathlib import Path
from playwright.sync_api import sync_playwright
os.environ['PW_TEST_SCREENSHOT_NO_FONTS_READY']='1'
class Handler(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Handler,directory=str(Path.cwd())))
threading.Thread(target=server.serve_forever,daemon=True).start()
url='https://i-sirius.github.io/movohray/' if '--live' in sys.argv else 'http://127.0.0.1:%s/'%server.server_port
with sync_playwright() as p:
 b=p.chromium.launch(channel='msedge',headless=True)
 c=b.new_context(viewport={'width':390,'height':844},reduced_motion='reduce',service_workers='block');page=c.new_page();errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(url);page.wait_for_selector('.mode-card-battle')
 def unlock(compact):
  page.wait_for_function('''() => {document.querySelectorAll('.word-guess-achievement-toast-close').forEach(b=>b.click());return !wordGuessAchievementToastActive&&!wordGuessAchievementToastPendingBatch.length&&!compactAchievementToast}''')
  id=page.evaluate('WORD_GUESS_ACHIEVEMENTS.find(a=>!wordGuessAchievementsState.unlocked[a.id]).id')
  page.evaluate('(id)=>unlockWordGuessAchievement(id)',id)
  selector='.achievement-compact-toast' if compact else '.word-guess-achievement-toast'
  page.wait_for_selector(selector)
  assert page.locator('.word-guess-achievement-toast' if compact else '.achievement-compact-toast').count()==0
  return selector
 page.locator('.mode-card-battle').click();page.wait_for_selector('#slovesnyiStart')
 page.evaluate('''()=>{const create=SlovesnyiEngine.create;SlovesnyiEngine.create=function(){window.testState=create.apply(null,arguments);return window.testState}}''')
 page.locator('#slovesnyiStart').click();unlock(False)
 page.locator('#slovesnyiAdvance').click()
 assert page.evaluate('Slovesnyi.snapshot().phase')=='preparation'
 assert page.locator('.word-guess-achievement-toast').count()==0
 for phase in ['preparation','speechA','speechB','rebuttalA','rebuttalB']:
  assert page.evaluate('Slovesnyi.snapshot().phase')==phase
  selector=unlock(True)
  geometry=page.evaluate('''()=>{const t=document.querySelector('.achievement-compact-toast').getBoundingClientRect(),h=document.querySelector('#slovesnyiGameScreen .slovesnyi-toolbar').getBoundingClientRect(),w=document.querySelector('#slovesnyiTopic').getBoundingClientRect();return {top:t.top,bottom:t.bottom,header:h.bottom,word:w.top}}''')
  assert geometry['top']>=geometry['header'] and geometry['bottom']<=geometry['word'],geometry
  if phase=='speechA':page.screenshot(path=str(Path(tempfile.gettempdir())/'movohray-c6-checks/slovesnyi-compact.png'),animations='disabled')
  page.locator('#slovesnyiAdvance').click()
 assert page.evaluate('Slovesnyi.snapshot().phase')=='voting';unlock(False)
 page.reload();page.wait_for_selector('.mode-card-charades');page.locator('.mode-card-charades').click();page.wait_for_selector('#startRoundBtn')
 page.evaluate('selectedCharadesFormat="teams";updateModeLabels();startRound();beginPreparedRound()')
 assert page.evaluate('roundTimerIsActive && isCharades()');unlock(True)
 page.evaluate('finishRound()');page.wait_for_selector('#roundReviewScreen.active');unlock(False)
 # Single-card Crocodile remains untimed and rich.
 page.evaluate('selectedCharadesFormat="single";updateModeLabels();showScreen("game")');assert not page.evaluate('isFocusedTimedGameplay()');unlock(False)
 page.reload();page.wait_for_selector('.mode-card-whoami');page.locator('.mode-card-whoami').click();page.wait_for_selector('#whoAmISettingsScreen.active')
 page.wait_for_function('whoAmICategories.length>0')
 page.evaluate('whoAmIPartyMode="timed";startWhoAmIGame()')
 assert page.evaluate('isFocusedTimedGameplay()');unlock(True)
 page.evaluate('finishWhoAmITimedRound()');unlock(False)
 # Word Guess has no strict running timer.
 page.reload();page.wait_for_selector('.mode-card-wordguess');page.locator('.mode-card-wordguess').click()
 page.locator('#wordGuessStartBtn').click();page.wait_for_selector('#wordGuessGameScreen.active')
 assert not page.evaluate('isFocusedTimedGameplay()');unlock(False)
 page.evaluate('wordGuessCurrentGuess=wordGuessTarget;submitWordGuess()')
 page.wait_for_function('wordGuessFinished')
 # Real solved puzzle can still celebrate richly.
 page.reload();page.wait_for_selector('.mode-card-battle')
 page.evaluate('SvitlohrayEngine.generate=function(rows,cols){return SvitlohrayEngine.toggle({rows:rows,cols:cols,cells:Array(rows*cols).fill(1)},0)};Svitlohray.open()')
 page.locator('.svitlohray-tile').first.click();page.wait_for_selector('#svitlohrayReplay')
 assert not page.evaluate('isFocusedTimedGameplay()');page.wait_for_selector('.word-guess-achievement-toast')
 assert not errors,errors
 print('PASS Slovesnyi intro/preparation/speeches/rebuttals/voting; timed/single Crocodile; timed Who Am I/review; Word Guess; solved Svitlohray; rich transition; geometry; errors: 0',flush=True)
 b.close()
server.shutdown()
