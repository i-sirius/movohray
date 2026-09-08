"""Native flow, layout, accessibility, storage, timer, and fresh offline smoke."""
import functools, http.server, json, os, tempfile, threading
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path.cwd()
ART=Path(tempfile.gettempdir())/'movohray-c3-checks'
ART.mkdir(exist_ok=True)
class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*args): pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Handler,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
url=os.environ.get('MOVOHRAY_TEST_URL') or 'http://127.0.0.1:%s/'%server.server_port
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path=r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',headless=True)
    context=browser.new_context(viewport={'width':390,'height':844},has_touch=True)
    page=context.new_page(); errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('console',lambda m:errors.append(m.text+' '+str(m.location)) if m.type=='error' else None)
    page.goto(url);page.wait_for_selector('.mode-card-battle')
    assert page.locator('.mode-card-active').count()==5
    page.locator('#appSettingsBtn').click();page.locator('#svitlohrayOpen').click()
    assert page.locator('.svitlohray-tile').count()==12
    assert page.locator('#svitlohrayTime').inner_text()=='0:00'
    page.wait_for_timeout(1100);assert page.locator('#svitlohrayTime').inner_text()=='0:00'
    move=page.evaluate('Svitlohray.snapshot().board.cells.findIndex((_,i)=>!SvitlohrayEngine.won(SvitlohrayEngine.toggle(Svitlohray.snapshot().board,i)))')
    page.locator('.svitlohray-tile').nth(move).tap()
    page.wait_for_function('document.getElementById("svitlohrayTime").textContent!=="0:00"')
    page.evaluate('openAppSettings()');page.wait_for_timeout(250)
    before=page.evaluate('Svitlohray.snapshot().elapsed');page.wait_for_timeout(1100)
    assert abs(page.evaluate('Svitlohray.snapshot().elapsed')-before)<10
    page.evaluate('closeAppSettings()')
    before=page.evaluate('Svitlohray.snapshot().board');page.locator('#svitlohrayHint').click()
    assert page.evaluate('Svitlohray.snapshot().board')==before
    assert page.locator('.is-hint').count()==1
    page.locator('#svitlohrayNew').click();assert page.locator('#svitlohrayMoves').inner_text()=='0'
    page.locator('.svitlohray-colors summary').click()
    page.locator('#svitlohrayOn').fill('#14265b')
    assert page.evaluate('JSON.parse(localStorage.getItem("movohray-svitlohray-colors"))[0]')=='#14265b'
    page.locator('#svitlohrayOff').fill('#14265b')
    assert page.locator('#svitlohrayPaletteMessage').inner_text()
    page.locator('#svitlohrayRandom').click()
    assert page.evaluate('Svitlohray.validColors(JSON.parse(localStorage.getItem("movohray-svitlohray-colors")))')
    page.locator('#svitlohrayReset').click()
    page.locator('.svitlohray-colors summary').click()
    page.evaluate('wordGuessLabsUnlocked=true')
    reports=[]
    for lang,title in ([('uk','Світлограй')] if os.environ.get('MOVOHRAY_QUICK') else [('uk','Світлограй'),('ru','Цветоигра'),('en','Lightplay')]):
        page.evaluate('(lang)=>selectWordGuessLanguage(lang)',lang)
        assert page.locator('#svitlohrayScreen h1').inner_text()==title
        for size,count in [('0',12),('1',16),('2',25)]:
            page.locator('#svitlohraySize').select_option(size)
            assert page.locator('.svitlohray-tile').count()==count
            for w,h in ([(360,800),(1600,900)] if os.environ.get('MOVOHRAY_QUICK') else [(360,800),(390,844),(430,932),(768,1024),(1600,900)]):
                page.set_viewport_size({'width':w,'height':h})
                for theme in ['light','dark']:
                    page.evaluate('(t)=>applyTheme(t)',theme)
                    page.locator('#svitlohrayScreen h1').scroll_into_view_if_needed()
                    layout=page.evaluate('''() => ({overflow:document.documentElement.scrollWidth>innerWidth,cells:[...document.querySelectorAll('.svitlohray-tile')].map(e=>{const r=e.getBoundingClientRect();return {x:r.x,w:r.width,h:r.height,right:r.right}})})''')
                    assert not layout['overflow'],(w,h,lang,layout)
                    assert all(c['x']>=0 and c['right']<=w+1 and c['w']>=44 and c['h']>=44 for c in layout['cells']),layout
                    page.locator('#svitlohrayHint').scroll_into_view_if_needed();assert page.locator('#svitlohrayHint').is_visible()
                    if lang=='uk' and size=='2' and w in [360,1600]:
                        page.screenshot(path=str(ART/f'svitlohray-{w}-{theme}.png'),full_page=True)
                reports.append([lang,size,w,h])
            # Solve using actual tile clicks, never replace game state.
            solution=page.evaluate('SvitlohrayEngine.solve(Svitlohray.snapshot().board)')
            for move in solution:
                if page.locator('#svitlohrayReplay').count():break
                page.locator('.svitlohray-tile').nth(move).click()
            page.wait_for_selector('#svitlohrayReplay')
            assert page.evaluate('Svitlohray.snapshot().finished')
            page.screenshot(path=str(ART/f'svitlohray-win-{lang}-{size}.png'))
            page.locator('#svitlohrayReplay').click()
    page.emulate_media(reduced_motion='reduce')
    assert page.locator('.svitlohray-tile').first.evaluate('(e)=>parseFloat(getComputedStyle(e).transitionDuration)')<=.00001
    page.locator('.svitlohray-tile').first.focus();page.keyboard.press('Space')
    assert page.evaluate('Svitlohray.snapshot().moves')==1
    page.evaluate('history.back()');page.wait_for_selector('#svitlohrayOpen',state='visible')
    page.locator('#appSettingsCloseBtn').click();page.wait_for_selector('#menuScreen.active')
    page.evaluate('navigator.serviceWorker.ready')
    page.wait_for_function('navigator.serviceWorker.controller!==null')
    keys=page.evaluate('caches.keys()');assert keys==['movohray-cache-v0.6.7-b20260908-c4'],keys
    assert not errors,errors
    context.set_offline(True);page.reload();page.wait_for_selector('.mode-card-battle')
    page.locator('#appSettingsBtn').click();page.locator('#svitlohrayOpen').click()
    move=page.evaluate('Svitlohray.snapshot().board.cells.findIndex((_,i)=>!SvitlohrayEngine.won(SvitlohrayEngine.toggle(Svitlohray.snapshot().board,i)))')
    page.locator('.svitlohray-tile').nth(move).click();page.locator('#svitlohrayHint').click()
    assert page.locator('.is-hint').count()==1
    # Existing SW intentionally checks version.json network-only, including offline.
    unexpected=[e for e in errors if not ('net::ERR_FAILED' in e and '/version.json?' in e)]
    assert not unexpected,unexpected
    print('PASS native flow,',len(reports)*2,'language/size/viewport/theme combinations, timer pause, palettes, keyboard, reduced motion, back, fresh PWA/offline; unexpected errors:',unexpected)
    print('Expected offline version-check failures:',len(errors))
    print('Artifacts:',ART)
    browser.close()
server.shutdown()
