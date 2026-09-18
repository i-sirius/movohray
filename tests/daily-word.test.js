/* Browser-executable unit tests; no Node dependency. Run via daily-word-browser.py. */
function runDailyWordTests(pool) {
  "use strict";
  var passed = [];
  function check(name, condition) {
    if (!condition) throw new Error(name);
    passed.push(name);
  }
  function storage(initial) {
    var data = initial || {};
    return { data: data, getItem: function (key) { return data[key] || null; }, setItem: function (key, value) { data[key] = value; } };
  }
  function store() { return DailyWord.createStore(storage()); }
  ["uk", "ru", "en"].forEach(function (lang) {
    var first = DailyWord.select(pool, "2026-09-18", lang);
    check(lang + " deterministic selection", first.word === DailyWord.select(pool, "2026-09-18", lang).word);
    check(lang + " next day", DailyWord.select(pool, "2026-09-19", lang).index === (first.index + 1) % pool.languages[lang].length);
    check(lang + " epoch", DailyWord.select(pool, "2026-01-01", lang).index === 0);
    check(lang + " pre-epoch modulo", DailyWord.select(pool, "2025-12-31", lang).index === pool.languages[lang].length - 1);
  });
  check("local date uses local components", DailyWord.localDate(new Date(2026, 8, 18, 23, 59)) === "2026-09-18");
  check("invalid calendar label", isNaN(DailyWord.dayNumber("2026-02-30")));
  check("leap day", DailyWord.dayNumber("2024-03-01") - DailyWord.dayNumber("2024-02-28") === 2);
  var daily = store();
  check("old user empty", daily.status("uk", "2026-09-18").totalCompleted === 0);
  daily.begin("uk", "2026-09-18");
  daily.begin("uk", "2026-09-18");
  check("starts are not completions", daily.status("uk", "2026-09-18").attempts === 2 && !daily.status("uk", "2026-09-18").completed);
  check("first completion", daily.complete("uk", "2026-09-18") && daily.status("uk", "2026-09-18").currentStreak === 1);
  check("duplicate completion", !daily.complete("uk", "2026-09-18") && daily.status("uk", "2026-09-18").totalCompleted === 1);
  check("consecutive day", daily.complete("uk", "2026-09-19") && daily.status("uk", "2026-09-19").currentStreak === 2);
  check("streak retained yesterday", daily.status("uk", "2026-09-20").currentStreak === 2);
  check("expired streak display", daily.status("uk", "2026-09-21").currentStreak === 0);
  check("skipped day", daily.complete("uk", "2026-09-21") && daily.status("uk", "2026-09-21").currentStreak === 1);
  check("best retained", daily.status("uk", "2026-09-21").bestStreak === 2);
  check("language isolation", daily.status("en", "2026-09-21").totalCompleted === 0);
  daily.complete("en", "2026-09-21");
  check("cross-language total, separate streak", daily.milestones().total === 4 && daily.milestones().best === 2);
  [["2026-01-31", "2026-02-01"], ["2026-12-31", "2027-01-01"], ["2026-03-28", "2026-03-29"], ["2026-10-24", "2026-10-25"]].forEach(function (pair) {
    var instance = store();
    instance.complete("uk", pair[0]); instance.complete("uk", pair[1]);
    check("calendar boundary " + pair.join(" / "), instance.status("uk", pair[1]).currentStreak === 2);
  });
  var corrupt = {}; corrupt[DailyWord.storageKey] = "{broken";
  var recovered = DailyWord.createStore(storage(corrupt));
  check("corrupt storage safe", recovered.status("uk", "2026-09-18").totalCompleted === 0 && recovered.complete("uk", "2026-09-18"));
  [null, [], { version: 99 }, { version: 1, languages: { uk: { lastCompletedDate: "2026-02-31", totalCompleted: -5, days: null } } }].forEach(function (raw, i) {
    var data = {}; data[DailyWord.storageKey] = JSON.stringify(raw);
    check("malformed schema " + i, DailyWord.createStore(storage(data)).status("uk", "2026-09-18").totalCompleted === 0);
  });
  var unavailable = DailyWord.createStore({ getItem: function () { throw Error("denied"); }, setItem: function () { throw Error("denied"); } });
  unavailable.complete("uk", "2026-09-18");
  check("unavailable storage session fallback", !unavailable.complete("uk", "2026-09-18") && unavailable.status("uk", "2026-09-18").totalCompleted === 1);
  var saved = storage({ "movohray-wordguess-achievements-v2": "existing awards" });
  var tab1 = DailyWord.createStore(saved), tab2 = DailyWord.createStore(saved);
  tab1.complete("uk", "2026-09-18");
  check("fresh read across tabs", !tab2.complete("uk", "2026-09-18") && tab2.status("uk", "2026-09-18").totalCompleted === 1);
  check("reload persistence", DailyWord.createStore(saved).status("uk", "2026-09-18").completed);
  check("existing achievements untouched", saved.data["movohray-wordguess-achievements-v2"] === "existing awards");
  for (var i = 0; i < 100; i++) {
    var date = DailyWord.localDate(new Date(2027, 0, i + 1, 12));
    tab1.begin("uk", date); tab1.complete("uk", date);
  }
  check("history bounded", Object.keys(JSON.parse(saved.data[DailyWord.storageKey]).languages.uk.days).length === 62);
  check("old pruned date cannot award again", !tab1.complete("uk", "2026-09-18"));
  check("aggregates survive pruning", tab1.milestones().total === 101 && tab1.milestones().best === 100);
  return passed;
}
