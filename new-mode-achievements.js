/* Adapters for the existing achievement store/unlock/UI in app.js. Engines stay pure. */
var NewModeAchievements = (function () {
  "use strict";
  var sessionId = null, winsBySide = {}, lastRound = 0;

  function normalizeStats(value) {
    var saved = value && typeof value === "object" ? value : {};
    function count(key) {
      return Number.isSafeInteger(saved[key]) && saved[key] >= 0 ? saved[key] : 0;
    }
    return {
      completed: count("completed"),
      won3x4: saved.won3x4 === true,
      won4x4: saved.won4x4 === true,
      won5x5: saved.won5x5 === true,
      noHintWinStreak: count("noHintWinStreak"),
      lastCompletedGameId: typeof saved.lastCompletedGameId === "string" ? saved.lastCompletedGameId : ""
    };
  }

  function recordSvitlohray(result) {
    if (!result || result.finished !== true || !result.gameId || !result.board ||
        !Number.isSafeInteger(result.moves) || result.moves < 1 || typeof result.assisted !== "boolean") return;
    try { if (!SvitlohrayEngine.won(result.board)) return; } catch (_) { return; }
    var stats = normalizeStats(wordGuessAchievementsState.svitlohray);
    if (stats.lastCompletedGameId === result.gameId) return;
    var size = result.board.rows + "x" + result.board.cols;
    stats.completed++;
    stats["won" + size] = true;
    stats.noHintWinStreak = result.assisted ? 0 : stats.noHintWinStreak + 1;
    stats.lastCompletedGameId = result.gameId;
    wordGuessAchievementsState.svitlohray = stats;
    // Counters are saved before awards; each unlock uses the existing idempotent path.
    persistWordGuessAchievementsState();
    unlockAchievementConditions([
      [true, "svitlohray-first-win"],
      [!result.assisted, "svitlohray-no-hint"],
      [size === "5x5", "svitlohray-big-picture"],
      [stats.won3x4 && stats.won4x4 && stats.won5x5, "svitlohray-all-sizes"],
      [stats.completed >= 10, "svitlohray-ten-wins"],
      [stats.completed >= 25, "svitlohray-twenty-five-wins"],
      [result.manualPaletteChanged === true, "svitlohray-colorist"],
      [result.randomPaletteUsed === true, "svitlohray-new-mood"],
      [stats.noHintWinStreak >= 5, "svitlohray-no-help"],
      [size === "5x5" && result.moves >= 75, "svitlohray-patience"]
    ]);
  }

  function onSlovesnyi(detail) {
    var state = detail && detail.state;
    if (!state || !state.sessionId || !Array.isArray(state.players)) return;
    if (detail.type !== "match-start" && detail.type !== "match-result" && detail.type !== "game-complete") return;
    if (sessionId !== state.sessionId) {
      sessionId = state.sessionId; winsBySide = {}; lastRound = 0;
    }
    if (detail.type === "game-complete") {
      if (state.winnerId && state.players.some(function (p) { return p.id === state.winnerId; })) {
        unlockWordGuessAchievement("slovesnyi-first-game");
      }
      return;
    }
    var match = state.currentMatch;
    if (detail.type !== "match-result" || !match || !match.voted || state.roundIndex <= lastRound) return;
    lastRound = state.roundIndex;
    var winner = state.players.filter(function (p) { return p.id === match.winnerId; })[0];
    if (!winner || !Array.isArray(match.playerIds) || match.playerIds.indexOf(winner.id) < 0) return;
    var side = (state.positions || {})[winner.id];
    var sides = winsBySide[winner.id] || { pro: false, con: false };
    if (side === "pro" || side === "con") sides[side] = true;
    winsBySide[winner.id] = sides;
    unlockAchievementConditions([
      [true, "slovesnyi-first-duel"],
      [side === "con", "slovesnyi-devils-advocate"],
      [state.currentTopic && state.currentTopic.level === "crazy", "slovesnyi-crazy-win"],
      [winner.streak >= 3, "slovesnyi-three-streak"],
      [sides.pro && sides.con, "slovesnyi-both-sides"]
    ]);
  }

  document.addEventListener("movohray:slovesnyi", function (event) { onSlovesnyi(event.detail); });
  return { normalizeStats: normalizeStats, recordSvitlohray: recordSvitlohray, onSlovesnyi: onSlovesnyi };
}());
