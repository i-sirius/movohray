"""c10 checks using an installed Chromium/Edge and Python's standard library.

No browser/Node/package download. An isolated temporary profile is used.
Run: python -X utf8 tests/daily-word-browser.py
Set MOVOHRAY_BROWSER to override the browser executable.
"""
import base64
import functools
import hashlib
import http.server
import json
import os
from pathlib import Path
import socket
import struct
import subprocess
import tempfile
import threading
import time
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
REV = '0.6.7-20260918-c10'
CACHE = 'movohray-cache-v0.6.7-b20260918-c10'


class CDP:
    """Minimal local-only RFC6455 transport for Chromium's DevTools endpoint."""
    def __init__(self, url):
        from urllib.parse import urlsplit
        parsed = urlsplit(url)
        self.sock = socket.create_connection((parsed.hostname, parsed.port), timeout=45)
        key = base64.b64encode(os.urandom(16)).decode()
        self.sock.sendall((f'GET {parsed.path} HTTP/1.1\r\nHost: {parsed.netloc}\r\n'
                           f'Upgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {key}\r\n'
                           'Sec-WebSocket-Version: 13\r\n\r\n').encode())
        header = b''
        while not header.endswith(b'\r\n\r\n'):
            header += self.sock.recv(1)
        assert b' 101 ' in header, header
        self.sequence = 0
        self.errors = []

    def read(self, size):
        data = b''
        while len(data) < size:
            part = self.sock.recv(size-len(data))
            if not part:
                raise RuntimeError('DevTools disconnected')
            data += part
        return data

    def send(self, payload, opcode=1):
        mask = os.urandom(4)
        length = len(payload)
        head = bytes([128 | opcode, 128 | (length if length < 126 else 126 if length < 65536 else 127)])
        if length >= 126:
            head += struct.pack('!H' if length < 65536 else '!Q', length)
        self.sock.sendall(head+mask+bytes(c ^ mask[i % 4] for i, c in enumerate(payload)))

    def receive(self):
        chunks = b''
        while True:
            a, b = self.read(2)
            length = b & 127
            if length == 126:
                length = struct.unpack('!H', self.read(2))[0]
            elif length == 127:
                length = struct.unpack('!Q', self.read(8))[0]
            payload = self.read(length)
            if a & 15 == 9:
                self.send(payload, 10)
                continue
            if a & 15 == 8:
                raise RuntimeError('DevTools closed')
            chunks += payload
            if a & 128:
                return json.loads(chunks)

    def call(self, method, params=None):
        self.sequence += 1
        request_id = self.sequence
        self.send(json.dumps({'id': request_id, 'method': method, 'params': params or {}}).encode())
        while True:
            message = self.receive()
            if message.get('method') == 'Runtime.exceptionThrown':
                self.errors.append(message['params'])
            if message.get('id') == request_id:
                if 'error' in message:
                    raise RuntimeError(message['error'])
                return message.get('result', {})

    def js(self, expression):
        result = self.call('Runtime.evaluate', {'expression': expression, 'awaitPromise': True, 'returnByValue': True})
        if 'exceptionDetails' in result:
            raise AssertionError(result['exceptionDetails'])
        return result.get('result', {}).get('value')

    def wait(self, expression, timeout=45):
        deadline = time.monotonic()+timeout
        while time.monotonic() < deadline:
            if self.js(expression):
                return
            time.sleep(.15)
        raise AssertionError('Timed out: '+expression)

    def click(self, selector):
        # DOM activation exercises the same listeners; keyboard input is tested separately.
        self.js(f'document.querySelector({json.dumps(selector)}).click()')


class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *_):
        pass


class UpgradeHandler(Handler):
    legacy = True
    baseline = {}

    def do_GET(self):
        from urllib.parse import urlsplit
        name = urlsplit(self.path).path.lstrip('/') or 'index.html'
        if self.legacy and name in self.baseline:
            payload = self.baseline[name]
            self.send_response(200)
            self.send_header('Content-Type', self.guess_type(name))
            self.send_header('Content-Length', str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
        else:
            super().do_GET()


def check(name, condition):
    assert condition, name
    print('PASS', name, flush=True)


def run():
    browser = os.environ.get('MOVOHRAY_BROWSER', r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe')
    assert Path(browser).exists(), 'Set MOVOHRAY_BROWSER to an installed Chromium browser'
    server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Handler, directory=str(ROOT)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    profile = tempfile.mkdtemp(prefix='movohray-daily-c10-')
    artifacts = Path(tempfile.gettempdir())/'movohray-daily-c10-results'
    artifacts.mkdir(exist_ok=True)
    proc = subprocess.Popen([browser, '--headless=new', '--no-first-run', '--no-default-browser-check',
                             '--remote-debugging-port=0', '--user-data-dir='+profile, 'about:blank'],
                            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                            creationflags=getattr(subprocess, 'CREATE_NO_WINDOW', 0))
    try:
        port_file = Path(profile)/'DevToolsActivePort'
        deadline = time.monotonic()+30
        while not port_file.exists() and time.monotonic() < deadline:
            time.sleep(.2)
        port = int(port_file.read_text().splitlines()[0])
        targets = json.load(urllib.request.urlopen(f'http://127.0.0.1:{port}/json'))
        page = CDP(next(t['webSocketDebuggerUrl'] for t in targets if t['type']=='page'))
        page.call('Runtime.enable')
        page.call('Page.enable')
        page.call('Network.enable')
        # Parse every top-level JS with the actual browser engine, including the worker.
        for file in list(ROOT.glob('*.js'))+list((ROOT/'tests').glob('*.js'))+list((ROOT/'tests').glob('*.cjs')):
            page.js('new Function('+json.dumps(file.read_text(encoding='utf-8'))+'); true')
        check('all JavaScript parses in Chromium', True)
        for file in ROOT.rglob('*.json'):
            json.loads(file.read_text(encoding='utf-8'))
        check('all JSON parses', True)
        pool = json.loads((ROOT/'daily-words.json').read_text(encoding='utf-8'))
        frozen_bytes=(ROOT/'daily-words.json').read_bytes().replace(b'\r\n',b'\n')
        check('v1 pool order is frozen',hashlib.sha256(frozen_bytes).hexdigest()=='aa9d6bf44d159264065f219c0b2a793ee5c53e0019cce18b0ccb076ce55dd7d9')
        for lang, file in [('uk','wordguess.json'),('ru','wordguess-ru.json'),('en','wordguess-en.json')]:
            words = pool['languages'][lang]
            source = json.loads((ROOT/file).read_text(encoding='utf-8'))['modes']['5']['answers']
            normalized = [w.replace('ё','е') for w in words]
            check(lang+' pool: 365 unique existing five-letter answers', len(words)==365 and len(set(normalized))==365 and set(words)<=set(source) and all(len(w)==5 for w in words))
        page.js((ROOT/'daily-word.js').read_text(encoding='utf-8'))
        page.js((ROOT/'tests/daily-word.test.js').read_text(encoding='utf-8'))
        checks = page.js('runDailyWordTests('+json.dumps(pool)+')')
        for name in checks:
            check(name, True)
        for timezone in ['America/Los_Angeles','Pacific/Auckland','Europe/Kyiv']:
            page.call('Emulation.setTimezoneOverride', {'timezoneId': timezone})
            check('local evening '+timezone, page.js('DailyWord.localDate(new Date(2026,8,18,23,59))')=='2026-09-18')
        page.call('Emulation.setTimezoneOverride', {'timezoneId': 'Europe/Kyiv'})
        url = f'http://127.0.0.1:{server.server_port}/'
        page.call('Page.navigate', {'url': url})
        page.wait("typeof dailyWordSession !== 'undefined' && document.querySelector('#dailyWordStartBtn').textContent && !document.body.classList.contains('required-update-open')")
        page.wait("Boolean(navigator.serviceWorker.controller)")
        check('release', page.js('getLocalReleaseInfo().revision')==REV)
        check('439 unique achievements', page.js('WORD_GUESS_ACHIEVEMENTS.length === 439 && new Set(WORD_GUESS_ACHIEVEMENTS.map(d=>d.id)).size === 439'))
        baseline = subprocess.check_output(['git','show','df861c893b5deb6ee8212d7bf29ec3daf75e2b69:app.js'],cwd=ROOT).decode('utf-8')
        definitions = baseline.split('const WORD_GUESS_ACHIEVEMENTS = ',1)[1].split('\n];',1)[0]+']'
        check('all 434 c9 definitions unchanged and in original order', page.js('JSON.stringify(WORD_GUESS_ACHIEVEMENTS.slice(0,434))===JSON.stringify('+definitions+')'))
        check('all daily translations', page.js("['ru','en'].every(l=>Object.keys(WORD_GUESS_TEXT.uk).every(k=>typeof WORD_GUESS_TEXT[l][k] !== 'undefined'))"))
        check('new assets precached', page.js("Promise.all(['daily-word.js','daily-word-ui.js','daily-words.json'].map(f=>caches.match(getRevisionedAssetUrl(f)).then(Boolean))).then(a=>a.every(Boolean))"))
        page.call('Emulation.setDeviceMetricsOverride', {'width':1280,'height':900,'deviceScaleFactor':1,'mobile':False})
        screenshot(page, artifacts/'desktop-menu.png')
        page.click('#dailyWordStartBtn')
        page.wait("getCurrentAppScreenName() === 'wordGuessGame'")
        target = page.js('wordGuessTarget')
        check('daily configuration and no pregame answer', page.js("getWordGuessLength()===5 && getWordGuessAttempts()===6 && getWordGuessAllowsRepeats() && !document.querySelector('#wordGuessBoard').textContent.trim() && document.querySelector('#wordGuessResult').hidden"))
        screenshot(page, artifacts/'desktop-daily.png')
        page.call('Page.reload')
        page.wait("typeof appHistoryInitialized!=='undefined' && appHistoryInitialized")
        page.click('#dailyWordStartBtn')
        page.wait("getCurrentAppScreenName()==='wordGuessGame'")
        check('unfinished reload keeps the same word', page.js('wordGuessTarget')==target)
        # Real accepted guesses/reveal/finish path: loss, retry, then physical-keyboard win.
        wrong = page.js('Array.from(wordGuessAllowedGuesses).find(w=>normalizeWordGuessComparisonWord(w)!==normalizeWordGuessComparisonWord(wordGuessTarget))')
        for _ in range(6):
            page.js('wordGuessCurrentGuess='+json.dumps(wrong)+'; submitWordGuess()')
            page.wait('!wordGuessInputLocked')
        page.wait('wordGuessFinished')
        check('loss offers retry, no completion', page.js("!dailyWordStore.status(selectedWordGuessLanguage, DailyWord.localDate()).completed && wordGuessNewBtn.textContent===getWordGuessText('dailyRetry')"))
        page.click('#wordGuessNewBtn')
        page.wait('!wordGuessFinished && wordGuessResult.hidden')
        check('retry identical target', page.js('wordGuessTarget')==target)
        for key in target:
            page.call('Input.dispatchKeyEvent', {'type':'keyDown','key':key})
        page.call('Input.dispatchKeyEvent', {'type':'keyDown','key':'Enter'})
        page.wait('wordGuessFinished && !wordGuessResult.hidden')
        check('real win completion and first award', page.js("dailyWordStore.status('uk',DailyWord.localDate()).totalCompleted===1 && !!wordGuessAchievementsState.unlocked['daily-word-first']"))
        page.js('finishWordGuessGame(true)')
        check('duplicate finish ignored', page.js("dailyWordStore.status('uk',DailyWord.localDate()).totalCompleted===1"))
        screenshot(page, artifacts/'desktop-result.png')
        page.click('#wordGuessNewBtn')
        page.wait('!wordGuessFinished && wordGuessResult.hidden')
        check('play more uses normal settings', page.js('dailyWordSession===null && getWordGuessAttempts()===selectedWordGuessAttempts && getWordGuessAllowsRepeats()===selectedWordGuessAllowRepeats'))
        before_games = page.js('wordGuessAchievementsState.games')
        page.js('wordGuessCurrentGuess=wordGuessTarget;submitWordGuess()')
        page.wait('wordGuessFinished')
        check('normal win keeps daily total unchanged', page.js("dailyWordStore.status('uk',DailyWord.localDate()).totalCompleted===1 && wordGuessAchievementsState.games==="+str(before_games+1)))
        page.js('leaveWordGuessGame();showScreen("menu")')
        check('completed home state', page.js("document.querySelector('#dailyWordStartBtn').disabled && document.querySelector('#dailyWordStartBtn').textContent===getWordGuessText('dailyCompleted')"))
        page.call('Page.reload')
        page.wait("typeof dailyWordSession!=='undefined' && document.querySelector('#dailyWordStartBtn').disabled && document.querySelector('#dailyWordStartBtn').textContent")
        check('daily state survives reload', page.js("dailyWordStore.status('uk',DailyWord.localDate()).totalCompleted===1"))
        # More flows below are deliberately isolated by language/date, not system-clock changes.
        page.js("wordGuessLabsUnlocked=true;selectWordGuessLanguage('en')")
        page.click('#dailyWordStartBtn')
        page.wait("getCurrentAppScreenName()==='wordGuessGame'")
        en_target = page.js('wordGuessTarget')
        page.js('leaveWordGuessGame();showScreen("menu");kidsModeEnabled=true;kidsAge=5;resetWordGuessDictionaryCache()')
        page.click('#dailyWordStartBtn')
        page.wait("getCurrentAppScreenName()==='wordGuessGame'")
        check('Kids independent target and hints', page.js('wordGuessTarget')==en_target and page.js('getWordGuessAttempts()')==6)
        page.js("selectWordGuessLanguage('ru')")
        check('active daily language locked', page.js('selectedWordGuessLanguage')=='en')
        for width,height in [(320,568),(375,667),(667,375)]:
            page.call('Emulation.setDeviceMetricsOverride', {'width':width,'height':height,'deviceScaleFactor':1,'mobile':True})
            page.js('scheduleWordGuessViewportFit({settle:true})')
            check(f'daily no horizontal overflow {width}x{height}', page.js('document.documentElement.scrollWidth<=innerWidth'))
            screenshot(page, artifacts/f'daily-{width}x{height}.png')
        page.js('wordGuessCurrentGuess=wordGuessTarget;submitWordGuess()')
        page.wait('wordGuessFinished')
        for width,height in [(320,568),(667,375)]:
            page.call('Emulation.setDeviceMetricsOverride', {'width':width,'height':height,'deviceScaleFactor':1,'mobile':True})
            check(f'result no overflow {width}x{height}', page.js('wordGuessResult.scrollWidth<=wordGuessResult.clientWidth+1'))
            screenshot(page, artifacts/f'result-{width}x{height}.png')
        page.js('leaveWordGuessGame();showScreen("menu")')
        page.call('Emulation.setDeviceMetricsOverride', {'width':320,'height':568,'deviceScaleFactor':1,'mobile':True})
        check('narrow menu no overflow', page.js("document.documentElement.scrollWidth<=innerWidth && document.querySelector('.daily-word-card').scrollWidth<=document.querySelector('.daily-word-card').clientWidth"))
        screenshot(page, artifacts/'narrow-menu.png')
        # Offline reload and an uncompleted language: data must come from the SW.
        page.js("selectWordGuessLanguage('ru');localStorage.setItem(WORD_GUESS_LABS_STORAGE_KEY,'true');persistWordGuessLanguagePreference()")
        page.call('Network.emulateNetworkConditions', {'offline':True,'latency':0,'downloadThroughput':0,'uploadThroughput':0})
        page.call('Page.reload')
        page.wait("typeof appHistoryInitialized!=='undefined' && appHistoryInitialized && !document.body.classList.contains('required-update-open')")
        page.click('#dailyWordStartBtn')
        page.wait("getCurrentAppScreenName()==='wordGuessGame'")
        check('offline daily launch', page.js('dailyWordSession.language')=='ru')
        page.js('wordGuessCurrentGuess=wordGuessTarget;submitWordGuess()')
        page.wait('wordGuessFinished')
        check('offline real completion', page.js("dailyWordStore.status('ru',DailyWord.localDate()).completed"))
        check('daily share identifies date', page.js("buildWordGuessShareText().includes(dailyWordSession.date) && buildWordGuessShareText().includes(getWordGuessText('dailyTitle'))"))
        page.call('Network.emulateNetworkConditions', {'offline':False,'latency':0,'downloadThroughput':-1,'uploadThroughput':-1})
        page.js('leaveWordGuessGame();showScreen("menu");applyTheme("dark")')
        page.js("document.querySelector('.daily-word-card').scrollIntoView({block:'center'})")
        screenshot(page, artifacts/'narrow-dark-menu.png')
        check('dark streak follows readable theme text',page.js("getComputedStyle(document.querySelector('#dailyWordStreak')).color === getComputedStyle(document.body).getPropertyValue('--color-text').trim() || getComputedStyle(document.querySelector('#dailyWordStreak')).color === getComputedStyle(document.querySelector('#dailyWordTitle')).color"))
        # Threshold awards exercise the real adapter, with isolated daily test data.
        thresholds = page.js('''(() => {
          const original=dailyWordStore, values={}, passed=[];
          dailyWordStore=DailyWord.createStore({getItem:k=>values[k]||null,setItem:(k,v)=>{values[k]=v;}});
          for(let i=1;i<=50;i++) {
            dailyWordStore.complete('uk',DailyWord.localDate(new Date(2024,0,i,12)));
            evaluateDailyWordAchievements();
            for(const n of [3,7,30,50]) if(i===n || i===n-1) {
              const id=n===50?'daily-word-total-50':'daily-word-streak-'+n;
              if(Boolean(wordGuessAchievementsState.unlocked[id])!==(i>=n)) throw Error(id+' at '+i);
              passed.push(id+' at '+i);
            }
          }
          dailyWordStore=original;return passed;
        })()''')
        for name in thresholds:
            check(name, True)
        # c9 -> c10 required update in two tabs, with real service workers.
        for name in ['index.html','app.js','styles.css','version.json','service-worker.js']:
            UpgradeHandler.baseline[name] = subprocess.check_output(['git','show','df861c893b5deb6ee8212d7bf29ec3daf75e2b69:'+name],cwd=ROOT)
        upgrade = http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(UpgradeHandler,directory=str(ROOT)))
        threading.Thread(target=upgrade.serve_forever,daemon=True).start()
        try:
            upgrade_url=f'http://127.0.0.1:{upgrade.server_port}/'
            page.call('Page.navigate', {'url':upgrade_url})
            page.wait("typeof appHistoryInitialized!=='undefined' && appHistoryInitialized && !!navigator.serviceWorker.controller")
            check('c9 worker active before upgrade', page.js("getActiveServiceWorkerInfo().then(s=>s.revision)")=='0.6.7-20260914-c9')
            page.js("wordGuessAchievementsState.games=123;wordGuessAchievementsState.unlocked['first-win']={unlockedAt:'2026-01-01T12:00:00.000Z',reward:'🏆'};persistWordGuessAchievementsState();localStorage.setItem('movohray-alias-swipe-learning-v1',JSON.stringify({usedSwipeUp:true,usedSwipeDown:true,totalSwipeGestures:12,completedAliasRounds:4}));")
            tab_id=page.call('Target.createTarget',{'url':upgrade_url})['targetId']
            targets=json.load(urllib.request.urlopen(f'http://127.0.0.1:{port}/json'))
            tab=CDP(next(t['webSocketDebuggerUrl'] for t in targets if t['id']==tab_id))
            tab.wait("typeof appHistoryInitialized!=='undefined' && appHistoryInitialized")
            UpgradeHandler.legacy=False
            page.js('checkRequiredUpdate({startup:false})')
            check('required gate blocks old candidate', page.js("document.body.classList.contains('required-update-open') && !!document.querySelector('#requiredUpdateOverlay')"))
            page.click('#requiredUpdateBtn')
            page.wait("typeof DATA_REVISION!=='undefined' && DATA_REVISION==='"+REV+"' && appHistoryInitialized && !document.body.classList.contains('required-update-open')",timeout=60)
            check('c10 GET_REVISION/cache handshake',page.js('getActiveServiceWorkerInfo()')=={'revision':REV,'cache':CACHE})
            check('old achievements, statistics and Alias learning survive upgrade',page.js("wordGuessAchievementsState.games===123 && !!wordGuessAchievementsState.unlocked['first-win'] && JSON.parse(localStorage.getItem('movohray-alias-swipe-learning-v1')).totalSwipeGestures===12"))
            tab.js('checkRequiredUpdate({startup:false})')
            tab.wait("document.body.classList.contains('required-update-open')")
            tab.click('#requiredUpdateBtn')
            tab.wait("typeof DATA_REVISION!=='undefined' && DATA_REVISION==='"+REV+"' && appHistoryInitialized && !document.body.classList.contains('required-update-open')",timeout=60)
            check('second tab upgrades safely',tab.js('getActiveServiceWorkerInfo()')=={'revision':REV,'cache':CACHE})
            # Fresh c10 daily page receives completion from the other tab.
            page.click('#dailyWordStartBtn');page.wait("getCurrentAppScreenName()==='wordGuessGame'")
            tab.click('#dailyWordStartBtn');tab.wait("getCurrentAppScreenName()==='wordGuessGame'")
            page.js('wordGuessCurrentGuess=wordGuessTarget;submitWordGuess()');page.wait('wordGuessFinished')
            tab.js('wordGuessCurrentGuess=wordGuessTarget;submitWordGuess()');tab.wait('wordGuessFinished')
            check('two tabs cannot double-complete the same daily',page.js("dailyWordStore.status('uk',DailyWord.localDate()).totalCompleted===1"))
            page.call('Target.closeTarget',{'targetId':tab_id})
            page.js('leaveWordGuessGame();showScreen("menu")')
            for width,height in [(1280,900),(320,568),(667,375)]:
                page.call('Emulation.setDeviceMetricsOverride',{'width':width,'height':height,'deviceScaleFactor':1,'mobile':width<800})
                page.js('openWordGuessAchievementsModal()')
                check(f'achievement stats fit {width}x{height}',page.js("(() => {const s=document.querySelector('#dailyWordCollectionStats'),c=document.querySelector('.achievements-modal-card'),g=document.querySelector('#achievementsModalGrid');return s.scrollWidth<=s.clientWidth+1 && c.scrollWidth<=c.clientWidth+1 && g.clientHeight>0;})()"))
                if width<761:
                    page.js("document.querySelector('.achievements-modal-card').scrollTop=10000")
                    check(f'achievement cards reachable {width}x{height}',page.js("(() => {const c=document.querySelector('.achievements-modal-card').getBoundingClientRect(),g=document.querySelector('#achievementsModalGrid').getBoundingClientRect();return Math.min(c.bottom,g.bottom)-Math.max(c.top,g.top)>=180;})()"))
                screenshot(page,artifacts/f'achievements-{width}x{height}.png')
                page.js('closeWordGuessAchievementsModal()')
            for mode,screen in [('explain','settings'),('charades','settings'),('whoami','whoAmISettings'),('battle','slovesnyiSetup'),('wordguess','wordGuessSettings')]:
                page.click('.mode-card-'+mode)
                page.wait('getCurrentAppScreenName()==='+json.dumps(screen))
                check(mode+' normal launch',True)
                page.js('navigateAfterAppBack("menu","replace")')
            page.js('Svitlohray.open()')
            page.wait("getCurrentAppScreenName()==='svitlohray'")
            check('Svitlohray launches',True)
        finally:
            upgrade.shutdown()
        check('no uncaught browser errors', not page.errors)
        print('ARTIFACTS', artifacts, flush=True)
    finally:
        proc.terminate()
        try:
            proc.wait(timeout=10)
        except subprocess.TimeoutExpired:
            proc.kill()
        server.shutdown()


def screenshot(page, path):
    result = page.call('Page.captureScreenshot', {'format':'png','captureBeyondViewport':False})
    path.write_bytes(base64.b64decode(result['data']))


if __name__ == '__main__':
    run()
