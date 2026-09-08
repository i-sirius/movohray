/* UI adapter for the independent SlovesnyiEngine. */
var Slovesnyi = (function () {
  "use strict";
  var E = SlovesnyiEngine;
  var locales = {
    uk: {
      title: "Словесний", description: "Батл аргументів", setup: "Нова гра", players: "Гравці", player: "Гравець",
      target: "Скільки перемог потрібно?", preparation: "Підготовка", speech: "Основний виступ", rebuttal: "Заперечення",
      levels: "Рівні тем", easy: "Легкі", normal: "Звичайні", crazy: "Божевільні", off: "Вимкнено", seconds: "с",
      start: "Почати гру", home: "У головне меню", back: "Назад", language: "Мова тем і гри", intro: "Новий батл",
      rules: "Для 2–8 гравців. Гра обирає пару: один за, інший проти. Послухайте обох і виберіть переможця. Перемога — 1 бал, нічия — без балів.",
      positions: "Позиції випали навмання — відстоюйте свої.", pro: "ЗА", con: "ПРОТИ",
      ready: "До підготовки", early: "Почати раніше", endSpeech: "Завершити виступ", endRebuttal: "Завершити заперечення",
      rebuttalHint: "Відповідай супернику", voting: "Хто був переконливішим?", draw: "Нічия", result: "Результат батлу",
      point: "+1 перемога", drawResult: "Нічия — без балів", next: "Наступний батл", final: "Підсумки гри", winner: "Переможець",
      wins: "Перемоги", battles: "Батли", newGame: "Нова гра", loading: "Завантажуємо теми…", error: "Не вдалося завантажити теми. Спробуйте ще раз.",
      retry: "Спробувати ще раз", invalid: "Введіть різні імена та оберіть хоча б один рівень тем.", pause: "Пауза", resume: "Продовжити",
      paused: "На паузі", round: "Батл", leaderboard: "Таблиця результатів", exit: "Завершити цю партію?", exitCopy: "Результати цієї гри не збережуться.",
      stay: "Залишитися", leave: "Завершити партію", battleStatus: "Батл {round} · До {target} перемог"
    },
    ru: {
      title: "Словесный", description: "Батл аргументов", setup: "Новая игра", players: "Игроки", player: "Игрок",
      target: "Сколько побед нужно?", preparation: "Подготовка", speech: "Основное выступление", rebuttal: "Возражение",
      levels: "Уровни тем", easy: "Лёгкие", normal: "Обычные", crazy: "Безумные", off: "Выключено", seconds: "с",
      start: "Начать игру", home: "В главное меню", back: "Назад", language: "Язык тем и игры", intro: "Новый батл",
      rules: "Играйте в компании от 2 до 8 человек. Игра выберет пару: один за, другой против. Выслушайте обоих и выберите победителя. За победу — 1 балл, за ничью — ничего.",
      positions: "Стороны выпали случайно — отстаивайте свои.", pro: "ЗА", con: "ПРОТИВ",
      ready: "К подготовке", early: "Начать раньше", endSpeech: "Завершить выступление", endRebuttal: "Завершить возражение",
      rebuttalHint: "Ответь сопернику", voting: "Кто был убедительнее?", draw: "Ничья", result: "Результат батла",
      point: "+1 победа", drawResult: "Ничья — без баллов", next: "Следующий батл", final: "Итоги игры", winner: "Победитель",
      wins: "Победы", battles: "Батлы", newGame: "Новая игра", loading: "Загружаем темы…", error: "Не удалось загрузить темы. Попробуйте ещё раз.",
      retry: "Попробовать ещё раз", invalid: "Введите разные имена и выберите хотя бы один уровень тем.", pause: "Пауза", resume: "Продолжить",
      paused: "На паузе", round: "Батл", leaderboard: "Таблица результатов", exit: "Завершить эту партию?", exitCopy: "Результаты этой игры не сохранятся.",
      stay: "Остаться", leave: "Завершить партию", battleStatus: "Батл {round} · До {target} побед"
    },
    en: {
      title: "Word Duel", description: "A battle of arguments", setup: "New game", players: "Players", player: "Player",
      target: "Wins needed", preparation: "Preparation", speech: "Main speech", rebuttal: "Rebuttal",
      levels: "Topic levels", easy: "Easy", normal: "Normal", crazy: "Crazy", off: "Off", seconds: "s",
      start: "Start game", home: "Main menu", back: "Back", language: "Topic and game language", intro: "New duel",
      rules: "For 2–8 players. The game picks a pair and gives them opposite sides. Hear them out, then pick a winner. A win scores 1 point; a draw scores none.",
      positions: "Your sides are random. Make the case for yours.", pro: "FOR", con: "AGAINST",
      ready: "Prepare", early: "Start early", endSpeech: "Finish speech", endRebuttal: "Finish rebuttal",
      rebuttalHint: "Answer your opponent", voting: "Who was more convincing?", draw: "Draw", result: "Duel result",
      point: "+1 win", drawResult: "Draw — no points", next: "Next duel", final: "Game results", winner: "Winner",
      wins: "Wins", battles: "Duels", newGame: "New game", loading: "Loading topics…", error: "Could not load topics. Please try again.",
      retry: "Try again", invalid: "Enter different names and select at least one topic level.", pause: "Pause", resume: "Resume",
      paused: "Paused", round: "Duel", leaderboard: "Leaderboard", exit: "End this game?", exitCopy: "You’ll lose this game’s scores.",
      stay: "Stay", leave: "End game", battleStatus: "Duel {round} · First to {target}"
    }
  };
  var state = null, topics = null, interval = null, lastSecond = -1, manualPause = false;
  var language = null, draft = null, pendingExit = null, loadToken = 0;
  var exposure = {}, historyKey = "movohray-debates-exposure-v1";
  function lang() { return language || selectedWordGuessLanguage || "uk"; }
  function text(key, locale) { return (locales[locale || lang()] || locales.uk)[key] || locales.uk[key]; }
  function el(tag, className, value, parent) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (value !== undefined) node.textContent = value;
    if (parent) parent.appendChild(node);
    return node;
  }
  function button(parent, value, action, secondary, id) {
    var node = el("button", secondary ? "secondary-btn" : "primary-btn", value, parent);
    node.type = "button"; if (id) node.id = id;
    node.addEventListener("click", action); return node;
  }
  function emit(type) {
    // Achievement/statistics adapters can consume these without changing the engine.
    document.dispatchEvent(new CustomEvent("movohray:slovesnyi", { detail: { type: type, state: E.snapshot(state) } }));
  }
  function readExposure() {
    try {
      var saved = JSON.parse(localStorage.getItem(historyKey) || "{}");
      var valid = {};
      topics.forEach(function (topic) {
        var h = saved[topic.id];
        if (h && Number.isFinite(h.count) && h.count >= 0 && Number.isFinite(h.lastShown) && h.lastShown >= 0) {
          valid[topic.id] = { count: Math.floor(h.count), lastShown: h.lastShown };
        }
      });
      exposure = valid;
    } catch (error) { exposure = {}; }
  }
  function saveExposure() {
    exposure = E.snapshot(state.topicHistory);
    try { localStorage.setItem(historyKey, JSON.stringify(exposure)); } catch (error) { /* In-memory fallback. */ }
  }
  function content(screenName) {
    var root = document.getElementById(screenName + "Screen");
    root.textContent = "";
    var card = el("div", "card bubble-card slovesnyi-card", undefined, root);
    return el("div", "card-inner", undefined, card);
  }
  function heading(parent, eyebrow, title) {
    el("p", "slovesnyi-eyebrow", eyebrow, parent);
    var h = el("h1", "slovesnyi-heading", title, parent);
    h.tabIndex = -1; return h;
  }
  function focusHeading(parent) {
    var h = parent.querySelector("h1");
    if (h) h.focus({ preventScroll: true });
  }
  function open() {
    stop(); language = null; state = null;
    if (!draft) draft = { names: ["", "", "", ""], settings: E.snapshot(E.defaults) };
    showScreen("slovesnyiSetup"); renderSetup();
  }
  function load() {
    var token = ++loadToken;
    var box = content("slovesnyiSetup");
    heading(box, text("title"), text("loading"));
    button(box, text("home"), function () { showScreen("menu"); }, true);
    return fetch(getRevisionedAssetUrl("debates.json")).then(function (response) {
      if (!response.ok) throw new Error("Topic request failed");
      return response.json();
    }).then(function (data) {
      var ids = {};
      if (data.schemaVersion !== 1 || !Array.isArray(data.topics) || !data.topics.length) throw new Error("Invalid topic data");
      data.topics.forEach(function (topic) {
        if (!topic.id || ids[topic.id] || E.defaults.levels.indexOf(topic.level) < 0 || !topic.category ||
            !topic.text || !topic.text.ua || !topic.text.ru || !topic.text.en) throw new Error("Invalid topic");
        ids[topic.id] = true;
      });
      topics = data.topics; readExposure();
      if (token === loadToken && getCurrentAppScreenName() === "slovesnyiSetup") renderSetup();
    }).catch(function () {
      if (token !== loadToken || getCurrentAppScreenName() !== "slovesnyiSetup") return;
      var errorBox = content("slovesnyiSetup");
      heading(errorBox, text("title"), text("error"));
      button(errorBox, text("retry"), load, false, "slovesnyiRetry");
      button(errorBox, text("home"), function () { showScreen("menu"); }, true);
    });
  }
  function select(parent, key, values, selected, onChange, labels) {
    var label = el("label", "slovesnyi-field", undefined, parent);
    el("span", "", text(key), label);
    var input = el("select", "", undefined, label); input.id = "slovesnyi-" + key;
    values.forEach(function (value, i) {
      var option = el("option", "", labels ? labels[i] : String(value), input);
      option.value = value;
    });
    input.value = selected;
    input.addEventListener("change", function () { onChange(input.value); });
    return input;
  }
  function renderSetup() {
    if (!topics) { load(); return; }
    var box = content("slovesnyiSetup");
    button(box, "← " + text("home"), function () { requestAppBack({ destination: "menu" }); }, true);
    heading(box, text("description"), text("title"));
    el("p", "slovesnyi-copy", text("rules"), box);
    var form = el("form", "slovesnyi-form", undefined, box);
    form.addEventListener("submit", function (event) { event.preventDefault(); start(); });
    select(form, "language", ["uk", "ru", "en"], lang(), function (value) { language = value; renderSetup(); }, ["Українська", "Русский", "English"]);
    select(form, "players", [2, 3, 4, 5, 6, 7, 8], draft.names.length, function (value) {
      var n = Number(value);
      while (draft.names.length < n) draft.names.push("");
      draft.names = draft.names.slice(0, n); renderSetup();
    });
    var names = el("div", "slovesnyi-names", undefined, form);
    draft.names.forEach(function (name, i) {
      var label = el("label", "slovesnyi-field", undefined, names);
      el("span", "", text("player") + " " + (i + 1), label);
      var input = el("input", "", undefined, label);
      input.id = "slovesnyi-player-" + i; input.value = name; input.maxLength = 32;
      input.placeholder = text("player") + " " + (i + 1); input.autocomplete = "off";
      input.addEventListener("input", function () { draft.names[i] = input.value; });
    });
    var choices = el("div", "slovesnyi-options", undefined, form);
    [["target", [3, 5, 7]], ["preparation", [10, 20, 30]], ["speech", [30, 40, 60]], ["rebuttal", [0, 10, 15, 20]]].forEach(function (item) {
      select(choices, item[0], item[1], draft.settings[item[0]], function (value) { draft.settings[item[0]] = Number(value); },
        item[1].map(function (value) { return value === 0 ? text("off") : String(value) + (item[0] === "target" ? "" : " " + text("seconds")); }));
    });
    var levels = el("fieldset", "slovesnyi-levels", undefined, form);
    el("legend", "", text("levels"), levels);
    E.defaults.levels.forEach(function (level) {
      var label = el("label", "slovesnyi-level", undefined, levels);
      var checkbox = el("input", "", undefined, label); checkbox.type = "checkbox"; checkbox.value = level;
      checkbox.checked = draft.settings.levels.indexOf(level) >= 0;
      checkbox.addEventListener("change", function () {
        draft.settings.levels = Array.from(levels.querySelectorAll("input:checked")).map(function (input) { return input.value; });
      });
      el("span", "", text(level), label);
    });
    var message = el("p", "message", "", form); message.id = "slovesnyiSetupMessage"; message.setAttribute("role", "alert");
    var submit = el("button", "primary-btn", text("start"), form); submit.type = "submit"; submit.id = "slovesnyiStart";
  }
  function start() {
    var names = draft.names.map(function (name, i) { return name.trim() || text("player") + " " + (i + 1); });
    var unique = names.map(function (name) { return name.toLocaleLowerCase(); });
    if (!draft.settings.levels.length || unique.some(function (name, i) { return unique.indexOf(name) !== i; })) {
      document.getElementById("slovesnyiSetupMessage").textContent = text("invalid"); return;
    }
    language = lang();
    state = E.create(names, draft.settings, exposure, Date.now());
    state.settings.language = language;
    manualPause = false; next();
  }
  function next() {
    if (!E.nextMatch(state, topics, Date.now())) return;
    saveExposure(); emit("match-start"); playGameSound("roundStart");
    showScreen("slovesnyiGame"); renderGame();
    clearInterval(interval); interval = setInterval(tick, 100);
  }
  function player(id) { return state.players.filter(function (p) { return p.id === id; })[0]; }
  function advance() {
    if (E.advance(state, Date.now())) { playGameSound("turnChange"); renderGame(); emit("phase-change"); }
  }
  function tick() {
    if (!state || getCurrentAppScreenName() !== "slovesnyiGame") return;
    syncPause();
    var timer = document.getElementById("slovesnyiTimer");
    if (!timer) return;
    var remaining = Math.ceil(E.remaining(state, Date.now()) / 1000);
    timer.textContent = String(remaining);
    if (state.pausedAt !== null) return;
    if (remaining !== lastSecond && remaining > 0 && remaining <= 3) playGameSound("countdown");
    lastSecond = remaining;
    if (remaining <= 0) advance();
  }
  function syncPause() {
    if (!state) return;
    var paused = manualPause || document.hidden || Boolean(pendingExit) || hasOpenAppOverlay() || document.body.classList.contains("required-update-open");
    E.pause(state, paused, Date.now());
    var toggle = document.getElementById("slovesnyiPause");
    if (toggle) { toggle.textContent = text(manualPause ? "resume" : "pause"); toggle.setAttribute("aria-pressed", String(manualPause)); }
    var status = document.getElementById("slovesnyiPauseStatus");
    if (status) status.textContent = paused ? text("paused") : "";
    var action = document.getElementById("slovesnyiAdvance");
    if (action) action.disabled = paused;
  }
  function renderGame() {
    var box = content("slovesnyiGame");
    var phase = state.phase;
    var header = el("div", "slovesnyi-toolbar", undefined, box);
    button(header, "← " + text("back"), function () { requestAppBack({}); }, true);
    el("span", "slovesnyi-eyebrow", text("battleStatus").replace("{round}", state.roundIndex).replace("{target}", state.settings.target), header);
    var title = phase === "intro" ? text("intro") : phase === "preparation" ? text("preparation") :
      phase.indexOf("speech") === 0 ? text("speech") : phase.indexOf("rebuttal") === 0 ? text("rebuttal") : text(phase);
    var speakerIndex = /[AB]$/.test(phase) ? (phase.slice(-1) === "A" ? 0 : 1) : -1;
    heading(box, text("title") + (speakerIndex >= 0 ? " · " + title : ""),
      speakerIndex >= 0 ? player(state.currentMatch.playerIds[speakerIndex]).name : title);
    if (phase === "intro") box.classList.add("slovesnyi-intro");
    var topic = el("p", "slovesnyi-topic", state.currentTopic.text[lang() === "uk" ? "ua" : lang()], box);
    topic.id = "slovesnyiTopic";
    var pair = el("div", "slovesnyi-pair", undefined, box);
    state.currentMatch.playerIds.forEach(function (id, i) {
      var active = phase === "speech" + (i === 0 ? "A" : "B") || phase === "rebuttal" + (i === 0 ? "A" : "B");
      var tile = el("div", "slovesnyi-side slovesnyi-" + state.positions[id] + (active ? " is-speaking" : ""), undefined, pair);
      el("strong", "slovesnyi-name", player(id).name, tile);
      el("span", "slovesnyi-position", text(state.positions[id]), tile);
      if (active) tile.setAttribute("aria-current", "true");
      if (i === 0) el("span", "slovesnyi-vs", "VS", pair);
    });
    if (phase === "intro") {
      if (state.roundIndex === 1) el("p", "slovesnyi-copy", text("positions"), box);
      button(box, text("ready"), advance, false, "slovesnyiAdvance");
    } else if (E.duration(state)) {
      if (phase.indexOf("rebuttal") === 0) el("p", "slovesnyi-copy", text("rebuttalHint"), box);
      var timer = el("div", "slovesnyi-timer", String(Math.ceil(E.remaining(state, Date.now()) / 1000)), box);
      timer.id = "slovesnyiTimer"; timer.setAttribute("role", "timer"); timer.setAttribute("aria-label", title + " · " + text("seconds"));
      var status = el("p", "slovesnyi-pause-status", "", box); status.id = "slovesnyiPauseStatus"; status.setAttribute("role", "status");
      var actions = el("div", "slovesnyi-actions", undefined, box);
      button(actions, text(phase === "preparation" ? "early" : phase.indexOf("speech") === 0 ? "endSpeech" : "endRebuttal"), advance, false, "slovesnyiAdvance");
      button(actions, text("pause"), function () { manualPause = !manualPause; syncPause(); }, true, "slovesnyiPause");
    } else if (phase === "voting") {
      var votes = el("div", "slovesnyi-actions", undefined, box);
      state.currentMatch.playerIds.forEach(function (id, i) {
        button(votes, player(id).name, function () { vote(id); }, false, "slovesnyiVote" + (i === 0 ? "A" : "B"));
      });
      button(box, text("draw"), function () { vote(null); }, true, "slovesnyiDraw");
    } else if (phase === "result") {
      var feedback = el("p", "slovesnyi-result" + (state.currentMatch.winnerId ? " slovesnyi-result-winner" : ""), undefined, box);
      if (state.currentMatch.winnerId) el("span", "slovesnyi-result-star", "★", feedback).setAttribute("aria-hidden", "true");
      el("span", "", state.currentMatch.winnerId ? player(state.currentMatch.winnerId).name + " · " + text("point") : text("drawResult"), feedback);
      leaderboard(box);
      button(box, text(state.winnerId ? "final" : "next"), function () {
        if (state.winnerId) { E.finish(state, Date.now()); renderFinal(); } else next();
      }, false, "slovesnyiNext");
    }
    lastSecond = -1; syncPause(); focusHeading(box);
  }
  function vote(id) {
    if (!E.vote(state, id, Date.now())) return;
    playGameSound(id ? "correct" : "tie"); emit("match-result");
    if (state.winnerId) emit("game-complete");
    renderGame();
  }
  function leaderboard(box) {
    el("h2", "slovesnyi-board-title", text("leaderboard"), box);
    var list = el("ol", "slovesnyi-board", undefined, box);
    state.players.slice().sort(function (a, b) { return b.wins - a.wins; }).forEach(function (p) {
      var row = el("li", "", undefined, list);
      el("strong", "", p.name, row);
      el("span", "", text("wins") + ": " + p.wins, row);
      el("small", "", text("battles") + ": " + p.battles + " · " + text("pro") + ": " + p.pro + " · " + text("con") + ": " + p.con, row);
    });
  }
  function renderFinal() {
    clearInterval(interval); interval = null;
    var box = content("slovesnyiFinal");
    heading(box, text("winner"), player(state.winnerId).name);
    el("p", "slovesnyi-result", text("wins") + ": " + player(state.winnerId).wins, box);
    leaderboard(box);
    button(box, text("newGame"), function () { state = null; showScreen("slovesnyiSetup"); renderSetup(); }, false, "slovesnyiNewGame");
    button(box, text("home"), function () { showScreen("menu"); }, true, "slovesnyiHome");
    showScreen("slovesnyiFinal"); playGameCompleteSound("win"); focusHeading(box);
  }
  function dismissExit() {
    var dialog = document.getElementById("slovesnyiExit");
    if (dialog) dialog.remove(); pendingExit = null; syncPause();
  }
  function back(options) {
    if (pendingExit) { var fromPop = pendingExit.fromPop; dismissExit(); if (fromPop) restoreCurrentHistoryEntry(); return true; }
    var screen = getCurrentAppScreenName();
    if (screen === "slovesnyiSetup" || screen === "slovesnyiFinal") { showScreen("menu", { historyMode: "replace" }); return true; }
    if (screen !== "slovesnyiGame") return false;
    pendingExit = { fromPop: options.source === "popstate", destination: options.destination === "menu" ? "menu" : "slovesnyiSetup" };
    syncPause();
    var overlay = el("div", "slovesnyi-exit", undefined, document.body); overlay.id = "slovesnyiExit";
    var card = el("div", "card slovesnyi-card", undefined, overlay);
    card.setAttribute("role", "dialog"); card.setAttribute("aria-modal", "true"); card.setAttribute("aria-labelledby", "slovesnyiExitTitle");
    var title = el("h2", "", text("exit"), card); title.id = "slovesnyiExitTitle";
    el("p", "slovesnyi-copy", text("exitCopy"), card);
    var stay = button(card, text("stay"), function () { var fromPop = pendingExit.fromPop; dismissExit(); if (fromPop) restoreCurrentHistoryEntry(); }, false, "slovesnyiStay");
    var leave = button(card, text("leave"), function () {
      var destination = pendingExit.destination;
      dismissExit(); stop(); state = null; showScreen(destination, { historyMode: "replace" });
      if (destination === "slovesnyiSetup") renderSetup();
    }, true, "slovesnyiLeave");
    overlay.addEventListener("keydown", function (event) {
      if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); stay.click(); }
      if (event.key === "Tab") {
        event.preventDefault(); (document.activeElement === stay ? leave : stay).focus();
      }
    });
    stay.focus(); return true;
  }
  function stop() { clearInterval(interval); interval = null; manualPause = false; loadToken++; dismissExit(); }
  function onScreen(screen) {
    if (screen !== "slovesnyiGame") stop();
  }
  document.addEventListener("visibilitychange", syncPause);
  return { text: text, locales: locales, open: open, back: back, onScreen: onScreen,
    snapshot: function () { return state ? E.snapshot(state) : null; } };
}());
