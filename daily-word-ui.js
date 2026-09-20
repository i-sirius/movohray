/* Thin adapter to the existing Word Guess board, results, locale and awards. */
var dailyWordSession = null;
var dailyWordPoolPromise = null;
var dailyWordStartPending = false;
var wordGuessSetupMode = "normal";
var dailyWordStore = DailyWord.createStore({
  getItem: function (key) { return window.localStorage.getItem(key); },
  setItem: function (key, value) { window.localStorage.setItem(key, value); }
});

function loadDailyWordPool() {
  if (!dailyWordPoolPromise) {
    dailyWordPoolPromise = fetch(getRevisionedAssetUrl("daily-words.json")).then(function (response) {
      if (!response.ok) throw new Error("Daily pool HTTP " + response.status);
      return response.json();
    }).catch(function (error) {
      dailyWordPoolPromise = null;
      throw error;
    });
  }
  return dailyWordPoolPromise;
}

function dailyWordDateLabel(date) {
  var parts = date.split("-").map(Number);
  return new Date(parts[0], parts[1] - 1, parts[2], 12).toLocaleDateString(getWordGuessLocale(), { day: "numeric", month: "long" });
}

function dailyWordStatsText(status) {
  return "🔥 " + formatWordGuessText("dailyStreak", status.currentStreak) + " · "
    + formatWordGuessText("dailyBest", status.bestStreak) + " · "
    + formatWordGuessText("dailyTotal", status.totalCompleted);
}

function renderDailyWordUi() {
  var today = DailyWord.localDate();
  var status = dailyWordStore.status(selectedWordGuessLanguage, today);
  var isDaily = wordGuessSetupMode === "daily";
  document.querySelectorAll("[data-word-guess-daily-status]").forEach(function (node) {
    node.textContent = getDailyWordCardStatus(status);
  });
  document.getElementById("wordGuessSetupTabs").setAttribute("aria-label", getWordGuessText("wordGuessModesAria"));
  ["normal", "daily"].forEach(function (mode) {
    var tab = document.getElementById(mode === "normal" ? "wordGuessNormalTab" : "wordGuessDailyTab");
    var selected = wordGuessSetupMode === mode;
    tab.textContent = getWordGuessText(mode === "normal" ? "wordGuessNormalTab" : "dailyTitle");
    tab.setAttribute("aria-selected", selected ? "true" : "false");
    tab.tabIndex = selected ? 0 : -1;
  });
  document.getElementById("wordGuessNormalPanel").hidden = isDaily;
  document.getElementById("wordGuessDailyPanel").hidden = !isDaily;
  wordGuessStartBtn.hidden = isDaily;
  document.getElementById("dailyWordTitle").textContent = getWordGuessText("dailyTitle");
  var date = document.getElementById("dailyWordSetupDate");
  date.textContent = dailyWordDateLabel(today);
  date.setAttribute("datetime", today);
  document.getElementById("dailyWordStatus").textContent = getWordGuessText(status.completed ? "dailyCompleted" : "dailySubtitle");
  var start = document.getElementById("dailyWordStartBtn");
  start.hidden = !isDaily;
  start.textContent = getWordGuessText(status.completed ? "wordGuessNormalGame" : "start");
  start.disabled = dailyWordStartPending;
  start.setAttribute("aria-busy", dailyWordStartPending ? "true" : "false");
  var streak = document.getElementById("dailyWordStreak");
  streak.textContent = status.currentStreak ? "🔥 " + formatWordGuessText("dailyStreak", status.currentStreak) : "";
  streak.hidden = !status.currentStreak;
  document.getElementById("dailyWordCollectionStats").textContent = getWordGuessText("dailyTitle") + " · "
    + getWordGuessLanguageProfile().shortLabel + " — " + dailyWordStatsText(status);
  var context = document.getElementById("dailyWordContext");
  context.hidden = !dailyWordSession;
  var dailyContext = dailyWordSession ? getWordGuessText("dailyTitle") + " · " + dailyWordDateLabel(dailyWordSession.date) : "";
  context.textContent = dailyContext;
  if (dailyWordSession) context.setAttribute("datetime", dailyWordSession.date);
  else context.removeAttribute("datetime");
  wordGuessGameTitle.textContent = getWordGuessText("title");
  wordGuessResultAppTitle.textContent = getWordGuessText("title");
  var resultContext = document.getElementById("dailyWordResultContext");
  resultContext.hidden = !dailyWordSession;
  resultContext.textContent = dailyContext;
  var won = wordGuessResult.classList.contains("is-won");
  wordGuessNewBtn.textContent = getWordGuessText(dailyWordSession ? (won ? "wordGuessNormalGame" : "dailyRetry") : "newGame");
  if (!dailyWordSession) document.getElementById("dailyWordResultStats").hidden = true;
  wordGuessLanguageButtons.forEach(function (button) {
    button.disabled = Boolean(dailyWordStartPending || (dailyWordSession && getCurrentAppScreenName() === "wordGuessGame"));
  });
}

function getDailyWordCardStatus(status) {
  var progress = status || dailyWordStore.status(selectedWordGuessLanguage, DailyWord.localDate());
  return getWordGuessText(progress.completed ? "dailyCardCompleted" : "dailyCardNew");
}

function selectWordGuessSetupMode(mode) {
  if (getCurrentAppScreenName() !== "wordGuessSettings" || document.body.classList.contains("required-update-open")) return;
  cancelPendingWordGuessStart();
  closeWordGuessStartPickers();
  wordGuessSetupMode = mode === "daily" ? "daily" : "normal";
  wordGuessSettingsMessage.textContent = "";
  renderDailyWordUi();
}

function returnToNormalWordGuessSetup() {
  navigateAfterAppBack("wordGuessSettings", "replace");
  selectWordGuessSetupMode("normal");
  renderWordGuessModeSelector();
  document.getElementById("wordGuessNormalTab").focus();
}

function startDailyWordGame() {
  if (document.body.classList.contains("required-update-open") || getCurrentAppScreenName() !== "wordGuessSettings" || wordGuessSetupMode !== "daily") return;
  if (dailyWordStore.status(selectedWordGuessLanguage, DailyWord.localDate()).completed) {
    selectWordGuessSetupMode("normal");
    document.getElementById("wordGuessNormalTab").focus();
    return;
  }
  return startWordGuessGame({ daily: true });
}

function evaluateDailyWordAchievements() {
  var milestones = dailyWordStore.milestones();
  unlockAchievementConditions([
    [milestones.total >= 1, "daily-word-first"],
    [milestones.best >= 3, "daily-word-streak-3"],
    [milestones.best >= 7, "daily-word-streak-7"],
    [milestones.best >= 30, "daily-word-streak-30"],
    [milestones.total >= 50, "daily-word-total-50"]
  ]);
}

function recordDailyWordResult(isWon) {
  if (!dailyWordSession) return;
  if (isWon && wordGuessGuesses.some(function (guess) {
    return normalizeWordGuessComparisonWord(guess.word) === normalizeWordGuessComparisonWord(dailyWordSession.word);
  })) {
    dailyWordStore.complete(dailyWordSession.language, dailyWordSession.date);
    evaluateDailyWordAchievements();
  }
}

function renderDailyWordResult(isWon) {
  var stats = document.getElementById("dailyWordResultStats");
  stats.hidden = !dailyWordSession;
  if (!dailyWordSession) return;
  var status = dailyWordStore.status(dailyWordSession.language, dailyWordSession.date);
  wordGuessResultTitle.textContent = getWordGuessText(isWon ? "dailySuccess" : "attemptsOver");
  stats.textContent = isWon ? dailyWordStatsText(status) : getWordGuessText("dailyRetryCopy");
  renderDailyWordUi();
}

function initializeDailyWord() {
  document.getElementById("dailyWordStartBtn").addEventListener("click", startDailyWordGame);
  var tabs = [document.getElementById("wordGuessNormalTab"), document.getElementById("wordGuessDailyTab")];
  tabs.forEach(function (tab, index) {
    tab.addEventListener("click", function () { selectWordGuessSetupMode(index === 0 ? "normal" : "daily"); });
    tab.addEventListener("keydown", function (event) {
      var next;
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") next = 1 - index;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = 1;
      else return;
      event.preventDefault();
      selectWordGuessSetupMode(next === 0 ? "normal" : "daily");
      tabs[next].focus();
    });
  });
  function refresh() {
    if (!document.hidden) renderDailyWordUi();
  }
  window.addEventListener("focus", refresh);
  document.addEventListener("visibilitychange", refresh);
  window.addEventListener("storage", function (event) {
    if (event.key === DailyWord.storageKey || event.key === null) refresh();
  });
  // Refresh both the informational menu badge and the setup panel across midnight.
  window.setInterval(refresh, 30000);
  evaluateDailyWordAchievements();
  renderDailyWordUi();
}
