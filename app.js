let categories = [];
let selectedCategory = null;
let selectedCategories = [];
let selectedDifficulties = ["easy", "medium"];
let excludePhrases = false;
let areCategoriesExpanded = false;
let selectedCharadesFormat = "single";
let selectedCharadesKind = "noun";
let selectedDuration = 60;
let selectedTargetScore = 30;
let selectedMode = "explain";
const DATA_VERSION = "0.4.20";
const THEME_STORAGE_KEY = "movohray-theme";
const WORD_GUESS_FEEDBACK_STORAGE_KEY = "movohray-wordguess-feedback-v1";
const GAME_TITLE = "Мовограй";
const GAME_SUBTITLE = "Українські ігри зі словами для компанії.";
const modeCategoryCache = {};
const WORD_GUESS_DATA_FILE = "wordguess.json";
const WORD_GUESS_LETTERS = "абвгґдеєжзиіїйклмнопрстуфхцчшщьюя";
const WORD_GUESS_KEYBOARD_ROWS = [
  ["й", "ц", "у", "к", "е", "н", "г", "ш", "щ", "з", "х", "ї"],
  ["ф", "і", "в", "а", "п", "р", "о", "л", "д", "ж", "є"],
  ["ґ", "я", "ч", "с", "м", "и", "т", "ь", "б", "ю"],
];
const WORD_GUESS_STATUS_PRIORITY = {
  absent: 1,
  present: 2,
  correct: 3,
};
const DICTIONARY_LINKS = [
  {
    name: "СУМ",
    label: "словник «СУМ»",
    url: (word) => `https://sum.in.ua/s/${encodeURIComponent(word)}`,
  },
  {
    name: "Горох",
    label: "словник «Горох»",
    url: (word) => `https://goroh.pp.ua/Тлумачення/${encodeURIComponent(word)}`,
  },
  {
    name: "Вікісловник",
    label: "Вікісловник",
    url: (word) => `https://uk.wiktionary.org/wiki/${encodeURIComponent(word)}`,
  },
];
const funnyTeamNames = [
  "Веселі Кабачки",
  "Шалені Бублики",
  "Котики в Панамі",
  "Борщові Ніндзя",
  "Сміливі Вареники",
  "Команда Печеньок",
  "Грізні Пампушки",
  "Космічні Їжаки",
  "Хитрі Лисички",
  "Дикі Равлики",
  "Супер Сирники",
  "Бадьорі Огірки",
  "Легендарні Капці",
  "Пухнасті Динозаври",
  "Таємні Пиріжки",
  "Веселі Пельмені",
  "Круті Картоплини",
  "Сонні Кактуси",
  "Мудрі Пончики",
  "Швидкі Галушки",
  "Зоряні Млинці",
  "Смішні Морквинки",
  "Кмітливі Банани",
  "Прудкі Черепашки",
  "Хоробрі Пироги",
  "Мармеладні Герої",
  "Танцюючі Пельмені",
  "Секретні Оладки",
  "Чемні Дракони",
  "Рухливі Круасани",
  "Відважні Кексики",
  "Диванні Чемпіони",
  "Сміливі Компоти",
  "Гучні Помідори",
  "Сяючі Капібари",
  "Кавові Мандрівники",
  "Весняні Пампухи",
  "Хитрі Баклажани",
  "Літаючі Вареники",
  "Молочні Супергерої",
  "Гречані Лицарі",
  "Пухкі Бублики",
  "Соковиті Апельсини",
  "Чарівні Капці",
  "Радісні Пінгвіни",
  "Сміливі Парасолі",
  "Майстри Пиріжків",
  "Карамельні Ракети",
  "Завзяті Огірочки",
  "Мега Пампушки",
  "Шоколадні Капітани",
  "Тихі Феєрверки",
  "Дружні Хмаринки",
  "Сирні Детективи",
  "Бадьорі Бджілки",
  "Супові Генії",
  "Піжамні Ракети",
  "Кумедні Лимони",
  "Галасливі Смаколики",
  "Веселі Планети",
];
let selectedTeamCount = 2;
let teamScores = [];
let teamNames = [];
let roundsPlayedByTeam = [];
let currentTeamIndex = 0;
let roundResults = null;
let finalRoundActive = false;
let playedRounds = 0;

let deck = [];
let currentWord = "";
let currentEntry = null;
let roundWords = [];
let isAwaitingLastWordResult = false;
let allowLastWordAfterTime = true;
let score = 0;
let skipped = 0;
let timeLeft = 60;
let timerId = null;
let wasTimerRunningBeforeExitModal = false;
let isThemesPopoverOpen = false;
let isRoundPaused = false;

let wordGuessConfig = null;
let wordGuessAnswerWords = [];
let wordGuessAllowedGuesses = new Set();
let wordGuessTarget = "";
let wordGuessGuesses = [];
let wordGuessAttemptLog = [];
let wordGuessCurrentGuess = "";
let wordGuessKeyStatuses = {};
let wordGuessFinished = false;
let wordGuessHintUsed = false;
let wordGuessFeedbackChoice = "";
let wordGuessMessageTimeoutId = null;
let isWordGuessHistoryOpen = false;
let isWordGuessResultHistoryOpen = false;

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
    defaultNoPhrases: true,
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
    id: "wordguess",
    title: "Вгадай слово",
    description: "Відгадай українське слово за 5 спроб.",
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
const wordGuessSettingsScreen = document.getElementById("wordGuessSettingsScreen");
const wordGuessGameScreen = document.getElementById("wordGuessGameScreen");
const teamReadyScreen = document.getElementById("teamReadyScreen");
const gameScreen = document.getElementById("gameScreen");
const roundReviewScreen = document.getElementById("roundReviewScreen");
const resultScreen = document.getElementById("resultScreen");
const winnerScreen = document.getElementById("winnerScreen");
const themeToggleBtn = document.getElementById("themeToggleBtn");
const themeToggleIcon = document.getElementById("themeToggleIcon");
const themeToggleText = document.getElementById("themeToggleText");
const appTitle = document.getElementById("appTitle");
const appSubtitle = document.getElementById("appSubtitle");

const backToMenuBtn = document.getElementById("backToMenuBtn");
const menuExitButtons = document.querySelectorAll(".menu-exit-btn");
const startRoundButtons = document.querySelectorAll(".start-round-btn");
const startTeamRoundBtn = document.getElementById("startTeamRoundBtn");

const modeList = document.getElementById("modeList");
const categoryList = document.getElementById("categoryList");
const teamNameFields = document.getElementById("teamNameFields");
const durationButtons = document.querySelectorAll(".duration-btn");
const targetButtons = document.querySelectorAll(".target-btn");
const difficultyButtons = document.querySelectorAll(".difficulty-btn");
const phraseFilterBtn = document.getElementById("phraseFilterBtn");
const lastWordSection = document.getElementById("lastWordSection");
const lastWordBtn = document.getElementById("lastWordBtn");
const lastWordStopBtn = document.getElementById("lastWordStopBtn");
const charadesFormatSection = document.getElementById("charadesFormatSection");
const charadesKindSection = document.getElementById("charadesKindSection");
const charadesFormatButtons = document.querySelectorAll(".charades-format-btn");
const charadesKindButtons = document.querySelectorAll(".charades-kind-btn");
const teamCountButtons = document.querySelectorAll(".team-count-btn");
const teamNamesToggleBtn = document.getElementById("teamNamesToggleBtn");
const teamNameFieldsWrap = document.getElementById("teamNameFieldsWrap");
const settingsMessage = document.getElementById("settingsMessage");

const settingsModeTitle = document.getElementById("settingsModeTitle");
const settingsModeDescription = document.getElementById("settingsModeDescription");
const gameModeTitle = document.getElementById("gameModeTitle");
const gameTeamName = document.getElementById("gameTeamName");
const gameCategoryName = document.getElementById("gameCategoryName");
const gameThemesPopover = document.getElementById("gameThemesPopover");
const timerText = document.getElementById("timerText");
const timerRingProgress = document.getElementById("timerRingProgress");
const roundTimeMessage = document.getElementById("roundTimeMessage");
const teamProgressText = document.getElementById("teamProgressText");
const teamProgressFill = document.getElementById("teamProgressFill");
const roundProgressFill = document.getElementById("roundProgressFill");
const wordText = document.getElementById("wordText");
const wordCard = document.getElementById("wordCard");
const wordCategoryBadge = document.getElementById("wordCategoryBadge");
const wordModeHint = document.getElementById("wordModeHint");
const swipeHint = document.getElementById("swipeHint");
const singleCardActions = document.getElementById("singleCardActions");
const singleNextBtn = document.getElementById("singleNextBtn");
const singleSettingsBtn = document.getElementById("singleSettingsBtn");

const skipBtn = document.getElementById("skipBtn");
const correctBtn = document.getElementById("correctBtn");
const finishEarlyBtn = document.getElementById("finishEarlyBtn");
const pauseRoundBtn = document.getElementById("pauseRoundBtn");
const pauseRoundIcon = document.getElementById("pauseRoundIcon");
const pauseRoundLabel = document.getElementById("pauseRoundLabel");
const pauseOverlay = document.getElementById("pauseOverlay");

const finalScoreText = document.getElementById("finalScoreText");
const finalSkippedText = document.getElementById("finalSkippedText");
const resultPhrase = document.getElementById("resultPhrase");
const playAgainBtn = document.getElementById("playAgainBtn");
const nextTeamBtn = document.getElementById("nextTeamBtn");
const resultToMenuBtn = document.getElementById("resultToMenuBtn");
const teamReadyName = document.getElementById("readyTeamName");
const teamReadyScore = document.getElementById("readyTeamScore");
const roundReviewTeamName = document.getElementById("roundReviewTeamName");
const roundReviewScore = document.getElementById("roundReviewScore");
const roundReviewSkipped = document.getElementById("roundReviewSkipped");
const roundReviewProgress = document.getElementById("roundReviewProgress");
const roundReviewList = document.getElementById("roundReviewList");
const confirmRoundBtn = document.getElementById("confirmRoundBtn");
const exitMenuModal = document.getElementById("exitMenuModal");
const stayInGameBtn = document.getElementById("stayInGameBtn");
const confirmExitMenuBtn = document.getElementById("confirmExitMenuBtn");
const winnerTitle = document.getElementById("winnerTitle");
const winnerSubtitle = document.getElementById("winnerSubtitle");
const winnerHero = document.getElementById("winnerHero");
const winnerTeamsList = document.getElementById("winnerTeamsList");
const winnerToMenuBtn = document.getElementById("winnerToMenuBtn");
const teamScoreBoard = document.getElementById("teamScoreBoard");
const resultTeamScoreBoard = document.getElementById("resultTeamScoreBoard");
const winnerScoreBoard = document.getElementById("winnerScoreBoard");
const wordGuessStartBtn = document.getElementById("wordGuessStartBtn");
const wordGuessBackBtn = document.getElementById("wordGuessBackBtn");
const wordGuessTopMenuBtn = document.getElementById("wordGuessTopMenuBtn");
const wordGuessSettingsMessage = document.getElementById("wordGuessSettingsMessage");
const wordGuessBoard = document.getElementById("wordGuessBoard");
const wordGuessMessage = document.getElementById("wordGuessMessage");
const wordGuessHintBtn = document.getElementById("wordGuessHintBtn");
const wordGuessRulesBtn = document.getElementById("wordGuessRulesBtn");
const wordGuessInfoModal = document.getElementById("wordGuessInfoModal");
const wordGuessInfoCloseBtn = document.getElementById("wordGuessInfoCloseBtn");
const wordGuessInfoEyebrow = document.getElementById("wordGuessInfoEyebrow");
const wordGuessInfoTitle = document.getElementById("wordGuessInfoTitle");
const wordGuessInfoText = document.getElementById("wordGuessInfoText");
const wordGuessHistoryBtn = document.getElementById("wordGuessHistoryBtn");
const wordGuessHistoryPanel = document.getElementById("wordGuessHistoryPanel");
const wordGuessResultHistory = document.getElementById("wordGuessResultHistory");
const wordGuessResultHistoryBtn = document.getElementById("wordGuessResultHistoryBtn");
const wordGuessResultAttempts = document.getElementById("wordGuessResultAttempts");
const wordGuessKeyboard = document.getElementById("wordGuessKeyboard");
const wordGuessResult = document.getElementById("wordGuessResult");
const wordGuessResultTitle = document.getElementById("wordGuessResultTitle");
const wordGuessResultText = document.getElementById("wordGuessResultText");
const wordGuessNewBtn = document.getElementById("wordGuessNewBtn");
const wordGuessMenuBtn = document.getElementById("wordGuessMenuBtn");
const wordGuessDictionaryLinks = document.getElementById("wordGuessDictionaryLinks");
const wordGuessResultDebug = document.getElementById("wordGuessResultDebug");
const wordGuessFeedback = document.getElementById("wordGuessFeedback");
const wordGuessLikeBtn = document.getElementById("wordGuessLikeBtn");
const wordGuessDislikeBtn = document.getElementById("wordGuessDislikeBtn");
const wordGuessFeedbackMessage = document.getElementById("wordGuessFeedbackMessage");
const wordGuessFeedbackExportBtn = document.getElementById("wordGuessFeedbackExportBtn");

init();

async function init() {
  applyBrandText();
  initializeTheme();
  await loadModeCategories(selectedMode);
  renderCategories();
  syncTeamNamesForCount();
  renderTeamNameInputs();
  resetTeamScores();
  updateModeLabels();
  syncPhraseFilterButton();
  syncLastWordButton();
  syncTeamNamesVisibility(false);
  renderWordGuessBoard();
  renderWordGuessKeyboard();
  setupEvents();
  registerServiceWorker();
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator) || !window.isSecureContext) {
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js", { scope: "./" }).catch((error) => {
      console.warn("Не вдалося зареєструвати service worker", error);
    });
  });
}

function applyBrandText() {
  document.title = GAME_TITLE;

  if (appTitle) {
    appTitle.textContent = GAME_TITLE;
  }

  if (appSubtitle) {
    appSubtitle.textContent = GAME_SUBTITLE;
  }
}

function getPreferredTheme() {
  try {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === "dark" || savedTheme === "light") {
      return savedTheme;
    }
  } catch (error) {
    // localStorage can be unavailable in some private/legacy contexts.
  }

  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }

  return "light";
}

function applyTheme(theme) {
  const nextTheme = theme === "dark" ? "dark" : "light";
  document.body.dataset.theme = nextTheme;

  if (themeToggleBtn) {
    themeToggleBtn.setAttribute("aria-pressed", nextTheme === "dark" ? "true" : "false");
    themeToggleBtn.setAttribute("aria-label", nextTheme === "dark" ? "Увімкнути світлу тему" : "Увімкнути темну тему");
  }

  if (themeToggleIcon) {
    themeToggleIcon.textContent = nextTheme === "dark" ? "☀️" : "🌙";
  }

  if (themeToggleText) {
    themeToggleText.textContent = nextTheme === "dark" ? "Світла тема" : "Темна тема";
  }
}

function initializeTheme() {
  applyTheme(getPreferredTheme());
}

function toggleTheme() {
  const nextTheme = document.body.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(nextTheme);

  try {
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  } catch (error) {
    // Theme still changes for the current session if persistence is blocked.
  }
}

async function loadModeCategories(modeId = selectedMode) {
  const mode = modeConfigs.find((item) => item.id === modeId) || modeConfigs[0];

  if (modeCategoryCache[mode.id]) {
    categories = modeCategoryCache[mode.id];
    return;
  }

  try {
    const dictionaryUrl = `${mode.dataFile}?v=${encodeURIComponent(DATA_VERSION)}`;
    const response = await fetch(dictionaryUrl);
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

async function loadWordGuessDictionary() {
  if (wordGuessConfig && wordGuessAnswerWords.length > 0 && wordGuessAllowedGuesses.size > 0) {
    return true;
  }

  if (wordGuessSettingsMessage) {
    wordGuessSettingsMessage.textContent = "Завантажуємо словник...";
  }

  try {
    const dictionaryUrl = `${WORD_GUESS_DATA_FILE}?v=${encodeURIComponent(DATA_VERSION)}`;
    const response = await fetch(dictionaryUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const wordLength = Number(data.wordLength) || 5;
    const attempts = Number(data.attempts) || 5;
    const rawAnswerWords = Array.isArray(data.answers) ? data.answers : data.words || [];
    const answerWords = normalizeWordGuessList(rawAnswerWords, wordLength);
    const allowedGuessWords = normalizeWordGuessList(
      Array.isArray(data.allowedGuesses) ? data.allowedGuesses : answerWords,
      wordLength,
    );
    const allowedGuessSet = new Set(allowedGuessWords);

    answerWords.forEach((word) => {
      allowedGuessSet.add(word);
    });

    if (answerWords.length === 0 || allowedGuessSet.size === 0) {
      throw new Error("Empty wordguess dictionary");
    }

    wordGuessConfig = {
      version: data.version || "1.0",
      wordLength,
      attempts,
    };
    wordGuessAnswerWords = answerWords;
    wordGuessAllowedGuesses = allowedGuessSet;

    if (wordGuessSettingsMessage) {
      wordGuessSettingsMessage.textContent = "";
    }

    return true;
  } catch (error) {
    console.error(`Не вдалося завантажити ${WORD_GUESS_DATA_FILE}`, error);
    wordGuessConfig = null;
    wordGuessAnswerWords = [];
    wordGuessAllowedGuesses = new Set();

    if (wordGuessSettingsMessage) {
      wordGuessSettingsMessage.textContent = "Не вдалося завантажити словник.";
    }

    return false;
  }
}

function normalizeWordGuessList(rawWords, length = 5) {
  const normalizedWords = [];
  const seenWords = new Set();

  rawWords.forEach((item) => {
    const rawWord = typeof item === "string" ? item : item?.word;
    const word = normalizeWordGuessWord(rawWord || "");

    if (!isValidWordGuessWord(word, length) || seenWords.has(word)) {
      return;
    }

    seenWords.add(word);
    normalizedWords.push(word);
  });

  return normalizedWords;
}

function normalizeWordGuessWord(word) {
  return String(word).trim().toLocaleLowerCase("uk-UA");
}

function isValidWordGuessWord(word, length = 5) {
  const letters = Array.from(word);
  return letters.length === length
    && letters.every((letter) => WORD_GUESS_LETTERS.includes(letter))
    && new Set(letters).size === letters.length;
}

function getWordGuessValidationMessage(word, length = 5) {
  const letters = Array.from(word);

  if (letters.length !== length) {
    return "Потрібно 5 літер";
  }

  if (!letters.every((letter) => WORD_GUESS_LETTERS.includes(letter))) {
    return "Тільки українські літери";
  }

  if (new Set(letters).size !== letters.length) {
    return "Без повторення літер";
  }

  return "";
}

function getWordGuessLength() {
  return wordGuessConfig?.wordLength || 5;
}

function getWordGuessAttempts() {
  return wordGuessConfig?.attempts || 5;
}

function getWordGuessDictionaryStatsLabel() {
  const answerCount = wordGuessAnswerWords.length;
  const allowedCount = wordGuessAllowedGuesses.size;

  if (!answerCount || !allowedCount) {
    return "";
  }

  return `Словник гри: ${answerCount} для загадування · ${allowedCount} для спроб.`;
}

function getWordGuessDebugLabel() {
  const answerCount = wordGuessAnswerWords.length;
  const allowedCount = wordGuessAllowedGuesses.size;

  if (!answerCount || !allowedCount) {
    return `v${DATA_VERSION}`;
  }

  return `v${DATA_VERSION} · загадування: ${answerCount} · спроби: ${allowedCount}`;
}

async function startWordGuessGame() {
  document.body.classList.remove("word-guess-result-open");
  const isDictionaryReady = await loadWordGuessDictionary();
  if (!isDictionaryReady) {
    showScreen("wordGuessSettings");
    return;
  }

  wordGuessTarget = wordGuessAnswerWords[Math.floor(Math.random() * wordGuessAnswerWords.length)];
  wordGuessGuesses = [];
  wordGuessAttemptLog = [];
  wordGuessCurrentGuess = "";
  wordGuessKeyStatuses = {};
  wordGuessFinished = false;
  wordGuessHintUsed = false;
  wordGuessFeedbackChoice = "";
  isWordGuessHistoryOpen = false;
  isWordGuessResultHistoryOpen = false;

  updateWordGuessHintState();
  updateWordGuessFeedbackState();

  if (wordGuessMessage) {
    setWordGuessMessage("");
  }

  if (wordGuessResult) {
    wordGuessResult.hidden = true;
  }

  if (wordGuessResultDebug) {
    wordGuessResultDebug.textContent = "";
  }

  renderWordGuessBoard();
  renderWordGuessKeyboard();
  renderWordGuessHistory();
  updateWordGuessHintState();
  showScreen("wordGuessGame");
}

function renderWordGuessBoard() {
  if (!wordGuessBoard) {
    return;
  }

  const wordLength = getWordGuessLength();
  const attempts = getWordGuessAttempts();
  wordGuessBoard.innerHTML = "";

  for (let rowIndex = 0; rowIndex < attempts; rowIndex++) {
    const row = document.createElement("div");
    row.className = "word-guess-row";

    const submittedGuess = wordGuessGuesses[rowIndex];
    const isActiveRow = rowIndex === wordGuessGuesses.length && !wordGuessFinished;
    const activeLetters = isActiveRow ? Array.from(wordGuessCurrentGuess) : [];

    for (let cellIndex = 0; cellIndex < wordLength; cellIndex++) {
      const cell = document.createElement("span");
      cell.className = "word-guess-cell";
      let letter = "";

      if (submittedGuess) {
        letter = submittedGuess.letters[cellIndex] || "";
        cell.classList.add(`is-${submittedGuess.statuses[cellIndex] || "absent"}`);
      } else if (isActiveRow && activeLetters[cellIndex]) {
        letter = activeLetters[cellIndex];
        cell.classList.add("is-filled");
      }

      cell.textContent = letter.toLocaleUpperCase("uk-UA");
      row.appendChild(cell);
    }

    wordGuessBoard.appendChild(row);
  }
}

function renderWordGuessKeyboard() {
  if (!wordGuessKeyboard) {
    return;
  }

  wordGuessKeyboard.innerHTML = "";

  WORD_GUESS_KEYBOARD_ROWS.forEach((letters) => {
    const row = document.createElement("div");
    row.className = "word-guess-key-row word-guess-letter-row";

    letters.forEach((letter) => {
      row.appendChild(createWordGuessKey(letter, letter.toLocaleUpperCase("uk-UA")));
    });

    wordGuessKeyboard.appendChild(row);
  });

  const controlsRow = document.createElement("div");
  controlsRow.className = "word-guess-control-row";
  controlsRow.appendChild(createWordGuessKey("enter", "Ввести", "wide"));
  controlsRow.appendChild(createWordGuessKey("backspace", "⌫", "utility"));
  wordGuessKeyboard.appendChild(controlsRow);
}


function setWordGuessBackgroundLocked(isLocked) {
  const locked = Boolean(isLocked);
  document.body.classList.toggle("word-guess-result-open", locked);

  [wordGuessTopMenuBtn, wordGuessHintBtn, wordGuessRulesBtn, wordGuessHistoryBtn].forEach((button) => {
    if (!button) {
      return;
    }

    button.disabled = locked;
    button.setAttribute("aria-disabled", String(locked));
  });

  if (wordGuessHistoryPanel) {
    wordGuessHistoryPanel.hidden = true;
  }

  if (locked) {
    isWordGuessHistoryOpen = false;
  }
}

function createWordGuessKey(key, label, variant = "") {
  const button = document.createElement("button");
  const status = wordGuessKeyStatuses[key];
  button.type = "button";
  button.className = `word-guess-key${variant ? ` word-guess-key-${variant}` : ""}`;
  button.dataset.wordGuessKey = key;

  if (key === "backspace") {
    button.classList.add("word-guess-key-icon");
    button.setAttribute("aria-label", "Стерти літеру");
    button.innerHTML = `
      <svg class="word-guess-backspace-icon" viewBox="0 0 28 20" aria-hidden="true" focusable="false">
        <path d="M10 3.5H24.2C25.2 3.5 26 4.3 26 5.3V14.7C26 15.7 25.2 16.5 24.2 16.5H10L2.8 10L10 3.5Z" />
        <path d="M13 7.3L18.4 12.7M18.4 7.3L13 12.7" />
      </svg>
    `;
  } else {
    button.textContent = label;
  }

  if (status) {
    button.classList.add(`is-${status}`);
  }

  if (wordGuessFinished) {
    button.disabled = true;
  }

  return button;
}

function handleWordGuessInput(rawKey) {
  if (wordGuessFinished || !isScreenActive(wordGuessGameScreen)) {
    return;
  }

  const key = normalizeWordGuessWord(rawKey);

  if (key === "enter") {
    submitWordGuess();
    return;
  }

  if (key === "backspace") {
    wordGuessCurrentGuess = Array.from(wordGuessCurrentGuess).slice(0, -1).join("");
    renderWordGuessBoard();
    setWordGuessMessage("");
    return;
  }

  if (!WORD_GUESS_LETTERS.includes(key) || Array.from(key).length !== 1) {
    return;
  }

  const letters = Array.from(wordGuessCurrentGuess);
  if (letters.length >= getWordGuessLength()) {
    return;
  }

  wordGuessCurrentGuess += key;
  renderWordGuessBoard();
  setWordGuessMessage("");
}

function handleWordGuessPhysicalKey(event) {
  if (!isScreenActive(wordGuessGameScreen)) {
    return;
  }

  if (event.key === "Enter") {
    event.preventDefault();
    handleWordGuessInput("enter");
    return;
  }

  if (event.key === "Backspace") {
    event.preventDefault();
    handleWordGuessInput("backspace");
    return;
  }

  const key = normalizeWordGuessWord(event.key);
  if (WORD_GUESS_LETTERS.includes(key) && Array.from(key).length === 1) {
    event.preventDefault();
    handleWordGuessInput(key);
  }
}

function submitWordGuess() {
  const wordLength = getWordGuessLength();
  const guess = normalizeWordGuessWord(wordGuessCurrentGuess);
  const validationMessage = getWordGuessValidationMessage(guess, wordLength);

  if (validationMessage) {
    addWordGuessAttemptLog(guess, "invalid", [], validationMessage);
    setWordGuessMessage(validationMessage);
    shakeWordGuessBoard();
    wordGuessCurrentGuess = "";
    renderWordGuessBoard();
    renderWordGuessHistory();
    return;
  }

  if (!wordGuessAllowedGuesses.has(guess)) {
    addWordGuessAttemptLog(guess, "invalid", [], "Немає в словнику гри");
    setWordGuessMessage("Немає в словнику гри");
    shakeWordGuessBoard();
    wordGuessCurrentGuess = "";
    renderWordGuessBoard();
    renderWordGuessHistory();
    return;
  }

  const statuses = evaluateWordGuess(guess, wordGuessTarget);
  const acceptedGuess = {
    word: guess,
    letters: Array.from(guess),
    statuses,
  };
  wordGuessGuesses.push(acceptedGuess);
  addWordGuessAttemptLog(guess, "valid", statuses, "");

  updateWordGuessKeyboardStatuses(guess, statuses);
  wordGuessCurrentGuess = "";
  setWordGuessMessage("");
  renderWordGuessHistory();

  if (guess === wordGuessTarget) {
    finishWordGuessGame(true);
  } else if (wordGuessGuesses.length >= getWordGuessAttempts()) {
    finishWordGuessGame(false);
  }

  renderWordGuessBoard();
  renderWordGuessKeyboard();
}

function evaluateWordGuess(guess, target) {
  const guessLetters = Array.from(guess);
  const targetLetters = Array.from(target);
  const statuses = Array(guessLetters.length).fill("absent");
  const remainingLetters = {};

  targetLetters.forEach((letter, index) => {
    if (guessLetters[index] !== letter) {
      remainingLetters[letter] = (remainingLetters[letter] || 0) + 1;
    }
  });

  guessLetters.forEach((letter, index) => {
    if (letter === targetLetters[index]) {
      statuses[index] = "correct";
    }
  });

  guessLetters.forEach((letter, index) => {
    if (statuses[index] === "correct") {
      return;
    }

    if (remainingLetters[letter] > 0) {
      statuses[index] = "present";
      remainingLetters[letter]--;
    }
  });

  return statuses;
}

function updateWordGuessKeyboardStatuses(guess, statuses) {
  Array.from(guess).forEach((letter, index) => {
    const currentStatus = wordGuessKeyStatuses[letter];
    const nextStatus = statuses[index];
    const currentPriority = WORD_GUESS_STATUS_PRIORITY[currentStatus] || 0;
    const nextPriority = WORD_GUESS_STATUS_PRIORITY[nextStatus] || 0;

    if (nextPriority > currentPriority) {
      wordGuessKeyStatuses[letter] = nextStatus;
    }
  });
}

function finishWordGuessGame(isWon) {
  wordGuessFinished = true;
  isWordGuessHistoryOpen = false;
  isWordGuessResultHistoryOpen = false;
  const targetLabel = wordGuessTarget.toLocaleUpperCase("uk-UA");
  const totalAttempts = wordGuessAttemptLog.length;
  const invalidAttempts = wordGuessAttemptLog.filter((attempt) => attempt.status === "invalid").length;
  const validAttempts = wordGuessGuesses.length;

  if (wordGuessResultTitle) {
    wordGuessResultTitle.textContent = isWon ? "Вгадано!" : "Спроби закінчились";
  }

  if (wordGuessResultText) {
    wordGuessResultText.textContent = "";

    const targetCaption = document.createElement("span");
    targetCaption.className = "word-guess-result-caption";
    targetCaption.textContent = isWon ? "Загадане слово" : "Правильне слово";

    const targetWord = document.createElement("strong");
    targetWord.className = "word-guess-result-word";
    targetWord.textContent = targetLabel;

    const summary = document.createElement("span");
    summary.className = "word-guess-result-summary";
    summary.textContent = `Зараховано ${validAttempts} ${getAttemptWord(validAttempts)} · перевірено всього: ${totalAttempts}${invalidAttempts > 0 ? ` · не в залік: ${invalidAttempts}` : ""}`;

    wordGuessResultText.appendChild(targetCaption);
    wordGuessResultText.appendChild(targetWord);
    wordGuessResultText.appendChild(summary);
  }

  if (wordGuessResultDebug) {
    wordGuessResultDebug.textContent = getWordGuessDebugLabel();
  }

  renderWordGuessDictionaryLinks(wordGuessTarget);
  renderWordGuessResultAttempts();
  renderWordGuessHistory();
  updateWordGuessHintState();
  updateWordGuessFeedbackState();

  if (wordGuessResult) {
    wordGuessResult.hidden = false;
  }

  setWordGuessBackgroundLocked(true);
}


function getWordGuessVowelCount(word) {
  const vowels = "аеєиіїоуюя";
  return Array.from(word).filter((letter) => vowels.includes(letter)).length;
}

function getWordGuessHintMessage() {
  if (!wordGuessTarget) {
    return "Підказка з’явиться після старту гри.";
  }

  const firstLetter = Array.from(wordGuessTarget)[0]?.toLocaleUpperCase("uk-UA") || "";
  const vowelCount = getWordGuessVowelCount(wordGuessTarget);
  const vowelLabel = vowelCount === 1 ? "голосна" : vowelCount >= 2 && vowelCount <= 4 ? "голосні" : "голосних";

  return `Перша літера: ${firstLetter} · ${vowelCount} ${vowelLabel}`;
}

function updateWordGuessHintState() {
  if (!wordGuessHintBtn) {
    return;
  }

  const isUsed = Boolean(wordGuessHintUsed && wordGuessTarget);
  wordGuessHintBtn.disabled = !wordGuessTarget;
  wordGuessHintBtn.innerHTML = `
    <span class="word-guess-hint-icon" aria-hidden="true">💡</span>
    <span class="word-guess-hint-label">Підказка</span>
  `;
  wordGuessHintBtn.classList.toggle("is-used", isUsed);
  wordGuessHintBtn.setAttribute("aria-label", isUsed ? "Показати використану підказку" : "Показати підказку");
  wordGuessHintBtn.title = isUsed ? "Підказку вже використано" : "Підказка";
}

function showWordGuessHint() {
  if (!wordGuessTarget) {
    return;
  }

  const wasUsed = wordGuessHintUsed;
  wordGuessHintUsed = true;
  setWordGuessMessage("");
  updateWordGuessHintState();
  openWordGuessInfoModal({
    eyebrow: wasUsed ? "Підказку вже використано" : "Підказка",
    title: getWordGuessHintMessage(),
    text: wasUsed
      ? "Її можна переглядати повторно."
      : "Підказка доступна один раз, але переглядати її можна повторно.",
    type: "hint",
  });
}

function showWordGuessRules() {
  openWordGuessInfoModal({
    eyebrow: "Правила",
    title: "Як грати",
    text: "Введи українське слово з 5 різних літер. Зелена літера стоїть на правильному місці, жовта є у слові, але в іншій позиції, рожева — відсутня. Є 5 зарахованих спроб; слова не зі словника показуються в історії перекресленими і не забирають спробу.",
    type: "rules",
  });
}

function openWordGuessInfoModal({ eyebrow = "", title = "", text = "", type = "" } = {}) {
  if (!wordGuessInfoModal) {
    return;
  }

  wordGuessInfoModal.classList.toggle("is-hint-modal", type === "hint");
  wordGuessInfoModal.classList.toggle("is-rules-modal", type === "rules");

  if (wordGuessInfoEyebrow) {
    wordGuessInfoEyebrow.textContent = eyebrow;
    wordGuessInfoEyebrow.hidden = !eyebrow;
  }

  if (wordGuessInfoTitle) {
    wordGuessInfoTitle.textContent = title;
  }

  if (wordGuessInfoText) {
    wordGuessInfoText.textContent = text;
  }

  wordGuessInfoModal.hidden = false;
  document.body.classList.add("modal-open");

  if (wordGuessInfoCloseBtn) {
    wordGuessInfoCloseBtn.focus();
  }
}

function closeWordGuessInfoModal() {
  if (!wordGuessInfoModal || wordGuessInfoModal.hidden) {
    return;
  }

  wordGuessInfoModal.hidden = true;
  document.body.classList.remove("modal-open");
}

function getAttemptWord(count) {
  if (count === 1) {
    return "спробу";
  }

  if (count >= 2 && count <= 4) {
    return "спроби";
  }

  return "спроб";
}


function renderWordGuessResultAttempts() {
  if (!wordGuessResultAttempts) {
    return;
  }

  wordGuessResultAttempts.innerHTML = "";

  const label = document.createElement("span");
  label.className = "word-guess-result-attempts-label";
  label.textContent = "Спроби:";
  wordGuessResultAttempts.appendChild(label);

  if (wordGuessAttemptLog.length === 0) {
    const empty = document.createElement("span");
    empty.className = "word-guess-result-attempts-empty";
    empty.textContent = "Спроб ще не було.";
    wordGuessResultAttempts.appendChild(empty);
    return;
  }

  const list = document.createElement("div");
  list.className = "word-guess-result-attempt-list";

  wordGuessAttemptLog.forEach((attempt, index) => {
    const row = document.createElement("div");
    const isInvalidAttempt = attempt.status === "invalid";
    row.className = `word-guess-result-attempt-row${isInvalidAttempt ? " is-invalid" : ""}`;

    const attemptIndex = document.createElement("span");
    attemptIndex.className = "word-guess-result-attempt-index";
    attemptIndex.textContent = `${index + 1}.`;
    row.appendChild(attemptIndex);

    const lettersWrap = document.createElement("span");
    lettersWrap.className = "word-guess-result-attempt-word";

    const letters = Array.from(attempt.word || "");
    for (let letterIndex = 0; letterIndex < getWordGuessLength(); letterIndex++) {
      const letterCell = document.createElement("span");
      const letter = letters[letterIndex] || "";
      const status = isInvalidAttempt ? "invalid" : attempt.statuses[letterIndex] || "absent";
      letterCell.className = `word-guess-result-attempt-letter is-${status}`;
      letterCell.textContent = letter.toLocaleUpperCase("uk-UA");
      lettersWrap.appendChild(letterCell);
    }

    if (isInvalidAttempt && attempt.message) {
      row.title = `Не зараховано: ${attempt.message}`;
    }

    row.appendChild(lettersWrap);
    list.appendChild(row);
  });

  wordGuessResultAttempts.appendChild(list);
}

function renderWordGuessDictionaryLinks(word) {
  if (!wordGuessDictionaryLinks) {
    return;
  }

  wordGuessDictionaryLinks.innerHTML = "";
  DICTIONARY_LINKS.forEach((link) => {
    const anchor = document.createElement("a");
    anchor.href = link.url(word);
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.textContent = link.label || link.name;
    anchor.title = `Почитати тлумачення слова ${word.toLocaleUpperCase("uk-UA")} у словнику ${link.name}`;
    anchor.setAttribute("aria-label", anchor.title);
    wordGuessDictionaryLinks.appendChild(anchor);
  });
}

function addWordGuessAttemptLog(word, status = "valid", statuses = [], message = "") {
  const normalizedWord = normalizeWordGuessWord(word);
  const letters = Array.from(normalizedWord);

  if (letters.length === 0) {
    return;
  }

  wordGuessAttemptLog.push({
    word: normalizedWord,
    letters,
    status,
    statuses: Array.isArray(statuses) ? statuses : [],
    message,
  });
}

function getWordGuessHistoryTitle() {
  const count = wordGuessAttemptLog.length;
  if (count === 0) {
    return "Спроби · 0";
  }

  return `Спроби · ${count}`;
}

function createWordGuessHistoryItem(guess, index) {
  const item = document.createElement("li");
  const isInvalidAttempt = guess.status === "invalid";
  item.className = `word-guess-history-item${isInvalidAttempt ? " is-invalid-attempt" : ""}`;

  const indexLabel = document.createElement("span");
  indexLabel.className = "word-guess-history-index";
  indexLabel.textContent = `${index + 1}.`;
  item.appendChild(indexLabel);

  const lettersWrap = document.createElement("span");
  lettersWrap.className = "word-guess-history-letters";

  for (let letterIndex = 0; letterIndex < getWordGuessLength(); letterIndex++) {
    const cell = document.createElement("span");
    const letter = guess.letters[letterIndex] || "";
    const status = isInvalidAttempt ? "invalid" : guess.statuses[letterIndex] || "absent";
    cell.className = `word-guess-history-letter is-${status}`;
    cell.textContent = letter.toLocaleUpperCase("uk-UA");
    lettersWrap.appendChild(cell);
  }

  item.appendChild(lettersWrap);

  if (isInvalidAttempt && guess.message) {
    item.title = `Не в залік: ${guess.message}`;
  }

  return item;
}

function renderWordGuessHistoryList(targetElement, emptyText = "Спроб ще немає.") {
  if (!targetElement) {
    return;
  }

  targetElement.innerHTML = "";

  if (wordGuessAttemptLog.length === 0) {
    const empty = document.createElement("p");
    empty.className = "word-guess-history-empty";
    empty.textContent = emptyText;
    targetElement.appendChild(empty);
    return;
  }

  const list = document.createElement("ol");
  list.className = "word-guess-history-list";
  wordGuessAttemptLog.forEach((guess, index) => {
    list.appendChild(createWordGuessHistoryItem(guess, index));
  });
  targetElement.appendChild(list);
}

function renderWordGuessHistory() {
  const historyTitle = getWordGuessHistoryTitle();

  if (wordGuessHistoryBtn) {
    wordGuessHistoryBtn.textContent = historyTitle;
    wordGuessHistoryBtn.setAttribute("aria-expanded", String(isWordGuessHistoryOpen));
  }

  if (wordGuessHistoryPanel) {
    wordGuessHistoryPanel.hidden = !isWordGuessHistoryOpen;
    renderWordGuessHistoryList(wordGuessHistoryPanel);
  }

  if (wordGuessResultHistoryBtn) {
    wordGuessResultHistoryBtn.textContent = historyTitle;
    wordGuessResultHistoryBtn.setAttribute("aria-expanded", String(isWordGuessResultHistoryOpen));
  }

  if (wordGuessResultHistory) {
    wordGuessResultHistory.hidden = !isWordGuessResultHistoryOpen;
    renderWordGuessHistoryList(wordGuessResultHistory, "Жодної спроби не було.");
  }
}

function closeWordGuessHistory() {
  if (!isWordGuessHistoryOpen) {
    return;
  }

  isWordGuessHistoryOpen = false;
  renderWordGuessHistory();
}

function toggleWordGuessHistory() {
  isWordGuessHistoryOpen = !isWordGuessHistoryOpen;
  renderWordGuessHistory();
}

function toggleWordGuessResultHistory() {
  isWordGuessResultHistoryOpen = !isWordGuessResultHistoryOpen;
  renderWordGuessHistory();
}

function shakeWordGuessBoard() {
  if (!wordGuessBoard) {
    return;
  }

  wordGuessBoard.classList.remove("is-invalid");
  void wordGuessBoard.offsetWidth;
  wordGuessBoard.classList.add("is-invalid");

  setTimeout(() => {
    wordGuessBoard.classList.remove("is-invalid");
  }, 360);
}

function setWordGuessMessage(message) {
  if (!wordGuessMessage) {
    return;
  }

  if (wordGuessMessageTimeoutId) {
    clearTimeout(wordGuessMessageTimeoutId);
    wordGuessMessageTimeoutId = null;
  }

  const hasMessage = Boolean(message);
  wordGuessMessage.textContent = message;
  wordGuessMessage.classList.toggle("is-visible", hasMessage);
  wordGuessMessage.classList.toggle("is-error", hasMessage);

  if (hasMessage) {
    wordGuessMessageTimeoutId = setTimeout(() => {
      wordGuessMessage.classList.remove("is-visible", "is-error");
      wordGuessMessage.textContent = "";
      wordGuessMessageTimeoutId = null;
    }, 1700);
  }
}


function getWordGuessFeedbackEntries() {
  try {
    const rawValue = localStorage.getItem(WORD_GUESS_FEEDBACK_STORAGE_KEY);
    const entries = JSON.parse(rawValue || "[]");
    return Array.isArray(entries) ? entries : [];
  } catch (error) {
    return [];
  }
}

function saveWordGuessFeedback(vote) {
  if (!wordGuessTarget) {
    return;
  }

  const normalizedVote = vote === "dislike" ? "dislike" : "like";
  const entries = getWordGuessFeedbackEntries();
  const feedbackEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    word: wordGuessTarget,
    vote: normalizedVote,
    version: DATA_VERSION,
    createdAt: new Date().toISOString(),
    acceptedAttempts: wordGuessGuesses.length,
    checkedAttempts: wordGuessAttemptLog.length,
    invalidAttempts: wordGuessAttemptLog.filter((attempt) => attempt.status === "invalid").length,
    hintUsed: Boolean(wordGuessHintUsed),
  };

  entries.push(feedbackEntry);

  try {
    localStorage.setItem(WORD_GUESS_FEEDBACK_STORAGE_KEY, JSON.stringify(entries));
    wordGuessFeedbackChoice = normalizedVote;
    updateWordGuessFeedbackState();
  } catch (error) {
    if (wordGuessFeedbackMessage) {
      wordGuessFeedbackMessage.textContent = "Не вдалося зберегти оцінку на цьому пристрої.";
    }
  }
}

function getWordGuessFeedbackText() {
  const entries = getWordGuessFeedbackEntries();
  if (entries.length === 0) {
    return "";
  }

  return JSON.stringify(entries, null, 2);
}

async function copyWordGuessFeedback() {
  const feedbackText = getWordGuessFeedbackText();
  if (!feedbackText) {
    if (wordGuessFeedbackMessage) {
      wordGuessFeedbackMessage.textContent = "Поки немає збережених оцінок.";
    }
    return;
  }

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(feedbackText);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = feedbackText;
      textarea.setAttribute("readonly", "readonly");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }

    if (wordGuessFeedbackMessage) {
      wordGuessFeedbackMessage.textContent = "Звіт скопійовано. Надішліть його розробнику для модерації словника.";
    }
  } catch (error) {
    if (wordGuessFeedbackMessage) {
      wordGuessFeedbackMessage.textContent = "Не вдалося скопіювати. Оцінка збережена на пристрої, але для модерації її треба передати розробнику вручну.";
    }
  }
}

function updateWordGuessFeedbackState() {
  if (!wordGuessFeedback) {
    return;
  }

  const hasTarget = Boolean(wordGuessTarget);
  wordGuessFeedback.hidden = !hasTarget;

  if (wordGuessLikeBtn) {
    wordGuessLikeBtn.disabled = !hasTarget;
    wordGuessLikeBtn.classList.toggle("selected", wordGuessFeedbackChoice === "like");
  }

  if (wordGuessDislikeBtn) {
    wordGuessDislikeBtn.disabled = !hasTarget;
    wordGuessDislikeBtn.classList.toggle("selected", wordGuessFeedbackChoice === "dislike");
  }

  const entriesCount = getWordGuessFeedbackEntries().length;
  if (wordGuessFeedbackExportBtn) {
    wordGuessFeedbackExportBtn.hidden = entriesCount === 0;
    wordGuessFeedbackExportBtn.textContent = entriesCount > 1 ? `Скопіювати звіт для розробника · ${entriesCount}` : "Скопіювати звіт для розробника";
  }

  if (wordGuessFeedbackMessage) {
    if (wordGuessFeedbackChoice === "like") {
      wordGuessFeedbackMessage.textContent = "Записано. Натисніть «Скопіювати відгук» і надішліть його розробнику.";
    } else if (wordGuessFeedbackChoice === "dislike") {
      wordGuessFeedbackMessage.textContent = "Записано. Натисніть «Скопіювати відгук» і надішліть його розробнику.";
    } else {
      wordGuessFeedbackMessage.textContent = "Оцінка збережеться на цьому пристрої. Для модерації її треба скопіювати й надіслати розробнику.";
    }
  }
}

function setupEvents() {
  renderModes();

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", toggleTheme);
  }

  if (wordGuessStartBtn) {
    wordGuessStartBtn.addEventListener("click", () => {
      startWordGuessGame();
    });
  }

  if (wordGuessBackBtn) {
    wordGuessBackBtn.addEventListener("click", () => {
      showScreen("menu");
    });
  }

  if (wordGuessTopMenuBtn) {
    wordGuessTopMenuBtn.addEventListener("click", () => {
      showScreen("menu");
    });
  }

  if (wordGuessHintBtn) {
    wordGuessHintBtn.addEventListener("click", showWordGuessHint);
  }

  if (wordGuessRulesBtn) {
    wordGuessRulesBtn.addEventListener("click", showWordGuessRules);
  }

  if (wordGuessInfoCloseBtn) {
    wordGuessInfoCloseBtn.addEventListener("click", closeWordGuessInfoModal);
  }

  if (wordGuessInfoModal) {
    wordGuessInfoModal.addEventListener("click", (event) => {
      if (event.target.matches("[data-word-guess-info-close]")) {
        closeWordGuessInfoModal();
      }
    });
  }

  if (wordGuessHistoryBtn) {
    wordGuessHistoryBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleWordGuessHistory();
    });
  }

  if (wordGuessHistoryPanel) {
    wordGuessHistoryPanel.addEventListener("click", (event) => {
      event.stopPropagation();
    });
  }

  if (wordGuessResultHistoryBtn) {
    wordGuessResultHistoryBtn.addEventListener("click", toggleWordGuessResultHistory);
  }

  if (wordGuessLikeBtn) {
    wordGuessLikeBtn.addEventListener("click", () => saveWordGuessFeedback("like"));
  }

  if (wordGuessDislikeBtn) {
    wordGuessDislikeBtn.addEventListener("click", () => saveWordGuessFeedback("dislike"));
  }

  if (wordGuessFeedbackExportBtn) {
    wordGuessFeedbackExportBtn.addEventListener("click", copyWordGuessFeedback);
  }

  if (wordGuessNewBtn) {
    wordGuessNewBtn.addEventListener("click", () => {
      startWordGuessGame();
    });
  }

  if (wordGuessMenuBtn) {
    wordGuessMenuBtn.addEventListener("click", () => {
      showScreen("menu");
    });
  }

  backToMenuBtn.addEventListener("click", () => {
    showScreen("menu");
  });

  menuExitButtons.forEach((button) => {
    button.addEventListener("click", handleMenuExitRequest);
  });

  if (stayInGameBtn) {
    stayInGameBtn.addEventListener("click", closeExitMenuModal);
  }

  if (confirmExitMenuBtn) {
    confirmExitMenuBtn.addEventListener("click", confirmExitToMenu);
  }

  if (exitMenuModal) {
    exitMenuModal.addEventListener("click", (event) => {
      if (event.target.matches("[data-exit-modal-close]")) {
        closeExitMenuModal();
      }
    });
  }

  document.addEventListener("keydown", (event) => {
    if (isScreenActive(wordGuessGameScreen)) {
      handleWordGuessPhysicalKey(event);
    }

    if (event.key === "Escape" && wordGuessInfoModal && !wordGuessInfoModal.hidden) {
      closeWordGuessInfoModal();
    }

    if (event.key === "Escape" && exitMenuModal && !exitMenuModal.hidden) {
      closeExitMenuModal();
    }

    if (event.key === "Escape") {
      closeWordGuessHistory();
      closeThemesPopover();
    }
  });

  if (gameCategoryName) {
    gameCategoryName.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleThemesPopover();
    });
  }

  if (gameThemesPopover) {
    gameThemesPopover.addEventListener("click", (event) => {
      event.stopPropagation();
    });
  }

  if (wordGuessKeyboard) {
    wordGuessKeyboard.addEventListener("click", (event) => {
      const keyButton = event.target.closest("[data-word-guess-key]");
      if (!keyButton) {
        return;
      }

      handleWordGuessInput(keyButton.dataset.wordGuessKey || "");
    });
  }

  document.addEventListener("click", (event) => {
    if (isWordGuessHistoryOpen
      && !wordGuessHistoryBtn?.contains(event.target)
      && !wordGuessHistoryPanel?.contains(event.target)) {
      closeWordGuessHistory();
    }

    if (!isThemesPopoverOpen) {
      return;
    }

    if (gameCategoryName?.contains(event.target) || gameThemesPopover?.contains(event.target)) {
      return;
    }

    closeThemesPopover();
  });

  window.addEventListener("resize", positionThemesPopover);
  window.addEventListener("scroll", positionThemesPopover, true);
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", positionThemesPopover);
    window.visualViewport.addEventListener("scroll", positionThemesPopover);
  }

  startRoundButtons.forEach((button) => {
    button.addEventListener("click", handleStartRound);
  });

  if (startTeamRoundBtn) {
    startTeamRoundBtn.addEventListener("click", () => {
      beginPreparedRound();
    });
  }

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

  if (lastWordBtn) {
    lastWordBtn.addEventListener("click", () => {
      allowLastWordAfterTime = true;
      syncLastWordButton();
      settingsMessage.textContent = "";
    });
  }

  if (lastWordStopBtn) {
    lastWordStopBtn.addEventListener("click", () => {
      allowLastWordAfterTime = false;
      syncLastWordButton();
      settingsMessage.textContent = "";
    });
  }

  if (teamNamesToggleBtn) {
    teamNamesToggleBtn.addEventListener("click", () => {
      const isExpanded = teamNamesToggleBtn.getAttribute("aria-expanded") === "true";
      syncTeamNamesVisibility(!isExpanded);
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
    if (isSwipeLocked || isRoundPaused) {
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
    finishRound("manual");
  });

  if (pauseRoundBtn) {
    pauseRoundBtn.addEventListener("click", toggleRoundPause);
  }

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

  if (confirmRoundBtn) {
    confirmRoundBtn.addEventListener("click", () => {
      confirmRoundResults();
    });
  }

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
  const activeModes = modeConfigs.filter((mode) => mode.available);
  const upcomingModes = modeConfigs.filter((mode) => !mode.available);
  const activeModesWrap = document.createElement("div");
  activeModesWrap.className = "active-mode-grid";

  activeModes.forEach((mode) => {
    const button = document.createElement("button");
    button.className = `mode-card mode-card-${mode.id} mode-card-active`;

    const modeIcons = {
      explain: "💬",
      charades: "🎭",
      wordguess: "🔤",
    };

    button.innerHTML = `
      <span class="mode-card-icon" aria-hidden="true">${modeIcons[mode.id] || "✨"}</span>
      <strong>${mode.title}</strong>
      <span class="mode-card-description">${mode.description}</span>
      <span class="mode-card-cta">Грати</span>
    `;

    button.addEventListener("click", async () => {
      selectedMode = mode.id;
      selectedCategories = [];
      selectedCategory = null;
      areCategoriesExpanded = false;

      if (isWordGuess()) {
        resetActiveGameState();
        document.body.dataset.mode = mode.id;
        document.body.classList.remove("single-card-mode");
        await loadWordGuessDictionary();
        showScreen("wordGuessSettings");
        return;
      }

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

    activeModesWrap.appendChild(button);
  });

  modeList.appendChild(activeModesWrap);

  if (upcomingModes.length > 0) {
    const upcomingBox = document.createElement("div");
    upcomingBox.className = "upcoming-modes";
    upcomingBox.innerHTML = `
      <div class="upcoming-modes-copy">
        <strong>Незабаром</strong>
        <span>Готуємо нові режими для компанії.</span>
      </div>
      <div class="upcoming-mode-chips">
        ${upcomingModes.map((mode) => `<span class="upcoming-mode-chip">${mode.title.replace(/\s*\([^)]*\)/g, "")}</span>`).join("")}
      </div>
    `;
    modeList.appendChild(upcomingBox);
  }
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
  if (lastWordSection) {
    lastWordSection.hidden = isCharadesMode;
  }

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

function syncLastWordButton() {
  if (!lastWordBtn && !lastWordStopBtn) {
    return;
  }

  if (lastWordBtn) {
    lastWordBtn.classList.toggle("selected", allowLastWordAfterTime);
    lastWordBtn.setAttribute("aria-pressed", String(allowLastWordAfterTime));
  }

  if (lastWordStopBtn) {
    lastWordStopBtn.classList.toggle("selected", !allowLastWordAfterTime);
    lastWordStopBtn.setAttribute("aria-pressed", String(!allowLastWordAfterTime));
  }
}

function syncTeamNamesVisibility(isExpanded) {
  if (!teamNamesToggleBtn || !teamNameFieldsWrap) {
    return;
  }

  teamNamesToggleBtn.classList.toggle("selected", isExpanded);
  teamNamesToggleBtn.setAttribute("aria-expanded", String(isExpanded));
  teamNamesToggleBtn.textContent = isExpanded ? "Назви команд ▴" : "Назви команд ▾";
  teamNameFieldsWrap.hidden = !isExpanded;
}

function isCharades() {
  return selectedMode === "charades";
}

function isWordGuess() {
  return selectedMode === "wordguess";
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
    return `1 тема: ${firstNames}`;
  }

  if (selectedCategories.length < 5) {
    return `${selectedCategories.length} теми: ${firstNames}`;
  }

  return `${selectedCategories.length} тем: ${firstNames}…`;
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

  if (selectedCategories.length > maxVisible) {
    return getThemeCountLabel(selectedCategories.length);
  }

  const visibleNames = selectedCategories.slice(0, maxVisible).map((category) => category.name);
  return visibleNames.join(", ");
}


function getThemeCountLabel(count) {
  const lastTwoDigits = count % 100;
  const lastDigit = count % 10;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return `${count} тем`;
  }

  if (lastDigit === 1) {
    return `${count} тема`;
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return `${count} теми`;
  }

  return `${count} тем`;
}

function getHudCategoryLabel() {
  if (selectedCategories.length === 0) {
    return "Усі теми";
  }

  if (selectedCategories.length === 1) {
    return selectedCategories[0].name;
  }

  if (selectedCategories.length >= 2 && selectedCategories.length <= 5) {
    const joinedNames = selectedCategories.map((category) => category.name).join(", ");
    const maxLabelLength = selectedCategories.length <= 2 ? 26 : selectedCategories.length <= 3 ? 34 : 46;
    return joinedNames.length <= maxLabelLength ? joinedNames : getThemeCountLabel(selectedCategories.length);
  }

  return getThemeCountLabel(selectedCategories.length);
}

function getHudCategoryLabelClass(label) {
  const count = selectedCategories.length;

  if (count === 0 || count === 1) {
    return "summary-title themes-label-short";
  }

  if (label === getThemeCountLabel(count)) {
    return "summary-title themes-label-count";
  }

  if (count <= 3) {
    return "summary-title themes-label-medium";
  }

  return "summary-title themes-label-long";
}

function getActiveThemeNames() {
  if (selectedCategories.length === 0) {
    return categories.map((category) => category.name);
  }

  return selectedCategories.map((category) => category.name);
}

function renderThemesPopover() {
  if (!gameThemesPopover) {
    return;
  }

  gameThemesPopover.innerHTML = "";

  const title = document.createElement("strong");
  title.className = "themes-popover-title";
  title.textContent = "Обрані теми";
  gameThemesPopover.appendChild(title);

  if (selectedCategories.length === 0) {
    const allThemesText = document.createElement("p");
    allThemesText.className = "themes-popover-note";
    allThemesText.textContent = "Усі теми";
    gameThemesPopover.appendChild(allThemesText);
    return;
  }

  const themeList = document.createElement("div");
  themeList.className = "themes-popover-list";

  getActiveThemeNames().forEach((themeName) => {
    const themeChip = document.createElement("span");
    themeChip.className = "themes-popover-chip";
    themeChip.textContent = themeName;
    themeList.appendChild(themeChip);
  });

  gameThemesPopover.appendChild(themeList);
}

function openThemesPopover() {
  if (!gameThemesPopover || !gameCategoryName) {
    return;
  }

  renderThemesPopover();
  gameThemesPopover.hidden = false;
  gameCategoryName.setAttribute("aria-expanded", "true");
  isThemesPopoverOpen = true;
  positionThemesPopover();
}

function closeThemesPopover() {
  if (!gameThemesPopover || !gameCategoryName) {
    return;
  }

  gameThemesPopover.hidden = true;
  gameThemesPopover.style.left = "";
  gameThemesPopover.style.top = "";
  gameThemesPopover.style.width = "";
  gameCategoryName.setAttribute("aria-expanded", "false");
  isThemesPopoverOpen = false;
}

function positionThemesPopover() {
  if (!isThemesPopoverOpen || !gameThemesPopover || !gameCategoryName || gameThemesPopover.hidden) {
    return;
  }

  const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 360;
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 640;
  const edgeGap = 12;
  const anchorGap = 8;
  const anchorRect = gameCategoryName.getBoundingClientRect();
  const maxWidth = Math.max(220, viewportWidth - edgeGap * 2);
  const preferredWidth = Math.min(Math.max(anchorRect.width, 260), 340, maxWidth);

  gameThemesPopover.style.width = `${preferredWidth}px`;

  const popoverRect = gameThemesPopover.getBoundingClientRect();
  const popoverWidth = popoverRect.width || preferredWidth;
  const popoverHeight = popoverRect.height || 0;
  let left = anchorRect.left;
  let top = anchorRect.bottom + anchorGap;

  if (left + popoverWidth > viewportWidth - edgeGap) {
    left = viewportWidth - popoverWidth - edgeGap;
  }

  if (left < edgeGap) {
    left = edgeGap;
  }

  if (top + popoverHeight > viewportHeight - edgeGap && anchorRect.top > popoverHeight + anchorGap + edgeGap) {
    top = anchorRect.top - popoverHeight - anchorGap;
  }

  if (top < edgeGap) {
    top = edgeGap;
  }

  gameThemesPopover.style.left = `${Math.round(left)}px`;
  gameThemesPopover.style.top = `${Math.round(top)}px`;
}

function toggleThemesPopover() {
  if (isThemesPopoverOpen) {
    closeThemesPopover();
    return;
  }

  openThemesPopover();
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
  gameCategoryName.setAttribute("aria-label", "Показати обрані теми");

  const label = getHudCategoryLabel();
  const title = document.createElement("span");
  title.className = getHudCategoryLabelClass(label);
  title.textContent = label;
  gameCategoryName.appendChild(title);

  const kindLabel = getTaskKindLabel();
  if (kindLabel && isCharades()) {
    const kindBadge = document.createElement("span");
    kindBadge.className = "summary-kind-badge";
    kindBadge.textContent = kindLabel;
    gameCategoryName.appendChild(kindBadge);
  }

  renderThemesPopover();
}

function renderWordMeta(entry) {
  if (!wordCategoryBadge) {
    return;
  }

  wordCategoryBadge.innerHTML = "";

  const leftGroup = document.createElement("div");
  leftGroup.className = "word-meta-group word-meta-left";

  const rightGroup = document.createElement("div");
  rightGroup.className = "word-meta-group word-meta-right";

  const categoryBadge = document.createElement("span");
  categoryBadge.className = "word-meta-badge word-meta-category";
  categoryBadge.textContent = (entry.categoryName || "Тема").toUpperCase();
  rightGroup.appendChild(categoryBadge);

  const difficulty = entry.difficulty || "medium";
  const difficultyBadge = document.createElement("span");
  difficultyBadge.className = `word-meta-badge word-meta-difficulty word-meta-difficulty-${difficulty}`;
  difficultyBadge.textContent = (entry.difficultyName || getDifficultyName(difficulty)).toUpperCase();
  leftGroup.appendChild(difficultyBadge);

  const kindLabel = getTaskKindLabel(entry.kind);
  if (kindLabel && isCharades()) {
    const kindBadge = document.createElement("span");
    kindBadge.className = "word-meta-badge word-meta-kind";
    kindBadge.textContent = kindLabel.toUpperCase();
    leftGroup.appendChild(kindBadge);
  }

  wordCategoryBadge.appendChild(leftGroup);
  wordCategoryBadge.appendChild(rightGroup);
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

function isScreenActive(screenElement) {
  return Boolean(screenElement && screenElement.classList.contains("active"));
}

function hasActiveGameProgress() {
  return teamScores.some((scoreValue) => scoreValue > 0)
    || roundWords.length > 0
    || score > 0
    || skipped > 0
    || playedRounds > 0
    || finalRoundActive
    || isScreenActive(teamReadyScreen)
    || isScreenActive(gameScreen)
    || isScreenActive(roundReviewScreen);
}

function resetActiveGameState() {
  clearInterval(timerId);
  timerId = null;
  setRoundPaused(false, { resumeTimer: false });
  wasTimerRunningBeforeExitModal = false;
  resetSwipeState();
  score = 0;
  skipped = 0;
  timeLeft = selectedDuration;
  roundResults = null;
  roundWords = [];
  currentEntry = null;
  currentWord = "";
  deck = [];
  isAwaitingLastWordResult = false;
  finalRoundActive = false;
  playedRounds = 0;

  if (roundTimeMessage) {
    roundTimeMessage.textContent = "";
  }

  if (skipBtn) {
    updateActionButtonLabels();
  }

  resetTeamScores();
}

function handleMenuExitRequest() {
  if (hasActiveGameProgress()) {
    openExitMenuModal();
    return;
  }

  confirmExitToMenu();
}

function openExitMenuModal() {
  if (!exitMenuModal) {
    confirmExitToMenu();
    return;
  }

  wasTimerRunningBeforeExitModal = Boolean(timerId && isScreenActive(gameScreen) && !isSingleCardMode());
  if (wasTimerRunningBeforeExitModal) {
    clearInterval(timerId);
    timerId = null;
  }

  exitMenuModal.hidden = false;
  document.body.classList.add("modal-open");

  if (stayInGameBtn) {
    stayInGameBtn.focus();
  }
}

function closeExitMenuModal() {
  if (!exitMenuModal) {
    return;
  }

  exitMenuModal.hidden = true;
  document.body.classList.remove("modal-open");

  if (wasTimerRunningBeforeExitModal && isScreenActive(gameScreen) && timeLeft > 0 && !isAwaitingLastWordResult && !isRoundPaused) {
    startTimer();
  }

  wasTimerRunningBeforeExitModal = false;
}

function confirmExitToMenu() {
  if (exitMenuModal) {
    exitMenuModal.hidden = true;
  }
  document.body.classList.remove("modal-open");
  resetActiveGameState();
  showScreen("menu");
}

function startRound() {
  resetSwipeState();
  setRoundPaused(false, { resumeTimer: false });
  score = 0;
  skipped = 0;
  timeLeft = selectedDuration;
  roundResults = null;
  roundWords = [];
  currentEntry = null;
  isAwaitingLastWordResult = false;
  if (roundTimeMessage) {
    roundTimeMessage.textContent = "";
  }

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
  updateTeamReadyScreen();

  showScreen("teamReady");
}

function beginPreparedRound() {
  resetSwipeState();
  setRoundPaused(false, { resumeTimer: false });
  isAwaitingLastWordResult = false;
  if (roundTimeMessage) {
    roundTimeMessage.textContent = "";
  }
  updateActionButtonLabels();

  showScreen("game");
  showNextWord();
  updateGameInfo();
  updateTeamScoreBoard();
  startTimer();
}

function startTimer() {
  clearInterval(timerId);

  if (isRoundPaused) {
    timerId = null;
    return;
  }

  timerId = setInterval(() => {
    timeLeft--;
    updateGameInfo();

    if (timeLeft <= 0) {
      finishRound("time");
    }
  }, 1000);
}

function getCurrentWordPool() {
  return getEffectiveSelectedCategories().flatMap((category) => getCategoryWordsByDifficulty(category));
}

function startSingleCardGame() {
  clearInterval(timerId);
  setRoundPaused(false, { resumeTimer: false });
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
  currentEntry = nextEntry;
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

function setRoundPaused(paused, options = {}) {
  const { resumeTimer = true } = options;
  const nextPausedState = Boolean(paused) && timeLeft > 0 && !isSingleCardMode() && isScreenActive(gameScreen) && !isAwaitingLastWordResult;
  isRoundPaused = nextPausedState;

  if (isRoundPaused) {
    clearInterval(timerId);
    timerId = null;
  }

  if (wordCard) {
    wordCard.classList.toggle("is-paused", isRoundPaused);
    wordCard.setAttribute("aria-busy", isRoundPaused ? "true" : "false");
  }

  if (gameScreen) {
    gameScreen.classList.toggle("is-paused", isRoundPaused);
  }

  if (pauseOverlay) {
    pauseOverlay.hidden = !isRoundPaused;
  }

  updatePauseControl();

  if (skipBtn) {
    skipBtn.disabled = isRoundPaused;
  }

  if (correctBtn) {
    correctBtn.disabled = isRoundPaused;
  }

  if (!isRoundPaused && resumeTimer && isScreenActive(gameScreen) && timeLeft > 0 && !isAwaitingLastWordResult && !isSingleCardMode()) {
    startTimer();
  }
}

function toggleRoundPause() {
  if (timeLeft <= 0) {
    return;
  }

  setRoundPaused(!isRoundPaused);
}

function updatePauseControl() {
  if (!pauseRoundBtn) {
    return;
  }

  const isTimeOver = timeLeft <= 0 && isScreenActive(gameScreen) && !isSingleCardMode();
  pauseRoundBtn.classList.toggle("is-ended", isTimeOver);
  pauseRoundBtn.setAttribute("aria-disabled", isTimeOver ? "true" : "false");

  if (isTimeOver) {
    pauseRoundBtn.setAttribute("aria-label", isAwaitingLastWordResult ? "Час вийшов. Дограйте слово" : "Час вийшов");
    pauseRoundBtn.setAttribute("aria-pressed", "false");

    if (pauseRoundIcon) {
      pauseRoundIcon.classList.remove("pause-icon-pause", "pause-icon-play");
      pauseRoundIcon.classList.add("pause-icon-ended");
    }

    if (pauseRoundLabel) {
      pauseRoundLabel.textContent = isAwaitingLastWordResult ? "Дограйте" : "Час вийшов";
    }

    return;
  }

  pauseRoundBtn.setAttribute("aria-label", isRoundPaused ? "Продовжити раунд" : "Поставити раунд на паузу");
  pauseRoundBtn.setAttribute("aria-pressed", isRoundPaused ? "true" : "false");

  if (pauseRoundIcon) {
    pauseRoundIcon.classList.remove("pause-icon-ended");
    pauseRoundIcon.classList.toggle("pause-icon-pause", !isRoundPaused);
    pauseRoundIcon.classList.toggle("pause-icon-play", isRoundPaused);
  }

  if (pauseRoundLabel) {
    pauseRoundLabel.textContent = isRoundPaused ? "Грати" : "Пауза";
  }
}

function updateActionButtonLabels() {
  if (skipBtn) {
    const skipLabel = isAwaitingLastWordResult ? "Не вгадано" : "Пропустити";
    skipBtn.textContent = `${skipLabel} · ${skipped}`;
  }

  if (correctBtn) {
    correctBtn.textContent = `Вгадано · ${score}`;
  }

}

function updateGameInfo() {
  timerText.textContent = timeLeft;
  updateActionButtonLabels();
  updatePauseControl();

  const currentTeamScore = (teamScores[currentTeamIndex] || 0) + score;
  const progressPercent = Math.min(100, Math.round((currentTeamScore / selectedTargetScore) * 100));
  if (teamProgressText) {
    teamProgressText.textContent = `${currentTeamScore}/${selectedTargetScore}`;
  }
  teamProgressFill.style.width = `${progressPercent}%`;

  const maxTime = selectedDuration;
  const timeProgressPercent = Math.max(0, Math.round((timeLeft / maxTime) * 100));
  if (roundProgressFill) {
    roundProgressFill.style.width = `${timeProgressPercent}%`;
  }

  if (timerRingProgress) {
    const timerRingLength = 2 * Math.PI * 31;
    const progressRatio = Math.max(0, Math.min(1, timeLeft / maxTime));
    timerRingProgress.style.strokeDasharray = `${timerRingLength}`;
    timerRingProgress.style.strokeDashoffset = `${timerRingLength * (1 - progressRatio)}`;
  }
}

function resetTeamScores() {
  teamScores = Array.from({ length: selectedTeamCount }, (_, index) => 0);
  roundsPlayedByTeam = Array.from({ length: selectedTeamCount }, () => 0);
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

function generateRandomTeamName(index) {
  const usedNames = new Set(teamNames.filter((name, teamIndex) => teamIndex !== index && name && name.trim()));
  const currentName = teamNames[index];
  const availableNames = funnyTeamNames.filter((name) => !usedNames.has(name) && name !== currentName);
  const namePool = availableNames.length > 0 ? availableNames : funnyTeamNames;
  const nextName = namePool[Math.floor(Math.random() * namePool.length)];

  teamNames[index] = nextName;
  renderTeamNameInputs();
  updateCurrentTeamDisplay();
  updateTeamScoreBoard();
  settingsMessage.textContent = "";
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
    label.textContent = getDefaultTeamName(index);

    const input = document.createElement("input");
    input.id = `teamName${index + 1}`;
    input.type = "text";
    input.placeholder = getDefaultTeamName(index);
    input.value = getTeamName(index);

    input.addEventListener("input", (event) => {
      teamNames[index] = event.target.value;
    });

    const fieldControl = document.createElement("div");
    fieldControl.className = "team-name-control";

    const randomNameButton = document.createElement("button");
    randomNameButton.className = "team-name-random-btn";
    randomNameButton.type = "button";
    randomNameButton.setAttribute("aria-label", `Згенерувати назву для ${getDefaultTeamName(index)}`);
    randomNameButton.textContent = "🎲";
    randomNameButton.addEventListener("click", () => {
      generateRandomTeamName(index);
    });

    fieldControl.appendChild(input);
    fieldControl.appendChild(randomNameButton);
    field.appendChild(label);
    field.appendChild(fieldControl);
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
    if (index === currentTeamIndex) {
      row.classList.add("current-team");
    }

    const visibleScore = includeCurrentRound && index === currentTeamIndex ? scoreValue + score : scoreValue;
    const progressPercent = Math.min(100, Math.round((visibleScore / selectedTargetScore) * 100));
    row.innerHTML = `
      <strong>${getTeamName(index)}</strong>
      <span>${visibleScore}/${selectedTargetScore}</span>
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
  currentTeamIndex = (currentTeamIndex + 1) % selectedTeamCount;
  startRound();
}

function startNewGame() {
  resetTeamScores();
  finalRoundActive = false;
  playedRounds = 0;
  showScreen("settings");
}


function updateTeamReadyScreen() {
  if (teamReadyName) {
    teamReadyName.textContent = getTeamName(currentTeamIndex);
  }

  if (teamReadyScore) {
    teamReadyScore.textContent = `\u041f\u043e\u0442\u043e\u0447\u043d\u0438\u0439 \u0440\u0430\u0445\u0443\u043d\u043e\u043a: ${teamScores[currentTeamIndex] || 0}`;
  }
}

function recordRoundWord(result) {
  if (!currentEntry) {
    return;
  }

  const alreadyRecorded = roundWords.some((item) => item.entryId === currentEntry);
  if (alreadyRecorded) {
    return;
  }

  roundWords.push({
    entryId: currentEntry,
    word: currentEntry.word,
    categoryName: currentEntry.categoryName,
    difficulty: currentEntry.difficulty,
    difficultyName: currentEntry.difficultyName,
    result,
  });
}

function recalculateRoundCounters() {
  score = roundWords.filter((item) => item.result === "guessed").length;
  skipped = roundWords.filter((item) => item.result === "skipped").length;
}

function shouldGuessLastWordAfterTime() {
  return !isCharades() && allowLastWordAfterTime;
}

function finishRound(reason = "manual") {
  clearInterval(timerId);
  timerId = null;
  setRoundPaused(false, { resumeTimer: false });

  if (isAwaitingLastWordResult) {
    return;
  }

  if (reason === "time" && currentEntry) {
    if (shouldGuessLastWordAfterTime()) {
      isAwaitingLastWordResult = true;
      updateActionButtonLabels();
      updatePauseControl();
      if (roundTimeMessage) {
        roundTimeMessage.textContent = "\u0427\u0430\u0441 \u0432\u0438\u0439\u0448\u043e\u0432. \u0417\u0430\u0432\u0435\u0440\u0448\u0456\u0442\u044c \u043f\u043e\u0442\u043e\u0447\u043d\u0435 \u0441\u043b\u043e\u0432\u043e.";
      }
      return;
    }

    // \u042f\u043a\u0449\u043e \u0434\u043e\u0432\u0433\u0430\u0434\u0443\u0432\u0430\u043d\u043d\u044f \u0432\u0438\u043c\u043a\u043d\u0435\u043d\u0435, \u0430\u043a\u0442\u0438\u0432\u043d\u0435 \u0441\u043b\u043e\u0432\u043e \u043f\u0456\u0441\u043b\u044f \u0441\u0438\u0433\u043d\u0430\u043b\u0443 \u0447\u0430\u0441\u0443 \u0432\u0432\u0430\u0436\u0430\u0454\u043c\u043e \u043d\u0435\u0432\u0433\u0430\u0434\u0430\u043d\u0438\u043c.
    recordRoundWord("skipped");
    recalculateRoundCounters();
  }

  showRoundReview();
}

function showRoundReview() {
  clearInterval(timerId);
  resetSwipeState();
  recalculateRoundCounters();
  renderRoundReview();
  showScreen("roundReview");
}

function renderRoundReview() {
  if (roundReviewTeamName) {
    roundReviewTeamName.textContent = getTeamName(currentTeamIndex);
  }

  if (roundReviewScore) {
    roundReviewScore.textContent = score;
  }

  if (roundReviewSkipped) {
    roundReviewSkipped.textContent = skipped;
  }

  renderRoundReviewProgress();

  if (confirmRoundBtn) {
    confirmRoundBtn.textContent = getRoundReviewActionLabel();
  }

  if (!roundReviewList) {
    return;
  }

  roundReviewList.innerHTML = "";

  if (roundWords.length === 0) {
    const emptyState = document.createElement("p");
    emptyState.className = "subtitle";
    emptyState.textContent = "\u0423 \u0446\u044c\u043e\u043c\u0443 \u0440\u0430\u0443\u043d\u0434\u0456 \u0449\u0435 \u043d\u0435\u043c\u0430\u0454 \u0441\u043b\u0456\u0432.";
    roundReviewList.appendChild(emptyState);
    return;
  }

  roundWords.forEach((item) => {
    const row = document.createElement("button");
    row.type = "button";
    row.className = `round-word-row ${item.result === "guessed" ? "is-guessed" : "is-skipped"}`;

    const main = document.createElement("span");
    main.className = "round-word-main";

    const word = document.createElement("span");
    word.className = "round-word-text";
    word.textContent = item.word;

    const meta = document.createElement("span");
    meta.className = "round-word-meta";

    const category = document.createElement("span");
    category.className = "round-word-category";
    category.textContent = formatReviewMetaText(item.categoryName);

    const separator = document.createElement("span");
    separator.className = "round-word-separator";
    separator.textContent = " \u00b7 ";

    const difficulty = document.createElement("em");
    difficulty.className = "round-word-difficulty";
    difficulty.textContent = formatReviewMetaText(item.difficultyName);

    meta.appendChild(category);
    meta.appendChild(separator);
    meta.appendChild(difficulty);

    const status = document.createElement("span");
    status.className = `round-word-status ${item.result === "guessed" ? "is-guessed" : "is-skipped"}`;
    status.textContent = item.result === "guessed" ? "\u0412\u0433\u0430\u0434\u0430\u043d\u043e" : "\u041d\u0435 \u0432\u0433\u0430\u0434\u0430\u043d\u043e";

    row.addEventListener("click", () => {
      item.result = item.result === "guessed" ? "skipped" : "guessed";
      recalculateRoundCounters();
      renderRoundReview();
    });

    main.appendChild(word);
    main.appendChild(meta);
    row.appendChild(main);
    row.appendChild(status);
    roundReviewList.appendChild(row);
  });
}

function formatReviewMetaText(value) {
  return String(value || "").toLocaleLowerCase("uk-UA");
}

function renderRoundReviewProgress() {
  if (!roundReviewProgress) {
    return;
  }

  roundReviewProgress.innerHTML = "";

  const heading = document.createElement("div");
  heading.className = "round-review-progress-heading";

  const title = document.createElement("strong");
  title.textContent = `${getTeamName(currentTeamIndex)}: +${score} за раунд`;

  const hint = document.createElement("span");
  hint.textContent = "Прогрес після зарахування";

  heading.appendChild(title);
  heading.appendChild(hint);
  roundReviewProgress.appendChild(heading);

  const list = document.createElement("div");
  list.className = "round-review-team-list";

  teamScores.slice(0, selectedTeamCount).forEach((scoreValue, index) => {
    const previewScore = index === currentTeamIndex ? scoreValue + score : scoreValue;
    const progressPercent = Math.min(100, Math.round((previewScore / selectedTargetScore) * 100));
    const row = document.createElement("div");
    row.className = "round-review-team-row";
    if (index === currentTeamIndex) {
      row.classList.add("current-team");
    }

    const name = document.createElement("strong");
    name.textContent = getTeamName(index);

    const total = document.createElement("span");
    total.textContent = `${previewScore}/${selectedTargetScore}`;

    const progress = document.createElement("div");
    progress.className = "progress-bar";

    const fill = document.createElement("span");
    fill.style.width = `${progressPercent}%`;

    progress.appendChild(fill);
    row.appendChild(name);
    row.appendChild(total);
    row.appendChild(progress);
    list.appendChild(row);
  });

  roundReviewProgress.appendChild(list);
}

function getRoundReviewActionLabel() {
  const previewScores = teamScores.slice(0, selectedTeamCount);
  previewScores[currentTeamIndex] = (previewScores[currentTeamIndex] || 0) + score;

  const previewRounds = roundsPlayedByTeam.slice(0, selectedTeamCount);
  previewRounds[currentTeamIndex] = (previewRounds[currentTeamIndex] || 0) + 1;

  const nextFinalRoundActive = finalRoundActive || previewScores.some((scoreValue) => scoreValue >= selectedTargetScore);
  const equalRounds = previewRounds.every((roundCount) => roundCount === previewRounds[0]);

  if (nextFinalRoundActive && equalRounds) {
    return "Показати переможця";
  }

  return "Наступна команда";
}

function getActiveRoundsPlayed() {
  return roundsPlayedByTeam.slice(0, selectedTeamCount);
}

function hasAnyTeamReachedTarget() {
  return teamScores.slice(0, selectedTeamCount).some((scoreValue) => scoreValue >= selectedTargetScore);
}

function haveActiveTeamsCompletedSameRound() {
  const activeRounds = getActiveRoundsPlayed();
  if (activeRounds.length === 0) {
    return false;
  }

  return activeRounds.every((roundCount) => roundCount === activeRounds[0]);
}

function confirmRoundResults() {
  recalculateRoundCounters();
  playedRounds += 1;

  const teamName = getTeamName(currentTeamIndex);
  const pointsEarned = score;
  teamScores[currentTeamIndex] += pointsEarned;
  roundsPlayedByTeam[currentTeamIndex] = (roundsPlayedByTeam[currentTeamIndex] || 0) + 1;

  roundResults = {
    teamName,
    score,
    skipped,
    pointsEarned,
    words: roundWords.map(({ entryId, ...item }) => item),
  };

  finalScoreText.textContent = score;
  finalSkippedText.textContent = skipped;

  if (score >= 10) {
    resultPhrase.textContent = `\u0421\u0438\u043b\u044c\u043d\u043e! ${teamName} \u0432\u043f\u043e\u0440\u0430\u043b\u0430\u0441\u044c \u0434\u0443\u0436\u0435 \u0434\u043e\u0431\u0440\u0435.`;
  } else if (score >= 5) {
    resultPhrase.textContent = `${teamName} \u043d\u0435 \u0437\u043b\u0430\u043c\u0430\u043b\u0430\u0441\u044c. \u041d\u0430\u0441\u0442\u0443\u043f\u043d\u0438\u0439 \u0440\u0430\u0443\u043d\u0434 \u0431\u0443\u0434\u0435 \u0449\u0435 \u043a\u0440\u0430\u0449\u0438\u043c.`;
  } else {
    resultPhrase.textContent = `${teamName} \u043c\u0430\u0454 \u0449\u0435 \u0448\u0430\u043d\u0441. \u041d\u0430\u0441\u0442\u0443\u043f\u043d\u0438\u0439 \u0440\u0430\u0443\u043d\u0434 \u0431\u0443\u0434\u0435 \u0449\u0435 \u043a\u0440\u0430\u0449\u0438\u043c.`;
  }

  if (!finalRoundActive && hasAnyTeamReachedTarget()) {
    finalRoundActive = true;
  }

  if (finalRoundActive && haveActiveTeamsCompletedSameRound()) {
    showWinnerScreen();
    return;
  }

  startNextTeamRound();
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
  closeThemesPopover();
  if (screenName !== "wordGuessGame") {
    setWordGuessBackgroundLocked(false);
  }
  document.body.dataset.screen = screenName;

  menuScreen.classList.remove("active");
  settingsScreen.classList.remove("active");
  wordGuessSettingsScreen?.classList.remove("active");
  wordGuessGameScreen?.classList.remove("active");
  teamReadyScreen.classList.remove("active");
  gameScreen.classList.remove("active");
  roundReviewScreen.classList.remove("active");
  resultScreen.classList.remove("active");
  winnerScreen.classList.remove("active");

  if (screenName === "menu") {
    settingsMessage.textContent = "";
    menuScreen.classList.add("active");
  }

  if (screenName === "settings") {
    settingsScreen.classList.add("active");
  }

  if (screenName === "wordGuessSettings") {
    wordGuessSettingsScreen?.classList.add("active");
  }

  if (screenName === "wordGuessGame") {
    wordGuessGameScreen?.classList.add("active");
  }

  if (screenName === "teamReady") {
    teamReadyScreen.classList.add("active");
  }

  if (screenName === "game") {
    gameScreen.classList.add("active");
  }

  if (screenName === "roundReview") {
    roundReviewScreen.classList.add("active");
  }

  if (screenName === "result") {
    resultScreen.classList.add("active");
  }

  if (screenName === "winner") {
    winnerScreen.classList.add("active");
  }
}

function handleSwipe(swipeDistance) {
  if (isSwipeLocked || isRoundPaused) {
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
  if (isSwipeLocked || isRoundPaused) {
    return;
  }

  handleRoundWordResult("guessed", "fly-up");
}

function markSkipped() {
  if (isSwipeLocked || isRoundPaused) {
    return;
  }

  handleRoundWordResult("skipped", "fly-down");
}

function handleRoundWordResult(result, animationClass) {
  isSwipeLocked = true;

  recordRoundWord(result);
  recalculateRoundCounters();
  updateGameInfo();

  if (result === "guessed") {
    updateTeamScoreBoard(true);
    playCorrectSound();
  } else {
    playSkipSound();
  }

  animateWordCard(animationClass);

  clearWordActionTimeout();
  wordActionTimeoutId = setTimeout(() => {
    if (isAwaitingLastWordResult) {
      isAwaitingLastWordResult = false;
      wordActionTimeoutId = null;
      resetWordCardPosition();
      showRoundReview();
      return;
    }

    currentEntry = null;
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
