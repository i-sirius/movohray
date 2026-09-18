/* Frozen-pool selection and local progress. No UI, network, or gameplay dependencies. */
var DailyWord = (function () {
  "use strict";
  var STORAGE_KEY = "movohray-daily-word-v1";
  var LANGUAGES = ["uk", "ru", "en"];
  var HISTORY_LIMIT = 62;

  function localDate(date) {
    var value = date || new Date();
    function pad(number) { return (number < 10 ? "0" : "") + number; }
    return value.getFullYear() + "-" + pad(value.getMonth() + 1) + "-" + pad(value.getDate());
  }

  // UTC is used only to number calendar labels, never to choose the user's date.
  // This avoids 23/25-hour days and timezone-offset changes in streak arithmetic.
  function dayNumber(label) {
    if (typeof label !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(label)) return NaN;
    var parts = label.split("-").map(Number);
    var date = new Date(0);
    date.setUTCFullYear(parts[0], parts[1] - 1, parts[2]);
    date.setUTCHours(0, 0, 0, 0);
    if (date.getUTCFullYear() !== parts[0] || date.getUTCMonth() !== parts[1] - 1 || date.getUTCDate() !== parts[2]) return NaN;
    return Math.floor(date.getTime() / 86400000);
  }

  function select(pool, date, language) {
    var words = pool && pool.version === 1 && pool.languages && pool.languages[language];
    var day = dayNumber(date);
    if (!Array.isArray(words) || !words.length || !isFinite(day)) throw new Error("Invalid daily pool or date");
    var index = ((day - dayNumber("2026-01-01")) % words.length + words.length) % words.length;
    return { date: date, language: language, index: index, word: words[index], poolVersion: 1 };
  }

  function count(value) {
    return typeof value === "number" && isFinite(value) && value >= 0 && value <= 9007199254740991 && Math.floor(value) === value ? value : 0;
  }

  function emptyProgress() {
    return { lastCompletedDate: "", currentStreak: 0, bestStreak: 0, totalCompleted: 0, days: {} };
  }

  function prune(progress) {
    Object.keys(progress.days).sort().reverse().slice(HISTORY_LIMIT).forEach(function (date) { delete progress.days[date]; });
  }

  function normalize(raw) {
    var state = { version: 1, languages: {} };
    LANGUAGES.forEach(function (language) {
      var progress = emptyProgress();
      var saved = raw && raw.version === 1 && raw.languages && raw.languages[language];
      if (saved && typeof saved === "object") {
        if (isFinite(dayNumber(saved.lastCompletedDate))) {
          progress.lastCompletedDate = saved.lastCompletedDate;
          progress.totalCompleted = Math.max(1, count(saved.totalCompleted));
          progress.currentStreak = Math.min(progress.totalCompleted, Math.max(1, count(saved.currentStreak)));
          progress.bestStreak = Math.min(progress.totalCompleted, Math.max(progress.currentStreak, count(saved.bestStreak)));
        }
        if (saved.days && typeof saved.days === "object") {
          Object.keys(saved.days).filter(function (date) { return isFinite(dayNumber(date)); }).sort().slice(-HISTORY_LIMIT).forEach(function (date) {
            var day = saved.days[date];
            if (day && typeof day === "object") progress.days[date] = {
              completed: day.completed === true && !!progress.lastCompletedDate && date <= progress.lastCompletedDate,
              attempts: Math.min(9999, count(day.attempts))
            };
          });
        }
      }
      state.languages[language] = progress;
    });
    return state;
  }

  function createStore(storage) {
    var memory = normalize(null);
    var volatile = false;
    function read() {
      if (!volatile) {
        try { memory = normalize(JSON.parse(storage.getItem(STORAGE_KEY))); }
        catch (_) { /* Corrupt/unavailable storage must not prevent play. */ }
      }
      return memory;
    }
    function write(state) {
      memory = state;
      try { storage.setItem(STORAGE_KEY, JSON.stringify(state)); }
      catch (_) { volatile = true; }
    }
    function valid(language, date) {
      if (LANGUAGES.indexOf(language) < 0 || !isFinite(dayNumber(date))) throw new Error("Invalid daily identity");
    }
    function status(language, date) {
      valid(language, date);
      var progress = read().languages[language];
      var gap = dayNumber(date) - dayNumber(progress.lastCompletedDate);
      var day = progress.days[date] || {};
      return {
        completed: day.completed === true || date === progress.lastCompletedDate,
        attempts: day.attempts || 0,
        currentStreak: gap === 0 || gap === 1 ? progress.currentStreak : 0,
        bestStreak: progress.bestStreak,
        totalCompleted: progress.totalCompleted
      };
    }
    function begin(language, date) {
      valid(language, date);
      var state = read();
      var progress = state.languages[language];
      var day = progress.days[date] || { completed: date === progress.lastCompletedDate, attempts: 0 };
      if (!day.completed) day.attempts = Math.min(9999, day.attempts + 1);
      progress.days[date] = day;
      prune(progress);
      write(state);
      return status(language, date);
    }
    function complete(language, date) {
      valid(language, date);
      // Re-read on every mutation so other tabs' completed days are respected.
      var state = read();
      var progress = state.languages[language];
      // A high-water mark also prevents re-awarding dates pruned from history
      // after a clock rollback. An in-flight game keeps its original date.
      if (progress.lastCompletedDate && date <= progress.lastCompletedDate) return false;
      var consecutive = dayNumber(date) - dayNumber(progress.lastCompletedDate) === 1;
      progress.currentStreak = consecutive ? progress.currentStreak + 1 : 1;
      progress.bestStreak = Math.max(progress.bestStreak, progress.currentStreak);
      progress.totalCompleted += 1;
      progress.lastCompletedDate = date;
      progress.days[date] = { completed: true, attempts: (progress.days[date] || {}).attempts || 1 };
      prune(progress);
      write(state);
      return true;
    }
    function milestones() {
      var state = read();
      var total = 0, best = 0;
      LANGUAGES.forEach(function (language) {
        total += state.languages[language].totalCompleted;
        best = Math.max(best, state.languages[language].bestStreak);
      });
      return { total: total, best: best };
    }
    return { status: status, begin: begin, complete: complete, milestones: milestones };
  }

  return { storageKey: STORAGE_KEY, localDate: localDate, dayNumber: dayNumber, select: select, createStore: createStore };
}());
