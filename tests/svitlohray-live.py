"""Prepare a real previous-release profile before push, then verify its live update.
python tests/svitlohray-live.py prepare | verify
"""
import json, sys, tempfile, time
from pathlib import Path
from playwright.sync_api import sync_playwright
BASE='https://i-sirius.github.io/movohray/'
PROFILE=Path(tempfile.gettempdir())/'movohray-c3-live-upgrade-profile'
with sync_playwright() as p:
    context=p.chromium.launch_persistent_context(str(PROFILE),executable_path=r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',headless=True)
    page=context.pages[0] if context.pages else context.new_page()
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(BASE);page.evaluate('navigator.serviceWorker.ready')
    page.wait_for_function('navigator.serviceWorker.controller!==null')
    if sys.argv[1]=='prepare':
        print('PREPARED',page.evaluate('getLocalReleaseInfo()'),page.evaluate('caches.keys()'))
        assert page.evaluate('getLocalReleaseInfo().version')=='0.6.6a'
    else:
        deadline=time.monotonic()+180
        while time.monotonic()<deadline:
            result=page.request.get(BASE+'version.json?check='+str(time.time_ns()))
            if result.ok and result.json().get('candidate')=='c3':break
            page.wait_for_timeout(3000)
        else:raise AssertionError('Pages has not deployed c3 yet')
        print('LIVE VERSION',result.json())
        page.evaluate('''async()=>{const r=await navigator.serviceWorker.getRegistration();await r.update();}''')
        deadline=time.monotonic()+90
        while time.monotonic()<deadline:
            try:
                ready=page.evaluate('''async()=>{const r=await navigator.serviceWorker.getRegistration();if(r.waiting)r.waiting.postMessage({type:'SKIP_WAITING'});return (await caches.keys()).includes('movohray-cache-v0.6.7-b20260908-c3') && !r.installing && !r.waiting;}''')
                if ready:break
            except Exception:pass # Existing required-update flow may navigate during activation.
            page.wait_for_timeout(1000)
        page.reload();page.wait_for_selector('.mode-card-battle')
        assert page.evaluate('getLocalReleaseInfo().revision')=='0.6.7-20260908-c3'
        assert page.evaluate('caches.keys()')==['movohray-cache-v0.6.7-b20260908-c3']
        print('LIVE SW',page.evaluate('navigator.serviceWorker.getRegistration().then(r=>r.active.scriptURL)'))
        page.locator('.mode-card-battle').click();page.wait_for_selector('#slovesnyiStart')
        page.locator('#slovesnyiStart').click();page.locator('#slovesnyiAdvance').click()
        assert page.locator('#slovesnyiTopic').inner_text()
        page.evaluate('requestAppBack({destination:"menu"})');page.locator('#slovesnyiLeave').click()
        page.locator('#appSettingsBtn').click();page.locator('#svitlohrayOpen').click()
        page.locator('#svitlohrayHint').click();assert page.locator('.is-hint').count()==1
        context.set_offline(True);page.reload();page.wait_for_selector('.mode-card-battle')
        page.locator('#appSettingsBtn').click();page.locator('#svitlohrayOpen').click()
        page.locator('#svitlohrayHint').click();assert page.locator('.is-hint').count()==1
        print('LIVE UPGRADE/OFFLINE PASS; runtime errors:',errors)
        assert not errors,errors
    context.close()
