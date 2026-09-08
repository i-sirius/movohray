"""Edge achievement flows. --prepare-live saves c4; --live tests fresh c5; --upgrade checks saved c4.
Default serves the current workspace. Runtime injection only creates test boards/captures state.
"""
import functools, http.server, json, sys, tempfile, threading, time
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path.cwd()
ART=Path(tempfile.gettempdir())/'movohray-c5-checks';ART.mkdir(exist_ok=True)
PROFILE=Path(tempfile.gettempdir())/'movohray-c5-upgrade-profile'
LIVE='https://i-sirius.github.io/movohray/'
REV='0.6.7-20260908-c5';CACHE='movohray-cache-v0.6.7-b20260908-c5'
COPY=json.loads((ROOT/'tests/new-mode-achievements-copy.json').read_text(encoding='utf-8'))
class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Handler,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
def wait_async(page,expr,timeout=60):
    end=time.monotonic()+timeout
    while time.monotonic()<end:
        if page.evaluate(expr):return
        page.wait_for_timeout(150)
    raise AssertionError(expr)
def clear_toast(page):
    # Dismiss each real notification, including queued/batched awards, before navigation.
    wait_async(page,'''() => {
      document.querySelectorAll('.word-guess-achievement-toast-close').forEach(b=>b.click());
      return !wordGuessAchievementToastPendingBatch.length && !wordGuessAchievementToastQueue.length && !wordGuessAchievementToastActive;
    }''')
def has(page,id):return page.evaluate('(id)=>Boolean(wordGuessAchievementsState.unlocked[id])',id)
def achievements(page,game):
    clear_toast(page)
    if not page.locator('#menuAchievementsBtn').is_visible():
        page.locator('#svitlohrayMenu').click()
    page.locator('#menuAchievementsBtn').click()
    page.locator('[data-achievement-game="'+game+'"]').click()
    page.locator('[data-achievement-category="all"]').click()
def close_achievements(page):page.locator('#achievementsModalCloseBtn').click()
def near_win(page):
    page.evaluate('''() => {
      SvitlohrayEngine.generate=function(rows,cols){return SvitlohrayEngine.toggle({rows:rows,cols:cols,cells:Array(rows*cols).fill(1)},0);};
    }''')
def win(page):
    clear_toast(page);page.locator('.svitlohray-tile').first.click();page.wait_for_selector('#svitlohrayReplay')
def replay(page):
    clear_toast(page)
    if page.locator('#svitlohrayReplay').is_visible():page.locator('#svitlohrayReplay').click()
    else:
        page.locator('#appSettingsBtn').click();page.locator('#svitlohrayOpen').click()
def run_flows(page,context,url):
    errors=[];console=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('console',lambda m:console.append(m.text+' '+str(m.location)) if m.type=='error' else None)
    page.goto(url);page.wait_for_selector('.mode-card-battle')
    assert page.evaluate('WORD_GUESS_ACHIEVEMENTS.length')==433
    assert page.evaluate('getLocalReleaseInfo().revision')==REV
    near_win(page)
    page.locator('#appSettingsBtn').click();page.locator('#svitlohrayOpen').click()
    win(page)
    assert has(page,'svitlohray-first-win') and has(page,'svitlohray-no-hint')
    assert page.evaluate('getNewWordGuessAchievementCount("svitlohray")')==2
    achievements(page,'svitlohray')
    assert page.locator('#achievementsModalGrid [data-achievement-id]').count()==10
    first=page.locator('#achievementsModalGrid [data-achievement-id="svitlohray-first-win"]')
    assert 'is-new' in first.get_attribute('class')
    assert first.locator('time').get_attribute('datetime')
    first.click();page.locator('#achievementDetailCloseBtn').click()
    assert not page.evaluate('isWordGuessAchievementNew("svitlohray-first-win")')
    # Existing secret semantics: title/description visible; condition initially concealed.
    secret=page.locator('#achievementsModalGrid [data-achievement-id="svitlohray-patience"]')
    assert 'is-mystery' in secret.get_attribute('class') and 'is-hint-revealed' not in secret.get_attribute('class')
    page.evaluate('openWordGuessAchievementDetail("svitlohray-patience")')
    assert page.locator('#achievementDetailHowTo').is_hidden()
    page.locator('#achievementDetailCloseBtn').click()
    for _ in range(3):secret.click()
    assert page.evaluate('wordGuessAchievementsState.revealedHints["svitlohray-patience"]')
    assert not has(page,'svitlohray-patience')
    page.evaluate('closeWordGuessAchievementDetail()');close_achievements(page)
    replay(page);page.locator('#svitlohraySize').select_option('2');win(page)
    assert has(page,'svitlohray-big-picture')
    achievements(page,'svitlohray')
    assert 'is-unlocked' in page.locator('#achievementsModalGrid [data-achievement-id="svitlohray-big-picture"]').get_attribute('class')
    close_achievements(page)
    replay(page);page.locator('.svitlohray-colors summary').click();page.locator('#svitlohrayRandom').click()
    assert page.evaluate('Svitlohray.snapshot().randomPaletteUsed && !Svitlohray.snapshot().manualPaletteChanged')
    win(page);assert has(page,'svitlohray-new-mood') and not has(page,'svitlohray-colorist')
    replay(page)
    assert page.evaluate('!Svitlohray.snapshot().randomPaletteUsed && !Svitlohray.snapshot().manualPaletteChanged')
    page.locator('.svitlohray-colors summary').click();page.locator('#svitlohrayReset').click()
    assert not page.evaluate('Svitlohray.snapshot().manualPaletteChanged')
    page.locator('#svitlohrayOn').fill('#fff1cc') # rejected equal-color pair
    assert not page.evaluate('Svitlohray.snapshot().manualPaletteChanged')
    page.locator('#svitlohrayOn').fill('#14265b')
    assert page.evaluate('Svitlohray.snapshot().manualPaletteChanged && !Svitlohray.snapshot().randomPaletteUsed')
    win(page);assert has(page,'svitlohray-colorist')
    replay(page)
    page.evaluate('''() => {for(let i=0;i<74;i++)document.querySelectorAll('.svitlohray-tile')[1].click();}''')
    win(page);assert page.evaluate('Svitlohray.snapshot().moves')==75
    assert has(page,'svitlohray-patience') and has(page,'svitlohray-no-help')
    achievements(page,'svitlohray')
    secret=page.locator('#achievementsModalGrid [data-achievement-id="svitlohray-patience"]')
    assert 'is-new' in secret.get_attribute('class') and secret.locator('time').count()==1
    assert 'is-hint-revealed' in secret.get_attribute('class')
    close_achievements(page);clear_toast(page)
    print('SV browser flow PASS',flush=True)
    # Capture actual engine state; production settings and timer defaults are unchanged.
    page.evaluate('''() => {const create=SlovesnyiEngine.create;SlovesnyiEngine.create=function(){window.achievementTestParty=create.apply(null,arguments);return window.achievementTestParty;};}''')
    page.locator('.mode-card-battle').click();page.wait_for_selector('#slovesnyiStart')
    page.locator('#slovesnyi-players').select_option('2');page.locator('#slovesnyi-target').select_option('3')
    for level in ['easy','normal']:page.locator('.slovesnyi-level input[value="'+level+'"]').uncheck()
    page.locator('#slovesnyiStart').click()
    winner=page.evaluate('Object.keys(achievementTestParty.positions).find(id=>achievementTestParty.positions[id]==="con")')
    for round in range(3):
        clear_toast(page)
        while page.evaluate('Slovesnyi.snapshot().phase')!='voting':page.locator('#slovesnyiAdvance').click()
        index=page.evaluate('(id)=>Slovesnyi.snapshot().currentMatch.playerIds.indexOf(id)',winner)
        page.locator('#slovesnyiVote'+('A' if index==0 else 'B')).click()
        clear_toast(page);page.locator('#slovesnyiNext').click()
    page.wait_for_selector('#slovesnyiHome')
    for f in COPY:
        if f['definition']['game']=='slovesnyi':assert has(page,f['definition']['id']),f['definition']['id']
    page.locator('#slovesnyiHome').click();achievements(page,'slovesnyi')
    assert page.locator('#achievementsModalGrid [data-achievement-id].is-unlocked').count()==6
    close_achievements(page)
    print('SL browser flow PASS: all six achievements',flush=True)
    # Legacy award functions still handle their original conditions.
    page.evaluate('selectedMode="explain";recordPartyModeAchievements(1,0);selectedMode="charades";recordPartyModeAchievements(1,0);selectedMode="explain"')
    assert has(page,'alias-first-point') and has(page,'charades-first-point')
    page.evaluate('recordWordGuessAchievements(true)');assert has(page,'first-win')
    page.evaluate('whoAmIAchievementGameRecorded=false;whoAmIAchievementSessionGuessed=1;whoAmIAchievementSessionSkipped=0;recordWhoAmIFinalAchievements()')
    assert has(page,'whoami-perfect-game')
    # Old mystery reveal and unread behavior use the same infrastructure as the new one.
    page.evaluate('revealWordGuessAchievementHint("logo-secret")')
    assert page.evaluate('wordGuessAchievementsState.revealedHints["logo-secret"]')
    assert not has(page,'logo-secret')
    page.evaluate('wordGuessLabsUnlocked=true')
    layouts=[]
    for lang in ['uk','ru','en']:
        page.evaluate('(l)=>selectWordGuessLanguage(l)',lang)
        achievements(page,'svitlohray')
        for w,h in [(360,800),(390,844),(768,1024),(1600,900)]:
            page.set_viewport_size({'width':w,'height':h})
            for theme in ['light','dark']:
                page.evaluate('(t)=>applyTheme(t)',theme)
                for game,count in [('svitlohray',10),('slovesnyi',6)]:
                    page.locator('[data-achievement-game="'+game+'"]').click()
                    page.locator('[data-achievement-category="all"]').click()
                    cards=page.locator('#achievementsModalGrid [data-achievement-id]');assert cards.count()==count
                    cards.last.scroll_into_view_if_needed()
                    assert not page.evaluate('document.documentElement.scrollWidth>innerWidth'),(lang,w,theme,game)
                    assert cards.evaluate_all('(es)=>es.every(e=>{const r=e.getBoundingClientRect();return r.x>=0 && r.right<=innerWidth+1;})')
                    for f in COPY:
                        if f['definition']['game']==game:
                            card=page.locator('#achievementsModalGrid [data-achievement-id="'+f['definition']['id']+'"]')
                            assert f['texts'][lang]['title'] in card.inner_text()
                            assert f['texts'][lang]['description'] in card.inner_text()
                    if w in [360,1600] and theme=='dark':page.screenshot(path=str(ART/f'{game}-{lang}-{w}-dark.png'))
                    layouts.append([lang,w,h,theme,game])
        close_achievements(page)
    before=page.evaluate('JSON.parse(JSON.stringify(wordGuessAchievementsState))')
    assert not errors and not console,(errors,console)
    page.reload();page.wait_for_selector('.mode-card-battle')
    assert page.evaluate('wordGuessAchievementsState.svitlohray')==before['svitlohray']
    for id,value in before['unlocked'].items():assert page.evaluate('(id)=>wordGuessAchievementsState.unlocked[id]',id)==value
    assert not page.evaluate('isWordGuessAchievementNew("svitlohray-first-win")')
    assert page.evaluate('isWordGuessAchievementNew("svitlohray-patience")')
    unread=page.evaluate('getNewWordGuessAchievementCount()')
    page.evaluate('unlockWordGuessAchievement("svitlohray-patience")')
    assert page.evaluate('getNewWordGuessAchievementCount()')==unread
    achievements(page,'svitlohray');close_achievements(page)
    page.evaluate('navigator.serviceWorker.ready');wait_async(page,'navigator.serviceWorker.controller!==null')
    assert page.evaluate('caches.keys()')==[CACHE]
    urls=page.evaluate('caches.open("'+CACHE+'").then(c=>c.keys()).then(rs=>rs.map(r=>r.url))')
    assert any('/new-mode-achievements.js?rev='+REV in u for u in urls)
    context.set_offline(True);page.reload();page.wait_for_selector('.mode-card-battle')
    achievements(page,'slovesnyi');assert page.locator('#achievementsModalGrid [data-achievement-id].is-unlocked').count()==6
    assert not errors,errors
    assert not [e for e in console if not ('net::ERR_FAILED' in e and '/version.json?' in e)],console
    print('PASS achievements flows A/B, palette flags/reset, 75-move secret, old award handlers, reveal/unread/timestamps/reload,',len(layouts),'layouts, PWA/offline; runtime errors:',errors,flush=True)
    print('ARTIFACTS',ART,flush=True)

with sync_playwright() as p:
    opts={'executable_path':r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe','headless':True}
    if '--prepare-live' in sys.argv or '--upgrade' in sys.argv:
        context=p.chromium.launch_persistent_context(str(PROFILE),**opts)
        page=context.pages[0] if context.pages else context.new_page()
        page.goto(LIVE);page.wait_for_selector('.mode-card-battle')
        page.evaluate('navigator.serviceWorker.ready');wait_async(page,'navigator.serviceWorker.controller!==null')
        if '--prepare-live' in sys.argv:
            assert page.evaluate('getLocalReleaseInfo().revision')=='0.6.7-20260908-c4'
            page.evaluate('unlockWordGuessAchievement("first-win");markWordGuessAchievementViewed("first-win");wordGuessAchievementsState.aliasRounds=12;persistWordGuessAchievementsState()')
            (ART/'c4-unlocked.json').write_text(json.dumps(page.evaluate('wordGuessAchievementsState.unlocked["first-win"]')))
            print('PREPARED live c4 profile',page.evaluate('caches.keys()'),flush=True)
        else:
            if page.evaluate('getLocalReleaseInfo().revision')!=REV:
                page.wait_for_selector('#requiredUpdateBtn',timeout=60000);page.locator('#requiredUpdateBtn').click()
                page.wait_for_function('getLocalReleaseInfo().revision==="'+REV+'"',timeout=90000)
            page.evaluate('serviceWorkerRegistrationPromise')
            wait_async(page,'caches.keys().then(keys=>keys.length===1 && keys[0]==="'+CACHE+'")')
            assert page.evaluate('wordGuessAchievementsState.aliasRounds')==12
            assert page.evaluate('wordGuessAchievementsState.unlocked["first-win"]')==json.loads((ART/'c4-unlocked.json').read_text())
            assert not page.evaluate('isWordGuessAchievementNew("first-win")')
            run_flows(page,context,LIVE+'?rev='+REV)
            print('LIVE c4 -> c5 update, legacy persistence PASS',flush=True)
        context.close()
    else:
        browser=p.chromium.launch(**opts);context=browser.new_context(viewport={'width':390,'height':844},has_touch=True)
        run_flows(context.new_page(),context,LIVE+'?rev='+REV if '--live' in sys.argv else 'http://127.0.0.1:%s/'%server.server_port)
        browser.close()
server.shutdown()
