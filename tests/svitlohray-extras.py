"""Storage, visibility, localization on victory and integration from each mode."""
import functools, http.server, threading
from pathlib import Path
from playwright.sync_api import sync_playwright
class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Handler,directory=str(Path.cwd())))
threading.Thread(target=server.serve_forever,daemon=True).start()
with sync_playwright() as p:
    b=p.chromium.launch(executable_path=r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',headless=True)
    c=b.new_context(service_workers='block');page=c.new_page();errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto('http://127.0.0.1:%s/'%server.server_port)
    page.wait_for_selector('.mode-card-battle')
    assert page.evaluate('Object.keys(Svitlohray.locales).every(l=>Object.keys(Svitlohray.locales[l]).sort().join()===Object.keys(Svitlohray.locales.uk).sort().join())')
    page.evaluate('localStorage.setItem("movohray-svitlohray-colors", "[null,0]");localStorage.setItem("movohray-svitlohray-bests", "[]");Svitlohray.open()')
    assert page.locator('#svitlohrayOn').input_value()=='#287b78'
    page.evaluate('''() => {const write=Storage.prototype.setItem; Storage.prototype.setItem=function(k,v){if(k.startsWith('movohray-svitlohray-'))throw Error('Unavailable storage');return write.call(this,k,v);};}''')
    page.locator('.svitlohray-colors summary').click();page.locator('#svitlohrayRandom').click()
    page.locator('.svitlohray-colors summary').click()
    move=page.evaluate('Svitlohray.snapshot().board.cells.findIndex((_,i)=>!SvitlohrayEngine.won(SvitlohrayEngine.toggle(Svitlohray.snapshot().board,i)))')
    page.locator('.svitlohray-tile').nth(move).click()
    page.evaluate('Object.defineProperty(document,"hidden",{configurable:true,get:()=>true});document.dispatchEvent(new Event("visibilitychange"))')
    before=page.evaluate('Svitlohray.snapshot().elapsed');page.wait_for_timeout(1200)
    assert page.evaluate('Svitlohray.snapshot().elapsed')==before
    page.evaluate('delete document.hidden;document.dispatchEvent(new Event("visibilitychange"))');page.wait_for_timeout(400)
    assert page.evaluate('Svitlohray.snapshot().elapsed')>before
    # Completing via repeated current-state hints does not create a personal best.
    for _ in range(30):
        if page.locator('#svitlohrayReplay').count():break
        page.locator('#svitlohrayHint').click();page.locator('.is-hint').click()
    page.wait_for_selector('#svitlohrayReplay')
    page.evaluate('wordGuessLabsUnlocked=true;selectWordGuessLanguage("en")')
    assert page.locator('#svitlohrayScreen h1').inner_text()=='The light comes together!'
    page.locator('#svitlohrayMenu').click()
    for mode in ['explain','charades','wordguess','whoami','battle']:
        page.locator('.mode-card-'+mode).click()
        page.evaluate('openAppSettings()');page.locator('#svitlohrayOpen').click()
        assert page.locator('.svitlohray-tile').count()==12
        page.evaluate('requestAppBack({destination:"menu"})')
        assert page.locator('#menuScreen.active').count()==1
    assert not errors,errors
    print('EXTRAS PASS: locale keys, malformed/unavailable storage, hidden/resume timer, hint-only victory, win localization, Bonus entry from all five mode setups; errors:',errors)
    b.close()
server.shutdown()
