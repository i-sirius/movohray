/* Serializable local game logic. No DOM, storage, audio or network dependencies. */
(function (root) {
  "use strict";
  var defaults = { target: 5, preparation: 20, speech: 40, rebuttal: 15, levels: ["easy", "normal", "crazy"] };
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function choose(items, random) { return items[Math.floor((random || Math.random)() * items.length)]; }
  function compare(a, b) {
    for (var i = 0; i < a.length; i++) { if (a[i] !== b[i]) return a[i] - b[i]; }
    return 0;
  }
  function least(items, rank, random) {
    var sorted = items.slice().sort(function (a, b) { return compare(rank(a), rank(b)); });
    var best = rank(sorted[0]);
    return choose(sorted.filter(function (item) { return compare(rank(item), best) === 0; }), random);
  }
  function create(names, settings, history, now, random) {
    var config = clone(defaults);
    Object.keys(settings || {}).forEach(function (key) { config[key] = clone(settings[key]); });
    if (names.length < 2 || names.length > 8 || [3, 5, 7].indexOf(config.target) < 0 ||
        [10, 20, 30].indexOf(config.preparation) < 0 || [30, 40, 60].indexOf(config.speech) < 0 ||
        [0, 10, 15, 20].indexOf(config.rebuttal) < 0 || !config.levels.length ||
        config.levels.some(function (level) { return defaults.levels.indexOf(level) < 0; })) throw new Error("Invalid game settings");
    return {
      schemaVersion: 1, sessionId: String(now) + "-" + Math.floor((random || Math.random)() * 1e9),
      players: names.map(function (name, i) {
        return { id: "p" + i, name: String(name).trim().slice(0, 32), wins: 0, battles: 0, pro: 0, con: 0, lastPlayedRound: -1, streak: 0 };
      }),
      settings: config, phase: "setup", phaseStartedAt: now, pausedAt: null,
      roundIndex: 0, currentMatch: null, currentTopic: null, positions: {},
      pairHistory: {}, topicHistory: clone(history || {}), topicSequence: 0, winnerId: null
    };
  }
  function nextMatch(state, topics, now, random) {
    if (state.phase !== "setup" && state.phase !== "result") return false;
    if (state.winnerId) return false;
    var pool = topics.filter(function (topic) { return state.settings.levels.indexOf(topic.level) >= 0; });
    if (!pool.length) throw new Error("Empty topic pool");
    var pairs = [];
    state.players.forEach(function (a, i) {
      state.players.slice(i + 1).forEach(function (b) { pairs.push([a, b]); });
    });
    function pairCost(a, b) {
      var key = [a.id, b.id].sort().join(":");
      var h = state.pairHistory[key];
      return Math.pow((h ? h.battles : 0) + 1, 2);
    }
    function completionCost(players) {
      if (players.length < 2) return 0;
      var best = Infinity;
      for (var i = 1; i < players.length; i++) {
        best = Math.min(best, pairCost(players[0], players[i]) + completionCost(players.filter(function (p, j) { return j !== 0 && j !== i; })));
      }
      return best;
    }
    var minimum = Math.min.apply(null, state.players.map(function (p) { return p.battles; }));
    var waiting = state.players.filter(function (p) { return p.battles === minimum; });
    var pair = least(pairs, function (p) {
      var h = state.pairHistory[p[0].id + ":" + p[1].id] || { battles: 0, lastPlayedRound: -1 };
      // Look ahead within an even exposure tier so greedy choices do not repeatedly
      // strand the same two players as the final pair (notably in six-player games).
      var waveCost = waiting.length % 2 === 0 && p[0].battles === minimum && p[1].battles === minimum
        ? pairCost(p[0], p[1]) + completionCost(waiting.filter(function (player) { return player !== p[0] && player !== p[1]; })) : 0;
      // Player exposure is absolute; balanced pair coverage, recency and rest break ties.
      return [Math.min(p[0].battles, p[1].battles), Math.max(p[0].battles, p[1].battles),
        waveCost, h.battles, h.lastPlayedRound, Math.max(p[0].lastPlayedRound, p[1].lastPlayedRound),
        p[0].lastPlayedRound + p[1].lastPlayedRound];
    }, random);
    var pairKey = pair[0].id + ":" + pair[1].id;
    var orientations = [pair, [pair[1], pair[0]]];
    var ordered = least(orientations, function (p) {
      return [Math.pow(p[0].pro - p[0].con + 1, 2) + Math.pow(p[1].pro - p[1].con - 1, 2)];
    }, random);
    var topic = least(pool, function (t) {
      var h = state.topicHistory[t.id] || { count: 0, lastShown: 0 };
      return [h.count, h.lastShown];
    }, random);
    state.topicSequence = Math.max(state.topicSequence, Object.keys(state.topicHistory).reduce(function (max, id) {
      return Math.max(max, state.topicHistory[id].lastShown || 0);
    }, 0)) + 1;
    var oldTopic = state.topicHistory[topic.id] || { count: 0 };
    state.topicHistory[topic.id] = { count: oldTopic.count + 1, lastShown: state.topicSequence };
    state.roundIndex++;
    var oldPair = state.pairHistory[pairKey] || { battles: 0 };
    state.pairHistory[pairKey] = { battles: oldPair.battles + 1, lastPlayedRound: state.roundIndex };
    state.positions = {};
    ordered.forEach(function (player, i) {
      player.battles++;
      player.lastPlayedRound = state.roundIndex;
      player[i === 0 ? "pro" : "con"]++;
      state.positions[player.id] = i === 0 ? "pro" : "con";
    });
    state.currentMatch = { playerIds: ordered.map(function (p) { return p.id; }), winnerId: null, voted: false };
    state.currentTopic = clone(topic);
    setPhase(state, "intro", now);
    return true;
  }
  function setPhase(state, phase, now) { state.phase = phase; state.phaseStartedAt = now; state.pausedAt = null; }
  function duration(state) {
    if (state.phase === "preparation") return state.settings.preparation;
    if (state.phase === "speechA" || state.phase === "speechB") return state.settings.speech;
    if (state.phase === "rebuttalA" || state.phase === "rebuttalB") return state.settings.rebuttal;
    return 0;
  }
  function remaining(state, now) {
    return Math.max(0, duration(state) * 1000 - ((state.pausedAt === null ? now : state.pausedAt) - state.phaseStartedAt));
  }
  function pause(state, paused, now) {
    if (paused && state.pausedAt === null) state.pausedAt = now;
    if (!paused && state.pausedAt !== null) {
      state.phaseStartedAt += now - state.pausedAt;
      state.pausedAt = null;
    }
  }
  function advance(state, now) {
    var phases = ["intro", "preparation", "speechA", "speechB"];
    if (state.settings.rebuttal) phases = phases.concat(["rebuttalA", "rebuttalB"]);
    phases.push("voting");
    var index = phases.indexOf(state.phase);
    if (index < 0 || index === phases.length - 1 || state.pausedAt !== null) return false;
    setPhase(state, phases[index + 1], now);
    return true;
  }
  function vote(state, winnerId, now) {
    if (state.phase !== "voting" || state.currentMatch.voted ||
        (winnerId !== null && state.currentMatch.playerIds.indexOf(winnerId) < 0)) return false;
    state.currentMatch.voted = true;
    state.currentMatch.winnerId = winnerId;
    state.players.forEach(function (player) {
      if (player.id === winnerId) {
        player.wins++; player.streak++;
        if (player.wins >= state.settings.target) state.winnerId = player.id;
      } else if (state.currentMatch.playerIds.indexOf(player.id) >= 0) player.streak = 0;
    });
    setPhase(state, "result", now);
    return true;
  }
  function finish(state, now) {
    if (state.phase !== "result" || !state.winnerId) return false;
    setPhase(state, "finished", now); return true;
  }
  root.SlovesnyiEngine = { defaults: defaults, create: create, nextMatch: nextMatch, advance: advance,
    vote: vote, finish: finish, duration: duration, remaining: remaining, pause: pause, snapshot: clone };
}(typeof window !== "undefined" ? window : globalThis));
