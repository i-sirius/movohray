"""Run from repo root: pip install playwright tinycss2; python tests/slovesnyi-browser.py.
Uses installed Edge on Windows, or Playwright Chromium elsewhere. Artifacts go to TEMP.
"""
import collections
import functools
import http.server
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import tempfile
import threading
import time
from html.parser import HTMLParser
from urllib.parse import urlparse
import tinycss2
from playwright.sync_api import sync_playwright

ROOT = Path.cwd()
ARTIFACTS = Path(tempfile.gettempdir()) / 'movohray-c1-checks'
ARTIFACTS.mkdir(exist_ok=True)
REVISION = '0.6.7-20260907-c1'
CACHE = 'movohray-cache-v0.6.7-b20260907-c1'
OLD_CACHE = 'movohray-cache-v0.6.6a-b20260825'
baseline = {name: subprocess.check_output(['git', 'show', 'v0.6.6a:' + name])
            for name in ['index.html', 'app.js', 'styles.css', 'version.json', 'service-worker.js']}
serve_baseline = False

class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args): pass

    def do_GET(self):
        name = urlparse(self.path).path.lstrip('/') or 'index.html'
        if serve_baseline and name in baseline:
            payload = baseline[name]
            self.send_response(200)
            self.send_header('Content-Type', self.guess_type(name))
            self.send_header('Content-Length', str(len(payload)))
            self.send_header('Cache-Control', 'no-store')
            self.end_headers()
            self.wfile.write(payload)
        else:
            super().do_GET()

def static_audit():
    class Document(HTMLParser):
        def __init__(self): super().__init__(); self.ids = []; self.assets = []
        def handle_starttag(self, tag, attrs):
            attrs = dict(attrs)
            if 'id' in attrs: self.ids.append(attrs['id'])
            if tag in ['script', 'img', 'link']:
                self.assets.append(attrs.get('src', attrs.get('href', '')))
    document = Document()
    document.feed((ROOT / 'index.html').read_text(encoding='utf-8'))
    assert len(document.ids) == len(set(document.ids)), 'Duplicate static IDs'
    for asset in document.assets:
        if asset and not urlparse(asset).scheme:
            assert (ROOT / asset.split('?')[0]).is_file(), asset
    for path in ROOT.glob('*.json'):
        json.loads(path.read_text(encoding='utf-8'))
    json.loads((ROOT / 'manifest.webmanifest').read_text(encoding='utf-8'))
    def check_rules(rules):
        for rule in rules:
            assert rule.type != 'error', str(rule)
            if rule.type == 'at-rule' and rule.content and rule.lower_at_keyword in ['media', 'supports', 'keyframes', '-webkit-keyframes', 'layer']:
                check_rules(tinycss2.parse_rule_list(rule.content, skip_comments=True, skip_whitespace=True))
            elif rule.type == 'qualified-rule':
                for declaration in tinycss2.parse_declaration_list(rule.content, skip_comments=True, skip_whitespace=True):
                    assert declaration.type != 'error', str(declaration)
    for path in ROOT.glob('*.css'):
        check_rules(tinycss2.parse_stylesheet(path.read_text(encoding='utf-8'), skip_comments=True, skip_whitespace=True))
    sw = (ROOT / 'service-worker.js').read_text(encoding='utf-8')
    for path in re.findall(r'`\./([^?`]+)\?rev=', sw): assert (ROOT / path).is_file(), path
    for name in ['slovesnyi.js', 'slovesnyi-engine.js']:
        source = (ROOT / name).read_text(encoding='utf-8')
        assert '?.' not in source and '??' not in source
    data = json.loads((ROOT / 'debates.json').read_text(encoding='utf-8'))['topics']
    assert len(data) == len({t['id'] for t in data}) == 180
    for lang in ['ua', 'ru', 'en']:
        assert len({t['text'][lang].strip().casefold() for t in data}) == 180
        assert all(t['text'][lang].strip() for t in data)
    assert json.loads((ROOT / 'version.json').read_text()) == {'version': '0.6.7', 'build': '2026-09-07', 'candidate': 'c1', 'required': True}
    assert REVISION in sw and CACHE in sw
    print('STATIC PASS', dict(collections.Counter(t['level'] for t in data)), 'categories', len({t['category'] for t in data}))

def phase(page): return page.evaluate('Slovesnyi.snapshot().phase')

def wait_phase(page, expected): page.wait_for_function('(p) => Slovesnyi.snapshot().phase === p', arg=expected)

def assert_layout(page, final=False, visible_controls=False):
    layout = page.evaluate('''() => {
      const screen = document.querySelector('.slovesnyi-screen.active');
      const rect = e => { const r=e.getBoundingClientRect(); return {x:r.x,y:r.y,w:r.width,h:r.height}; };
      const card=screen.querySelector('.card');
      return {viewport:[innerWidth,innerHeight], screen:rect(screen),card:rect(card),
        overflow:document.documentElement.scrollWidth > innerWidth,
        rightCovered:screen.contains(document.elementFromPoint(innerWidth-1,innerHeight/2)),
        topic:screen.querySelector('.slovesnyi-topic') ? rect(screen.querySelector('.slovesnyi-topic')) : null,
        advance:document.querySelector('#slovesnyiAdvance') ? rect(document.querySelector('#slovesnyiAdvance')) : null,
        timer:document.querySelector('#slovesnyiTimer') ? rect(document.querySelector('#slovesnyiTimer')) : null};
    }''')
    assert not layout['overflow'], layout
    if visible_controls:
        for key in ['topic', 'advance', 'timer']:
            r = layout[key]
            if r: assert r['x'] >= 0 and r['x'] + r['w'] <= layout['viewport'][0] + 1 and r['y'] >= 0 and r['y'] + r['h'] <= layout['viewport'][1], layout
    if final:
        w, h = layout['viewport']; s = layout['screen']; c = layout['card']
        assert s == {'x': 0, 'y': 0, 'w': w, 'h': h} and layout['rightCovered'], layout
        assert c['w'] <= 720 and c['h'] <= h, layout
        assert abs(c['x'] + c['w']/2 - w/2) < 1 and abs(c['y'] + c['h']/2 - h/2) < 1, layout
    return layout

def smoke(browser, base_url):
    context = browser.new_context(service_workers='block')
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto(base_url)
    page.wait_for_selector('.mode-card-battle')
    page.evaluate('''() => {
      const create = SlovesnyiEngine.create;
      SlovesnyiEngine.create = function () { window.testState=create.apply(null, arguments); return window.testState; };
    }''')
    assert page.locator('.mode-card-active').count() == 5
    assert 'Словес' not in page.locator('#appUpcomingModesChips').inner_text()
    assert 'Світлограй' in page.locator('#appUpcomingModesChips').inner_text()
    page.locator('.mode-card-battle').click()
    page.wait_for_selector('#slovesnyiStart')
    assert page.locator('#slovesnyi-players').input_value() == '4'
    assert [page.locator('#slovesnyi-' + key).input_value() for key in ['target', 'preparation', 'speech', 'rebuttal']] == ['5', '20', '40', '15']
    for lang, title in [('ru', 'Словесный'), ('en', 'Word Duel'), ('uk', 'Словесний')]:
        page.locator('#slovesnyi-language').select_option(lang)
        assert page.locator('#slovesnyiSetupScreen h1').inner_text() == title
    for i, name in enumerate(['Олена', 'Марко', 'Ірина', 'Данило']): page.locator('#slovesnyi-player-' + str(i)).fill(name)
    page.locator('#slovesnyi-target').select_option('3')
    page.locator('#slovesnyiStart').click()
    assert phase(page) == 'intro'
    page.locator('#slovesnyiAdvance').click()
    assert phase(page) == 'preparation'
    page.locator('#slovesnyiPause').click()
    timer = page.locator('#slovesnyiTimer').inner_text()
    page.wait_for_timeout(1200)
    assert page.locator('#slovesnyiTimer').inner_text() == timer
    assert page.locator('#slovesnyiAdvance').is_disabled()
    page.locator('#slovesnyiPause').click()
    page.evaluate('testState.phaseStartedAt -= 21000')
    wait_phase(page, 'speechA')
    page.evaluate('openAppSettings()')
    page.wait_for_timeout(200)
    assert page.evaluate('testState.pausedAt !== null')
    page.evaluate('closeAppSettings()')
    page.wait_for_timeout(200)
    assert page.evaluate('testState.pausedAt === null')
    page.evaluate('history.back()')
    page.wait_for_selector('#slovesnyiStay')
    assert page.evaluate('testState.pausedAt !== null')
    page.locator('#slovesnyiStay').click()
    for expected in ['speechB', 'rebuttalA', 'rebuttalB', 'voting']:
        page.locator('#slovesnyiAdvance').click(); assert phase(page) == expected
    page.locator('#slovesnyiDraw').click()
    assert sum(p['wins'] for p in page.evaluate('Slovesnyi.snapshot().players')) == 0
    page.locator('#slovesnyiNext').click()
    for match in range(30):
        while phase(page) != 'voting': page.locator('#slovesnyiAdvance').click()
        ids = page.evaluate('Slovesnyi.snapshot().currentMatch.playerIds')
        page.locator('#slovesnyiVote' + ('A' if 'p0' not in ids or ids[0] == 'p0' else 'B')).click()
        assert phase(page) == 'result'
        winner = page.evaluate('Slovesnyi.snapshot().winnerId')
        page.locator('#slovesnyiNext').click()
        if winner: break
    assert phase(page) == 'finished'
    page.locator('#slovesnyiNewGame').click()
    page.wait_for_selector('#slovesnyiStart')
    page.locator('#slovesnyi-players').select_option('8')
    for i in range(8): page.locator('#slovesnyi-player-' + str(i)).fill('Олександра-Мирослава ' + str(i))
    page.locator('#slovesnyi-rebuttal').select_option('0')
    reports = []
    for w, h in [(360,800),(390,844),(430,932),(768,1024),(1600,900)]:
        page.set_viewport_size({'width': w, 'height': h})
        assert_layout(page)
        page.locator('#slovesnyiStart').click()
        # Use the longest available topic, retaining real production typography and timers.
        page.evaluate('''() => {
          const next = SlovesnyiEngine.advance;
          SlovesnyiEngine.advance = function (s,t) {
            s.currentTopic.text.ua = 'Краще возити в кишені крихітний оркестр, ніж особистого коментатора';
            return next(s,t);
          };
        }''')
        page.locator('#slovesnyiAdvance').click()
        assert_layout(page, visible_controls=True)
        page.screenshot(path=str(ARTIFACTS / ('preparation-%s.png' % w)))
        for expected in ['speechA','speechB','voting']:
            page.locator('#slovesnyiAdvance').click(); assert phase(page) == expected
        page.evaluate('testState.players.forEach(p => { p.wins = 2; })')
        page.locator('#slovesnyiVoteA').click(); page.locator('#slovesnyiNext').click()
        reports.append(assert_layout(page, final=True))
        page.screenshot(path=str(ARTIFACTS / ('final-%s.png' % w)))
        page.locator('#slovesnyiNewGame').click()
    # Start again and exercise confirmed exit, new setup, then home.
    page.locator('#slovesnyiStart').click()
    page.evaluate('requestAppBack({destination:"menu"})')
    page.locator('#slovesnyiLeave').click()
    assert page.locator('#menuScreen').evaluate('(e) => e.classList.contains("active")')
    # Existing setup/navigation, language/Labs, achievements and Who Am I overlay.
    for mode, screen in [('explain','settings'),('charades','settings'),('wordguess','wordGuessSettings'),('whoami','whoAmISettings')]:
        page.locator('.mode-card-' + mode).click()
        page.wait_for_function('(s) => document.body.dataset.screen === s', arg=screen)
        page.evaluate('requestAppBack({destination:"menu"})')
        page.wait_for_function('document.body.dataset.screen === "menu"')
    page.evaluate('openWordGuessAchievementsModal()'); page.evaluate('requestAppBack({})')
    page.evaluate('wordGuessLabsUnlocked = true; selectWordGuessLanguage("en")')
    assert page.locator('.mode-card-battle strong').inner_text() == 'Word Duel'
    page.locator('.mode-card-battle').click(); page.wait_for_selector('#slovesnyiStart')
    assert page.locator('#slovesnyiSetupScreen h1').inner_text() == 'Word Duel'
    page.evaluate('requestAppBack({destination:"menu"})')
    page.evaluate('selectWordGuessLanguage("uk"); showWhoAmIFinal()')
    assert page.locator('#whoAmIFinalScreen').bounding_box()['width'] == 1600
    assert page.evaluate('document.querySelectorAll("[id]").length === new Set(Array.from(document.querySelectorAll("[id]")).map(e=>e.id)).size')
    assert not errors, errors
    print('SMOKE PASS; runtime errors:', errors)
    print('VIEWPORT PASS', json.dumps(reports))
    context.close()

def wait_async(page, expression, arg=None, timeout=60000):
    deadline = time.monotonic() + timeout / 1000
    while time.monotonic() < deadline:
        if page.evaluate(expression, arg): return
        page.wait_for_timeout(100)
    raise AssertionError('Async condition timed out: ' + expression)

def extras(browser, base_url):
    context = browser.new_context(service_workers='block', viewport={'width':360,'height':800}, is_mobile=True, has_touch=True)
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.on('console', lambda message: errors.append(message.text) if message.type == 'error' else None)
    page.goto(base_url)
    page.wait_for_selector('.mode-card-battle')
    # Storage restrictions leave the mode usable; loading failure has a working retry.
    page.route('**/debates.json?*', lambda route: route.abort())
    page.locator('.mode-card-battle').click(); page.wait_for_selector('#slovesnyiRetry')
    page.unroute('**/debates.json?*')
    page.locator('#slovesnyiRetry').click(); page.wait_for_selector('#slovesnyiStart')
    errors.clear()  # The deliberately aborted topic request is expected.
    assert page.evaluate('''() => {
      const keys=Object.keys(Slovesnyi.locales.uk).sort().join();
      return ['ru','en'].every(lang=>Object.keys(Slovesnyi.locales[lang]).sort().join()===keys);
    }''')
    page.locator('#slovesnyi-player-0').fill('Same')
    page.locator('#slovesnyi-player-1').fill('same')
    page.locator('#slovesnyiStart').click()
    assert page.locator('#slovesnyiSetupMessage').inner_text()
    page.locator('#slovesnyi-player-1').fill('Different')
    for checkbox in page.locator('.slovesnyi-level input').all(): checkbox.uncheck()
    page.locator('#slovesnyiStart').click()
    assert page.locator('#slovesnyiSetupMessage').inner_text()
    page.locator('.slovesnyi-level input[value="crazy"]').check()
    page.evaluate('''() => {
      const create=SlovesnyiEngine.create;
      SlovesnyiEngine.create=function(){ window.testState=create.apply(null,arguments); return window.testState; };
      const write=Storage.prototype.setItem;
      Storage.prototype.setItem=function(key,value){
        if(key==='movohray-debates-exposure-v1') throw new Error('Unavailable storage');
        return write.call(this,key,value);
      };
    }''')
    for lang, pro in [('ru','ЗА'),('en','FOR'),('uk','ЗА')]:
        page.locator('#slovesnyi-language').select_option(lang)
        for i in range(4): page.locator('#slovesnyi-player-' + str(i)).fill('ABCDEFGHIJKLMNOPQRSTUVWXYZABCDE' + str(i))
        page.evaluate('applyTheme("dark")')
        page.locator('#slovesnyiStart').click()
        assert page.evaluate('testState.currentTopic.level') == 'crazy'
        assert page.locator('.slovesnyi-pro .slovesnyi-position').inner_text() == pro
        expected_topic = page.evaluate('testState.currentTopic.text[testState.settings.language === "uk" ? "ua" : testState.settings.language]')
        assert page.locator('#slovesnyiTopic').inner_text() == expected_topic
        topic_lang = 'ua' if lang == 'uk' else lang
        longest = max(json.loads((ROOT / 'debates.json').read_text(encoding='utf-8'))['topics'], key=lambda t: len(t['text'][topic_lang]))
        page.evaluate('(topic)=>{testState.currentTopic=topic}', longest)
        page.locator('#slovesnyiAdvance').click()
        assert_layout(page, visible_controls=True)
        page.screenshot(path=str(ARTIFACTS / ('dark-' + lang + '-360.png')))
        for expected in ['speechA','speechB','rebuttalA','rebuttalB','voting']:
            page.evaluate('testState.phaseStartedAt -= 61000')
            wait_phase(page, expected)
            assert_layout(page, visible_controls=True)
        page.evaluate('requestAppBack({destination:"menu"})')
        page.locator('#slovesnyiLeave').click()
        page.locator('.mode-card-battle').click(); page.wait_for_selector('#slovesnyiStart')
    assert not errors, errors
    print('EXTRAS PASS: touch viewport, UA/RU/EN content and key coverage, dark theme, maximum-length names, validation, retry, unavailable storage, all automatic timer transitions; console/runtime errors: 0')
    context.close()

def pwa(browser, base_url):
    global serve_baseline
    serve_baseline = True
    context = browser.new_context()
    page = context.new_page()
    page.on('pageerror', lambda error: print('PWA runtime error:', error))
    page.on('console', lambda message: print('PWA console:', message.text) if message.type == 'error' else None)
    page.goto(base_url)
    page.evaluate('navigator.serviceWorker.ready')
    wait_async(page, 'navigator.serviceWorker.controller !== null')
    assert OLD_CACHE in page.evaluate('caches.keys()')
    serve_baseline = False
    page.evaluate('''async () => {
      const reg = await navigator.serviceWorker.getRegistration();
      await reg.update();
    }''')
    wait_async(page, '''async () => {
      const reg = await navigator.serviceWorker.getRegistration();
      return Boolean(reg.waiting);
    }''', timeout=60000)
    page.evaluate('''async () => {
      const reg = await navigator.serviceWorker.getRegistration();
      // The existing app may already have activated the waiting worker.
      if (reg.waiting) reg.waiting.postMessage({type:'SKIP_WAITING'});
    }''')
    wait_async(page, '(name) => caches.keys().then(keys => keys.length === 1 && keys[0] === name)', arg=CACHE)
    page.reload()
    page.wait_for_selector('.mode-card-battle')
    page.evaluate('serviceWorkerRegistrationPromise')
    wait_async(page, '''async () => {
      const r = await navigator.serviceWorker.getRegistration();
      if (r.waiting) r.waiting.postMessage({type:'SKIP_WAITING'});
      return r.active && r.active.scriptURL.includes('0.6.7-20260907-c1') && r.active.state === 'activated' && !r.installing;
    }''')
    assert page.evaluate('getLocalReleaseInfo().revision') == REVISION
    assert page.evaluate('normalizeReleaseInfo({version:"0.6.7",build:"2026-09-07",candidate:"c1"}).revision') == REVISION
    assets = page.evaluate('(name) => caches.open(name).then(c=>c.keys()).then(keys=>keys.map(r=>r.url))', CACHE)
    cached_shell = page.evaluate('(rev) => caches.match("./index.html?rev="+rev).then(r=>r.text())', REVISION)
    assert 'slovesnyi-engine.js' in cached_shell, cached_shell[-600:]
    assert all('?rev=' + REVISION in url for url in assets), assets
    for name in ['debates.json','slovesnyi.js','slovesnyi-engine.js','slovesnyi.css','assets/game-icons/slovesnyi.svg']:
        assert any('/' + name + '?rev=' + REVISION in url for url in assets), name
    wait_async(page, '''async () => {
      const r = await navigator.serviceWorker.getRegistration();
      return r && r.active && r.active.state === 'activated' && !r.installing && !r.waiting && navigator.serviceWorker.controller === r.active;
    }''')
    context.set_offline(True)
    page.reload()
    page.wait_for_selector('.mode-card-battle')
    page.locator('.mode-card-battle').click(); page.wait_for_selector('#slovesnyiStart')
    page.locator('#slovesnyiStart').click(); page.locator('#slovesnyiAdvance').click()
    assert phase(page) == 'preparation'
    assert page.locator('#slovesnyiTopic').inner_text()
    context.close()
    print('PWA PASS: 0.6.6a install -> c1 waiting -> activate; old cache removed; all revisioned assets; offline reload and play')

static_audit()
server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Handler, directory=str(ROOT)))
threading.Thread(target=server.serve_forever, daemon=True).start()
with sync_playwright() as playwright:
    edge = Path(r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe')
    browser = playwright.chromium.launch(executable_path=str(edge) if edge.is_file() else None, headless=True)
    base_url = 'http://127.0.0.1:%s/' % server.server_port
    if '--extras' in sys.argv:
        extras(browser, base_url)
    else:
        if '--pwa' not in sys.argv: smoke(browser, base_url)
        if '--smoke' not in sys.argv: pwa(browser, base_url)
    browser.close()
server.shutdown()
print('Artifacts:', ARTIFACTS)
