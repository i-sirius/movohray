/* Thin adapter to the existing Word Guess board, results, locale and awards. */
var dailyWordSession = null;
var dailyWordPoolPromise = null;
var dailyWordStartPending = false;
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
  var status = dailyWordStore.status(selectedWordGuessLanguage, DailyWord.localDate());
  document.getElementById("dailyWordTitle").textContent = getWordGuessText("dailyTitle");
  document.getElementById("dailyWordSubtitle").textContent = getWordGuessText("dailySubtitle");
  var start = document.getElementById("dailyWordStartBtn");
  start.textContent = getWordGuessText(status.completed ? "dailyCompleted" : "dailyStart");
  start.disabled = status.completed || dailyWordStartPending;
  start.setAttribute("aria-busy", dailyWordStartPending ? "true" : "false");
  var streak = document.getElementById("dailyWordStreak");
  streak.textContent = status.currentStreak ? "🔥 " + formatWordGuessText("dailyStreak", status.currentStreak) : "";
  streak.hidden = !status.currentStreak;
  document.getElementById("dailyWordLanguage").textContent = getWordGuessLanguageProfile().shortLabel;
  document.getElementById("dailyWordCollectionStats").textContent = getWordGuessText("dailyTitle") + " · "
    + getWordGuessLanguageProfile().shortLabel + " — " + dailyWordStatsText(status);
  var context = document.getElementById("dailyWordContext");
  context.hidden = !dailyWordSession;
  context.textContent = dailyWordSession ? dailyWordDateLabel(dailyWordSession.date) : "";
  if (dailyWordSession) context.setAttribute("datetime", dailyWordSession.date);
  else context.removeAttribute("datetime");
  wordGuessGameTitle.textContent = getWordGuessText(dailyWordSession ? "dailyTitle" : "title");
  wordGuessResultAppTitle.textContent = dailyWordSession
    ? getWordGuessText("dailyTitle") + " · " + dailyWordDateLabel(dailyWordSession.date)
    : getWordGuessText("title");
  var won = wordGuessResult.classList.contains("is-won");
  wordGuessNewBtn.textContent = getWordGuessText(dailyWordSession ? (won ? "dailyPlayMore" : "dailyRetry") : "newGame");
  if (!dailyWordSession) document.getElementById("dailyWordResultStats").hidden = true;
  wordGuessLanguageButtons.forEach(function (button) {
    button.disabled = Boolean(dailyWordStartPending || (dailyWordSession && getCurrentAppScreenName() === "wordGuessGame"));
  });
}

function startDailyWordGame() {
  if (document.body.classList.contains("required-update-open")) return;
  modeSelectionRequestId += 1;
  selectedMode = "wordguess";
  resetActiveGameState();
  clearWhoAmITimer();
  document.body.dataset.mode = "wordguess";
  document.body.classList.remove("single-card-mode");
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
  function refresh() {
    if (!document.hidden) renderDailyWordUi();
  }
  window.addEventListener("focus", refresh);
  document.addEventListener("visibilitychange", refresh);
  window.addEventListener("storage", function (event) {
    if (event.key === DailyWord.storageKey || event.key === null) refresh();
  });
  // A menu left open across midnight must become playable without a reload.
  window.setInterval(refresh, 30000);
  evaluateDailyWordAchievements();
  renderDailyWordUi();
}
