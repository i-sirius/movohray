const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const app = fs.readFileSync('app.js', 'utf8');
function fn(name) {
  const start = app.indexOf('function ' + name + '(');
  return app.slice(start, app.indexOf('\nfunction ', start + 1));
}
function setup(saved, unavailable) {
  const data = { value: saved };
  const context = vm.createContext({
    ALIAS_SWIPE_LEARNING_KEY: 'movohray-alias-swipe-learning-v1',
    localStorage: { getItem() { if (unavailable) throw Error(); return data.value; },
      setItem(key, value) { if (unavailable) throw Error(); data.value = value; } },
    selectedMode: 'explain', currentEntry: { word: 'test' }, roundTimerIsActive: true,
    isAwaitingLastWordResult: false, isSwipeLocked: false, isRoundPaused: false,
    getCurrentAppScreenName: () => 'game', isSingleCardMode: () => false,
    handleRoundWordResult() {}, renderAliasSwipeHint() {}
  });
  for (const name of ['readAliasSwipeLearning', 'hasLearnedAliasSwipes', 'persistAliasSwipeLearning', 'recordAliasSwipe', 'handleSwipe', 'markCorrect', 'markSkipped']) vm.runInContext(fn(name), context);
  vm.runInContext('var aliasSwipeLearning = readAliasSwipeLearning()', context);
  return { c: context, data, run: source => vm.runInContext(source, context) };
}
test('all four learning requirements must hold; persistence survives reload', () => {
  const h = setup();
  assert.equal(h.run('hasLearnedAliasSwipes()'), false);
  h.run('handleSwipe(100)');
  assert.equal(h.run('hasLearnedAliasSwipes()'), false);
  h.run('handleSwipe(-100)');
  assert.equal(h.run('hasLearnedAliasSwipes()'), false);
  h.run('aliasSwipeLearning.completedAliasRounds=2; handleSwipe(100); handleSwipe(100); handleSwipe(100)');
  assert.equal(h.run('hasLearnedAliasSwipes()'), false);
  h.run('aliasSwipeLearning.completedAliasRounds=1; handleSwipe(100)');
  assert.equal(h.run('hasLearnedAliasSwipes()'), false);
  h.run('aliasSwipeLearning.completedAliasRounds=2; persistAliasSwipeLearning()');
  assert.equal(h.run('hasLearnedAliasSwipes()'), true);
  assert.equal(setup(h.data.value).run('hasLearnedAliasSwipes()'), true);
  h.run('aliasSwipeLearning.usedSwipeDown=false');
  assert.equal(h.run('hasLearnedAliasSwipes()'), false);
});
test('buttons, short/rejected gestures, other modes and inactive rounds never count', () => {
  const h=setup();
  h.run('markCorrect(); markSkipped(); handleSwipe(59); isRoundPaused=true; handleSwipe(100); isRoundPaused=false; isSwipeLocked=true; handleSwipe(-100); isSwipeLocked=false; selectedMode="charades"; handleSwipe(100); selectedMode="explain"; roundTimerIsActive=false; handleSwipe(100)');
  assert.equal(h.run('aliasSwipeLearning.totalSwipeGestures'), 0);
});
test('corrupt/missing/unavailable storage defaults safely; writes are optional', () => {
  for (const value of [undefined, 'oops', 'null', '{}', '{"totalSwipeGestures":-1}', '{"totalSwipeGestures":6,"completedAliasRounds":2,"usedSwipeUp":"true","usedSwipeDown":true}']) {
    assert.equal(setup(value).run('hasLearnedAliasSwipes()'), false);
  }
  const h=setup(null,true);h.run('handleSwipe(100)');
  assert.equal(h.run('aliasSwipeLearning.totalSwipeGestures'),1);
  assert.equal(setup(null,true).run('hasLearnedAliasSwipes()'),false);
});
test('global reset includes learning storage; achievement core equals c5', () => {
  assert.match(app, /MOVOHRAY_USER_RESET_STORAGE_KEYS = \[ALIAS_SWIPE_LEARNING_KEY,/);
  const old=require('node:child_process').execFileSync('git',['show','2d5ce60:app.js'],{encoding:'utf8',maxBuffer:3000000});
  for (const name of ['unlockWordGuessAchievement','readWordGuessAchievementsState','persistWordGuessAchievementsState','isWordGuessAchievementNew','markWordGuessAchievementViewed','revealWordGuessAchievementHint']) {
    const start=old.indexOf('function '+name+'(');
    assert.equal(fn(name).replace(/\r/g,'').trim(),old.slice(start,old.indexOf('\nfunction ',start+1)).replace(/\r/g,'').trim(),name);
  }
});
