const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const cp = require('node:child_process');
const app = fs.readFileSync('app.js','utf8');
const fixture = JSON.parse(fs.readFileSync('tests/new-mode-achievements-copy.json','utf8'));
function constant(source,name,end) {
  const start=source.indexOf('const '+name+' = ');
  assert(start>=0,name);
  return source.slice(start,source.indexOf(end,start)+end.length);
}
function fn(name) {
  const start=app.indexOf('function '+name+'(');
  assert(start>=0,name);
  return app.slice(start,app.indexOf('\nfunction ',start+1));
}
function harness(saved, unavailable=false) {
  const data=saved || {}, events={}, queued=[];
  const c=vm.createContext({console,document:{addEventListener:(name,callback)=>{events[name]=callback;}},
    localStorage:{getItem:k=>{if(unavailable)throw Error('storage unavailable');return data[k] || null;},setItem:(k,v)=>{if(unavailable)throw Error('storage unavailable');data[k]=v;}}});
  c.window=c;
  for(const file of ['svitlohray-engine.js','slovesnyi-engine.js','new-mode-achievements.js']) vm.runInContext(fs.readFileSync(file,'utf8'),c);
  vm.runInContext(constant(app,'WORD_GUESS_ACHIEVEMENTS','\n];')+'\n'+constant(app,'WORD_GUESS_ACHIEVEMENT_GAMES','\n];')+'\n'+constant(app,'MOVOHRAY_GLOBAL_ACHIEVEMENT_IDS',']);')+'\n'+constant(app,'WORD_GUESS_TEXT','\n};'),c);
  c.queueWordGuessAchievementToast=id=>queued.push(id);
  c.renderHiddenWordGuessAchievementsLab=()=>{};
  c.achievementsModal=null;
  c.wordGuessAchievementsModalDirty=false;
  c.WORD_GUESS_ACHIEVEMENTS_STORAGE_KEY='movohray-wordguess-achievements-v2';
  for(const name of ['readWordGuessAchievementsState','persistWordGuessAchievementsState','getWordGuessAchievementDefinition','getWordGuessAchievementGameId','unlockWordGuessAchievement','unlockAchievementConditions','isWordGuessAchievementNew','markWordGuessAchievementViewed']) vm.runInContext(fn(name),c);
  vm.runInContext('var wordGuessAchievementsState = readWordGuessAchievementsState();',c);
  const run=code=>vm.runInContext(code,c);
  let game=0;
  function sv(overrides={}) {
    const result=Object.assign({gameId:'board-'+(++game),finished:true,board:{rows:3,cols:4,cells:Array(12).fill(1)},moves:8,assisted:false,manualPaletteChanged:false,randomPaletteUsed:false},overrides);
    c.NewModeAchievements.recordSvitlohray(result);return result;
  }
  function party(id='party-a') {
    const state=c.SlovesnyiEngine.create(['A','B'],{target:7}, {},123,()=>.5);state.sessionId=id;
    const topics=['easy','normal','crazy'].map((level,i)=>({id:'topic'+i,level,category:'test',text:{ua:'T',ru:'T',en:'T'}}));
    function duel(winnerId='p0',side='pro',level='normal') {
      c.SlovesnyiEngine.nextMatch(state,topics,123,()=>.5);
      state.positions={p0:side,p1:side==='pro'?'con':'pro'};state.currentTopic.level=level;
      events['movohray:slovesnyi']({detail:{type:'match-start',state:c.SlovesnyiEngine.snapshot(state)}});
      state.phase='voting';assert(c.SlovesnyiEngine.vote(state,winnerId,124));
      const detail={type:'match-result',state:c.SlovesnyiEngine.snapshot(state)};
      events['movohray:slovesnyi']({detail});return detail;
    }
    return {state,duel,complete:()=>events['movohray:slovesnyi']({detail:{type:'game-complete',state:c.SlovesnyiEngine.snapshot(state)}})};
  }
  return {c,run,data,queued,sv,party,has:id=>!!c.wordGuessAchievementsState.unlocked[id],state:()=>JSON.parse(JSON.stringify(c.wordGuessAchievementsState))};
}
const board=(rows,cols)=>({rows,cols,cells:Array(rows*cols).fill(1)});
test('417 legacy definitions and their copy unchanged; 433 total, exact +16 copy, groups',()=>{
  const h=harness(), old=cp.execFileSync('git',['show','095a8d9:app.js'],{encoding:'utf8'}), baseline=vm.createContext({});
  vm.runInContext(constant(old,'WORD_GUESS_ACHIEVEMENTS','\n];')+'\n'+constant(old,'WORD_GUESS_TEXT','\n};'),baseline);
  const oldDefs=JSON.parse(vm.runInContext('JSON.stringify(WORD_GUESS_ACHIEVEMENTS)',baseline));
  const defs=JSON.parse(h.run('JSON.stringify(WORD_GUESS_ACHIEVEMENTS)'));
  assert.equal(oldDefs.length,417);assert.equal(defs.length,433);assert.equal(new Set(defs.map(d=>d.id)).size,433);
  for(const d of oldDefs) {
    assert.deepEqual(defs.find(n=>n.id===d.id),d);
    for(const lang of ['uk','ru','en']) for(const key of [d.titleKey,d.descriptionKey,d.hintKey].filter(Boolean)) {
      assert.equal(h.run(`WORD_GUESS_TEXT.${lang}[${JSON.stringify(key)}]`),vm.runInContext(`WORD_GUESS_TEXT.${lang}[${JSON.stringify(key)}]`,baseline));
    }
  }
  for(const f of fixture) {
    assert.deepEqual(defs.find(d=>d.id===f.definition.id),f.definition);
    for(const lang of ['uk','ru','en']) {
      assert.equal(h.run(`WORD_GUESS_TEXT.${lang}.${f.definition.titleKey}`),f.texts[lang].title);
      assert.equal(h.run(`WORD_GUESS_TEXT.${lang}.${f.definition.descriptionKey}`),f.texts[lang].description);
    }
  }
  assert.deepEqual(JSON.parse(h.run('JSON.stringify(WORD_GUESS_ACHIEVEMENTS.reduce(function(a,d){var g=getWordGuessAchievementGameId(d);a[g]=(a[g]||0)+1;return a;},{}))')),{wordguess:148,movohray:17,alias:93,charades:76,whoami:83,svitlohray:10,slovesnyi:6});
  for(const name of ['recordWordGuessAchievements','recordWhoAmIFinalAchievements','evaluatePartyModeCumulativeAchievements','recordPartyModeAchievements','evaluatePartyWordSpecificAchievements','evaluatePartyRoundPatternAchievements','unlockWordGuessAchievement','getVisibleWordGuessAchievementDefinitions','markWordGuessAchievementViewed','revealWordGuessAchievementHint','renderWordGuessAchievementCards','getWordGuessAchievementTimestamp']) {
    const start=old.indexOf('function '+name+'('), end=old.indexOf('\nfunction ',start+1);
    assert.equal(fn(name).replace(/\r\n/g,'\n').trimEnd(),old.slice(start,end).replace(/\r\n/g,'\n').trimEnd(),name+' unchanged');
  }
});
test('SV01/02: first completion; hinted/non-finished games do not grant no-hint',()=>{
  const h=harness();h.sv({finished:false});assert.equal(h.queued.length,0);
  h.sv({assisted:true});assert(h.has('svitlohray-first-win'));assert(!h.has('svitlohray-no-hint'));
  h.sv();assert(h.has('svitlohray-no-hint'));
});
test('SV03/04: 5x5 and all three sizes persist',()=>{
  const h=harness();h.sv({board:board(5,5),assisted:true});assert(h.has('svitlohray-big-picture'));assert(!h.has('svitlohray-all-sizes'));
  h.sv({board:board(4,4)});h.sv();assert(h.has('svitlohray-all-sizes'));
  const reloaded=harness(h.data);assert(reloaded.state().svitlohray.won3x4 && reloaded.state().svitlohray.won4x4 && reloaded.state().svitlohray.won5x5);
});
test('SV05/06: exact 10/25 completion boundaries',()=>{
  const h=harness();for(let i=0;i<9;i++)h.sv();assert(!h.has('svitlohray-ten-wins'));h.sv();assert(h.has('svitlohray-ten-wins'));
  for(let i=10;i<24;i++)h.sv();assert(!h.has('svitlohray-twenty-five-wins'));h.sv();assert(h.has('svitlohray-twenty-five-wins'));
});
test('SV07/08: manual and random flags independent; multiple awards in one result',()=>{
  const manual=harness();manual.sv({manualPaletteChanged:true});assert(manual.has('svitlohray-colorist'));assert(!manual.has('svitlohray-new-mood'));
  const random=harness();random.sv({randomPaletteUsed:true});assert(random.has('svitlohray-new-mood'));assert(!random.has('svitlohray-colorist'));
  const both=harness();both.sv({board:board(5,5),manualPaletteChanged:true,randomPaletteUsed:true});assert.equal(both.queued.length,5);
});
test('SV09: completed-board streak spans sizes/reloads; hints reset, abandonment does not',()=>{
  const h=harness();for(let i=0;i<4;i++)h.sv();assert(!h.has('svitlohray-no-help'));
  h.sv({assisted:true});assert.equal(h.state().svitlohray.noHintWinStreak,0);
  for(let i=0;i<4;i++)h.sv();h.sv({finished:false});assert.equal(h.state().svitlohray.noHintWinStreak,4);
  const r=harness(h.data);r.sv({gameId:'after-reload',board:board(5,5)});assert(r.has('svitlohray-no-help'));
});
test('SV10: 5x5 at >=75 moves only, hints permitted',()=>{
  const h=harness();h.sv({board:board(4,4),moves:80});assert(!h.has('svitlohray-patience'));
  h.sv({board:board(5,5),moves:74});assert(!h.has('svitlohray-patience'));
  h.sv({board:board(5,5),moves:75,assisted:true});assert(h.has('svitlohray-patience'));
});
test('SL01/03/04: draw/FOR/normal negatives; actual AGAINST winner can be either player',()=>{
  const h=harness(), p=h.party();p.duel(null);assert.equal(h.queued.length,0);
  p.duel('p0','pro');assert(h.has('slovesnyi-first-duel'));assert(!h.has('slovesnyi-devils-advocate'));assert(!h.has('slovesnyi-crazy-win'));
  p.duel('p0','con','crazy');assert(h.has('slovesnyi-devils-advocate'));assert(h.has('slovesnyi-crazy-win'));
  const b=harness();b.party().duel('p1','pro');assert(b.has('slovesnyi-devils-advocate'));
});
test('SL02: completed party requires a winner',()=>{
  const h=harness(),p=h.party();p.complete();assert(!h.has('slovesnyi-first-game'));
  for(let i=0;i<7;i++)p.duel();p.complete();assert(h.has('slovesnyi-first-game'));
});
test('SL05: engine player streak; draws/losses reset; new parties do not carry streak',()=>{
  const h=harness(),p=h.party();p.duel();p.duel();p.duel(null);assert(!h.has('slovesnyi-three-streak'));
  p.duel();p.duel('p1');p.duel();p.duel();assert(!h.has('slovesnyi-three-streak'));p.duel();assert(h.has('slovesnyi-three-streak'));
  const fresh=harness(),a=fresh.party();a.duel();a.duel();fresh.party('new').duel();assert(!fresh.has('slovesnyi-three-streak'));
});
test('SL06: same player, same party; neither different players nor sessions can combine sides',()=>{
  const h=harness(),p=h.party();p.duel('p0','pro');p.duel('p1','pro');assert(!h.has('slovesnyi-both-sides'));
  p.duel('p0','con');assert(h.has('slovesnyi-both-sides'));
  const n=harness();n.party('one').duel('p0','pro');n.party('two').duel('p0','con');assert(!n.has('slovesnyi-both-sides'));
});
test('repeated Slovesnyi result events cannot duplicate awards or combine sides',()=>{
  const h=harness(),result=h.party().duel('p0','pro');const before=h.state(),queue=h.queued.slice();
  h.c.NewModeAchievements.onSlovesnyi(result);
  result.state.positions.p0='con';h.c.NewModeAchievements.onSlovesnyi(result);
  assert.deepEqual(h.state(),before);assert.deepEqual(h.queued,queue);assert(!h.has('slovesnyi-both-sides'));
});
test('persistent counters, secret, timestamps/unread survive reload; duplicate results/awards idempotent',()=>{
  const h=harness(),result=h.sv({board:board(5,5),moves:80}),before=h.state();
  h.c.NewModeAchievements.recordSvitlohray(result);assert.deepEqual(h.state(),before);
  const r=harness(h.data);r.c.NewModeAchievements.recordSvitlohray(result);assert.deepEqual(r.state().unlocked,before.unlocked);assert.equal(r.state().svitlohray.completed,1);assert.equal(r.queued.length,0);
  assert(r.run('isWordGuessAchievementNew("svitlohray-patience")'));r.run('markWordGuessAchievementViewed("svitlohray-patience")');
  assert(!harness(r.data).run('isWordGuessAchievementNew("svitlohray-patience")'));
  r.run('unlockWordGuessAchievement("svitlohray-patience")');assert.equal(r.queued.length,0);assert.equal(r.state().unlocked['svitlohray-patience'].unlockedAt,before.unlocked['svitlohray-patience'].unlockedAt);
});
test('corrupt/missing/unavailable storage uses existing fallback; old progress retained without migration',()=>{
  const key='movohray-wordguess-achievements-v2';
  for(const raw of ['{','null','[]',JSON.stringify({svitlohray:{completed:-1,noHintWinStreak:'4',won3x4:'yes'}})]){
    const h=harness({[key]:raw});h.sv();assert.equal(h.state().svitlohray.completed,1);
  }
  const h=harness({},true);h.sv();assert(h.has('svitlohray-first-win'));
  const old=harness({[key]:JSON.stringify({schemaVersion:8,aliasRounds:93,unlocked:{'alias-first-round':{unlockedAt:'2026-08-01T00:00:00.000Z'}},viewedAchievements:{}})});
  old.sv();assert.equal(old.state().aliasRounds,93);assert.equal(old.state().schemaVersion,8);assert(old.run('isWordGuessAchievementNew("alias-first-round")'));
});
