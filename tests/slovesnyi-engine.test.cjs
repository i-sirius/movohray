/* Run with Node. Exercises invariants, not DOM implementation details. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const context = { window: {} };
vm.runInNewContext(fs.readFileSync('slovesnyi-engine.js', 'utf8'), context);
const E = context.window.SlovesnyiEngine;
const topics = JSON.parse(fs.readFileSync('debates.json', 'utf8')).topics;
let seed = 41;
const random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const names = n => Array.from({ length: n }, (_, i) => 'Player ' + i);
assert.throws(() => E.create(names(1), {}, {}, 0, random));
assert.throws(() => E.create(names(4), { levels: [] }, {}, 0, random));
for (const rebuttal of [0, 15]) {
  const state = E.create(names(4), { rebuttal }, {}, 0, random);
  assert(E.nextMatch(state, topics, 0, random));
  assert(!E.vote(state, state.currentMatch.playerIds[0], 1));
  const phases = ['intro', 'preparation', 'speechA', 'speechB'];
  if (rebuttal) phases.push('rebuttalA', 'rebuttalB');
  for (const phase of phases) { assert.equal(state.phase, phase); assert(E.advance(state, 1000)); }
  assert.equal(state.phase, 'voting');
  const winner = state.currentMatch.playerIds[0];
  assert(!E.vote(state, 'outsider', 1000));
  assert(E.vote(state, winner, 1000));
  assert(!E.vote(state, winner, 1001));
  assert.equal(state.players.reduce((sum, p) => sum + p.wins, 0), 1);
}
const paused = E.create(names(2), {}, {}, 0, random);
E.nextMatch(paused, topics, 0, random); E.advance(paused, 0);
E.pause(paused, true, 5000);
assert.equal(E.remaining(paused, 50000), 15000);
assert(!E.advance(paused, 50000));
E.pause(paused, false, 50000);
assert.equal(E.remaining(paused, 55000), 10000);
const restored = JSON.parse(JSON.stringify(paused));
assert.equal(E.remaining(restored, 55000), 10000);
assert(E.advance(restored, 55000));
assert.equal(restored.phase, 'speechA');
const reports = [];
for (let n = 2; n <= 8; n++) {
  const state = E.create(names(n), {}, {}, 0, random);
  const seen = new Set();
  let largestGap = 0;
  for (let round = 0; round < 720; round++) {
    const before = state.players.map(p => p.battles);
    const minExposure = Math.min(...before);
    const minTopic = Math.min(...topics.map(t => state.topicHistory[t.id] ? state.topicHistory[t.id].count : 0));
    E.nextMatch(state, topics, round * 1000, random);
    const selected = state.currentMatch.playerIds.map(id => state.players.findIndex(p => p.id === id));
    assert(selected.some(i => before[i] === minExposure), 'Minimum player exposure must take priority');
    assert.equal(state.topicHistory[state.currentTopic.id].count, minTopic + 1);
    if (round < topics.length) { assert(!seen.has(state.currentTopic.id)); seen.add(state.currentTopic.id); }
    const counts = state.players.map(p => p.battles);
    largestGap = Math.max(largestGap, Math.max(...counts) - Math.min(...counts));
    assert(largestGap <= 1, 'Player appearances diverged');
    assert.equal(state.positions[state.currentMatch.playerIds[0]], 'pro');
    assert.equal(state.positions[state.currentMatch.playerIds[1]], 'con');
    while (state.phase !== 'voting') E.advance(state, round * 1000);
    assert(E.vote(state, null, round * 1000));
    assert(state.players.every(p => p.wins === 0));
  }
  const pairCounts = Object.values(state.pairHistory).map(p => p.battles);
  assert.equal(pairCounts.length, n * (n - 1) / 2, 'All pairs must participate');
  assert(Math.max(...pairCounts) - Math.min(...pairCounts) <= 2, 'Pair exposure diverged');
  const imbalance = Math.max(...state.players.map(p => Math.abs(p.pro - p.con)));
  assert(imbalance <= 2, 'Position balancing diverged');
  reports.push({ players: n, matches: 720, largestAppearanceGap: largestGap, pairRange: [Math.min(...pairCounts), Math.max(...pairCounts)], maxPositionImbalance: imbalance });
  const newGame = E.create(names(n), { levels: ['crazy'] }, state.topicHistory, 1e7, random);
  E.nextMatch(newGame, topics, 1e7, random);
  assert.equal(newGame.currentTopic.level, 'crazy');
  assert.equal(newGame.topicHistory[newGame.currentTopic.id].count, 5);
}
const final = E.create(names(2), { target: 3 }, {}, 0, random);
for (let i = 0; i < 3; i++) {
  E.nextMatch(final, topics, i, random);
  while (final.phase !== 'voting') E.advance(final, i);
  E.vote(final, 'p0', i);
}
assert.equal(final.winnerId, 'p0');
assert(!E.nextMatch(final, topics, 5, random));
assert(E.finish(final, 5));
assert.equal(final.phase, 'finished');
console.log(JSON.stringify(reports, null, 2));
console.log('PASS: phases, pause, JSON round trip, scoring, draws, fair rotation, sides, topic exposure, final');
