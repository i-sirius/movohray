"""Verify three complete, connected layouts per released circle in Chromium/Edge."""
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

 source=(p/'word-circle/game.js').read_text(encoding='utf-8')
 engine=source[source.index('function key('):source.index('function difficultyOf(')]
 page.js("window.make=new Function('MAX','shuffle',"+json.dumps(engine+';return generateCrossword;')+")(23,a=>a.sort(()=>Math.random()-.5));true")
 levels=json.loads((p/'word-circle/levels.js').read_text(encoding='utf-8').split('window.WordCircleData = ',1)[1].strip().rstrip(';'))
 result={}
 for lang,packs in levels.items():
  count=0;placed=0
  for start in range(0,len(packs),40):
   report=page.js('(()=>{let count=0,placed=0;for(const p of '+json.dumps(packs[start:start+40])+'){for(let i=0;i<3;i++){const b=make(p.main);if(b.words.length!==p.main.length)throw Error("Missing "+p.id+" "+p.main.filter(w=>!b.words.some(x=>x.word===w)));const sets=b.words.map(p=>Array.from(p.word,(ch,j)=>({k:`${p.r+(p.d==="V"?j:0)},${p.c+(p.d==="H"?j:0)}`,ch})));const reached=new Set([0]);let changed=true;while(changed){changed=false;for(let a=0;a<sets.length;a++)if(reached.has(a))for(let c=0;c<sets.length;c++)if(!reached.has(c)&&sets[a].some(x=>sets[c].some(y=>x.k===y.k&&x.ch===y.ch))){reached.add(c);changed=true;}}if(reached.size!==b.words.length)throw Error("Disconnected "+p.id);for(const cells of sets)for(const c of cells)if(b.cells.get(c.k)!==c.ch)throw Error("Conflict "+p.id);count++;placed+=b.words.length;}}return {count,placed};})()')
   count+=report['count'];placed+=report['placed']
  result[lang]={'boards':count,'placements':placed};print('PASS',lang,result[lang],flush=True)
 (p/'test-results/slovokolo-expanded-boards.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
 print('PASS all expanded grids: complete, connected, no conflicting letters',flush=True)
finally:
 proc.terminate();server.shutdown()
