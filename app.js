let categories = [];
let selectedCategory = null;
let selectedCategories = [];
let selectedDifficulties = ["easy", "medium", "hard"];
let excludePhrases = false;
let areCategoriesExpanded = false;
let selectedCharadesFormat = "single";
let selectedCharadesKind = "noun";
let selectedDuration = 60;
let selectedTargetScore = 30;
let selectedMode = "explain";
const modeCategoryCache = {};
let selectedTeamCount = 2;
let teamScores = [];
let teamNames = [];
let currentTeamIndex = 0;
let roundResults = null;
let finalRoundActive = false;
let finalRoundTeamsPlayed = 0;

let deck = [];
let currentWord = "";
let score = 0;
let skipped = 0;
let timeLeft = 60;
let timerId = null;

let pointerStartY = 0;
let isSwipeLocked = false;
let dragOffsetY = 0;
let dragVelocityY = 0;
let activePointerId = null;
let wordActionTimeoutId = null;

const modeConfigs = [
  {
    id: "explain",
    title: "Поясни слово (Alias)",
    description: "Пояснюй слово, не називаючи його.",
    dataFile: "words.json",
    cardHint: "",
    defaultNoPhrases: false,
    available: true,
  },
  {
    id: "charades",
    title: "Покажи слово (Крокодил)",
    description: "Показуй завдання жестами. Говорити не можна.",
    dataFile: "crocodile.json",
    cardHint: "Показуй без слів",
    defaultNoPhrases: true,
    available: true,
  },
  {
    id: "whoami",
    title: "Хто я?",
    description: "Відгадувати персонажа за питаннями.",
    available: false,
  },
  {
    id: "battle",
    title: "Словесний батл",
    description: "Дискутувати й доводити свою думку.",
    available: false,
  },
];

const difficultyLevels = [
  {
    id: "easy",
    name: "Легко",
  },
  {
    id: "medium",
    name: "Середньо",
  },
  {
    id: "hard",
    name: "Складно",
  },
];

const menuScreen = document.getElementById("menuScreen");
const settingsScreen = document.getElementById("settingsScreen");
const gameScreen = document.getElementById("gameScreen");
const resultScreen = document.getElementById("resultScreen");
const winnerScreen = document.getElementById("winnerScreen");

const backToMenuBtn = document.getElementById("backToMenuBtn");
const startRoundButtons = document.querySelectorAll(".start-round-btn");

const modeList = document.getElementById("modeList");
const categoryList = document.getElementById("categoryList");
const teamNameFields = document.getElementById("teamNameFields");
const durationButtons = document.querySelectorAll(".duration-btn");
const targetButtons = document.querySelectorAll(".target-btn");
const difficultyButtons = document.querySelectorAll(".difficulty-btn");
const phraseFilterBtn = document.getElementById("phraseFilterBtn");
const charadesFormatSection = document.getElementById("charadesFormatSection");
const charadesKindSection = document.getElementById("charadesKindSection");
const charadesFormatButtons = document.querySelectorAll(".charades-format-btn");
const charadesKindButtons = document.querySelectorAll(".charades-kind-btn");
const teamCountButtons = document.querySelectorAll(".team-count-btn");
const settingsMessage = document.getElementById("settingsMessage");

const settingsModeTitle = document.getElementById("settingsModeTitle");
const settingsModeDescription = document.getElementById("settingsModeDescription");
const gameModeTitle = document.getElementById("gameModeTitle");
const gameTeamName = document.getElementById("gameTeamName");
const gameCategoryName = document.getElementById("gameCategoryName");
const timerText = document.getElementById("timerText");
const scoreText = document.getElementById("scoreText");
const skippedText = document.getElementById("skippedText");
const teamProgressText = document.getElementById("teamProgressText");
const teamProgressFill = document.getElementById("teamProgressFill");
const roundProgressText = document.getElementById("roundProgressText");
const roundProgressFill = document.getElementById("roundProgressFill");
const wordText = document.getElementById("wordText");
const wordCard = document.getElementById("wordCard");
const wordCategoryBadge = document.getElementById("wordCategoryBadge");
const wordModeHint = document.getElementById("wordModeHint");
const swipeHint = document.getElementById("swipeHint");
const singleCardActions = document.getElementById("singleCardActions");
const singleNextBtn = document.getElementById("singleNextBtn");
const singleSettingsBtn = document.getElementById("singleSettingsBtn");
const singleMenuBtn = document.getElementById("singleMenuBtn");

const skipBtn = document.getElementById("skipBtn");
const correctBtn = document.getElementById("correctBtn");
const finishEarlyBtn = document.getElementById("finishEarlyBtn");

const finalScoreText = document.getElementById("finalScoreText");
const finalSkippedText = document.getElementById("finalSkippedText");
const resultPhrase = document.getElementById("resultPhrase");
const playAgainBtn = document.getElementById("playAgainBtn");
const nextTeamBtn = document.getElementById("nextTeamBtn");
const resultToMenuBtn = document.getElementById("resultToMenuBtn");
const winnerTitle = document.getElementById("winnerTitle");
const winnerSubtitle = document.getElementById("winnerSubtitle");
const winnerHero = document.getElementById("winnerHero");
const winnerTeamsList = document.getElementById("winnerTeamsList");
const winnerToMenuBtn = document.getElementById("winnerToMenuBtn");
const teamScoreBoard = document.getElementById("teamScoreBoard");
const resultTeamScoreBoard = document.getElementById("resultTeamScoreBoard");
const winnerScoreBoard = document.getElementById("winnerScoreBoard");

init();

async function init() {
  await loadModeCategories(selectedMode);
  renderCategories();
  syncTeamNamesForCount();
  renderTeamNameInputs();
  resetTeamScores();
  updateModeLabels();
  syncPhraseFilterButton();
  setupEvents();
}

async function loadModeCategories(modeId = selectedMode) {
  const mode = modeConfigs.find((item) => item.id === modeId) || modeConfigs[0];

  if (modeCategoryCache[mode.id]) {
    categories = modeCategoryCache[mode.id];
    return;
  }

  try {
    const response = await fetch(mode.dataFile);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const loadedCategories = await response.json();
    modeCategoryCache[mode.id] = loadedCategories;
    categories = loadedCategories;
  } catch (error) {
    console.error(`Не вдалося завантажити ${mode.dataFile}`, error);
    categories = [];
    settingsMessage.textContent = "Не вдалося завантажити словник режиму.";
  }
}

function setupEvents() {
  renderModes();

  backToMenuBtn.addEventListener("click", () => {
    showScreen("menu");
  });

  startRoundButtons.forEach((button) => {
    button.addEventListener("click", handleStartRound);
  });

  durationButtons.forEach((button) => {
    button.addEventListener("click", () => {
      durationButtons.forEach((btn) => btn.classList.remove("selected"));
      button.classList.add("selected");
      selectedDuration = Number(button.dataset.seconds);
      settingsMessage.textContent = "";
    });
  });

  targetButtons.forEach((button) => {
    button.addEventListener("click", () => {
      targetButtons.forEach((btn) => btn.classList.remove("selected"));
      button.classList.add("selected");
      selectedTargetScore = Number(button.dataset.target);
      settingsMessage.textContent = "";
    });
  });

  difficultyButtons.forEach((button) => {
    button.addEventListener("click", () => {
      button.classList.toggle("selected");
      selectedDifficulties = getSelectedDifficulties();
      renderCategories();
      settingsMessage.textContent = "";
    });
  });

  charadesFormatButtons.forEach((button) => {
    button.addEventListener("click", () => {
      charadesFormatButtons.forEach((btn) => btn.classList.remove("selected"));
      button.classList.add("selected");
      selectedCharadesFormat = button.dataset.format || "single";
      updateModeLabels();
      settingsMessage.textContent = "";
    });
  });

  charadesKindButtons.forEach((button) => {
    button.addEventListener("click", () => {
      charadesKindButtons.forEach((btn) => btn.classList.remove("selected"));
      button.classList.add("selected");
      selectedCharadesKind = button.dataset.kind || "noun";
      renderCategories();
      settingsMessage.textContent = "";
    });
  });

  if (phraseFilterBtn) {
    phraseFilterBtn.addEventListener("click", () => {
      excludePhrases = !excludePhrases;
      syncPhraseFilterButton();
      renderCategories();
      settingsMessage.textContent = "";
    });
  }

  teamCountButtons.forEach((button) => {
    button.addEventListener("click", () => {
      teamCountButtons.forEach((btn) => btn.classList.remove("selected"));
      button.classList.add("selected");
      selectedTeamCount = Number(button.dataset.count);
      syncTeamNamesForCount();
      renderTeamNameInputs();
      resetTeamScores();
      settingsMessage.textContent = "";
    });
  });

  correctBtn.addEventListener("click", () => {
    markCorrect();
  });

  skipBtn.addEventListener("click", () => {
    markSkipped();
  });

  wordCard.addEventListener("pointerdown", (event) => {
    if (isSwipeLocked) {
      return;
    }

    releaseWordCardPointer(activePointerId);
    activePointerId = event.pointerId;
    pointerStartY = event.clientY;
    dragOffsetY = 0;
    dragVelocityY = 0;
    wordCard.classList.remove("fly-up", "fly-down");
    wordCard.style.transition = "transform 0.16s ease";
    wordCard.style.transform = "";

    if (wordCard.setPointerCapture) {
      wordCard.setPointerCapture(event.pointerId);
    }
  });

  wordCard.addEventListener("pointermove", (event) => {
    if (isSwipeLocked || activePointerId !== event.pointerId) {
      return;
    }

    const deltaY = event.clientY - pointerStartY;
    dragVelocityY = deltaY - dragOffsetY;
    dragOffsetY = deltaY;

    if (event.buttons !== 1) {
      return;
    }

    const springFactor = 0.8;
    const easedOffset = dragOffsetY * springFactor;
    wordCard.style.transform = `translateY(${easedOffset}px)`;
  });

  wordCard.addEventListener("pointerup", (event) => {
    if (activePointerId !== event.pointerId) {
      return;
    }

    const dragDistance = pointerStartY - event.clientY;
    releaseWordCardPointer(event.pointerId);

    if (isSwipeLocked) {
      resetWordCardPosition();
      return;
    }

    const swipeHandled = handleSwipe(dragDistance);

    if (!swipeHandled) {
      wordCard.style.transition = "transform 0.16s ease";
      wordCard.style.transform = "";

      setTimeout(() => {
        wordCard.style.transition = "opacity 0.22s ease, background 0.22s ease, transform 0.22s ease";
      }, 160);
    }
  });

  wordCard.addEventListener("pointercancel", (event) => {
    if (activePointerId !== event.pointerId) {
      return;
    }

    releaseWordCardPointer(event.pointerId);
    resetWordCardPosition();
  });

  finishEarlyBtn.addEventListener("click", () => {
    finishRound();
  });

  if (singleNextBtn) {
    singleNextBtn.addEventListener("click", () => {
      showSingleNextCard();
    });
  }

  if (singleSettingsBtn) {
    singleSettingsBtn.addEventListener("click", () => {
      resetSwipeState();
      showScreen("settings");
    });
  }

  if (singleMenuBtn) {
    singleMenuBtn.addEventListener("click", () => {
      resetSwipeState();
      showScreen("menu");
    });
  }

  if (playAgainBtn) {
    playAgainBtn.addEventListener("click", () => {
      const highestScore = Math.max(...teamScores);
      const tiedTeams = teamScores.reduce((accumulator, scoreValue, index) => {
        if (scoreValue === highestScore) {
          accumulator.push(getTeamName(index));
        }
        return accumulator;
      }, []);

      if (tiedTeams.length > 1) {
        startExtraRound();
      } else {
        startNewGame();
      }
    });
  }

  nextTeamBtn.addEventListener("click", () => {
    startNextTeamRound();
  });

  resultToMenuBtn.addEventListener("click", () => {
    showScreen("menu");
  });

  if (winnerToMenuBtn) {
    winnerToMenuBtn.addEventListener("click", () => {
      showScreen("menu");
    });
  }
}

function renderModes() {
  modeList.innerHTML = "";

  modeConfigs.forEach((mode) => {
    const button = document.createElement("button");
    button.className = `mode-card mode-card-${mode.id}`;
    if (!mode.available) {
      button.classList.add("disabled");
    }

    button.innerHTML = `
      <strong>${mode.title}</strong>
      <span>${mode.available ? mode.description : "Скоро"}</span>
    `;

    button.addEventListener("click", async () => {
      if (!mode.available) {
        settingsMessage.textContent = "Цей режим скоро з’явиться";
        return;
      }

      selectedMode = mode.id;
      selectedCategories = [];
      selectedCategory = null;
      areCategoriesExpanded = false;
      excludePhrases = Boolean(mode.defaultNoPhrases);
      syncPhraseFilterButton();
      if (mode.id === "charades") {
        selectedCharadesFormat = "single";
        selectedCharadesKind = "noun";
        syncCharadesOptionButtons();
      }
      await loadModeCategories(selectedMode);
      updateModeLabels();
      renderCategories();
      settingsMessage.textContent = "";
      showScreen("settings");
    });

    modeList.appendChild(button);
  });
}

function getSelectedModeConfig() {
  return modeConfigs.find((mode) => mode.id === selectedMode) || modeConfigs[0];
}

function updateModeLabels() {
  const mode = getSelectedModeConfig();
  const isCharadesMode = isCharades();
  const isSingleMode = isSingleCardMode();
  document.body.dataset.mode = mode.id;
  document.body.classList.toggle("single-card-mode", isSingleMode);
  settingsModeTitle.textContent = mode.title;
  if (settingsModeDescription) {
    settingsModeDescription.textContent = mode.description;
  }
  gameModeTitle.textContent = mode.title;

  if (charadesFormatSection) {
    charadesFormatSection.hidden = !isCharadesMode;
  }

  if (charadesKindSection) {
    charadesKindSection.hidden = !isCharadesMode;
  }

  document.querySelectorAll(".timed-settings").forEach((section) => {
    section.hidden = isSingleMode;
  });

  document.querySelectorAll(".timed-game-ui").forEach((element) => {
    element.hidden = isSingleMode;
  });

  if (singleCardActions) {
    singleCardActions.hidden = !isSingleMode;
  }

  if (swipeHint) {
    swipeHint.textContent = isSingleMode
      ? "Свайп вгору або вниз — наступне слово"
      : "Свайп вгору — вгадано, вниз — пропустити";
  }
}

function isCharades() {
  return selectedMode === "charades";
}

function isSingleCardMode() {
  return isCharades() && selectedCharadesFormat === "single";
}

function syncCharadesOptionButtons() {
  charadesFormatButtons.forEach((button) => {
    button.classList.toggle("selected", button.dataset.format === selectedCharadesFormat);
  });

  charadesKindButtons.forEach((button) => {
    button.classList.toggle("selected", button.dataset.kind === selectedCharadesKind);
  });
}

function syncPhraseFilterButton() {
  if (!phraseFilterBtn) {
    return;
  }

  phraseFilterBtn.classList.toggle("selected", excludePhrases);
  phraseFilterBtn.setAttribute("aria-pressed", String(excludePhrases));
}

function renderCategories() {
  if (!categoryList) {
    return;
  }

  categoryList.innerHTML = "";
  categoryList.className = "category-picker";

  const allButton = document.createElement("button");
  allButton.className = "category-btn all-categories-btn";
  allButton.type = "button";
  allButton.textContent = "Усі теми";

  if (selectedCategories.length === 0) {
    allButton.classList.add("selected");
  }

  allButton.addEventListener("click", () => {
    selectedCategories = [];
    selectedCategory = null;
    renderCategories();
    settingsMessage.textContent = "";
  });

  const toggleButton = document.createElement("button");
  toggleButton.className = "category-toggle-btn setting-chip";
  toggleButton.type = "button";
  toggleButton.textContent = areCategoriesExpanded ? "Сховати теми" : "Змінити теми";
  toggleButton.setAttribute("aria-expanded", String(areCategoriesExpanded));

  toggleButton.addEventListener("click", () => {
    areCategoriesExpanded = !areCategoriesExpanded;
    renderCategories();
  });

  const summary = document.createElement("p");
  summary.className = "category-status";
  summary.textContent = getSelectedCategoryStatus();

  const controls = document.createElement("div");
  controls.className = "category-picker-controls";
  controls.appendChild(allButton);
  controls.appendChild(toggleButton);

  const themesWrap = document.createElement("div");
  themesWrap.className = "category-list";
  themesWrap.hidden = !areCategoriesExpanded;

  categoryList.appendChild(controls);
  categoryList.appendChild(summary);
  categoryList.appendChild(themesWrap);

  categories.forEach((category) => {
    const button = document.createElement("button");
    const availableCount = getCategoryAvailableCount(category);
    button.className = "category-btn";
    button.type = "button";
    button.textContent = `${category.name} (${availableCount})`;

    const isSelected = selectedCategories.some((item) => item.id === category.id);
    if (isSelected) {
      button.classList.add("selected");
    }

    if (availableCount === 0) {
      button.classList.add("is-unavailable");
    }

    button.addEventListener("click", () => {
      const selectedIndex = selectedCategories.findIndex((item) => item.id === category.id);

      if (selectedIndex >= 0) {
        selectedCategories = selectedCategories.filter((item) => item.id !== category.id);
      } else {
        selectedCategories = [...selectedCategories, category];
      }

      selectedCategory = selectedCategories[0] || null;
      renderCategories();
      settingsMessage.textContent = "";
    });

    themesWrap.appendChild(button);
  });
}

function getSelectedCategoryStatus() {
  if (selectedCategories.length === 0) {
    return "Усі теми";
  }

  const firstNames = selectedCategories.slice(0, 3).map((category) => category.name).join(", ");

  if (selectedCategories.length === 1) {
    return `1 тема вибрана: ${firstNames}`;
  }

  if (selectedCategories.length < 5) {
    return `${selectedCategories.length} теми вибрано: ${firstNames}`;
  }

  return `${selectedCategories.length} тем вибрано: ${firstNames}…`;
}

function getSelectedCategoryLabel() {
  if (selectedCategories.length === 0) {
    return "Усі теми";
  }

  if (selectedCategories.length === 1) {
    return selectedCategories[0].name;
  }

  if (selectedCategories.length === 2) {
    return "2 теми";
  }

  if (selectedCategories.length === 3) {
    return "3 теми";
  }

  return "Кілька тем";
}

function getCompactCategoryNames(maxVisible = 3) {
  if (selectedCategories.length === 0) {
    return "";
  }

  const visibleNames = selectedCategories.slice(0, maxVisible).map((category) => category.name);
  const remainingCount = selectedCategories.length - visibleNames.length;
  const suffix = remainingCount > 0 ? ` +${remainingCount}` : "";
  return `${visibleNames.join(", ")}${suffix}`;
}

function getSelectedDifficultyLabel() {
  if (selectedDifficulties.length === 0 || selectedDifficulties.length === difficultyLevels.length) {
    return "";
  }

  return selectedDifficulties.map((difficultyId) => getDifficultyName(difficultyId)).join(", ");
}

function getTaskKindLabel(kind = selectedCharadesKind) {
  if (!isCharades()) {
    return "";
  }

  const labels = {
    noun: "Іменники",
    action: "Дії",
    phrase: "Фрази",
    all: "Усе",
  };

  return labels[kind] || "";
}

function getCategorySummaryTitle() {
  if (selectedCategories.length === 0) {
    return "Категорії: Усі категорії";
  }

  if (selectedCategories.length === 1) {
    return "Категорії: 1 категорія";
  }

  if (selectedCategories.length >= 2 && selectedCategories.length <= 4) {
    return `Категорії: ${selectedCategories.length} категорії`;
  }

  return `Категорії: ${selectedCategories.length} категорій`;
}

function getCategorySummaryList() {
  return getCompactCategoryNames(3);
}

function renderGameSummary() {
  if (!gameCategoryName) {
    return;
  }

  gameCategoryName.innerHTML = "";

  const title = document.createElement("span");
  title.className = "summary-title";
  title.textContent = getCategorySummaryTitle();
  gameCategoryName.appendChild(title);

  const categoryListText = getCategorySummaryList();
  if (categoryListText) {
    const list = document.createElement("span");
    list.className = "summary-list";
    list.textContent = categoryListText;
    gameCategoryName.appendChild(list);
  }

  const kindLabel = getTaskKindLabel();
  if (kindLabel && isCharades()) {
    const kindBadge = document.createElement("span");
    kindBadge.className = "summary-kind-badge";
    kindBadge.textContent = kindLabel;
    gameCategoryName.appendChild(kindBadge);
  }
}

function renderWordMeta(entry) {
  if (!wordCategoryBadge) {
    return;
  }

  wordCategoryBadge.innerHTML = "";

  const categoryBadge = document.createElement("span");
  categoryBadge.className = "word-meta-badge word-meta-category";
  categoryBadge.textContent = `Категорія: ${entry.categoryName || "Тема"}`;
  wordCategoryBadge.appendChild(categoryBadge);

  const difficultyBadge = document.createElement("span");
  difficultyBadge.className = "word-meta-badge word-meta-difficulty";
  difficultyBadge.textContent = `Складність: ${entry.difficultyName || getDifficultyName(entry.difficulty || "medium")}`;
  wordCategoryBadge.appendChild(difficultyBadge);

  const kindLabel = getTaskKindLabel(entry.kind);
  if (kindLabel && isCharades()) {
    const kindBadge = document.createElement("span");
    kindBadge.className = "word-meta-badge word-meta-kind";
    kindBadge.textContent = `Тип: ${kindLabel}`;
    wordCategoryBadge.appendChild(kindBadge);
  }
}

function getSelectedButton(buttons) {
  return Array.from(buttons).find((button) => button.classList.contains("selected")) || null;
}

function getSelectedDifficulties() {
  return Array.from(difficultyButtons)
    .filter((button) => button.classList.contains("selected"))
    .map((button) => button.dataset.difficulty)
    .filter(Boolean);
}

function getDifficultyName(difficultyId) {
  const difficulty = difficultyLevels.find((level) => level.id === difficultyId);
  return difficulty ? difficulty.name : difficultyId;
}

function getEntryText(entry) {
  return typeof entry === "object" && entry !== null ? entry.text : entry;
}

function getEntryKind(entry) {
  if (typeof entry === "object" && entry !== null && entry.kind) {
    return entry.kind;
  }

  return isPhrase(getEntryText(entry)) ? "phrase" : "noun";
}

function isPhrase(text) {
  return String(text || "").trim().includes(" ");
}

function hasDifficultyLevels(category) {
  return category.levels && typeof category.levels === "object" && !Array.isArray(category.levels);
}

function getCategoryWordsByDifficulty(category) {
  return getWordsFromCategoryByFilters(category);
}

function getWordsFromCategoryByFilters(category, difficulties = selectedDifficulties, shouldExcludePhrases = excludePhrases) {
  const normalizeEntries = (words, difficultyId) => {
    const filteredWords = words.filter((entry) => {
      const text = getEntryText(entry);
      const kind = getEntryKind(entry);

      if (!text) {
        return false;
      }

      if (shouldExcludePhrases && isPhrase(text)) {
        return false;
      }

      if (isCharades() && selectedCharadesKind !== "all" && kind !== selectedCharadesKind) {
        return false;
      }

      return true;
    });

    return filteredWords.map((entry) => ({
      word: getEntryText(entry),
      kind: getEntryKind(entry),
      categoryName: category.name || "Тема",
      difficulty: difficultyId,
      difficultyName: getDifficultyName(difficultyId),
    }));
  };

  if (hasDifficultyLevels(category)) {
    return difficulties.flatMap((difficultyId) => {
      const words = Array.isArray(category.levels[difficultyId]) ? category.levels[difficultyId] : [];
      return normalizeEntries(words, difficultyId);
    });
  }

  const words = Array.isArray(category.words) ? category.words : [];

  if (!difficulties.includes("medium")) {
    return [];
  }

  return normalizeEntries(words, "medium");
}

function getCategoryAvailableCount(category) {
  return getWordsFromCategoryByFilters(category).length;
}

function getEffectiveSelectedCategories() {
  if (selectedCategories.length === 0) {
    return categories;
  }

  return categories.filter((category) => selectedCategories.some((selected) => selected.id === category.id));
}

function getMissingSettingsMessage(missingSettings) {
  if (missingSettings.length === 1) {
    return `Оберіть ${missingSettings[0]}.`;
  }

  if (missingSettings.length === 2) {
    return `Оберіть ${missingSettings[0]} і ${missingSettings[1]}.`;
  }

  const allButLast = missingSettings.slice(0, -1).join(", ");
  const lastSetting = missingSettings[missingSettings.length - 1];
  return `Оберіть ${allButLast} і ${lastSetting}.`;
}

function validateGameSettings() {
  const missingSettings = [];
  const selectedTeamButton = getSelectedButton(teamCountButtons);
  const selectedDurationButton = getSelectedButton(durationButtons);
  const selectedTargetButton = getSelectedButton(targetButtons);
  selectedDifficulties = getSelectedDifficulties();
  const selectedTeamCountValue = selectedTeamButton ? Number(selectedTeamButton.dataset.count) : 0;
  const selectedDurationValue = selectedDurationButton ? Number(selectedDurationButton.dataset.seconds) : 0;
  const selectedTargetValue = selectedTargetButton ? Number(selectedTargetButton.dataset.target) : 0;

  if (!isSingleCardMode() && (!selectedTeamButton || !Number.isFinite(selectedTeamCountValue) || selectedTeamCountValue <= 0)) {
    missingSettings.push("кількість команд");
  }

  if (!isSingleCardMode() && (!selectedDurationButton || !Number.isFinite(selectedDurationValue) || selectedDurationValue <= 0)) {
    missingSettings.push("час раунду");
  }

  if (!isSingleCardMode() && (!selectedTargetButton || !Number.isFinite(selectedTargetValue) || selectedTargetValue <= 0)) {
    missingSettings.push("ціль гри");
  }

  if (selectedDifficulties.length === 0) {
    settingsMessage.textContent = "Оберіть хоча б один рівень складності.";
    return false;
  }

  if (missingSettings.length > 0) {
    settingsMessage.textContent = getMissingSettingsMessage(missingSettings);
    return false;
  }

  if (getCurrentWordPool().length === 0) {
    settingsMessage.textContent = isCharades()
      ? "Для цих тем і фільтрів немає завдань."
      : "Для цих тем, складності та фільтра словосполучень немає слів.";
    return false;
  }

  if (!isSingleCardMode()) {
    selectedTeamCount = selectedTeamCountValue;
    selectedDuration = selectedDurationValue;
    selectedTargetScore = selectedTargetValue;
    syncTeamNamesForCount();
  }
  settingsMessage.textContent = "";
  return true;
}

function handleStartRound() {
  if (!validateGameSettings()) {
    return;
  }

  if (isSingleCardMode()) {
    startSingleCardGame();
    return;
  }

  startRound();
}

function clearWordActionTimeout() {
  if (!wordActionTimeoutId) {
    return;
  }

  clearTimeout(wordActionTimeoutId);
  wordActionTimeoutId = null;
}

function releaseWordCardPointer(pointerId) {
  if (pointerId === null || pointerId === undefined) {
    return;
  }

  if (wordCard.hasPointerCapture && wordCard.hasPointerCapture(pointerId)) {
    wordCard.releasePointerCapture(pointerId);
  }

  if (activePointerId === pointerId) {
    activePointerId = null;
  }
}

function resetWordCardPosition() {
  wordCard.classList.remove("fly-up", "fly-down", "correct-swipe", "skip-swipe");
  wordCard.style.transition = "opacity 0.22s ease, background 0.22s ease, transform 0.22s ease";
  wordCard.style.transform = "";
}

function resetSwipeState() {
  clearWordActionTimeout();
  releaseWordCardPointer(activePointerId);
  pointerStartY = 0;
  dragOffsetY = 0;
  dragVelocityY = 0;
  isSwipeLocked = false;
  resetWordCardPosition();
}

function startRound() {
  resetSwipeState();
  score = 0;
  skipped = 0;
  timeLeft = selectedDuration;
  roundResults = null;

  const wordPool = getCurrentWordPool();
  if (wordPool.length === 0) {
    settingsMessage.textContent = isCharades()
      ? "Для цих тем і фільтрів немає завдань."
      : "Для цих тем, складності та фільтра словосполучень немає слів.";
    showScreen("settings");
    return;
  }

  deck = shuffleArray([...wordPool]);

  renderGameSummary();

  currentTeamIndex = getNextTeamIndex();
  updateCurrentTeamDisplay();
  updateModeLabels();
  settingsMessage.textContent = "";

  showScreen("game");
  showNextWord();
  updateGameInfo();
  updateTeamScoreBoard();
  startTimer();
}

function startTimer() {
  clearInterval(timerId);

  timerId = setInterval(() => {
    timeLeft--;
    updateGameInfo();

    if (timeLeft <= 0) {
      finishRound();
    }
  }, 1000);
}

function getCurrentWordPool() {
  return getEffectiveSelectedCategories().flatMap((category) => getCategoryWordsByDifficulty(category));
}

function startSingleCardGame() {
  clearInterval(timerId);
  resetSwipeState();
  score = 0;
  skipped = 0;
  roundResults = null;

  const wordPool = getCurrentWordPool();
  if (wordPool.length === 0) {
    settingsMessage.textContent = "Для цих тем і фільтрів немає завдань.";
    showScreen("settings");
    return;
  }

  deck = shuffleArray([...wordPool]);
  renderGameSummary();
  updateModeLabels();
  settingsMessage.textContent = "";

  showScreen("game");
  showNextWord();
}

function showNextWord() {
  if (deck.length === 0) {
    deck = shuffleArray([...getCurrentWordPool()]);
  }

  const nextEntry = deck.pop();
  const mode = getSelectedModeConfig();
  currentWord = nextEntry.word;
  wordText.textContent = currentWord;
  renderWordMeta(nextEntry);

  if (wordModeHint) {
    wordModeHint.textContent = mode.cardHint || "";
    wordModeHint.hidden = !mode.cardHint;
  }
}

function showSingleNextCard() {
  if (!isSingleCardMode() || isSwipeLocked) {
    return;
  }

  isSwipeLocked = true;
  animateWordCard("fly-up");

  clearWordActionTimeout();
  wordActionTimeoutId = setTimeout(() => {
    showNextWord();
    isSwipeLocked = false;
    wordActionTimeoutId = null;
    resetWordCardPosition();
  }, 180);
}

function updateGameInfo() {
  timerText.textContent = timeLeft;
  scoreText.textContent = score;
  skippedText.textContent = skipped;

  const currentTeamScore = (teamScores[currentTeamIndex] || 0) + score;
  const progressPercent = Math.min(100, Math.round((currentTeamScore / selectedTargetScore) * 100));
  teamProgressText.textContent = `${currentTeamScore} / ${selectedTargetScore}`;
  teamProgressFill.style.width = `${progressPercent}%`;

  const maxTime = selectedDuration;
  const timeProgressPercent = Math.max(0, Math.round((timeLeft / maxTime) * 100));
  roundProgressText.textContent = `${timeLeft} / ${maxTime}`;
  roundProgressFill.style.width = `${timeProgressPercent}%`;
}

function resetTeamScores() {
  teamScores = Array.from({ length: selectedTeamCount }, (_, index) => 0);
  currentTeamIndex = 0;
  updateCurrentTeamDisplay();
  updateTeamScoreBoard();
}

function getDefaultTeamName(index) {
  return `Команда ${index + 1}`;
}

function syncTeamNamesForCount() {
  const nextNames = [];

  for (let index = 0; index < selectedTeamCount; index += 1) {
    const existingName = teamNames[index];
    nextNames.push(existingName && existingName.trim() ? existingName.trim() : getDefaultTeamName(index));
  }

  teamNames = nextNames;
}

function renderTeamNameInputs() {
  if (!teamNameFields) {
    return;
  }

  teamNameFields.innerHTML = "";

  for (let index = 0; index < selectedTeamCount; index += 1) {
    const field = document.createElement("div");
    field.className = "team-name-field";

    const label = document.createElement("label");
    label.htmlFor = `teamName${index + 1}`;
    label.textContent = getTeamName(index);

    const input = document.createElement("input");
    input.id = `teamName${index + 1}`;
    input.type = "text";
    input.placeholder = getDefaultTeamName(index);
    input.value = getTeamName(index);

    input.addEventListener("input", (event) => {
      teamNames[index] = event.target.value;
    });

    field.appendChild(label);
    field.appendChild(input);
    teamNameFields.appendChild(field);
  }
}

function getNextTeamIndex() {
  if (teamScores.length === 0) {
    return 0;
  }

  return currentTeamIndex % selectedTeamCount;
}

function getTeamName(index) {
  const currentName = teamNames[index];
  if (currentName && currentName.trim()) {
    return currentName.trim();
  }

  return getDefaultTeamName(index);
}

function updateCurrentTeamDisplay() {
  gameTeamName.textContent = getTeamName(currentTeamIndex);
}

function updateTeamScoreBoard(includeCurrentRound = false) {
  if (!teamScoreBoard) {
    return;
  }

  teamScoreBoard.innerHTML = "";

  teamScores.forEach((scoreValue, index) => {
    const row = document.createElement("div");
    row.className = "team-score-row";
    const visibleScore = includeCurrentRound && index === currentTeamIndex ? scoreValue + score : scoreValue;
    const progressPercent = Math.min(100, Math.round((visibleScore / selectedTargetScore) * 100));
    row.innerHTML = `
      <strong>${getTeamName(index)}</strong>
      <span>${visibleScore}</span>
    `;

    const progress = document.createElement("div");
    progress.className = "progress-bar";
    const fill = document.createElement("span");
    fill.style.width = `${progressPercent}%`;
    progress.appendChild(fill);
    row.appendChild(progress);
    teamScoreBoard.appendChild(row);
  });
}

function updateResultTeamScoreBoard() {
  if (!resultTeamScoreBoard) {
    return;
  }

  resultTeamScoreBoard.innerHTML = "";

  teamScores.forEach((scoreValue, index) => {
    const row = document.createElement("div");
    row.className = "team-score-row";
    const progressPercent = Math.min(100, Math.round((scoreValue / selectedTargetScore) * 100));
    row.innerHTML = `
      <strong>${getTeamName(index)}</strong>
      <span>${scoreValue}</span>
    `;

    const progress = document.createElement("div");
    progress.className = "progress-bar";
    const fill = document.createElement("span");
    fill.style.width = `${progressPercent}%`;
    progress.appendChild(fill);
    row.appendChild(progress);
    resultTeamScoreBoard.appendChild(row);
  });
}

function updateWinnerScoreBoard(winnerIndex = null) {
  if (!winnerScoreBoard) {
    return;
  }

  winnerScoreBoard.innerHTML = "";

  teamScores.forEach((scoreValue, index) => {
    const row = document.createElement("div");
    row.className = "team-score-row";
    if (index === winnerIndex) {
      row.classList.add("winner");
    }

    const progressPercent = Math.min(100, Math.round((scoreValue / selectedTargetScore) * 100));

    const teamName = document.createElement("strong");
    if (index === winnerIndex) {
      const cup = document.createElement("span");
      cup.className = "winner-cup";
      cup.setAttribute("aria-hidden", "true");
      cup.textContent = "🏆";
      teamName.appendChild(cup);
    }
    teamName.appendChild(document.createTextNode(getTeamName(index)));

    const scoreLabel = document.createElement("span");
    scoreLabel.textContent = scoreValue;

    row.appendChild(teamName);
    row.appendChild(scoreLabel);

    const progress = document.createElement("div");
    progress.className = "progress-bar";
    const fill = document.createElement("span");
    fill.style.width = `${progressPercent}%`;
    progress.appendChild(fill);
    row.appendChild(progress);
    winnerScoreBoard.appendChild(row);
  });
}

function renderWinnerHero(label, teamLabel, className) {
  if (!winnerHero) {
    return;
  }

  winnerHero.className = `winner-hero ${className}`;
  winnerHero.innerHTML = "";

  const kicker = document.createElement("span");
  kicker.className = "winner-kicker";
  kicker.textContent = label;

  const name = document.createElement("strong");
  name.textContent = teamLabel;

  winnerHero.appendChild(kicker);
  winnerHero.appendChild(name);
}

function startNextTeamRound() {
  currentTeamIndex = (currentTeamIndex + 1) % selectedTeamCount;
  startRound();
}

function startExtraRound() {
  finalRoundActive = false;
  finalRoundTeamsPlayed = 0;
  currentTeamIndex = (currentTeamIndex + 1) % selectedTeamCount;
  startRound();
}

function startNewGame() {
  resetTeamScores();
  finalRoundActive = false;
  finalRoundTeamsPlayed = 0;
  showScreen("settings");
}

function finishRound() {
  clearInterval(timerId);
  resetSwipeState();

  const teamName = getTeamName(currentTeamIndex);
  const pointsEarned = score;
  teamScores[currentTeamIndex] += pointsEarned;

  roundResults = {
    teamName,
    score,
    skipped,
    pointsEarned,
  };

  finalScoreText.textContent = score;
  finalSkippedText.textContent = skipped;

  if (score >= 10) {
    resultPhrase.textContent = `Сильно! ${teamName} впоралась дуже добре.`;
  } else if (score >= 5) {
    resultPhrase.textContent = `${teamName} не зламалась. Наступний раунд буде ще кращим.`;
  } else {
    resultPhrase.textContent = `${teamName} має ще шанс. Наступний раунд буде кращим.`;
  }

  updateTeamScoreBoard();
  updateResultTeamScoreBoard();

  if (!finalRoundActive && teamScores[currentTeamIndex] >= selectedTargetScore) {
    finalRoundActive = true;
    finalRoundTeamsPlayed = 1;
  } else if (finalRoundActive) {
    finalRoundTeamsPlayed += 1;
  }

  if (finalRoundActive && finalRoundTeamsPlayed >= selectedTeamCount) {
    showWinnerScreen();
    return;
  }

  showScreen("result");
}

function showWinnerScreen() {
  const highestScore = Math.max(...teamScores);
  const tiedIndices = teamScores.reduce((accumulator, scoreValue, index) => {
    if (scoreValue === highestScore) {
      accumulator.push(index);
    }
    return accumulator;
  }, []);

  if (tiedIndices.length > 1) {
    const teamNamesList = tiedIndices.map((index) => getTeamName(index)).join(", ");
    updateWinnerScoreBoard();
    renderWinnerHero("🤝 Нічия", teamNamesList, "tie");
    winnerTitle.textContent = "Гру завершено";
    winnerSubtitle.textContent = `Команди ${teamNamesList} набрали однакову кількість очок.`;
    winnerTeamsList.textContent = `Найвищий рахунок: ${highestScore}`;
    playAgainBtn.textContent = "Додатковий раунд";
  } else {
    const winnerIndex = tiedIndices[0];
    const winnerName = getTeamName(winnerIndex);
    updateWinnerScoreBoard(winnerIndex);
    renderWinnerHero("🏆 Переможець", winnerName, "winner");
    winnerTitle.textContent = "Гру завершено";
    winnerSubtitle.textContent = `Перемогла ${winnerName}.`;
    winnerTeamsList.textContent = `Фінальний рахунок: ${highestScore}`;
    playAgainBtn.textContent = "Нова гра";
  }

  showScreen("winner");
}

function showScreen(screenName) {
  menuScreen.classList.remove("active");
  settingsScreen.classList.remove("active");
  gameScreen.classList.remove("active");
  resultScreen.classList.remove("active");
  winnerScreen.classList.remove("active");

  if (screenName === "menu") {
    settingsMessage.textContent = "";
    menuScreen.classList.add("active");
  }

  if (screenName === "settings") {
    settingsScreen.classList.add("active");
  }

  if (screenName === "game") {
    gameScreen.classList.add("active");
  }

  if (screenName === "result") {
    resultScreen.classList.add("active");
  }

  if (screenName === "winner") {
    winnerScreen.classList.add("active");
  }
}

function handleSwipe(swipeDistance) {
  if (isSwipeLocked) {
    return false;
  }

  const minimumSwipeDistance = 60;

  if (swipeDistance > minimumSwipeDistance) {
    if (isSingleCardMode()) {
      showSingleNextCard();
      return true;
    }

    markCorrect();
    return true;
  } else if (swipeDistance < -minimumSwipeDistance) {
    if (isSingleCardMode()) {
      showSingleNextCard();
      return true;
    }

    markSkipped();
    return true;
  }

  return false;
}

function markCorrect() {
  if (isSwipeLocked) {
    return;
  }

  isSwipeLocked = true;

  score++;
  updateGameInfo();
  updateTeamScoreBoard(true);
  playCorrectSound();
  animateWordCard("fly-up");

  clearWordActionTimeout();
  wordActionTimeoutId = setTimeout(() => {
    showNextWord();
    isSwipeLocked = false;
    wordActionTimeoutId = null;
    resetWordCardPosition();
  }, 220);
}

function markSkipped() {
  if (isSwipeLocked) {
    return;
  }

  isSwipeLocked = true;

  skipped++;
  updateGameInfo();
  playSkipSound();
  animateWordCard("fly-down");

  clearWordActionTimeout();
  wordActionTimeoutId = setTimeout(() => {
    showNextWord();
    isSwipeLocked = false;
    wordActionTimeoutId = null;
    resetWordCardPosition();
  }, 220);
}

function animateWordCard(className) {
  wordCard.classList.remove("fly-up", "fly-down", "correct-swipe", "skip-swipe");
  wordCard.style.transition = "opacity 0.22s ease, background 0.22s ease, transform 0.22s ease";
  wordCard.style.transform = "";
  void wordCard.offsetWidth;
  wordCard.classList.add(className);

  setTimeout(() => {
    wordCard.classList.remove(className);
  }, 220);
}

function playCorrectSound() {
  // Тут пізніше додамо звук для “Вгадано”
}

function playSkipSound() {
  // Тут пізніше додамо звук для “Пропущено”
}

function shuffleArray(array) {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    const temporary = result[i];

    result[i] = result[randomIndex];
    result[randomIndex] = temporary;
  }

  return result;
}
