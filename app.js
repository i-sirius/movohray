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
const DATA_VERSION = "0.6.4a";
const DATA_BUILD = "2026-08-16";
const DATA_REVISION = `${DATA_VERSION}-${DATA_BUILD.replace(/-/g, "")}`;
const ASSET_REVISION = DATA_REVISION;
const VERSION_CHECK_FILE = "version.json";
const VERSION_CHECK_TIMEOUT_MS = 4500;
const SERVICE_WORKER_UPDATE_TIMEOUT_MS = 15000;
const SERVICE_WORKER_ACTIVATION_TIMEOUT_MS = 45000;
const UPDATE_TARGET_STORAGE_KEY = "movohray-update-target-revision";
const THEME_STORAGE_KEY = "movohray-theme";
const SOUND_STORAGE_KEY = "movohray-sound";
const HAPTIC_STORAGE_KEY = "movohray-haptic";
const WORD_CARD_SETTINGS_STORAGE_KEY = "movohray-word-card-settings-v2";
const WORD_CARD_SHAPES = [
  { id: "organic", className: "word-card-shape-organic", label: "М’яка шайба" },
  { id: "splat", className: "word-card-shape-splat", label: "Асиметрична клякса" },
  { id: "pebble", className: "word-card-shape-pebble", label: "Камінчик / жетон" },
  { id: "sticker", className: "word-card-shape-sticker", label: "Стікер-клякса" },
  { id: "cloud", className: "word-card-shape-cloud", label: "Хмаринка" },
  { id: "splash", className: "word-card-shape-splash", label: "Крапля-сплеш" },
  { id: "gummy", className: "word-card-shape-gummy", label: "Жуйка / мармелад" },
  { id: "paper", className: "word-card-shape-paper", label: "Паперова пляма" },
];
const WORD_CARD_SHAPE_CLASS_NAMES = WORD_CARD_SHAPES.map((shape) => shape.className);
const WORD_CARD_SHAPE_ID_SET = new Set(WORD_CARD_SHAPES.map((shape) => shape.id));
const WORD_CARD_OUTLINE_MODES = new Set(["off", "random", "on"]);
const WORD_CARD_FLIGHT_DURATION_MS = 320;
const DEFAULT_WORD_CARD_SETTINGS = {
  useAllShapes: true,
  enabledShapes: WORD_CARD_SHAPES.map((shape) => shape.id),
  randomColors: true,
  outlineModes: {
    light: "random",
    dark: "random",
  },
};
const WORD_CARD_LIGHT_PALETTES = [
  { fillTop: "#fff8ea", fillBottom: "#fdeacc", outline: "rgba(255,255,255,0.96)", text: "#2f3a67" },
  { fillTop: "#dff7fb", fillBottom: "#bdeff4", outline: "rgba(255,255,255,0.96)", text: "#27435f" },
  { fillTop: "#ffe0ee", fillBottom: "#f8b7d4", outline: "rgba(255,250,253,0.96)", text: "#4a2949" },
  { fillTop: "#f0f8cf", fillBottom: "#cfe88a", outline: "rgba(255,255,247,0.96)", text: "#324126" },
  { fillTop: "#efe8ff", fillBottom: "#d9cbff", outline: "rgba(255,255,255,0.95)", text: "#372d68" },
  { fillTop: "#ffe6d7", fillBottom: "#f6c78f", outline: "rgba(255,251,246,0.95)", text: "#563825" },
];
const WORD_CARD_DARK_PALETTES = [
  { fillTop: "#39476f", fillBottom: "#243052", outline: "rgba(222, 230, 255, 0.90)", text: "#eef2ff" },
  { fillTop: "#225a63", fillBottom: "#173f4d", outline: "rgba(205, 245, 250, 0.86)", text: "#e7fcff" },
  { fillTop: "#693352", fillBottom: "#47223a", outline: "rgba(255, 226, 241, 0.86)", text: "#ffe9f5" },
  { fillTop: "#5d6121", fillBottom: "#3e4317", outline: "rgba(240, 248, 196, 0.84)", text: "#f8fbe3" },
  { fillTop: "#51417c", fillBottom: "#362a56", outline: "rgba(232, 225, 255, 0.86)", text: "#f2eeff" },
  { fillTop: "#6a4423", fillBottom: "#4c3017", outline: "rgba(255, 234, 209, 0.85)", text: "#fff3e6" },
];
let wordCardSettings = null;
let lastWordCardShapeId = "";
let currentWordCardShapeId = "";
let lastWordCardPaletteIndexByTheme = { light: -1, dark: -1 };
const LEGACY_IOS_MATCH = /OS (?:9|10|11|12)_/i.test(navigator.userAgent || "");
if (LEGACY_IOS_MATCH) {
  document.documentElement.classList.add("legacy-ios");
}
const GAME_SOUND_MASTER_VOLUME = 0.28;
const GAME_SOUND_LEVELS = {
  ui: 0.18,
  feedback: 0.7,
  transition: 0.55,
  round: 0.8,
  finale: 0.95,
};
const GAME_SOUND_PATTERNS = {
  uiClick: [
    { frequency: 520, start: 0, duration: 0.08, volume: 0.08, type: "triangle", level: "ui", attack: 0.012, release: 0.06 },
  ],
  uiOpen: [
    { frequency: 392, start: 0, duration: 0.14, volume: 0.08, type: "sine", level: "ui", attack: 0.012, release: 0.1 },
    { frequency: 587, start: 0.08, duration: 0.14, volume: 0.06, type: "triangle", level: "ui", attack: 0.012, release: 0.12 },
  ],
  uiClose: [
    { frequency: 440, start: 0, duration: 0.14, volume: 0.055, type: "sine", level: "ui", attack: 0.012, release: 0.1 },
    { frequency: 330, start: 0.07, duration: 0.14, volume: 0.045, type: "triangle", level: "ui", attack: 0.012, release: 0.11 },
  ],
  positiveTick: [
    { frequency: 523.25, start: 0, duration: 0.16, volume: 0.18, type: "sine", level: "feedback", attack: 0.01, release: 0.12 },
    { frequency: 659.25, start: 0.09, duration: 0.18, volume: 0.14, type: "triangle", level: "feedback", attack: 0.012, release: 0.16 },
  ],
  correct: [
    { frequency: 523.25, start: 0, duration: 0.26, volume: 0.34, type: "sine", level: "feedback", attack: 0.012, release: 0.2 },
    { frequency: 659.25, start: 0.13, duration: 0.26, volume: 0.28, type: "triangle", level: "feedback", attack: 0.012, release: 0.22 },
    { frequency: 783.99, start: 0.28, duration: 0.18, volume: 0.18, type: "sine", level: "feedback", attack: 0.008, release: 0.16 },
    { frequency: 1174.66, start: 0.38, duration: 0.11, volume: 0.06, type: "sine", level: "ui", attack: 0.006, release: 0.08 },
  ],
  wrong: [
    { frequency: 196, start: 0, duration: 0.19, volume: 0.24, type: "triangle", level: "feedback", attack: 0.012, release: 0.16 },
    { frequency: 146.83, start: 0.055, duration: 0.14, volume: 0.1, type: "sine", level: "feedback", attack: 0.012, release: 0.12 },
  ],
  skipped: [
    { frequency: 392, glideTo: 261.63, start: 0, duration: 0.28, volume: 0.24, type: "triangle", level: "feedback", attack: 0.014, release: 0.2 },
    { frequency: 523.25, glideTo: 392, start: 0.08, duration: 0.18, volume: 0.08, type: "sine", level: "ui", attack: 0.012, release: 0.14 },
    { frequency: 220, start: 0.27, duration: 0.06, volume: 0.07, type: "sine", level: "ui", attack: 0.006, release: 0.05 },
  ],
  turnChange: [
    { frequency: 349.23, start: 0, duration: 0.16, volume: 0.16, type: "sine", level: "transition", attack: 0.012, release: 0.13 },
    { frequency: 440, start: 0.12, duration: 0.18, volume: 0.14, type: "triangle", level: "transition", attack: 0.012, release: 0.15 },
  ],
  roundStart: [
    { frequency: 329.63, start: 0, duration: 0.16, volume: 0.18, type: "sine", level: "round", attack: 0.014, release: 0.13 },
    { frequency: 493.88, start: 0.12, duration: 0.18, volume: 0.2, type: "triangle", level: "round", attack: 0.014, release: 0.14 },
    { frequency: 659.25, start: 0.27, duration: 0.2, volume: 0.16, type: "sine", level: "round", attack: 0.014, release: 0.16 },
  ],
  roundComplete: [
    { frequency: 392, start: 0, duration: 0.28, volume: 0.28, type: "triangle", level: "round", attack: 0.016, release: 0.22 },
    { frequency: 493.88, start: 0.2, duration: 0.28, volume: 0.28, type: "sine", level: "round", attack: 0.016, release: 0.22 },
    { frequency: 587.33, start: 0.42, duration: 0.34, volume: 0.24, type: "triangle", level: "round", attack: 0.016, release: 0.28 },
  ],
  gameComplete: [
    { frequency: 261.63, start: 0, duration: 0.34, volume: 0.24, type: "sine", level: "finale", attack: 0.018, release: 0.26 },
    { frequency: 329.63, start: 0.18, duration: 0.34, volume: 0.26, type: "triangle", level: "finale", attack: 0.018, release: 0.26 },
    { frequency: 392, start: 0.36, duration: 0.36, volume: 0.28, type: "sine", level: "finale", attack: 0.018, release: 0.28 },
    { frequency: 523.25, start: 0.58, duration: 0.4, volume: 0.24, type: "triangle", level: "finale", attack: 0.018, release: 0.34 },
    { frequency: 783.99, start: 0.86, duration: 0.28, volume: 0.12, type: "sine", level: "ui", attack: 0.01, release: 0.22 },
  ],
  gameLoss: [
    { frequency: 329.63, glideTo: 261.63, start: 0, duration: 0.28, volume: 0.2, type: "triangle", level: "finale", attack: 0.016, release: 0.22 },
    { frequency: 246.94, glideTo: 196, start: 0.22, duration: 0.3, volume: 0.18, type: "sine", level: "finale", attack: 0.016, release: 0.24 },
    { frequency: 174.61, start: 0.52, duration: 0.18, volume: 0.1, type: "triangle", level: "feedback", attack: 0.014, release: 0.14 },
  ],
  tie: [
    { frequency: 392, start: 0, duration: 0.42, volume: 0.2, type: "sine", level: "finale", attack: 0.018, release: 0.3 },
    { frequency: 493.88, start: 0.04, duration: 0.42, volume: 0.18, type: "triangle", level: "finale", attack: 0.018, release: 0.3 },
    { frequency: 587.33, start: 0.08, duration: 0.46, volume: 0.16, type: "sine", level: "finale", attack: 0.018, release: 0.34 },
  ],
  reveal: [
    { frequency: 659.25, start: 0, duration: 0.13, volume: 0.09, type: "sine", level: "ui", attack: 0.01, release: 0.1 },
    { frequency: 987.77, start: 0.08, duration: 0.18, volume: 0.075, type: "sine", level: "ui", attack: 0.008, release: 0.14 },
  ],
  medal: [
    { frequency: 783.99, start: 0, duration: 0.12, volume: 0.1, type: "sine", level: "ui", attack: 0.008, release: 0.1 },
    { frequency: 1174.66, start: 0.1, duration: 0.16, volume: 0.08, type: "sine", level: "ui", attack: 0.008, release: 0.13 },
  ],
  countdown: [
    { frequency: 659.25, start: 0, duration: 0.08, volume: 0.1, type: "triangle", level: "ui", attack: 0.008, release: 0.06 },
  ],
};
const GAME_SOUND_FILE_MAP = {
  correct: getRevisionedAssetUrl("assets/sounds/correct.ogg"),
  skipped: getRevisionedAssetUrl("assets/sounds/skipped.ogg"),
  wrong: getRevisionedAssetUrl("assets/sounds/wrong.ogg"),
  turnChange: getRevisionedAssetUrl("assets/sounds/turn-change.ogg"),
  roundStart: getRevisionedAssetUrl("assets/sounds/round-start.ogg"),
  countdown: getRevisionedAssetUrl("assets/sounds/countdown.ogg"),
  roundComplete: getRevisionedAssetUrl("assets/sounds/round-complete.ogg"),
  reveal: getRevisionedAssetUrl("assets/sounds/reveal.ogg"),
  gameComplete: getRevisionedAssetUrl("assets/sounds/game-win.ogg"),
  gameLoss: getRevisionedAssetUrl("assets/sounds/game-loss.ogg"),
  tie: getRevisionedAssetUrl("assets/sounds/game-tie.ogg"),
  medal: getRevisionedAssetUrl("assets/sounds/medal.ogg"),
};
const WORD_GUESS_FEEDBACK_STORAGE_KEY = "movohray-wordguess-feedback-v1";
const WORD_GUESS_MODE_STORAGE_KEY = "movohray-wordguess-mode";
const WORD_GUESS_LENGTH_STORAGE_KEY = "movohray-wordguess-length";
const WORD_GUESS_ATTEMPTS_STORAGE_KEY = "movohray-wordguess-attempts";
const WORD_GUESS_REPEATS_STORAGE_KEY = "movohray-wordguess-repeats";
const WORD_GUESS_LANGUAGE_STORAGE_KEY = "movohray-wordguess-language-v1";
const WORD_GUESS_LABS_STORAGE_KEY = "movohray-labs-unlocked-v1";
const WORD_GUESS_ACHIEVEMENTS_STORAGE_KEY = "movohray-wordguess-achievements-v2";
const WORD_GUESS_HINT_NUDGE_DELAY_MS = 24000;
const WORD_GUESS_HINT_NUDGE_VISIBLE_MS = 6500;
const WORD_GUESS_ACHIEVEMENT_TOAST_HOLD_MS = 9000;
const WORD_GUESS_ACHIEVEMENT_TOAST_EXIT_MS = 650;
const WORD_GUESS_FUTURE_FEATURES = Object.freeze({ timedModeUi: false, multiplayerUi: false, developerFeedbackPlaceholder: true });
const MOVOHRAY_USER_RESET_STORAGE_KEYS = [THEME_STORAGE_KEY, SOUND_STORAGE_KEY, HAPTIC_STORAGE_KEY, WORD_CARD_SETTINGS_STORAGE_KEY, WORD_GUESS_MODE_STORAGE_KEY, WORD_GUESS_LENGTH_STORAGE_KEY, WORD_GUESS_ATTEMPTS_STORAGE_KEY, WORD_GUESS_REPEATS_STORAGE_KEY, WORD_GUESS_LANGUAGE_STORAGE_KEY, WORD_GUESS_LABS_STORAGE_KEY, WORD_GUESS_ACHIEVEMENTS_STORAGE_KEY];
const WORD_GUESS_ACHIEVEMENTS = [
  { id: "first-win", reward: "🏆", titleKey: "achievementFirstWinTitle", descriptionKey: "achievementFirstWinDescription", category: "milestones" },
  { id: "first-try", reward: "🎯", titleKey: "achievementFirstTryTitle", descriptionKey: "achievementFirstTryDescription", category: "skill" },
  { id: "no-hints", reward: "🧠", titleKey: "achievementNoHintsTitle", descriptionKey: "achievementNoHintsDescription", category: "hints" },
  { id: "uk-win", reward: "🇺🇦", titleKey: "achievementUkWinTitle", descriptionKey: "achievementUkWinDescription", category: "languages" },
  { id: "ru-win", reward: "🧪", titleKey: "achievementRuWinTitle", descriptionKey: "achievementRuWinDescription", category: "languages" },
  { id: "en-win", reward: "🔬", titleKey: "achievementEnWinTitle", descriptionKey: "achievementEnWinDescription", category: "languages" },
  { id: "labs-duo", reward: "🧬", titleKey: "achievementLabsDuoTitle", descriptionKey: "achievementLabsDuoDescription", category: "languages" },
  { id: "polyglot", reward: "🌍", titleKey: "achievementPolyglotTitle", descriptionKey: "achievementPolyglotDescription", category: "languages" },
  { id: "clean-win", reward: "✨", titleKey: "achievementCleanWinTitle", descriptionKey: "achievementCleanWinDescription", category: "skill" },
  { id: "one-hint", reward: "🔎", titleKey: "achievementOneHintTitle", descriptionKey: "achievementOneHintDescription", category: "hints" },
  { id: "full-hints", reward: "🧩", titleKey: "achievementFullHintsTitle", descriptionKey: "achievementFullHintsDescription", category: "hints", mystery: true, hintKey: "achievementFullHintsHint" },
  { id: "last-chance", reward: "🫀", titleKey: "achievementLastChanceTitle", descriptionKey: "achievementLastChanceDescription", category: "skill" },
  { id: "speedrun", reward: "⚡", titleKey: "achievementSpeedrunTitle", descriptionKey: "achievementSpeedrunDescription", category: "skill" },
  { id: "seven-letter", reward: "🦒", titleKey: "achievementSevenLetterTitle", descriptionKey: "achievementSevenLetterDescription", category: "skill" },
  { id: "repeat-master", reward: "♻️", titleKey: "achievementRepeatMasterTitle", descriptionKey: "achievementRepeatMasterDescription", category: "patterns" },
  { id: "traffic-light", reward: "🚦", titleKey: "achievementTrafficLightTitle", descriptionKey: "achievementTrafficLightDescription", category: "patterns", mystery: true, hintKey: "achievementTrafficLightHint" },
  { id: "yellow-storm", reward: "🌕", titleKey: "achievementYellowStormTitle", descriptionKey: "achievementYellowStormDescription", category: "patterns" },
  { id: "green-wave", reward: "🍀", titleKey: "achievementGreenWaveTitle", descriptionKey: "achievementGreenWaveDescription", category: "patterns" },
  { id: "alphabet-tour", reward: "🧳", titleKey: "achievementAlphabetTourTitle", descriptionKey: "achievementAlphabetTourDescription", category: "patterns" },
  { id: "stubborn", reward: "🛡️", titleKey: "achievementStubbornTitle", descriptionKey: "achievementStubbornDescription", category: "chaos" },
  { id: "chaos-agent", reward: "🤡", titleKey: "achievementChaosAgentTitle", descriptionKey: "achievementChaosAgentDescription", category: "chaos" },
  { id: "comeback", reward: "🔥", titleKey: "achievementComebackTitle", descriptionKey: "achievementComebackDescription", category: "chaos" },
  { id: "almost", reward: "😬", titleKey: "achievementAlmostTitle", descriptionKey: "achievementAlmostDescription", category: "chaos", mystery: true, hintKey: "achievementAlmostHint" },
  { id: "five-wins", reward: "🥉", titleKey: "achievementFiveWinsTitle", descriptionKey: "achievementFiveWinsDescription", category: "milestones" },
  { id: "ten-wins", reward: "🥈", titleKey: "achievementTenWinsTitle", descriptionKey: "achievementTenWinsDescription", category: "milestones" },
  { id: "twenty-five-wins", reward: "🥇", titleKey: "achievementTwentyFiveWinsTitle", descriptionKey: "achievementTwentyFiveWinsDescription", category: "milestones" },
  { id: "three-streak", reward: "🔥", titleKey: "achievementThreeStreakTitle", descriptionKey: "achievementThreeStreakDescription", category: "streaks" },
  { id: "ten-games", reward: "🎲", titleKey: "achievementTenGamesTitle", descriptionKey: "achievementTenGamesDescription", category: "milestones" },
  { id: "twenty-five-games", reward: "🕹️", titleKey: "achievementTwentyFiveGamesTitle", descriptionKey: "achievementTwentyFiveGamesDescription", category: "milestones" },
  { id: "five-letter-win", reward: "🖐️", titleKey: "achievementFiveLetterWinTitle", descriptionKey: "achievementFiveLetterWinDescription", category: "skill" },
  { id: "six-letter-win", reward: "🎩", titleKey: "achievementSixLetterWinTitle", descriptionKey: "achievementSixLetterWinDescription", category: "skill" },
  { id: "all-lengths", reward: "📏", titleKey: "achievementAllLengthsTitle", descriptionKey: "achievementAllLengthsDescription", category: "skill" },
  { id: "two-try", reward: "✌️", titleKey: "achievementTwoTryTitle", descriptionKey: "achievementTwoTryDescription", category: "skill" },
  { id: "all-yellow", reward: "🟡", titleKey: "achievementAllYellowTitle", descriptionKey: "achievementAllYellowDescription", category: "patterns", mystery: true, hintKey: "achievementAllYellowHint" },
  { id: "all-gray", reward: "🌑", titleKey: "achievementAllGrayTitle", descriptionKey: "achievementAllGrayDescription", category: "patterns" },
  { id: "hot-hand", reward: "🌶️", titleKey: "achievementHotHandTitle", descriptionKey: "achievementHotHandDescription", category: "patterns" },
  { id: "repeat-guess", reward: "🔁", titleKey: "achievementRepeatGuessTitle", descriptionKey: "achievementRepeatGuessDescription", category: "patterns", mystery: true, hintKey: "achievementRepeatGuessHint" },
  { id: "alphabet-explorer", reward: "🧭", titleKey: "achievementAlphabetExplorerTitle", descriptionKey: "achievementAlphabetExplorerDescription", category: "patterns", mystery: true, hintKey: "achievementAlphabetExplorerHint" },
  { id: "five-hints-total", reward: "💡", titleKey: "achievementFiveHintsTotalTitle", descriptionKey: "achievementFiveHintsTotalDescription", category: "hints" },
  { id: "ten-hints-total", reward: "🔦", titleKey: "achievementTenHintsTotalTitle", descriptionKey: "achievementTenHintsTotalDescription", category: "hints" },
  { id: "twenty-five-hints-total", reward: "🛟", titleKey: "achievementTwentyFiveHintsTotalTitle", descriptionKey: "achievementTwentyFiveHintsTotalDescription", category: "hints" },
  { id: "ten-invalid-total", reward: "🧱", titleKey: "achievementTenInvalidTotalTitle", descriptionKey: "achievementTenInvalidTotalDescription", category: "chaos" },
  { id: "twenty-five-invalid-total", reward: "🪨", titleKey: "achievementTwentyFiveInvalidTotalTitle", descriptionKey: "achievementTwentyFiveInvalidTotalDescription", category: "chaos" },
  { id: "fifty-invalid-total", reward: "💥", titleKey: "achievementFiftyInvalidTotalTitle", descriptionKey: "achievementFiftyInvalidTotalDescription", category: "chaos" },
  { id: "fifty-wins", reward: "👑", titleKey: "achievementFiftyWinsTitle", descriptionKey: "achievementFiftyWinsDescription", category: "milestones" },
  { id: "fifty-games", reward: "🎮", titleKey: "achievementFiftyGamesTitle", descriptionKey: "achievementFiftyGamesDescription", category: "milestones" },
  { id: "hundred-games", reward: "🏛️", titleKey: "achievementHundredGamesTitle", descriptionKey: "achievementHundredGamesDescription", category: "milestones" },
  { id: "five-streak", reward: "🌋", titleKey: "achievementFiveStreakTitle", descriptionKey: "achievementFiveStreakDescription", category: "streaks" },
  { id: "ten-streak", reward: "☄️", titleKey: "achievementTenStreakTitle", descriptionKey: "achievementTenStreakDescription", category: "streaks", mystery: true, hintKey: "achievementTenStreakHint" },
  { id: "five-first-try", reward: "🏹", titleKey: "achievementFiveFirstTryTitle", descriptionKey: "achievementFiveFirstTryDescription", category: "streaks" },
  { id: "ten-first-try", reward: "🦅", titleKey: "achievementTenFirstTryTitle", descriptionKey: "achievementTenFirstTryDescription", category: "streaks" },
  { id: "five-no-hint", reward: "🧠", titleKey: "achievementFiveNoHintTitle", descriptionKey: "achievementFiveNoHintDescription", category: "hints" },
  { id: "ten-no-hint", reward: "🧙", titleKey: "achievementTenNoHintTitle", descriptionKey: "achievementTenNoHintDescription", category: "hints" },
  { id: "five-seven-letter", reward: "🦕", titleKey: "achievementFiveSevenLetterTitle", descriptionKey: "achievementFiveSevenLetterDescription", category: "skill" },
  { id: "ten-seven-letter", reward: "🐉", titleKey: "achievementTenSevenLetterTitle", descriptionKey: "achievementTenSevenLetterDescription", category: "skill" },
  { id: "language-tourist", reward: "🧳", titleKey: "achievementLanguageTouristTitle", descriptionKey: "achievementLanguageTouristDescription", category: "languages" },
  { id: "language-veteran", reward: "🛂", titleKey: "achievementLanguageVeteranTitle", descriptionKey: "achievementLanguageVeteranDescription", category: "languages", mystery: true, hintKey: "achievementLanguageVeteranHint" },
  { id: "two-hints", reward: "👀", titleKey: "achievementTwoHintsTitle", descriptionKey: "achievementTwoHintsDescription", category: "hints" },
  { id: "five-last-chance", reward: "🧨", titleKey: "achievementFiveLastChanceTitle", descriptionKey: "achievementFiveLastChanceDescription", category: "skill" },
  { id: "seven-first-try", reward: "🔮", titleKey: "achievementSevenFirstTryTitle", descriptionKey: "achievementSevenFirstTryDescription", category: "skill", mystery: true, hintKey: "achievementSevenFirstTryHint" },
  { id: "flash-15", reward: "💫", titleKey: "achievementFlash15Title", descriptionKey: "achievementFlash15Description", category: "skill" },
  { id: "marathon", reward: "🐢", titleKey: "achievementMarathonTitle", descriptionKey: "achievementMarathonDescription", category: "skill", mystery: true, hintKey: "achievementMarathonHint" },
  { id: "phoenix", reward: "🪽", titleKey: "achievementPhoenixTitle", descriptionKey: "achievementPhoenixDescription", category: "chaos", mystery: true, hintKey: "achievementPhoenixHint" },
  { id: "zero-to-word", reward: "🚀", titleKey: "achievementZeroToWordTitle", descriptionKey: "achievementZeroToWordDescription", category: "patterns", mystery: true, hintKey: "achievementZeroToWordHint" },
  { id: "exact-three", reward: "3️⃣", titleKey: "achievementExactThreeTitle", descriptionKey: "achievementExactThreeDescription", category: "skill" },
  { id: "exact-four", reward: "4️⃣", titleKey: "achievementExactFourTitle", descriptionKey: "achievementExactFourDescription", category: "skill" },
  { id: "exact-five", reward: "5️⃣", titleKey: "achievementExactFiveTitle", descriptionKey: "achievementExactFiveDescription", category: "skill" },
  { id: "seven-speed", reward: "🏎️", titleKey: "achievementSevenSpeedTitle", descriptionKey: "achievementSevenSpeedDescription", category: "skill", mystery: true, hintKey: "achievementSevenSpeedHint" },
  { id: "seven-no-hints", reward: "🧠", titleKey: "achievementSevenNoHintsTitle", descriptionKey: "achievementSevenNoHintsDescription", category: "skill" },
  { id: "seven-two-try", reward: "🥷", titleKey: "achievementSevenTwoTryTitle", descriptionKey: "achievementSevenTwoTryDescription", category: "skill", mystery: true, hintKey: "achievementSevenTwoTryHint" },
  { id: "five-flash", reward: "⚡", titleKey: "achievementFiveFlashTitle", descriptionKey: "achievementFiveFlashDescription", category: "skill" },
  { id: "six-flash", reward: "🌠", titleKey: "achievementSixFlashTitle", descriptionKey: "achievementSixFlashDescription", category: "skill" },
  { id: "clean-first-try", reward: "💎", titleKey: "achievementCleanFirstTryTitle", descriptionKey: "achievementCleanFirstTryDescription", category: "skill", mystery: true, hintKey: "achievementCleanFirstTryHint" },
  { id: "chaos-last-chance", reward: "🎬", titleKey: "achievementChaosLastChanceTitle", descriptionKey: "achievementChaosLastChanceDescription", category: "chaos", mystery: true, hintKey: "achievementChaosLastChanceHint" },
  { id: "slow-pure", reward: "🧘", titleKey: "achievementSlowPureTitle", descriptionKey: "achievementSlowPureDescription", category: "skill", mystery: true, hintKey: "achievementSlowPureHint" },
  { id: "full-briefing-last", reward: "🧯", titleKey: "achievementFullBriefingLastTitle", descriptionKey: "achievementFullBriefingLastDescription", category: "hints", mystery: true, hintKey: "achievementFullBriefingLastHint" },
  { id: "first-green", reward: "🟢", titleKey: "achievementFirstGreenTitle", descriptionKey: "achievementFirstGreenDescription", category: "patterns" },
  { id: "first-double-green", reward: "🧲", titleKey: "achievementFirstDoubleGreenTitle", descriptionKey: "achievementFirstDoubleGreenDescription", category: "patterns" },
  { id: "first-all-gray", reward: "🌚", titleKey: "achievementFirstAllGrayTitle", descriptionKey: "achievementFirstAllGrayDescription", category: "patterns" },
  { id: "first-all-yellow", reward: "🟨", titleKey: "achievementFirstAllYellowTitle", descriptionKey: "achievementFirstAllYellowDescription", category: "patterns", mystery: true, hintKey: "achievementFirstAllYellowHint" },
  { id: "one-away", reward: "🧩", titleKey: "achievementOneAwayTitle", descriptionKey: "achievementOneAwayDescription", category: "patterns" },
  { id: "blind-start-win", reward: "🕳️", titleKey: "achievementBlindStartWinTitle", descriptionKey: "achievementBlindStartWinDescription", category: "patterns", mystery: true, hintKey: "achievementBlindStartWinHint" },
  { id: "yellow-to-green", reward: "🐤", titleKey: "achievementYellowToGreenTitle", descriptionKey: "achievementYellowToGreenDescription", category: "patterns", mystery: true, hintKey: "achievementYellowToGreenHint" },
  { id: "green-anchor", reward: "⚓", titleKey: "achievementGreenAnchorTitle", descriptionKey: "achievementGreenAnchorDescription", category: "patterns", mystery: true, hintKey: "achievementGreenAnchorHint" },
  { id: "traffic-win", reward: "🚥", titleKey: "achievementTrafficWinTitle", descriptionKey: "achievementTrafficWinDescription", category: "patterns" },
  { id: "all-yellow-win", reward: "🌞", titleKey: "achievementAllYellowWinTitle", descriptionKey: "achievementAllYellowWinDescription", category: "patterns", mystery: true, hintKey: "achievementAllYellowWinHint" },
  { id: "hot-win", reward: "🌶️", titleKey: "achievementHotWinTitle", descriptionKey: "achievementHotWinDescription", category: "patterns" },
  { id: "alphabet-master", reward: "⌨️", titleKey: "achievementAlphabetMasterTitle", descriptionKey: "achievementAlphabetMasterDescription", category: "patterns", mystery: true, hintKey: "achievementAlphabetMasterHint" },
  { id: "hint-one-next-win", reward: "🪄", titleKey: "achievementHintOneNextWinTitle", descriptionKey: "achievementHintOneNextWinDescription", category: "hints", mystery: true, hintKey: "achievementHintOneNextWinHint" },
  { id: "hint-two-next-win", reward: "🔍", titleKey: "achievementHintTwoNextWinTitle", descriptionKey: "achievementHintTwoNextWinDescription", category: "hints", mystery: true, hintKey: "achievementHintTwoNextWinHint" },
  { id: "hint-three-next-win", reward: "💡", titleKey: "achievementHintThreeNextWinTitle", descriptionKey: "achievementHintThreeNextWinDescription", category: "hints", mystery: true, hintKey: "achievementHintThreeNextWinHint" },
  { id: "patient-hint", reward: "⏳", titleKey: "achievementPatientHintTitle", descriptionKey: "achievementPatientHintDescription", category: "hints" },
  { id: "late-hint", reward: "🕰️", titleKey: "achievementLateHintTitle", descriptionKey: "achievementLateHintDescription", category: "hints", mystery: true, hintKey: "achievementLateHintHint" },
  { id: "hints-before-guess", reward: "🗺️", titleKey: "achievementHintsBeforeGuessTitle", descriptionKey: "achievementHintsBeforeGuessDescription", category: "hints", mystery: true, hintKey: "achievementHintsBeforeGuessHint" },
  { id: "fifty-hints-total", reward: "🛟", titleKey: "achievementFiftyHintsTotalTitle", descriptionKey: "achievementFiftyHintsTotalDescription", category: "hints" },
  { id: "hundred-hints-total", reward: "🛰️", titleKey: "achievementHundredHintsTotalTitle", descriptionKey: "achievementHundredHintsTotalDescription", category: "hints" },
  { id: "invalid-then-win", reward: "🧹", titleKey: "achievementInvalidThenWinTitle", descriptionKey: "achievementInvalidThenWinDescription", category: "chaos" },
  { id: "three-invalid-row", reward: "🎳", titleKey: "achievementThreeInvalidRowTitle", descriptionKey: "achievementThreeInvalidRowDescription", category: "chaos" },
  { id: "five-invalid-row", reward: "🌀", titleKey: "achievementFiveInvalidRowTitle", descriptionKey: "achievementFiveInvalidRowDescription", category: "chaos", mystery: true, hintKey: "achievementFiveInvalidRowHint" },
  { id: "duplicate-invalid", reward: "🦜", titleKey: "achievementDuplicateInvalidTitle", descriptionKey: "achievementDuplicateInvalidDescription", category: "chaos", mystery: true, hintKey: "achievementDuplicateInvalidHint" },
  { id: "ten-backspaces-game", reward: "⌫", titleKey: "achievementTenBackspacesGameTitle", descriptionKey: "achievementTenBackspacesGameDescription", category: "chaos" },
  { id: "thirty-backspaces-game", reward: "🧽", titleKey: "achievementThirtyBackspacesGameTitle", descriptionKey: "achievementThirtyBackspacesGameDescription", category: "chaos", mystery: true, hintKey: "achievementThirtyBackspacesGameHint" },
  { id: "full-erase", reward: "🫥", titleKey: "achievementFullEraseTitle", descriptionKey: "achievementFullEraseDescription", category: "chaos", mystery: true, hintKey: "achievementFullEraseHint" },
  { id: "triple-full-erase", reward: "🧼", titleKey: "achievementTripleFullEraseTitle", descriptionKey: "achievementTripleFullEraseDescription", category: "chaos", mystery: true, hintKey: "achievementTripleFullEraseHint" },
  { id: "three-incomplete-submits", reward: "🧱", titleKey: "achievementThreeIncompleteSubmitsTitle", descriptionKey: "achievementThreeIncompleteSubmitsDescription", category: "chaos" },
  { id: "hundred-backspaces-total", reward: "🧮", titleKey: "achievementHundredBackspacesTotalTitle", descriptionKey: "achievementHundredBackspacesTotalDescription", category: "chaos" },
  { id: "ten-uk-wins", reward: "🌻", titleKey: "achievementTenUkWinsTitle", descriptionKey: "achievementTenUkWinsDescription", category: "languages" },
  { id: "ten-ru-wins", reward: "🪆", titleKey: "achievementTenRuWinsTitle", descriptionKey: "achievementTenRuWinsDescription", category: "languages" },
  { id: "ten-en-wins", reward: "☕", titleKey: "achievementTenEnWinsTitle", descriptionKey: "achievementTenEnWinsDescription", category: "languages" },
  { id: "global-tour-25", reward: "✈️", titleKey: "achievementGlobalTour25Title", descriptionKey: "achievementGlobalTour25Description", category: "languages" },
  { id: "global-wins-10", reward: "🌐", titleKey: "achievementGlobalWins10Title", descriptionKey: "achievementGlobalWins10Description", category: "languages", mystery: true, hintKey: "achievementGlobalWins10Hint" },
  { id: "seven-all-languages", reward: "7️⃣", titleKey: "achievementSevenAllLanguagesTitle", descriptionKey: "achievementSevenAllLanguagesDescription", category: "languages", mystery: true, hintKey: "achievementSevenAllLanguagesHint" },
  { id: "first-try-all-languages", reward: "🎯", titleKey: "achievementFirstTryAllLanguagesTitle", descriptionKey: "achievementFirstTryAllLanguagesDescription", category: "languages", mystery: true, hintKey: "achievementFirstTryAllLanguagesHint" },
  { id: "no-hint-all-languages", reward: "🧠", titleKey: "achievementNoHintAllLanguagesTitle", descriptionKey: "achievementNoHintAllLanguagesDescription", category: "languages", mystery: true, hintKey: "achievementNoHintAllLanguagesHint" },
  { id: "seventy-five-wins", reward: "🏅", titleKey: "achievementSeventyFiveWinsTitle", descriptionKey: "achievementSeventyFiveWinsDescription", category: "milestones" },
  { id: "hundred-wins", reward: "🏆", titleKey: "achievementHundredWinsTitle", descriptionKey: "achievementHundredWinsDescription", category: "milestones" },
  { id: "hundred-fifty-games", reward: "🎟️", titleKey: "achievementHundredFiftyGamesTitle", descriptionKey: "achievementHundredFiftyGamesDescription", category: "milestones" },
  { id: "two-fifty-games", reward: "🗿", titleKey: "achievementTwoFiftyGamesTitle", descriptionKey: "achievementTwoFiftyGamesDescription", category: "milestones", mystery: true, hintKey: "achievementTwoFiftyGamesHint" },
  { id: "fifteen-streak", reward: "🔥", titleKey: "achievementFifteenStreakTitle", descriptionKey: "achievementFifteenStreakDescription", category: "streaks", mystery: true, hintKey: "achievementFifteenStreakHint" },
  { id: "twenty-streak", reward: "🌞", titleKey: "achievementTwentyStreakTitle", descriptionKey: "achievementTwentyStreakDescription", category: "streaks", mystery: true, hintKey: "achievementTwentyStreakHint" },
  { id: "twenty-five-first-try", reward: "🦅", titleKey: "achievementTwentyFiveFirstTryTitle", descriptionKey: "achievementTwentyFiveFirstTryDescription", category: "streaks" },
  { id: "twenty-five-no-hint", reward: "🧙‍♂️", titleKey: "achievementTwentyFiveNoHintTitle", descriptionKey: "achievementTwentyFiveNoHintDescription", category: "hints" },
  { id: "labs-easter", reward: "🧪", titleKey: "achievementLabsEasterTitle", descriptionKey: "achievementLabsEasterDescription", category: "secrets", mystery: true, hintKey: "achievementLabsEasterHint" },
  { id: "hint-whisperer", reward: "🕵️", titleKey: "achievementHintWhispererTitle", descriptionKey: "achievementHintWhispererDescription", category: "secrets", mystery: true, hintKey: "achievementHintWhispererHint" },
  { id: "museum-visitor", reward: "🏛️", titleKey: "achievementMuseumVisitorTitle", descriptionKey: "achievementMuseumVisitorDescription", category: "secrets", mystery: true, hintKey: "achievementMuseumVisitorHint" },
  { id: "museum-curator", reward: "🗃️", titleKey: "achievementMuseumCuratorTitle", descriptionKey: "achievementMuseumCuratorDescription", category: "secrets", mystery: true, hintKey: "achievementMuseumCuratorHint" },
  { id: "day-night", reward: "🌗", titleKey: "achievementDayNightTitle", descriptionKey: "achievementDayNightDescription", category: "secrets", mystery: true, hintKey: "achievementDayNightHint" },
  { id: "logo-secret", reward: "👆", titleKey: "achievementLogoSecretTitle", descriptionKey: "achievementLogoSecretDescription", category: "secrets", mystery: true, hintKey: "achievementLogoSecretHint" },
  { id: "gear-goblin", reward: "⚙️", titleKey: "achievementGearGoblinTitle", descriptionKey: "achievementGearGoblinDescription", category: "secrets", mystery: true, hintKey: "achievementGearGoblinHint" },
  { id: "trophy-tapper", reward: "🏆", titleKey: "achievementTrophyTapperTitle", descriptionKey: "achievementTrophyTapperDescription", category: "secrets", mystery: true, hintKey: "achievementTrophyTapperHint" },
  { id: "rules-lawyer", reward: "📜", titleKey: "achievementRulesLawyerTitle", descriptionKey: "achievementRulesLawyerDescription", category: "oddities", mystery: true, hintKey: "achievementRulesLawyerHint" },
  { id: "language-pinball", reward: "🗣️", titleKey: "achievementLanguagePinballTitle", descriptionKey: "achievementLanguagePinballDescription", category: "oddities", mystery: true, hintKey: "achievementLanguagePinballHint" },
  { id: "length-carousel", reward: "📏", titleKey: "achievementLengthCarouselTitle", descriptionKey: "achievementLengthCarouselDescription", category: "oddities", mystery: true, hintKey: "achievementLengthCarouselHint" },
  { id: "attempt-carousel", reward: "🎰", titleKey: "achievementAttemptCarouselTitle", descriptionKey: "achievementAttemptCarouselDescription", category: "oddities", mystery: true, hintKey: "achievementAttemptCarouselHint" },
  { id: "repeat-switcher", reward: "🔁", titleKey: "achievementRepeatSwitcherTitle", descriptionKey: "achievementRepeatSwitcherDescription", category: "oddities", mystery: true, hintKey: "achievementRepeatSwitcherHint" },
  { id: "museum-night-shift", reward: "🏺", titleKey: "achievementMuseumNightShiftTitle", descriptionKey: "achievementMuseumNightShiftDescription", category: "secrets", mystery: true, hintKey: "achievementMuseumNightShiftHint" },
  { id: "theme-chameleon", reward: "🦎", titleKey: "achievementThemeChameleonTitle", descriptionKey: "achievementThemeChameleonDescription", category: "secrets", mystery: true, hintKey: "achievementThemeChameleonHint" },
  { id: "feedback-pioneer", reward: "📡", titleKey: "achievementFeedbackPioneerTitle", descriptionKey: "achievementFeedbackPioneerDescription", category: "oddities" },
  { id: "bug-hunter", reward: "🐞", titleKey: "achievementBugHunterTitle", descriptionKey: "achievementBugHunterDescription", category: "oddities" },
  { id: "word-fan", reward: "👍", titleKey: "achievementWordFanTitle", descriptionKey: "achievementWordFanDescription", category: "oddities" },
  { id: "word-critic", reward: "👎", titleKey: "achievementWordCriticTitle", descriptionKey: "achievementWordCriticDescription", category: "oddities" },
  { id: "balanced-critic", reward: "⚖️", titleKey: "achievementBalancedCriticTitle", descriptionKey: "achievementBalancedCriticDescription", category: "oddities", mystery: true, hintKey: "achievementBalancedCriticHint" },
  { id: "share-trio", reward: "📤", titleKey: "achievementShareTrioTitle", descriptionKey: "achievementShareTrioDescription", category: "oddities" },
  { id: "empty-enter-seven", reward: "🫥", titleKey: "achievementEmptyEnterSevenTitle", descriptionKey: "achievementEmptyEnterSevenDescription", category: "chaos", mystery: true, hintKey: "achievementEmptyEnterSevenHint" },
  { id: "backspace-blizzard", reward: "❄️", titleKey: "achievementBackspaceBlizzardTitle", descriptionKey: "achievementBackspaceBlizzardDescription", category: "chaos", mystery: true, hintKey: "achievementBackspaceBlizzardHint" },
  { id: "invalid-tornado", reward: "🌪️", titleKey: "achievementInvalidTornadoTitle", descriptionKey: "achievementInvalidTornadoDescription", category: "chaos", mystery: true, hintKey: "achievementInvalidTornadoHint" },
  { id: "letter-monotony", reward: "🦜", titleKey: "achievementLetterMonotonyTitle", descriptionKey: "achievementLetterMonotonyDescription", category: "patterns", mystery: true, hintKey: "achievementLetterMonotonyHint" },
  { id: "vowel-choir", reward: "🎤", titleKey: "achievementVowelChoirTitle", descriptionKey: "achievementVowelChoirDescription", category: "patterns", mystery: true, hintKey: "achievementVowelChoirHint" },
  { id: "consonant-wall", reward: "🧱", titleKey: "achievementConsonantWallTitle", descriptionKey: "achievementConsonantWallDescription", category: "patterns", mystery: true, hintKey: "achievementConsonantWallHint" },
  { id: "mirror-guess", reward: "🪞", titleKey: "achievementMirrorGuessTitle", descriptionKey: "achievementMirrorGuessDescription", category: "patterns", mystery: true, hintKey: "achievementMirrorGuessHint" },
  { id: "keyboard-tour-live", reward: "⌨️", titleKey: "achievementKeyboardTourLiveTitle", descriptionKey: "achievementKeyboardTourLiveDescription", category: "patterns" },
  { id: "erase-before-first", reward: "🧼", titleKey: "achievementEraseBeforeFirstTitle", descriptionKey: "achievementEraseBeforeFirstDescription", category: "chaos", mystery: true, hintKey: "achievementEraseBeforeFirstHint" },
  { id: "nervous-fingers", reward: "🤏", titleKey: "achievementNervousFingersTitle", descriptionKey: "achievementNervousFingersDescription", category: "chaos", mystery: true, hintKey: "achievementNervousFingersHint" },
  { id: "silent-minute", reward: "🧘", titleKey: "achievementSilentMinuteTitle", descriptionKey: "achievementSilentMinuteDescription", category: "skill", mystery: true, hintKey: "achievementSilentMinuteHint" },
  { id: "speed-mistake", reward: "💨", titleKey: "achievementSpeedMistakeTitle", descriptionKey: "achievementSpeedMistakeDescription", category: "chaos", mystery: true, hintKey: "achievementSpeedMistakeHint" },
  { id: "no-green-loss", reward: "🥶", titleKey: "achievementNoGreenLossTitle", descriptionKey: "achievementNoGreenLossDescription", category: "chaos", mystery: true, hintKey: "achievementNoGreenLossHint" },
  { id: "yellow-only-loss", reward: "🟨", titleKey: "achievementYellowOnlyLossTitle", descriptionKey: "achievementYellowOnlyLossDescription", category: "patterns", mystery: true, hintKey: "achievementYellowOnlyLossHint" },
  { id: "three-blackouts", reward: "🌚", titleKey: "achievementThreeBlackoutsTitle", descriptionKey: "achievementThreeBlackoutsDescription", category: "patterns", mystery: true, hintKey: "achievementThreeBlackoutsHint" },
  { id: "rainbow-collector", reward: "🎨", titleKey: "achievementRainbowCollectorTitle", descriptionKey: "achievementRainbowCollectorDescription", category: "patterns", mystery: true, hintKey: "achievementRainbowCollectorHint" },
  { id: "seven-chaos-win", reward: "🐙", titleKey: "achievementSevenChaosWinTitle", descriptionKey: "achievementSevenChaosWinDescription", category: "skill", mystery: true, hintKey: "achievementSevenChaosWinHint" },
];
const WORD_GUESS_ACHIEVEMENT_CATEGORIES = [
  { id: "skill", titleKey: "achievementCategorySkill" },
  { id: "patterns", titleKey: "achievementCategoryPatterns" },
  { id: "hints", titleKey: "achievementCategoryHints" },
  { id: "chaos", titleKey: "achievementCategoryChaos" },
  { id: "languages", titleKey: "achievementCategoryLanguages" },
  { id: "streaks", titleKey: "achievementCategoryStreaks" },
  { id: "milestones", titleKey: "achievementCategoryMilestones" },
  { id: "secrets", titleKey: "achievementCategorySecrets" },
  { id: "oddities", titleKey: "achievementCategoryOddities" },
];
const WORD_GUESS_DEFAULT_MODE = "5";
const WORD_GUESS_DEFAULT_LENGTH = 5;
const WORD_GUESS_DEFAULT_ATTEMPTS = 5;
const WORD_GUESS_DEFAULT_LANGUAGE = "uk";
const WORD_GUESS_LABS_UNLOCK_TAPS = 7;
const GAME_TITLE = "Мовограй";
const GAME_SUBTITLE = "Українські ігри зі словами для компанії.";
const modeCategoryCache = {};
const modeCategoryPromises = {};
let modeSelectionRequestId = 0;
const WHOAMI_DATA_FILE = "whoami.json";
const WHOAMI_DEFAULT_PLAYER_COUNT = 4;
const WORD_GUESS_LANGUAGES = {
  uk: {
    id: "uk",
    label: "Українська",
    shortLabel: "UA",
    locale: "uk-UA",
    dataFile: "wordguess.json",
    letters: "абвгґдеєжзиіїйклмнопрстуфхцчшщьюя",
    vowels: "аеєиіїоуюя",
    keyboardRows: [
      ["й", "ц", "у", "к", "е", "н", "г", "ш", "щ", "з", "х", "ї"],
      ["ф", "і", "в", "а", "п", "р", "о", "л", "д", "ж", "є"],
      ["ґ", "я", "ч", "с", "м", "и", "т", "ь", "б", "ю"],
    ],
  },
  ru: {
    id: "ru",
    label: "Русский",
    shortLabel: "RU",
    locale: "ru-RU",
    dataFile: "wordguess-ru.json",
    letters: "абвгдеёжзийклмнопрстуфхцчшщъыьэюя",
    vowels: "аеёиоуыэюя",
    keyboardRows: [
      ["й", "ц", "у", "к", "е", "н", "г", "ш", "щ", "з", "х", "ъ"],
      ["ф", "ы", "в", "а", "п", "р", "о", "л", "д", "ж", "э"],
      ["я", "ч", "с", "м", "и", "т", "ь", "б", "ю", "ё"],
    ],
  },
  en: {
    id: "en",
    label: "English",
    shortLabel: "EN",
    locale: "en-US",
    dataFile: "wordguess-en.json",
    letters: "abcdefghijklmnopqrstuvwxyz",
    vowels: "aeiou",
    keyboardRows: [
      ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
      ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
      ["z", "x", "c", "v", "b", "n", "m"],
    ],
  },
};
const WORD_GUESS_TEXT = {
  uk: {
    brand: "Мовограй", title: "Вгадай слово", menuDescription: "Відгадай слово за кольоровими підказками.", soloMode: "Одиночний режим", rules: "Правила", showRules: "Показати правила", howToPlay: "Як грати", hintsTitle: "Підказки",
    start: "Почати гру", backMenu: "← У меню", mainMenu: "У головне меню", newGame: "Нова гра",
    enter: "Ввести", erase: "Стерти літеру", loading: "Завантажуємо словник...", loadError: "Не вдалося завантажити словник.",
    repeatOn: "З повторами літер", repeatOff: "Без повторення літер", repeatShortOn: "повтори", repeatShortOff: "без повторів", onlyLetters: "Тільки українські літери",
    noRepeats: "Без повторення літер", notInDictionary: "Немає в словнику гри", hintsNone: "Підказки не використовувались",
    hintsUsed: "Використано підказки", guessed: "Слово відгадано", attemptsOver: "Спроби закінчилися",
    targetWon: "Загадане слово", targetLost: "Правильне слово", attempts: "Спроби", checked: "Перевірено", invalid: "Незалік",
    attemptsLabel: "Спроби:", noAttempts: "Спроб ще не було.", noAttemptsHistory: "Спроб ще немає.", noAttemptsResult: "Жодної спроби не було.", invalidBadge: "Не зараховано",
    share: "Поділитися", dictionaryPrompt: "Почитайте тлумачення загаданого слова у словничку",
    hint1: "Підказка 1", hint2: "Підказка 2", hint3: "Підказка 3", firstHintAgain: "Показати першу підказку ще раз", firstHintShow: "Показати першу підказку",
    secondHintAgain: "Показати другу підказку ще раз", secondHintLocked: "Друга підказка відкриється після першої", thirdHintAgain: "Показати третю підказку ще раз", thirdHintLocked: "Третя підказка відкриється після другої",
    firstHintNext: "Після неї відкриється підказка 2 — одна літера, яка точно є у слові.", secondHintNext: "Після неї відкриється підказка 3 — підсвітити всі літери загаданого слова на клавіатурі.", thirdHintText: "На клавіатурі підсвічені всі літери, які є у загаданому слові.",
    openHint1First: "Спочатку відкрийте підказку 1", openHint2First: "Спочатку відкрийте підказку 2", hintBeforeStart: "Підказка з’явиться після старту гри.", firstLetter: "Перша літера", highlightedLetters: "Підсвічені літери",
    languageAdjective: "українське", keyboardLabel: "Українська клавіатура", experimental: "",
    hintLevels: "3 рівні", close: "Закрити", modeTagsAria: "Параметри поточної гри", boardAria: "Поле гри",
    statsAria: "Статистика гри", resultAttemptsAria: "Перевірені спроби", debugAria: "Службова інформація",
    vowelsLabel: "Голосних", firstLetterLabel: "Перша літера", nextHintGlow: "Наступна підказка доступна",
    statusCorrect: "правильне місце", statusPresent: "є в слові", statusAbsent: "немає в слові",
    wordCountOne: "слово", wordCountMany: "слів", targetsShort: "цілі", guessesShort: "слова", invalidCount: "Незалік",
    shareImageShared: "Картинку результату поширено", shareImageCopied: "Картинку результату скопійовано", shareImageSaved: "Картинку результату збережено",
    shareTextCopied: "Результат скопійовано", shareFailed: "Не вдалося поділитися", shareFooter: "movohray · гра зі словами",
    shortRulesTitle: "Короткі правила", shortRulesText: "Введи слово потрібної довжини. Зелений означає правильну позицію, жовтий — літера є у слові, рожевий — літери немає. Є три підказки.",
    labsEyebrow: "Labs · прихований тест", labsTitle: "Експериментальні функції", labsCopy: "Мова змінюється тільки у грі «Вгадай слово». Українська лишається основною; RU та EN — тестові словники.", labsLanguageAria: "Мова гри Вгадай слово",
    labsStatusUk: "Основний перевірений словник: українська.", labsStatusRu: "Русский: експериментальний Labs-режим. Словник продовжує розширюватися й модеруватися.", labsStatusEn: "English: експериментальний Labs-режим. Словник продовжує розширюватися й модеруватися.",
    labsUnlocked: "Секретний режим відкрито", achievementSectionEyebrow: "Achievements · Labs", achievementSectionTitle: "Нагороди й досягнення", achievementSectionCopy: "Локальні нагороди зберігаються на цьому пристрої.", achievementProgress: "Відкрито", achievementUnlocked: "Отримано", achievementLocked: "Ще не відкрито", achievementToast: "Досягнення відкрито!", achievementDismiss: "Закрити сповіщення", achievementToastOpen: "Натисни, щоб переглянути нагороду",
    achievementFirstWinTitle: "Перша перемога", achievementFirstWinDescription: "Здобудь свою першу перемогу у «Вгадай слово».",
    achievementFirstTryTitle: "З першої спроби", achievementFirstTryDescription: "Відгадай слово першою зарахованою спробою в одній партії.",
    achievementNoHintsTitle: "Чиста голова", achievementNoHintsDescription: "Виграй одну партію, не використавши жодної підказки.",
    achievementRuWinTitle: "RU-дослідник", achievementRuWinDescription: "Здобудь перемогу в російському Labs-словнику.",
    achievementEnWinTitle: "EN-дослідник", achievementEnWinDescription: "Здобудь перемогу в англійському Labs-словнику.",
    achievementStubbornTitle: "Наполегливість", achievementStubbornDescription: "За одну партію зроби щонайменше 3 введення, які гра не зарахує.",
    achievementUkWinTitle: "Вдома найкраще", achievementUkWinDescription: "Здобудь перемогу в українському словнику.",
    achievementLabsDuoTitle: "Подвійний експеримент", achievementLabsDuoDescription: "Здобудь щонайменше по 1 перемозі в RU Labs і EN Labs.",
    achievementPolyglotTitle: "Поліглот", achievementPolyglotDescription: "Здобудь щонайменше по 1 перемозі українською, російською та англійською.",
    achievementCleanWinTitle: "Чистенько", achievementCleanWinDescription: "Виграй одну партію без жодного введення, яке гра не зарахувала.",
    achievementOneHintTitle: "Одним оком", achievementOneHintDescription: "Виграй одну партію, використавши рівно 1 підказку.",
    achievementFullHintsTitle: "Повний брифінг", achievementFullHintsDescription: "Іноді варто вислухати весь брифінг до кінця.",
    achievementLastChanceTitle: "На останньому подиху", achievementLastChanceDescription: "Відгадай слово останньою доступною зарахованою спробою.",
    achievementSpeedrunTitle: "Блискавка", achievementSpeedrunDescription: "Відгадай слово менш ніж за 30 секунд від початку партії.",
    achievementSevenLetterTitle: "Довга історія", achievementSevenLetterDescription: "Переможи у грі зі словом із 7 літер.",
    achievementRepeatMasterTitle: "Дежавю", achievementRepeatMasterDescription: "Відгадай слово, у якому повторюється хоча б одна літера.",
    achievementTrafficLightTitle: "Світлофор", achievementTrafficLightDescription: "Три кольори мають зустрітися в одному місці.",
    achievementYellowStormTitle: "Жовта буря", achievementYellowStormDescription: "В одній зарахованій спробі отримай щонайменше 3 жовті літери.",
    achievementGreenWaveTitle: "Зелена хвиля", achievementGreenWaveDescription: "В одній зарахованій невиграшній спробі постав щонайменше 3 літери на правильні місця.",
    achievementAlphabetTourTitle: "Екскурсія алфавітом", achievementAlphabetTourDescription: "За одну партію використай у зарахованих спробах щонайменше 15 різних літер.",
    achievementChaosAgentTitle: "Агент хаосу", achievementChaosAgentDescription: "За одну партію зроби щонайменше 6 введень, які гра не зарахує.",
    achievementComebackTitle: "І все-таки!", achievementComebackDescription: "Виграй партію після щонайменше 3 введень, які гра не зарахувала.",
    achievementAlmostTitle: "За крок до слави", achievementAlmostDescription: "Навіть програш іноді буває майже ідеальним.",
    achievementFiveWinsTitle: "Бронзова серія", achievementFiveWinsDescription: "Здобудь загалом 5 перемог у «Вгадай слово».",
    achievementTenWinsTitle: "Срібна десятка", achievementTenWinsDescription: "Здобудь загалом 10 перемог у «Вгадай слово».",
    achievementTwentyFiveWinsTitle: "Золотий словограй", achievementTwentyFiveWinsDescription: "Здобудь загалом 25 перемог у «Вгадай слово».",
    achievementThreeStreakTitle: "На вогні", achievementThreeStreakDescription: "Виграй 3 партії поспіль.",
    achievementTenGamesTitle: "Втягнувся", achievementTenGamesDescription: "Зіграй загалом 10 партій у «Вгадай слово».",
    achievementTwentyFiveGamesTitle: "Завсідник", achievementTwentyFiveGamesDescription: "Зіграй загалом 25 партій у «Вгадай слово».",
    achievementMenuEyebrow: "Вгадай слово",
    achievementMenuTitle: "Досягнення",
    achievementMenuCopy: "Збирай нагороди за майстерність, серії, експерименти й кумедні ситуації у грі.",
    achievementMenuOpen: "Відкрити досягнення",
    achievementCategoryOddities: "Дивацтва й Easter Eggs",
    achievementGearGoblinTitle: "Шестерня знає забагато",
    achievementGearGoblinDescription: "Деякі двері відкриваються не ключем, а надмірною цікавістю.",
    achievementGearGoblinHint: "Натисни глобальну кнопку ⚙️ налаштувань 13 разів.",
    achievementTrophyTapperTitle: "Кубок теж кнопка",
    achievementTrophyTapperDescription: "Навіть музейна вивіска може втомитися від уваги.",
    achievementTrophyTapperHint: "Натисни кнопку 🏆 Досягнень 13 разів.",
    achievementRulesLawyerTitle: "Адвокат правил",
    achievementRulesLawyerDescription: "Ти явно шукаєш дрібний шрифт.",
    achievementRulesLawyerHint: "Відкрий правила «Вгадай слово» 7 разів.",
    achievementLanguagePinballTitle: "Мовний пінбол",
    achievementLanguagePinballDescription: "UA, RU, EN — кулька ще літає.",
    achievementLanguagePinballHint: "Зміни мову «Вгадай слово» 12 разів після відкриття Labs.",
    achievementLengthCarouselTitle: "Карусель літер",
    achievementLengthCarouselDescription: "П’ять? Шість? Сім? А може ще раз.",
    achievementLengthCarouselHint: "Зміни довжину слова в налаштуваннях 15 разів.",
    achievementAttemptCarouselTitle: "Крутилка долі",
    achievementAttemptCarouselDescription: "Кількість шансів ніяк не визначиться.",
    achievementAttemptCarouselHint: "Зміни кількість спроб у налаштуваннях 15 разів.",
    achievementRepeatSwitcherTitle: "Повтор повтору",
    achievementRepeatSwitcherDescription: "Цей перемикач починає підозрювати недобре.",
    achievementRepeatSwitcherHint: "Увімкни або вимкни повторення літер 10 разів.",
    achievementMuseumNightShiftTitle: "Нічна зміна в музеї",
    achievementMuseumNightShiftDescription: "Охоронець колекції вже впізнає тебе в обличчя.",
    achievementMuseumNightShiftHint: "Відкрий колекцію досягнень 50 разів.",
    achievementThemeChameleonTitle: "Хамелеон інтерфейсу",
    achievementThemeChameleonDescription: "Світло. Темрява. Світло. Темрява. Хтось визначиться?",
    achievementThemeChameleonHint: "Перемкни світлу/темну тему 25 разів.",
    achievementFeedbackPioneerTitle: "Перший сигнал",
    achievementFeedbackPioneerDescription: "Збережи перше повідомлення або оцінку для розробника.",
    achievementBugHunterTitle: "Мисливець на жуків",
    achievementBugHunterDescription: "Збережи повідомлення про баг для розробника.",
    achievementWordFanTitle: "Слово зайшло",
    achievementWordFanDescription: "Постав 👍 хоча б одному загаданому слову.",
    achievementWordCriticTitle: "Редактор прокинувся",
    achievementWordCriticDescription: "Постав 👎 хоча б одному загаданому слову.",
    achievementBalancedCriticTitle: "І батіг, і пряник",
    achievementBalancedCriticDescription: "Справедливий критик знає, що не все однаково.",
    achievementBalancedCriticHint: "Постав хоча б один 👍 і хоча б один 👎 загаданим словам.",
    achievementShareTrioTitle: "Мовограй у люди",
    achievementShareTrioDescription: "Поділися результатом гри 3 рази.",
    achievementEmptyEnterSevenTitle: "Enter у порожнечу",
    achievementEmptyEnterSevenDescription: "Кнопка вводу терпляча. Але не безмежно.",
    achievementEmptyEnterSevenHint: "За одну партію 7 разів натисни «Ввести», коли слово ще не набране повністю.",
    achievementBackspaceBlizzardTitle: "Завірюха Backspace",
    achievementBackspaceBlizzardDescription: "Літери приходять і йдуть. Переважно йдуть.",
    achievementBackspaceBlizzardHint: "За одну партію видали Backspace щонайменше 50 набраних літер.",
    achievementInvalidTornadoTitle: "Торнадо незаліків",
    achievementInvalidTornadoDescription: "Словник уже ховається під столом.",
    achievementInvalidTornadoHint: "За одну партію зроби 10 введень, які гра не зарахує.",
    achievementLetterMonotonyTitle: "Папуга",
    achievementLetterMonotonyDescription: "Одна літера. Ще вона. І знову вона.",
    achievementLetterMonotonyHint: "Під час набору склади послідовність щонайменше з 4 однакових літер.",
    achievementVowelChoirTitle: "Хор голосних",
    achievementVowelChoirDescription: "А-а-а… і це раптом стало стратегією.",
    achievementVowelChoirHint: "Під час набору введи щонайменше 4 голосні поспіль без приголосних.",
    achievementConsonantWallTitle: "Стіна приголосних",
    achievementConsonantWallDescription: "Жодного повітря між цими літерами.",
    achievementConsonantWallHint: "Спробуй ввести повне слово без жодної голосної.",
    achievementMirrorGuessTitle: "Дзеркало",
    achievementMirrorGuessDescription: "Початок підозріло схожий на кінець.",
    achievementMirrorGuessHint: "Спробуй ввести паліндром довжиною 5–7 літер.",
    achievementKeyboardTourLiveTitle: "Пальці бачили все",
    achievementKeyboardTourLiveDescription: "За одну партію натисни щонайменше 20 різних літер клавіатури.",
    achievementEraseBeforeFirstTitle: "Чернетка знищена",
    achievementEraseBeforeFirstDescription: "Перша ідея не пережила редактуру.",
    achievementEraseBeforeFirstHint: "До першої зарахованої спроби набери повне слово й повністю його зітри.",
    achievementNervousFingersTitle: "Нервові пальці",
    achievementNervousFingersDescription: "Редактор усередині тебе дуже активний.",
    achievementNervousFingersHint: "До першої зарахованої спроби видали Backspace щонайменше 20 набраних літер.",
    achievementSilentMinuteTitle: "Хвилина тиші",
    achievementSilentMinuteDescription: "Думка визрівала довше, ніж хотілося клавіатурі.",
    achievementSilentMinuteHint: "Зроби першу зараховану спробу не раніше ніж через 60 секунд після старту партії.",
    achievementSpeedMistakeTitle: "Швидше за думку",
    achievementSpeedMistakeDescription: "Руки вже натиснули Enter, а мозок ще завантажувався.",
    achievementSpeedMistakeHint: "Отримай незаліковане введення протягом перших 5 секунд партії.",
    achievementNoGreenLossTitle: "Арктична партія",
    achievementNoGreenLossDescription: "Зелене світло так і не ввімкнулося.",
    achievementNoGreenLossHint: "Програй партію, не отримавши жодної зеленої клітинки.",
    achievementYellowOnlyLossTitle: "Золото без перемоги",
    achievementYellowOnlyLossDescription: "Літери були десь поруч. Дуже поруч.",
    achievementYellowOnlyLossHint: "Програй партію, отримавши хоча б одну жовту клітинку, але жодної зеленої.",
    achievementThreeBlackoutsTitle: "Три затемнення",
    achievementThreeBlackoutsDescription: "Тричі — і жодна літера не знала відповіді.",
    achievementThreeBlackoutsHint: "За одну партію отримай 3 зараховані рядки, де всі клітинки позначені як відсутні.",
    achievementRainbowCollectorTitle: "Колекціонер погоди",
    achievementRainbowCollectorDescription: "У цій партії було і похмуро, і строкато, і майже сонячно.",
    achievementRainbowCollectorHint: "За одну партію отримай повністю «сірий» рядок, рядок із трьома типами кольорів і невиграшний рядок без відсутніх літер.",
    achievementSevenChaosWinTitle: "Семилітерний восьминіг",
    achievementSevenChaosWinDescription: "Сім літер, багато хаосу — і все одно перемога.",
    achievementSevenChaosWinHint: "Виграй 7-літерну партію після щонайменше 5 незалікованих введень.",
    supportEyebrow: "Дані й підтримка",
    supportTitle: "Скидання та зв’язок",
    supportReportTitle: "Повідомити розробнику",
    supportReportText: "Баг або дивна поведінка — поки що звіт збережеться локально як заглушка майбутнього сервера.",
    supportResetTitle: "Скинути прогрес і налаштування",
    supportResetText: "Видалити досягнення, Labs і персональні налаштування на цьому пристрої.",
    supportResetConfirm: "Скинути всі досягнення, Labs і налаштування Мовограю на цьому пристрої? Збережені відгуки розробнику залишаться.",
    supportResetDone: "Прогрес і налаштування скинуто.",
    feedbackWordTitle: "Оцініть загадане слово",
    feedbackLike: "Подобається",
    feedbackDislike: "Не подобається",
    feedbackReport: "Поскаржитися / баг",
    feedbackThanks: "Дякуємо! Оцінку збережено локально.",
    feedbackModalEyebrow: "Зв’язок із розробником",
    feedbackModalTitle: "Повідомити про проблему",
    feedbackModalCopy: "Опишіть баг, слово або іншу дивину. Надсилання на сервер ще не підключено — запис збережеться на цьому пристрої.",
    feedbackPlaceholder: "Що сталося? Що очікували побачити?",
    feedbackSave: "Надіслати розробнику",
    feedbackSaved: "Збережено локально. Серверне надсилання з’явиться пізніше.",
    feedbackEmpty: "Напишіть хоча б кілька слів про проблему.",
    feedbackContextWord: "Поточне слово",
    feedbackExport: "Скопіювати локальний звіт",


    achievementCategorySkill: "Майстерність",
    achievementCategoryPatterns: "Кольори й закономірності",
    achievementCategoryHints: "Підказки",
    achievementCategoryChaos: "Помилки й хаос",
    achievementCategoryLanguages: "Мови та Labs",
    achievementCategoryStreaks: "Серії та стиль",
    achievementCategoryMilestones: "Віхи колекції",
    achievementFiveLetterWinTitle: "П’ятірочка",
    achievementFiveLetterWinDescription: "Переможи зі словом із 5 літер.",
    achievementSixLetterWinTitle: "Шість із шести",
    achievementSixLetterWinDescription: "Переможи зі словом із 6 літер.",
    achievementAllLengthsTitle: "Повна лінійка",
    achievementAllLengthsDescription: "Здобудь щонайменше по 1 перемозі в режимах на 5, 6 і 7 літер.",
    achievementTwoTryTitle: "Подвійний постріл",
    achievementTwoTryDescription: "Відгадай слово першою або другою зарахованою спробою.",
    achievementAllYellowTitle: "Сонячна анаграма",
    achievementAllYellowDescription: "Усе вже поруч, але ще нічого не стоїть на своєму місці.",
    achievementAllGrayTitle: "Повз касу",
    achievementAllGrayDescription: "Зроби зараховану спробу, в якій усі клітинки рожеві — жодної літери немає у слові.",
    achievementHotHandTitle: "Гаряче!",
    achievementHotHandDescription: "Зроби зараховану невиграшну спробу без жодної рожевої клітинки.",
    achievementRepeatGuessTitle: "Точно це слово?",
    achievementRepeatGuessDescription: "Може, варто сказати це ще раз? Саме так само.",
    achievementAlphabetExplorerTitle: "Майже вся клавіатура",
    achievementAlphabetExplorerDescription: "Клавіатура просить дуже довгої прогулянки.",
    achievementFiveHintsTotalTitle: "Ліхтарик",
    achievementFiveHintsTotalDescription: "Використай загалом 5 рівнів підказок у всіх зіграних партіях.",
    achievementTenHintsTotalTitle: "Прожектор",
    achievementTenHintsTotalDescription: "Використай загалом 10 рівнів підказок у всіх зіграних партіях.",
    achievementTwentyFiveHintsTotalTitle: "Рятувальний круг",
    achievementTwentyFiveHintsTotalDescription: "Використай загалом 25 рівнів підказок у всіх зіграних партіях.",
    achievementTenInvalidTotalTitle: "Словник тримається",
    achievementTenInvalidTotalDescription: "Назбирай загалом 10 введень, які гра не зарахувала.",
    achievementTwentyFiveInvalidTotalTitle: "Міцний словник",
    achievementTwentyFiveInvalidTotalDescription: "Назбирай загалом 25 введень, які гра не зарахувала.",
    achievementFiftyInvalidTotalTitle: "А словник вижив",
    achievementFiftyInvalidTotalDescription: "Назбирай загалом 50 введень, які гра не зарахувала.",
    achievementFiftyWinsTitle: "Корона словограя",
    achievementFiftyWinsDescription: "Здобудь загалом 50 перемог у «Вгадай слово».",
    achievementFiftyGamesTitle: "Півсотні партій",
    achievementFiftyGamesDescription: "Зіграй загалом 50 партій у «Вгадай слово».",
    achievementHundredGamesTitle: "Сто історій",
    achievementHundredGamesDescription: "Зіграй загалом 100 партій у «Вгадай слово».",
    achievementFiveStreakTitle: "Розпечений",
    achievementFiveStreakDescription: "Виграй 5 партій поспіль.",
    achievementTenStreakTitle: "Комета",
    achievementTenStreakDescription: "Комета не повинна згаснути дуже довго.",
    achievementFiveFirstTryTitle: "Снайпер",
    achievementFiveFirstTryDescription: "Відгадай слово першою зарахованою спробою у 5 різних переможних партіях.",
    achievementTenFirstTryTitle: "Орлине око",
    achievementTenFirstTryDescription: "Відгадай слово першою зарахованою спробою у 10 різних переможних партіях.",
    achievementFiveNoHintTitle: "Сам собі підказка",
    achievementFiveNoHintDescription: "Здобудь 5 перемог, не використовуючи підказок у цих партіях.",
    achievementTenNoHintTitle: "Менталіст",
    achievementTenNoHintDescription: "Здобудь 10 перемог, не використовуючи підказок у цих партіях.",
    achievementFiveSevenLetterTitle: "Мисливець на сімки",
    achievementFiveSevenLetterDescription: "Здобудь 5 перемог у режимі зі словами з 7 літер.",
    achievementTenSevenLetterTitle: "Дракон семи літер",
    achievementTenSevenLetterDescription: "Здобудь 10 перемог у режимі зі словами з 7 літер.",
    achievementLanguageTouristTitle: "Мовний турист",
    achievementLanguageTouristDescription: "Зіграй щонайменше 5 партій українською, 5 російською і 5 англійською.",
    achievementLanguageVeteranTitle: "Три паспорти",
    achievementLanguageVeteranDescription: "Три мовні паспорти мають бути добре потерті.",
    achievementTwoHintsTitle: "Два натяки",
    achievementTwoHintsDescription: "Виграй одну партію, використавши рівно 2 підказки.",
    achievementFiveLastChanceTitle: "Короткий запал",
    achievementFiveLastChanceDescription: "У режимі на 5 літер відгадай слово останньою доступною зарахованою спробою.",
    achievementSevenFirstTryTitle: "Оракул",
    achievementSevenFirstTryDescription: "Сім знаків. Один постріл. Жодного права на розвідку.",
    achievementFlash15Title: "Спалах",
    achievementFlash15Description: "Відгадай слово не довше ніж за 15 секунд від початку партії.",
    achievementMarathonTitle: "Марафонець",
    achievementMarathonDescription: "Не всі перемоги люблять поспіх.",
    achievementPhoenixTitle: "Фенікс",
    achievementPhoenixDescription: "Навіть після серії відмов можна красиво злетіти.",
    achievementZeroToWordTitle: "З нуля в яблучко",
    achievementZeroToWordDescription: "Почни з повної темряви — і все одно знайди світло.",
    achievementCategorySecrets: "Таємниці та Easter Eggs",
    achievementMysteryLabel: "Загадкова умова",
    achievementTapForHint: "Умова прихована",
    achievementHowTo: "Як відкрити",
    achievementHintRevealed: "Умову розкрито",
    achievementHintRevealedToast: "Підказку розкрито — нагороду ще треба заробити 🔎",
    achievementFullHintsHint: "Виграй одну партію після використання всіх 3 рівнів підказок.",
    achievementTrafficLightHint: "В одній зарахованій спробі отримай одночасно зелені, жовті та рожеві клітинки.",
    achievementAlmostHint: "Програй партію, маючи в останній зарахованій спробі всі правильні позиції, крім однієї.",
    achievementAllYellowHint: "Зроби зараховану спробу, у якій усі клітинки жовті.",
    achievementRepeatGuessHint: "За одну партію двічі введи одне й те саме зараховане слово.",
    achievementAlphabetExplorerHint: "За одну партію використай у зарахованих спробах щонайменше 20 різних літер.",
    achievementLanguageVeteranHint: "Зіграй щонайменше 10 партій українською, 10 російською і 10 англійською.",
    achievementTenStreakHint: "Виграй 10 партій поспіль.",
    achievementSevenFirstTryHint: "У режимі на 7 літер відгадай слово першою зарахованою спробою.",
    achievementMarathonHint: "Заверши партію перемогою не раніше ніж через 3 хвилини після її початку.",
    achievementPhoenixHint: "Виграй одну партію після щонайменше 5 введень, які гра не зарахувала.",
    achievementZeroToWordHint: "Зроби зараховану спробу з усіма рожевими клітинками, а потім виграй цю саму партію.",
    achievementExactThreeTitle: "Третій постріл",
    achievementExactThreeDescription: "Відгадай слово рівно третьою зарахованою спробою.",
    achievementExactFourTitle: "Четвертий дзвінок",
    achievementExactFourDescription: "Відгадай слово рівно четвертою зарахованою спробою.",
    achievementExactFiveTitle: "П’ята передача",
    achievementExactFiveDescription: "Відгадай слово рівно п’ятою зарахованою спробою.",
    achievementSevenSpeedTitle: "Сім на швидкості",
    achievementSevenSpeedDescription: "Сім літер не люблять чекати.",
    achievementSevenSpeedHint: "Переможи у режимі на 7 літер не довше ніж за 30 секунд від початку партії.",
    achievementSevenNoHintsTitle: "Сім без страховки",
    achievementSevenNoHintsDescription: "Переможи зі словом із 7 літер без жодної підказки.",
    achievementSevenTwoTryTitle: "Ніндзя сімки",
    achievementSevenTwoTryDescription: "Велике слово можна взяти майже без розвідки.",
    achievementSevenTwoTryHint: "Відгадай 7-літерне слово не пізніше другої зарахованої спроби.",
    achievementFiveFlashTitle: "П’ятисекундник... майже",
    achievementFiveFlashDescription: "У режимі на 5 літер переможи не довше ніж за 15 секунд.",
    achievementSixFlashTitle: "Шість іскр",
    achievementSixFlashDescription: "У режимі на 6 літер переможи не довше ніж за 20 секунд.",
    achievementCleanFirstTryTitle: "Діамантовий постріл",
    achievementCleanFirstTryDescription: "Ідеальна партія має бути без єдиної подряпини.",
    achievementCleanFirstTryHint: "Відгадай слово першою зарахованою спробою, без підказок і без жодного незалікованого введення.",
    achievementChaosLastChanceTitle: "Фінал сезону",
    achievementChaosLastChanceDescription: "Перед фінальною сценою має бути трохи хаосу.",
    achievementChaosLastChanceHint: "Виграй останньою доступною зарахованою спробою після щонайменше 3 незалікованих введень.",
    achievementSlowPureTitle: "Дзен-режим",
    achievementSlowPureDescription: "Думай довго, але не проси допомоги.",
    achievementSlowPureHint: "Переможи не раніше ніж через 3 хвилини після старту й не використай жодної підказки.",
    achievementFullBriefingLastTitle: "Усе за інструкцією",
    achievementFullBriefingLastDescription: "Прочитай усе, а відповідь залиш на самий фінал.",
    achievementFullBriefingLastHint: "Використай усі 3 підказки й відгадай слово останньою доступною зарахованою спробою.",
    achievementFirstGreenTitle: "Зелений привіт",
    achievementFirstGreenDescription: "У першій зарахованій спробі отримай хоча б 1 зелену клітинку.",
    achievementFirstDoubleGreenTitle: "Магніт на місце",
    achievementFirstDoubleGreenDescription: "У першій зарахованій спробі отримай щонайменше 2 зелені клітинки.",
    achievementFirstAllGrayTitle: "Темний старт",
    achievementFirstAllGrayDescription: "Зроби першу зараховану спробу повністю рожевою.",
    achievementFirstAllYellowTitle: "Жовтий світанок",
    achievementFirstAllYellowDescription: "Перша спроба знає всі літери, але плутає адреси.",
    achievementFirstAllYellowHint: "Зроби першу зараховану спробу, в якій усі клітинки жовті.",
    achievementOneAwayTitle: "Одна клітинка до щастя",
    achievementOneAwayDescription: "У невиграшній зарахованій спробі постав правильно всі літери, крім однієї.",
    achievementBlindStartWinTitle: "Із темряви до слова",
    achievementBlindStartWinDescription: "Почни без жодного точного попадання, але не зупиняйся.",
    achievementBlindStartWinHint: "У першій зарахованій спробі не отримай жодної зеленої клітинки, а потім виграй цю партію.",
    achievementYellowToGreenTitle: "Курча знайшло місце",
    achievementYellowToGreenDescription: "Одна літера має переїхати туди, де їй справді місце.",
    achievementYellowToGreenHint: "У двох сусідніх зарахованих спробах зроби так, щоб та сама літера спочатку була жовтою, а в наступній — зеленою.",
    achievementGreenAnchorTitle: "Зелений якір",
    achievementGreenAnchorDescription: "Щось правильне має залишатися незрушним дуже довго.",
    achievementGreenAnchorHint: "У трьох послідовних зарахованих спробах утримуй одну й ту саму позицію зеленою.",
    achievementTrafficWinTitle: "Переможний світлофор",
    achievementTrafficWinDescription: "Отримай в одній партії спробу із зеленими, жовтими й рожевими клітинками та потім переможи.",
    achievementAllYellowWinTitle: "Сонце склалося",
    achievementAllYellowWinDescription: "Спочатку все жовте, потім усе стає на місця.",
    achievementAllYellowWinHint: "Отримай повністю жовту зараховану спробу, а потім виграй цю саму партію.",
    achievementHotWinTitle: "Гаряча доріжка",
    achievementHotWinDescription: "Отримай невиграшну спробу без рожевих клітинок, а потім переможи.",
    achievementAlphabetMasterTitle: "Клавіатурний марафон",
    achievementAlphabetMasterDescription: "Здається, ти вирішив познайомитися майже з усіма літерами.",
    achievementAlphabetMasterHint: "За одну партію використай у зарахованих спробах щонайменше 25 різних літер.",
    achievementHintOneNextWinTitle: "Один натяк — і досить",
    achievementHintOneNextWinDescription: "Перший шепіт має одразу привести до відповіді.",
    achievementHintOneNextWinHint: "Відкрий лише підказку 1, а наступною зарахованою спробою відгадай слово.",
    achievementHintTwoNextWinTitle: "Другий промінь",
    achievementHintTwoNextWinDescription: "Другий натяк має стати останньою потрібною підказкою.",
    achievementHintTwoNextWinHint: "Відкрий рівно 2 підказки, а наступною зарахованою спробою відгадай слово.",
    achievementHintThreeNextWinTitle: "Повна карта",
    achievementHintThreeNextWinDescription: "Після третьої підказки вже нема куди відступати.",
    achievementHintThreeNextWinHint: "Відкрий усі 3 підказки, а наступною зарахованою спробою відгадай слово.",
    achievementPatientHintTitle: "Терплячий запит",
    achievementPatientHintDescription: "Першу підказку відкрий не раніше ніж через 60 секунд після старту партії.",
    achievementLateHintTitle: "Останній аргумент",
    achievementLateHintDescription: "Попроси допомогу лише тоді, коли вже дуже довго думав.",
    achievementLateHintHint: "Першу підказку відкрий не раніше ніж через 2 хвилини після старту партії.",
    achievementHintsBeforeGuessTitle: "Спочатку інструкція",
    achievementHintsBeforeGuessDescription: "Спершу дізнайся все, а вже потім зроби перший хід.",
    achievementHintsBeforeGuessHint: "Відкрий усі 3 підказки до першої зарахованої спроби в партії.",
    achievementFiftyHintsTotalTitle: "Штаб допомоги",
    achievementFiftyHintsTotalDescription: "Використай загалом 50 рівнів підказок у всіх партіях.",
    achievementHundredHintsTotalTitle: "Супутник підтримки",
    achievementHundredHintsTotalDescription: "Використай загалом 100 рівнів підказок у всіх партіях.",
    achievementInvalidThenWinTitle: "Спіткнувся — пішов",
    achievementInvalidThenWinDescription: "Виграй партію після хоча б одного введення, яке гра не зарахувала.",
    achievementThreeInvalidRowTitle: "Страйк повз словник",
    achievementThreeInvalidRowDescription: "Зроби 3 незаліковані введення поспіль в одній партії.",
    achievementFiveInvalidRowTitle: "Воронка хаосу",
    achievementFiveInvalidRowDescription: "Словник має п’ять разів поспіль сказати «ні».",
    achievementFiveInvalidRowHint: "Зроби 5 незалікованих введень поспіль в одній партії.",
    achievementDuplicateInvalidTitle: "Папуга",
    achievementDuplicateInvalidDescription: "Словник уже відповідав. Але ти питаєш знову.",
    achievementDuplicateInvalidHint: "За одну партію двічі введи те саме слово, яке гра не зарахує.",
    achievementTenBackspacesGameTitle: "Гумка розігрілась",
    achievementTenBackspacesGameDescription: "Натисни Backspace щонайменше 10 разів за одну завершену партію.",
    achievementThirtyBackspacesGameTitle: "Прибирання століття",
    achievementThirtyBackspacesGameDescription: "Клавіша стирання має добряче попрацювати.",
    achievementThirtyBackspacesGameHint: "Натисни Backspace щонайменше 30 разів за одну завершену партію.",
    achievementFullEraseTitle: "Цього не було",
    achievementFullEraseDescription: "Напиши щось повністю — і передумай абсолютно.",
    achievementFullEraseHint: "Набери повне слово потрібної довжини й, не відправляючи його, зітри всі літери до порожнього рядка.",
    achievementTripleFullEraseTitle: "Переписувач реальності",
    achievementTripleFullEraseDescription: "Одного повного передумування недостатньо.",
    achievementTripleFullEraseHint: "За одну партію тричі набери повне слово й повністю зітри його до відправлення.",
    achievementThreeIncompleteSubmitsTitle: "Куди так поспішати?",
    achievementThreeIncompleteSubmitsDescription: "Тричі за одну партію натисни «Ввести», коли набрано менше літер, ніж потрібно.",
    achievementHundredBackspacesTotalTitle: "Сто кроків назад",
    achievementHundredBackspacesTotalDescription: "Накопич загалом 100 натискань Backspace у завершених партіях.",
    achievementTenUkWinsTitle: "Соняшникова десятка",
    achievementTenUkWinsDescription: "Здобудь 10 перемог українською.",
    achievementTenRuWinsTitle: "Labs: десять пробірок",
    achievementTenRuWinsDescription: "Здобудь 10 перемог у російському Labs-словнику.",
    achievementTenEnWinsTitle: "Labs: ten o’clock",
    achievementTenEnWinsDescription: "Здобудь 10 перемог в англійському Labs-словнику.",
    achievementGlobalTour25Title: "Навколо світу словами",
    achievementGlobalTour25Description: "Зіграй щонайменше 25 партій українською, 25 російською і 25 англійською.",
    achievementGlobalWins10Title: "Три прапори над фінішем",
    achievementGlobalWins10Description: "У кожної мови має бути своя повна десятка перемог.",
    achievementGlobalWins10Hint: "Здобудь щонайменше 10 перемог українською, 10 російською і 10 англійською.",
    achievementSevenAllLanguagesTitle: "Сімка без кордонів",
    achievementSevenAllLanguagesDescription: "Сім літер мають заговорити трьома мовами.",
    achievementSevenAllLanguagesHint: "Здобудь хоча б по 1 перемозі у режимі на 7 літер українською, російською та англійською.",
    achievementFirstTryAllLanguagesTitle: "Три постріли без пристрілки",
    achievementFirstTryAllLanguagesDescription: "Перший постріл має спрацювати в кожній мові.",
    achievementFirstTryAllLanguagesHint: "Здобудь хоча б по 1 перемозі з першої зарахованої спроби українською, російською та англійською.",
    achievementNoHintAllLanguagesTitle: "Мозок без перекладача",
    achievementNoHintAllLanguagesDescription: "Жодна мова не повинна попросити підказку.",
    achievementNoHintAllLanguagesHint: "Здобудь хоча б по 1 перемозі без підказок українською, російською та англійською.",
    achievementSeventyFiveWinsTitle: "Словесний ветеран",
    achievementSeventyFiveWinsDescription: "Здобудь загалом 75 перемог у «Вгадай слово».",
    achievementHundredWinsTitle: "Сотня влучань",
    achievementHundredWinsDescription: "Здобудь загалом 100 перемог у «Вгадай слово».",
    achievementHundredFiftyGamesTitle: "Квиток №150",
    achievementHundredFiftyGamesDescription: "Зіграй загалом 150 партій у «Вгадай слово».",
    achievementTwoFiftyGamesTitle: "Кам’яний завсідник",
    achievementTwoFiftyGamesDescription: "Ця колекція вже бачила дуже багато партій.",
    achievementTwoFiftyGamesHint: "Зіграй загалом 250 партій у «Вгадай слово».",
    achievementFifteenStreakTitle: "Палаюча смуга",
    achievementFifteenStreakDescription: "Полум’я має триматися довше, ніж здається розумним.",
    achievementFifteenStreakHint: "Виграй 15 партій поспіль.",
    achievementTwentyStreakTitle: "Маленьке сонце",
    achievementTwentyStreakDescription: "Серія має стати майже астрономічною.",
    achievementTwentyStreakHint: "Виграй 20 партій поспіль.",
    achievementTwentyFiveFirstTryTitle: "Орлиний клуб",
    achievementTwentyFiveFirstTryDescription: "Відгадай слово першою зарахованою спробою у 25 різних переможних партіях.",
    achievementTwentyFiveNoHintTitle: "Архімаг",
    achievementTwentyFiveNoHintDescription: "Здобудь 25 перемог без використання підказок у цих партіях.",
    achievementLabsEasterTitle: "Сім разів відміряй",
    achievementLabsEasterDescription: "Деякі номери версій дуже люблять увагу.",
    achievementLabsEasterHint: "У глобальних налаштуваннях 7 разів швидко натисни на номер версії та відкрий Мовограй Labs.",
    achievementHintWhispererTitle: "Шепіт плитки",
    achievementHintWhispererDescription: "Колекція любить тих, хто вміє витягувати з неї секрети.",
    achievementHintWhispererHint: "Розкрий точні умови щонайменше 12 різних загадкових досягнень.",
    achievementMuseumVisitorTitle: "Відвідувач музею",
    achievementMuseumVisitorDescription: "Колекція любить, коли до неї повертаються.",
    achievementMuseumVisitorHint: "Відкрий вікно «Досягнення» 5 разів загалом.",
    achievementMuseumCuratorTitle: "Куратор музею",
    achievementMuseumCuratorDescription: "Схоже, ти тут уже працюєш.",
    achievementMuseumCuratorHint: "Відкрий вікно «Досягнення» 20 разів загалом.",
    achievementDayNightTitle: "День / ніч / день / ніч",
    achievementDayNightDescription: "Іноді інтерфейс теж хоче погратися.",
    achievementDayNightHint: "Перемкни світлу/темну тему 10 разів загалом.",
    achievementLogoSecretTitle: "Не тицяй логотип",
    achievementLogoSecretDescription: "Серйозно. Логотип просто стоїть собі.",
    achievementLogoSecretHint: "У головному меню натисни на логотип Мовограю 7 разів.",
    gameDescription: (length, attempts, letterWord, attemptWord, repeatText) => `Відгадай українське слово з ${length} ${letterWord} за ${attempts} ${attemptWord}. ${repeatText}.`,
    dictionaryStats: (targets, allowed) => `Словник гри: ${targets} для загадування · ${allowed} для спроб.`,
    shareModeCompact: (length, result, repeats) => `${length} літер · ${result} · ${repeats ? "з повторами" : "без повторів"}`,
    shareResult: (won, valid, limit) => won ? `Відгадано за ${valid}/${limit}` : `Не відгадано · ${limit} спроб`,
    shareModeFull: (language, length, attempts, repeats) => `${language} · ${length} літер · ${attempts} спроб · ${repeats ? "повтори" : "без повторів"}`,
    fullRules: (length, letterWord, attempts, attemptWord, repeats) => `Введи українське слово з ${length} ${letterWord}${repeats ? ", літери можуть повторюватися" : " без повторення літер"}. Зелена літера стоїть на правильному місці, жовта є у слові, але в іншій позиції, рожева — відсутня. Є ${attempts} зарахованих ${attemptWord}. Підказки мають три рівні.`,
    lookupTitle: (word, dictionary) => `Почитати тлумачення слова ${word} у словнику ${dictionary}`,
    invalidReactions: ["Ой!", "Не-а 😄", "Ще раз!", "Хитре слово 🤨", "Словник сумнівається"],
  },
  ru: {
    brand: "Мовограй", title: "Угадай слово", menuDescription: "Угадай слово по цветным подсказкам.", soloMode: "Одиночный режим · Labs", rules: "Правила", showRules: "Показать правила", howToPlay: "Как играть", hintsTitle: "Подсказки",
    start: "Начать игру", backMenu: "← В меню", mainMenu: "В главное меню", newGame: "Новая игра",
    enter: "Ввести", erase: "Стереть букву", loading: "Загружаем словарь...", loadError: "Не удалось загрузить словарь.",
    repeatOn: "С повторами букв", repeatOff: "Без повторения букв", repeatShortOn: "повторы", repeatShortOff: "без повторов", onlyLetters: "Только русские буквы",
    noRepeats: "Без повторения букв", notInDictionary: "Нет в словаре игры", hintsNone: "Подсказки не использовались",
    hintsUsed: "Использованы подсказки", guessed: "Слово угадано", attemptsOver: "Попытки закончились",
    targetWon: "Загаданное слово", targetLost: "Правильное слово", attempts: "Попытки", checked: "Проверено", invalid: "Не зачтено",
    attemptsLabel: "Попытки:", noAttempts: "Попыток ещё не было.", noAttemptsHistory: "Попыток ещё нет.", noAttemptsResult: "Ни одной попытки не было.", invalidBadge: "Не зачтено",
    share: "Поделиться", dictionaryPrompt: "Посмотреть значение загаданного слова",
    hint1: "Подсказка 1", hint2: "Подсказка 2", hint3: "Подсказка 3", firstHintAgain: "Показать первую подсказку ещё раз", firstHintShow: "Показать первую подсказку",
    secondHintAgain: "Показать вторую подсказку ещё раз", secondHintLocked: "Вторая подсказка откроется после первой", thirdHintAgain: "Показать третью подсказку ещё раз", thirdHintLocked: "Третья подсказка откроется после второй",
    firstHintNext: "После неё откроется подсказка 2 — одна буква, которая точно есть в слове.", secondHintNext: "После неё откроется подсказка 3 — подсветить все буквы загаданного слова на клавиатуре.", thirdHintText: "На клавиатуре подсвечены все буквы, которые есть в загаданном слове.",
    openHint1First: "Сначала откройте подсказку 1", openHint2First: "Сначала откройте подсказку 2", hintBeforeStart: "Подсказка появится после начала игры.", firstLetter: "Первая буква", highlightedLetters: "Подсвеченные буквы",
    languageAdjective: "русское", keyboardLabel: "Русская клавиатура", experimental: "Экспериментальный словарь Labs",
    hintLevels: "3 уровня", close: "Закрыть", modeTagsAria: "Параметры текущей игры", boardAria: "Игровое поле",
    statsAria: "Статистика игры", resultAttemptsAria: "Проверенные попытки", debugAria: "Служебная информация",
    vowelsLabel: "Гласных", firstLetterLabel: "Первая буква", nextHintGlow: "Следующая подсказка доступна",
    statusCorrect: "правильная позиция", statusPresent: "есть в слове", statusAbsent: "нет в слове",
    wordCountOne: "слово", wordCountMany: "слов", targetsShort: "цели", guessesShort: "слова", invalidCount: "Не зачтено",
    shareImageShared: "Картинка результата отправлена", shareImageCopied: "Картинка результата скопирована", shareImageSaved: "Картинка результата сохранена",
    shareTextCopied: "Результат скопирован", shareFailed: "Не удалось поделиться", shareFooter: "movohray · игра со словами",
    shortRulesTitle: "Короткие правила", shortRulesText: "Введите слово выбранной длины. Зелёный — правильная позиция, жёлтый — буква есть в слове, розовый — буквы нет. Доступны три подсказки.",
    labsEyebrow: "Labs · скрытый тест", labsTitle: "Экспериментальные функции", labsCopy: "Язык меняется только в игре «Угадай слово». Украинский остаётся основным; RU и EN — тестовые словари.", labsLanguageAria: "Язык игры Угадай слово",
    labsStatusUk: "Основной проверенный словарь: украинский.", labsStatusRu: "Русский: экспериментальный Labs-режим. Словарь продолжает расширяться и модерироваться.", labsStatusEn: "English: экспериментальный Labs-режим. Словарь продолжает расширяться и модерироваться.",
    labsUnlocked: "Секретный режим открыт", achievementSectionEyebrow: "Achievements · Labs", achievementSectionTitle: "Награды и достижения", achievementSectionCopy: "Локальные награды сохраняются на этом устройстве.", achievementProgress: "Открыто", achievementUnlocked: "Получено", achievementLocked: "Ещё не открыто", achievementToast: "Достижение открыто!", achievementDismiss: "Закрыть уведомление", achievementToastOpen: "Нажми, чтобы посмотреть награду",
    achievementFirstWinTitle: "Первая победа", achievementFirstWinDescription: "Одержи свою первую победу в «Угадай слово».",
    achievementFirstTryTitle: "С первой попытки", achievementFirstTryDescription: "Угадай слово с первой зачтённой попытки в одной партии.",
    achievementNoHintsTitle: "Своя голова", achievementNoHintsDescription: "Выиграй одну партию, не используя ни одной подсказки.",
    achievementRuWinTitle: "RU-исследователь", achievementRuWinDescription: "Победи в русском Labs-словаре.",
    achievementEnWinTitle: "EN-исследователь", achievementEnWinDescription: "Победи в английском Labs-словаре.",
    achievementStubbornTitle: "Упрямство", achievementStubbornDescription: "За одну партию сделай не менее 3 вводов, которые игра не засчитает.",
    achievementUkWinTitle: "Дома лучше", achievementUkWinDescription: "Победи в украинском словаре.",
    achievementLabsDuoTitle: "Двойной эксперимент", achievementLabsDuoDescription: "Одержи минимум по 1 победе в RU Labs и EN Labs.",
    achievementPolyglotTitle: "Полиглот", achievementPolyglotDescription: "Одержи минимум по 1 победе на украинском, русском и английском.",
    achievementCleanWinTitle: "Чистая работа", achievementCleanWinDescription: "Выиграй одну партию без единого ввода, который игра не засчитала.",
    achievementOneHintTitle: "Одним глазком", achievementOneHintDescription: "Выиграй одну партию, использовав ровно 1 подсказку.",
    achievementFullHintsTitle: "Полный брифинг", achievementFullHintsDescription: "Иногда стоит дослушать весь брифинг до конца.",
    achievementLastChanceTitle: "На последнем дыхании", achievementLastChanceDescription: "Угадай слово последней доступной зачтённой попыткой.",
    achievementSpeedrunTitle: "Молния", achievementSpeedrunDescription: "Угадай слово менее чем за 30 секунд от начала партии.",
    achievementSevenLetterTitle: "Длинная история", achievementSevenLetterDescription: "Победи со словом из 7 букв.",
    achievementRepeatMasterTitle: "Дежавю", achievementRepeatMasterDescription: "Угадай слово, в котором повторяется хотя бы одна буква.",
    achievementTrafficLightTitle: "Светофор", achievementTrafficLightDescription: "Три цвета должны встретиться в одном месте.",
    achievementYellowStormTitle: "Жёлтая буря", achievementYellowStormDescription: "В одной зачтённой попытке получи не менее 3 жёлтых букв.",
    achievementGreenWaveTitle: "Зелёная волна", achievementGreenWaveDescription: "В одной зачтённой невыигрышной попытке поставь не менее 3 букв на правильные места.",
    achievementAlphabetTourTitle: "Экскурсия по алфавиту", achievementAlphabetTourDescription: "За одну партию используй в зачтённых попытках не менее 15 разных букв.",
    achievementChaosAgentTitle: "Агент хаоса", achievementChaosAgentDescription: "За одну партию сделай не менее 6 вводов, которые игра не засчитает.",
    achievementComebackTitle: "И всё-таки!", achievementComebackDescription: "Выиграй партию после не менее 3 вводов, которые игра не засчитала.",
    achievementAlmostTitle: "В шаге от славы", achievementAlmostDescription: "Даже поражение иногда бывает почти идеальным.",
    achievementFiveWinsTitle: "Бронзовая серия", achievementFiveWinsDescription: "Одержи в сумме 5 побед в «Угадай слово».",
    achievementTenWinsTitle: "Серебряная десятка", achievementTenWinsDescription: "Одержи в сумме 10 побед в «Угадай слово».",
    achievementTwentyFiveWinsTitle: "Золотой словограй", achievementTwentyFiveWinsDescription: "Одержи в сумме 25 побед в «Угадай слово».",
    achievementThreeStreakTitle: "В огне", achievementThreeStreakDescription: "Выиграй 3 партии подряд.",
    achievementTenGamesTitle: "Втянулся", achievementTenGamesDescription: "Сыграй в сумме 10 партий в «Угадай слово».",
    achievementTwentyFiveGamesTitle: "Завсегдатай", achievementTwentyFiveGamesDescription: "Сыграй в сумме 25 партий в «Угадай слово».",
    achievementMenuEyebrow: "Угадай слово",
    achievementMenuTitle: "Достижения",
    achievementMenuCopy: "Собирай награды за мастерство, серии, эксперименты и забавные ситуации в игре.",
    achievementMenuOpen: "Открыть достижения",
    achievementCategoryOddities: "Странности и Easter Eggs",
    achievementGearGoblinTitle: "Шестерёнка знает слишком много",
    achievementGearGoblinDescription: "Некоторые двери открываются не ключом, а чрезмерным любопытством.",
    achievementGearGoblinHint: "Нажми глобальную кнопку ⚙️ настроек 13 раз.",
    achievementTrophyTapperTitle: "Кубок тоже кнопка",
    achievementTrophyTapperDescription: "Даже музейная вывеска может устать от внимания.",
    achievementTrophyTapperHint: "Нажми кнопку 🏆 достижений 13 раз.",
    achievementRulesLawyerTitle: "Адвокат правил",
    achievementRulesLawyerDescription: "Ты явно ищешь мелкий шрифт.",
    achievementRulesLawyerHint: "Открой правила «Угадай слово» 7 раз.",
    achievementLanguagePinballTitle: "Языковой пинбол",
    achievementLanguagePinballDescription: "UA, RU, EN — шарик всё ещё летает.",
    achievementLanguagePinballHint: "Смени язык «Угадай слово» 12 раз после открытия Labs.",
    achievementLengthCarouselTitle: "Карусель букв",
    achievementLengthCarouselDescription: "Пять? Шесть? Семь? А может ещё раз.",
    achievementLengthCarouselHint: "Смени длину слова в настройках 15 раз.",
    achievementAttemptCarouselTitle: "Крутилка судьбы",
    achievementAttemptCarouselDescription: "Количество шансов никак не определится.",
    achievementAttemptCarouselHint: "Смени количество попыток в настройках 15 раз.",
    achievementRepeatSwitcherTitle: "Повтор повтора",
    achievementRepeatSwitcherDescription: "Этот переключатель начинает что-то подозревать.",
    achievementRepeatSwitcherHint: "Включи или выключи повторение букв 10 раз.",
    achievementMuseumNightShiftTitle: "Ночная смена в музее",
    achievementMuseumNightShiftDescription: "Охранник коллекции уже узнаёт тебя в лицо.",
    achievementMuseumNightShiftHint: "Открой коллекцию достижений 50 раз.",
    achievementThemeChameleonTitle: "Хамелеон интерфейса",
    achievementThemeChameleonDescription: "Свет. Тьма. Свет. Тьма. Может, определимся?",
    achievementThemeChameleonHint: "Переключи светлую/тёмную тему 25 раз.",
    achievementFeedbackPioneerTitle: "Первый сигнал",
    achievementFeedbackPioneerDescription: "Сохрани первое сообщение или оценку для разработчика.",
    achievementBugHunterTitle: "Охотник на жуков",
    achievementBugHunterDescription: "Сохрани сообщение о баге для разработчика.",
    achievementWordFanTitle: "Слово зашло",
    achievementWordFanDescription: "Поставь 👍 хотя бы одному загаданному слову.",
    achievementWordCriticTitle: "Редактор проснулся",
    achievementWordCriticDescription: "Поставь 👎 хотя бы одному загаданному слову.",
    achievementBalancedCriticTitle: "И кнут, и пряник",
    achievementBalancedCriticDescription: "Справедливый критик знает, что не всё одинаково.",
    achievementBalancedCriticHint: "Поставь хотя бы один 👍 и хотя бы один 👎 загаданным словам.",
    achievementShareTrioTitle: "Мовограй в люди",
    achievementShareTrioDescription: "Поделись результатом игры 3 раза.",
    achievementEmptyEnterSevenTitle: "Enter в пустоту",
    achievementEmptyEnterSevenDescription: "Кнопка ввода терпелива. Но не бесконечно.",
    achievementEmptyEnterSevenHint: "За одну партию 7 раз нажми «Ввести», когда слово ещё не набрано полностью.",
    achievementBackspaceBlizzardTitle: "Метель Backspace",
    achievementBackspaceBlizzardDescription: "Буквы приходят и уходят. В основном уходят.",
    achievementBackspaceBlizzardHint: "За одну партию удали Backspace не менее 50 набранных букв.",
    achievementInvalidTornadoTitle: "Торнадо незачётов",
    achievementInvalidTornadoDescription: "Словарь уже прячется под столом.",
    achievementInvalidTornadoHint: "За одну партию сделай 10 вводов, которые игра не засчитает.",
    achievementLetterMonotonyTitle: "Попугай",
    achievementLetterMonotonyDescription: "Одна буква. Снова она. И ещё раз она.",
    achievementLetterMonotonyHint: "Во время набора составь последовательность минимум из 4 одинаковых букв.",
    achievementVowelChoirTitle: "Хор гласных",
    achievementVowelChoirDescription: "А-а-а… и это внезапно стало стратегией.",
    achievementVowelChoirHint: "Во время набора введи не менее 4 гласных подряд без согласных.",
    achievementConsonantWallTitle: "Стена согласных",
    achievementConsonantWallDescription: "Ни глотка воздуха между этими буквами.",
    achievementConsonantWallHint: "Попробуй ввести полное слово без единой гласной.",
    achievementMirrorGuessTitle: "Зеркало",
    achievementMirrorGuessDescription: "Начало подозрительно похоже на конец.",
    achievementMirrorGuessHint: "Попробуй ввести палиндром длиной 5–7 букв.",
    achievementKeyboardTourLiveTitle: "Пальцы видели всё",
    achievementKeyboardTourLiveDescription: "За одну партию нажми не менее 20 разных букв клавиатуры.",
    achievementEraseBeforeFirstTitle: "Черновик уничтожен",
    achievementEraseBeforeFirstDescription: "Первая идея не пережила редактуру.",
    achievementEraseBeforeFirstHint: "До первой засчитанной попытки набери полное слово и полностью его сотри.",
    achievementNervousFingersTitle: "Нервные пальцы",
    achievementNervousFingersDescription: "Редактор внутри тебя очень активен.",
    achievementNervousFingersHint: "До первой засчитанной попытки удали Backspace не менее 20 набранных букв.",
    achievementSilentMinuteTitle: "Минута тишины",
    achievementSilentMinuteDescription: "Мысль созревала дольше, чем хотелось клавиатуре.",
    achievementSilentMinuteHint: "Сделай первую засчитанную попытку не раньше чем через 60 секунд после старта партии.",
    achievementSpeedMistakeTitle: "Быстрее мысли",
    achievementSpeedMistakeDescription: "Руки уже нажали Enter, а мозг ещё загружался.",
    achievementSpeedMistakeHint: "Получи незасчитанный ввод в первые 5 секунд партии.",
    achievementNoGreenLossTitle: "Арктическая партия",
    achievementNoGreenLossDescription: "Зелёный свет так и не включился.",
    achievementNoGreenLossHint: "Проиграй партию, не получив ни одной зелёной клетки.",
    achievementYellowOnlyLossTitle: "Золото без победы",
    achievementYellowOnlyLossDescription: "Буквы были где-то рядом. Очень рядом.",
    achievementYellowOnlyLossHint: "Проиграй партию, получив хотя бы одну жёлтую клетку, но ни одной зелёной.",
    achievementThreeBlackoutsTitle: "Три затмения",
    achievementThreeBlackoutsDescription: "Трижды — и ни одна буква не знала ответа.",
    achievementThreeBlackoutsHint: "За одну партию получи 3 засчитанных ряда, где все клетки отмечены как отсутствующие.",
    achievementRainbowCollectorTitle: "Коллекционер погоды",
    achievementRainbowCollectorDescription: "В этой партии было и пасмурно, и пёстро, и почти солнечно.",
    achievementRainbowCollectorHint: "За одну партию получи полностью «серый» ряд, ряд с тремя типами цветов и невигрышный ряд без отсутствующих букв.",
    achievementSevenChaosWinTitle: "Семибуквенный осьминог",
    achievementSevenChaosWinDescription: "Семь букв, много хаоса — и всё равно победа.",
    achievementSevenChaosWinHint: "Выиграй 7-буквенную партию после минимум 5 незасчитанных вводов.",
    supportEyebrow: "Данные и поддержка",
    supportTitle: "Сброс и связь",
    supportReportTitle: "Сообщить разработчику",
    supportReportText: "Баг или странное поведение — пока отчёт сохранится локально как заглушка будущего сервера.",
    supportResetTitle: "Сбросить прогресс и настройки",
    supportResetText: "Удалить достижения, Labs и персональные настройки на этом устройстве.",
    supportResetConfirm: "Сбросить все достижения, Labs и настройки Мовограю на этом устройстве? Сохранённые отзывы разработчику останутся.",
    supportResetDone: "Прогресс и настройки сброшены.",
    feedbackWordTitle: "Оцените загаданное слово",
    feedbackLike: "Нравится",
    feedbackDislike: "Не нравится",
    feedbackReport: "Пожаловаться / баг",
    feedbackThanks: "Спасибо! Оценка сохранена локально.",
    feedbackModalEyebrow: "Связь с разработчиком",
    feedbackModalTitle: "Сообщить о проблеме",
    feedbackModalCopy: "Опишите баг, слово или другую странность. Отправка на сервер ещё не подключена — запись сохранится на этом устройстве.",
    feedbackPlaceholder: "Что произошло? Что ожидали увидеть?",
    feedbackSave: "Отправить разработчику",
    feedbackSaved: "Сохранено локально. Серверная отправка появится позже.",
    feedbackEmpty: "Напишите хотя бы несколько слов о проблеме.",
    feedbackContextWord: "Текущее слово",
    feedbackExport: "Скопировать локальный отчёт",
    achievementCategorySkill: "Мастерство",
    achievementCategoryPatterns: "Цвета и закономерности",
    achievementCategoryHints: "Подсказки",
    achievementCategoryChaos: "Ошибки и хаос",
    achievementCategoryLanguages: "Языки и Labs",
    achievementCategoryStreaks: "Серии и стиль",
    achievementCategoryMilestones: "Вехи коллекции",
    achievementFiveLetterWinTitle: "Пятёрочка",
    achievementFiveLetterWinDescription: "Победи со словом из 5 букв.",
    achievementSixLetterWinTitle: "Шесть из шести",
    achievementSixLetterWinDescription: "Победи со словом из 6 букв.",
    achievementAllLengthsTitle: "Полная линейка",
    achievementAllLengthsDescription: "Одержи минимум по 1 победе в режимах на 5, 6 и 7 букв.",
    achievementTwoTryTitle: "Двойной выстрел",
    achievementTwoTryDescription: "Угадай слово с первой или второй зачтённой попытки.",
    achievementAllYellowTitle: "Солнечная анаграмма",
    achievementAllYellowDescription: "Всё уже рядом, но пока ничего не стоит на своём месте.",
    achievementAllGrayTitle: "Мимо кассы",
    achievementAllGrayDescription: "Сделай зачтённую попытку, в которой все клетки розовые — ни одной буквы нет в слове.",
    achievementHotHandTitle: "Горячо!",
    achievementHotHandDescription: "Сделай зачтённую невыигрышную попытку без единой розовой клетки.",
    achievementRepeatGuessTitle: "Точно это слово?",
    achievementRepeatGuessDescription: "Может, стоит сказать это ещё раз? Точно так же.",
    achievementAlphabetExplorerTitle: "Почти вся клавиатура",
    achievementAlphabetExplorerDescription: "Клавиатура просит очень долгой прогулки.",
    achievementFiveHintsTotalTitle: "Фонарик",
    achievementFiveHintsTotalDescription: "Используй в сумме 5 уровней подсказок во всех сыгранных партиях.",
    achievementTenHintsTotalTitle: "Прожектор",
    achievementTenHintsTotalDescription: "Используй в сумме 10 уровней подсказок во всех сыгранных партиях.",
    achievementTwentyFiveHintsTotalTitle: "Спасательный круг",
    achievementTwentyFiveHintsTotalDescription: "Используй в сумме 25 уровней подсказок во всех сыгранных партиях.",
    achievementTenInvalidTotalTitle: "Словарь держится",
    achievementTenInvalidTotalDescription: "Накопи в сумме 10 вводов, которые игра не засчитала.",
    achievementTwentyFiveInvalidTotalTitle: "Крепкий словарь",
    achievementTwentyFiveInvalidTotalDescription: "Накопи в сумме 25 вводов, которые игра не засчитала.",
    achievementFiftyInvalidTotalTitle: "А словарь выжил",
    achievementFiftyInvalidTotalDescription: "Накопи в сумме 50 вводов, которые игра не засчитала.",
    achievementFiftyWinsTitle: "Корона словесника",
    achievementFiftyWinsDescription: "Одержи в сумме 50 побед в «Угадай слово».",
    achievementFiftyGamesTitle: "Полсотни партий",
    achievementFiftyGamesDescription: "Сыграй в сумме 50 партий в «Угадай слово».",
    achievementHundredGamesTitle: "Сто историй",
    achievementHundredGamesDescription: "Сыграй в сумме 100 партий в «Угадай слово».",
    achievementFiveStreakTitle: "Раскалённый",
    achievementFiveStreakDescription: "Выиграй 5 партий подряд.",
    achievementTenStreakTitle: "Комета",
    achievementTenStreakDescription: "Комета не должна гаснуть очень долго.",
    achievementFiveFirstTryTitle: "Снайпер",
    achievementFiveFirstTryDescription: "Угадай слово с первой зачтённой попытки в 5 разных победных партиях.",
    achievementTenFirstTryTitle: "Орлиный глаз",
    achievementTenFirstTryDescription: "Угадай слово с первой зачтённой попытки в 10 разных победных партиях.",
    achievementFiveNoHintTitle: "Сам себе подсказка",
    achievementFiveNoHintDescription: "Одержи 5 побед, не используя подсказок в этих партиях.",
    achievementTenNoHintTitle: "Менталист",
    achievementTenNoHintDescription: "Одержи 10 побед, не используя подсказок в этих партиях.",
    achievementFiveSevenLetterTitle: "Охотник на семёрки",
    achievementFiveSevenLetterDescription: "Одержи 5 побед в режиме со словами из 7 букв.",
    achievementTenSevenLetterTitle: "Дракон семи букв",
    achievementTenSevenLetterDescription: "Одержи 10 побед в режиме со словами из 7 букв.",
    achievementLanguageTouristTitle: "Языковой турист",
    achievementLanguageTouristDescription: "Сыграй не менее 5 партий на украинском, 5 на русском и 5 на английском.",
    achievementLanguageVeteranTitle: "Три паспорта",
    achievementLanguageVeteranDescription: "Три языковых паспорта должны быть хорошо потрёпаны.",
    achievementTwoHintsTitle: "Два намёка",
    achievementTwoHintsDescription: "Выиграй одну партию, использовав ровно 2 подсказки.",
    achievementFiveLastChanceTitle: "Короткий фитиль",
    achievementFiveLastChanceDescription: "В режиме на 5 букв угадай слово последней доступной зачтённой попыткой.",
    achievementSevenFirstTryTitle: "Оракул",
    achievementSevenFirstTryDescription: "Семь знаков. Один выстрел. Никакой разведки.",
    achievementFlash15Title: "Вспышка",
    achievementFlash15Description: "Угадай слово не более чем за 15 секунд от начала партии.",
    achievementMarathonTitle: "Марафонец",
    achievementMarathonDescription: "Не все победы любят спешку.",
    achievementPhoenixTitle: "Феникс",
    achievementPhoenixDescription: "Даже после серии отказов можно красиво взлететь.",
    achievementZeroToWordTitle: "С нуля в яблочко",
    achievementZeroToWordDescription: "Начните с полной темноты — и всё равно найдите свет.",
    achievementCategorySecrets: "Секреты и Easter Eggs",
    achievementMysteryLabel: "Загадочное условие",
    achievementTapForHint: "Условие скрыто",
    achievementHowTo: "Как открыть",
    achievementHintRevealed: "Условие раскрыто",
    achievementHintRevealedToast: "Подсказка раскрыта — награду ещё нужно заработать 🔎",
    achievementFullHintsHint: "Выиграйте одну партию после использования всех 3 уровней подсказок.",
    achievementTrafficLightHint: "В одной зачтённой попытке получите одновременно зелёные, жёлтые и розовые клетки.",
    achievementAlmostHint: "Проиграйте партию, имея в последней зачтённой попытке все правильные позиции, кроме одной.",
    achievementAllYellowHint: "Сделайте зачтённую попытку, в которой все клетки жёлтые.",
    achievementRepeatGuessHint: "За одну партию дважды введите одно и то же зачтённое слово.",
    achievementAlphabetExplorerHint: "За одну партию используйте в зачтённых попытках не менее 20 разных букв.",
    achievementLanguageVeteranHint: "Сыграйте не менее 10 партий на украинском, 10 на русском и 10 на английском.",
    achievementTenStreakHint: "Выиграйте 10 партий подряд.",
    achievementSevenFirstTryHint: "В режиме на 7 букв угадайте слово с первой зачтённой попытки.",
    achievementMarathonHint: "Завершите партию победой не раньше чем через 3 минуты после её начала.",
    achievementPhoenixHint: "Выиграйте одну партию после не менее 5 вводов, которые игра не засчитала.",
    achievementZeroToWordHint: "Сделайте зачтённую попытку со всеми розовыми клетками, а затем выиграйте эту же партию.",
    achievementExactThreeTitle: "Третий выстрел",
    achievementExactThreeDescription: "Угадайте слово ровно с третьей зачтённой попытки.",
    achievementExactFourTitle: "Четвёртый звонок",
    achievementExactFourDescription: "Угадайте слово ровно с четвёртой зачтённой попытки.",
    achievementExactFiveTitle: "Пятая передача",
    achievementExactFiveDescription: "Угадайте слово ровно с пятой зачтённой попытки.",
    achievementSevenSpeedTitle: "Семь на скорости",
    achievementSevenSpeedDescription: "Семь букв не любят ждать.",
    achievementSevenSpeedHint: "Победите в режиме на 7 букв не более чем за 30 секунд от начала партии.",
    achievementSevenNoHintsTitle: "Семь без страховки",
    achievementSevenNoHintsDescription: "Победите со словом из 7 букв без подсказок.",
    achievementSevenTwoTryTitle: "Ниндзя семёрки",
    achievementSevenTwoTryDescription: "Большое слово можно взять почти без разведки.",
    achievementSevenTwoTryHint: "Угадайте 7-буквенное слово не позднее второй зачтённой попытки.",
    achievementFiveFlashTitle: "Пять на вспышке",
    achievementFiveFlashDescription: "В режиме на 5 букв победите не более чем за 15 секунд.",
    achievementSixFlashTitle: "Шесть искр",
    achievementSixFlashDescription: "В режиме на 6 букв победите не более чем за 20 секунд.",
    achievementCleanFirstTryTitle: "Бриллиантовый выстрел",
    achievementCleanFirstTryDescription: "Идеальная партия должна быть без единой царапины.",
    achievementCleanFirstTryHint: "Угадайте слово первой зачтённой попыткой, без подсказок и без единого незачтённого ввода.",
    achievementChaosLastChanceTitle: "Финал сезона",
    achievementChaosLastChanceDescription: "Перед финальной сценой нужно немного хаоса.",
    achievementChaosLastChanceHint: "Победите последней доступной зачтённой попыткой после минимум 3 незачтённых вводов.",
    achievementSlowPureTitle: "Дзен-режим",
    achievementSlowPureDescription: "Думайте долго, но не просите помощи.",
    achievementSlowPureHint: "Победите не раньше чем через 3 минуты после старта и не используйте подсказки.",
    achievementFullBriefingLastTitle: "Всё по инструкции",
    achievementFullBriefingLastDescription: "Прочитайте всё, а ответ оставьте на самый финал.",
    achievementFullBriefingLastHint: "Используйте все 3 подсказки и угадайте слово последней доступной зачтённой попыткой.",
    achievementFirstGreenTitle: "Зелёный привет",
    achievementFirstGreenDescription: "В первой зачтённой попытке получите хотя бы 1 зелёную клетку.",
    achievementFirstDoubleGreenTitle: "Магнит на место",
    achievementFirstDoubleGreenDescription: "В первой зачтённой попытке получите минимум 2 зелёные клетки.",
    achievementFirstAllGrayTitle: "Тёмный старт",
    achievementFirstAllGrayDescription: "Сделайте первую зачтённую попытку полностью розовой.",
    achievementFirstAllYellowTitle: "Жёлтый рассвет",
    achievementFirstAllYellowDescription: "Первая попытка знает все буквы, но путает адреса.",
    achievementFirstAllYellowHint: "Сделайте первую зачтённую попытку, в которой все клетки жёлтые.",
    achievementOneAwayTitle: "Одна клетка до счастья",
    achievementOneAwayDescription: "В невыигрышной зачтённой попытке поставьте правильно все буквы, кроме одной.",
    achievementBlindStartWinTitle: "Из темноты к слову",
    achievementBlindStartWinDescription: "Начните без единого точного попадания, но не останавливайтесь.",
    achievementBlindStartWinHint: "В первой зачтённой попытке не получите ни одной зелёной клетки, а затем выиграйте эту партию.",
    achievementYellowToGreenTitle: "Цыплёнок нашёл место",
    achievementYellowToGreenDescription: "Одна буква должна переехать туда, где ей действительно место.",
    achievementYellowToGreenHint: "В двух соседних зачтённых попытках сделайте так, чтобы одна и та же буква сначала была жёлтой, а затем зелёной.",
    achievementGreenAnchorTitle: "Зелёный якорь",
    achievementGreenAnchorDescription: "Что-то правильное должно оставаться неподвижным очень долго.",
    achievementGreenAnchorHint: "В трёх последовательных зачтённых попытках удерживайте одну и ту же позицию зелёной.",
    achievementTrafficWinTitle: "Победный светофор",
    achievementTrafficWinDescription: "Получите в одной партии попытку с зелёными, жёлтыми и розовыми клетками, а затем победите.",
    achievementAllYellowWinTitle: "Солнце сложилось",
    achievementAllYellowWinDescription: "Сначала всё жёлтое, потом всё встаёт на места.",
    achievementAllYellowWinHint: "Получите полностью жёлтую зачтённую попытку, а затем выиграйте эту же партию.",
    achievementHotWinTitle: "Горячая дорожка",
    achievementHotWinDescription: "Получите невыигрышную попытку без розовых клеток, а затем победите.",
    achievementAlphabetMasterTitle: "Клавиатурный марафон",
    achievementAlphabetMasterDescription: "Похоже, вы решили познакомиться почти со всеми буквами.",
    achievementAlphabetMasterHint: "За одну партию используйте в зачтённых попытках минимум 25 разных букв.",
    achievementHintOneNextWinTitle: "Один намёк — и хватит",
    achievementHintOneNextWinDescription: "Первый шёпот должен сразу привести к ответу.",
    achievementHintOneNextWinHint: "Откройте только подсказку 1, а следующей зачтённой попыткой угадайте слово.",
    achievementHintTwoNextWinTitle: "Второй луч",
    achievementHintTwoNextWinDescription: "Второй намёк должен стать последней нужной помощью.",
    achievementHintTwoNextWinHint: "Откройте ровно 2 подсказки, а следующей зачтённой попыткой угадайте слово.",
    achievementHintThreeNextWinTitle: "Полная карта",
    achievementHintThreeNextWinDescription: "После третьей подсказки уже некуда отступать.",
    achievementHintThreeNextWinHint: "Откройте все 3 подсказки, а следующей зачтённой попыткой угадайте слово.",
    achievementPatientHintTitle: "Терпеливый запрос",
    achievementPatientHintDescription: "Первую подсказку откройте не раньше чем через 60 секунд после старта партии.",
    achievementLateHintTitle: "Последний аргумент",
    achievementLateHintDescription: "Попросите помощь только после очень долгих раздумий.",
    achievementLateHintHint: "Первую подсказку откройте не раньше чем через 2 минуты после старта партии.",
    achievementHintsBeforeGuessTitle: "Сначала инструкция",
    achievementHintsBeforeGuessDescription: "Сначала узнайте всё, а уже потом делайте первый ход.",
    achievementHintsBeforeGuessHint: "Откройте все 3 подсказки до первой зачтённой попытки в партии.",
    achievementFiftyHintsTotalTitle: "Штаб помощи",
    achievementFiftyHintsTotalDescription: "Используйте суммарно 50 уровней подсказок во всех партиях.",
    achievementHundredHintsTotalTitle: "Спутник поддержки",
    achievementHundredHintsTotalDescription: "Используйте суммарно 100 уровней подсказок во всех партиях.",
    achievementInvalidThenWinTitle: "Споткнулся — пошёл",
    achievementInvalidThenWinDescription: "Выиграйте партию после хотя бы одного ввода, который игра не засчитала.",
    achievementThreeInvalidRowTitle: "Страйк мимо словаря",
    achievementThreeInvalidRowDescription: "Сделайте 3 незачтённых ввода подряд в одной партии.",
    achievementFiveInvalidRowTitle: "Воронка хаоса",
    achievementFiveInvalidRowDescription: "Словарь должен пять раз подряд сказать «нет».",
    achievementFiveInvalidRowHint: "Сделайте 5 незачтённых вводов подряд в одной партии.",
    achievementDuplicateInvalidTitle: "Попугай",
    achievementDuplicateInvalidDescription: "Словарь уже отвечал. Но вы спрашиваете снова.",
    achievementDuplicateInvalidHint: "За одну партию дважды введите одно и то же слово, которое игра не засчитает.",
    achievementTenBackspacesGameTitle: "Ластик разогрелся",
    achievementTenBackspacesGameDescription: "Нажмите Backspace минимум 10 раз за одну завершённую партию.",
    achievementThirtyBackspacesGameTitle: "Уборка века",
    achievementThirtyBackspacesGameDescription: "Клавиша стирания должна серьёзно поработать.",
    achievementThirtyBackspacesGameHint: "Нажмите Backspace минимум 30 раз за одну завершённую партию.",
    achievementFullEraseTitle: "Этого не было",
    achievementFullEraseDescription: "Напишите что-то полностью — и передумайте абсолютно.",
    achievementFullEraseHint: "Наберите полное слово нужной длины и, не отправляя его, сотрите все буквы до пустой строки.",
    achievementTripleFullEraseTitle: "Переписчик реальности",
    achievementTripleFullEraseDescription: "Одного полного передумывания недостаточно.",
    achievementTripleFullEraseHint: "За одну партию трижды наберите полное слово и полностью сотрите его до отправки.",
    achievementThreeIncompleteSubmitsTitle: "Куда так спешить?",
    achievementThreeIncompleteSubmitsDescription: "Трижды за одну партию нажмите «Ввести», когда набрано меньше букв, чем требуется.",
    achievementHundredBackspacesTotalTitle: "Сто шагов назад",
    achievementHundredBackspacesTotalDescription: "Накопите суммарно 100 нажатий Backspace в завершённых партиях.",
    achievementTenUkWinsTitle: "Подсолнечная десятка",
    achievementTenUkWinsDescription: "Одержите 10 побед на украинском.",
    achievementTenRuWinsTitle: "Labs: десять пробирок",
    achievementTenRuWinsDescription: "Одержите 10 побед в русском Labs-словаре.",
    achievementTenEnWinsTitle: "Labs: ten o’clock",
    achievementTenEnWinsDescription: "Одержите 10 побед в английском Labs-словаре.",
    achievementGlobalTour25Title: "Вокруг света словами",
    achievementGlobalTour25Description: "Сыграйте минимум 25 партий на украинском, 25 на русском и 25 на английском.",
    achievementGlobalWins10Title: "Три флага над финишем",
    achievementGlobalWins10Description: "У каждого языка должна быть своя полная десятка побед.",
    achievementGlobalWins10Hint: "Одержите минимум 10 побед на украинском, 10 на русском и 10 на английском.",
    achievementSevenAllLanguagesTitle: "Семёрка без границ",
    achievementSevenAllLanguagesDescription: "Семь букв должны заговорить на трёх языках.",
    achievementSevenAllLanguagesHint: "Одержите хотя бы по 1 победе в режиме на 7 букв на украинском, русском и английском.",
    achievementFirstTryAllLanguagesTitle: "Три выстрела без пристрелки",
    achievementFirstTryAllLanguagesDescription: "Первый выстрел должен сработать на каждом языке.",
    achievementFirstTryAllLanguagesHint: "Одержите хотя бы по 1 победе с первой зачтённой попытки на украинском, русском и английском.",
    achievementNoHintAllLanguagesTitle: "Мозг без переводчика",
    achievementNoHintAllLanguagesDescription: "Ни один язык не должен попросить подсказку.",
    achievementNoHintAllLanguagesHint: "Одержите хотя бы по 1 победе без подсказок на украинском, русском и английском.",
    achievementSeventyFiveWinsTitle: "Словесный ветеран",
    achievementSeventyFiveWinsDescription: "Одержите суммарно 75 побед в «Угадай слово».",
    achievementHundredWinsTitle: "Сотня попаданий",
    achievementHundredWinsDescription: "Одержите суммарно 100 побед в «Угадай слово».",
    achievementHundredFiftyGamesTitle: "Билет №150",
    achievementHundredFiftyGamesDescription: "Сыграйте суммарно 150 партий в «Угадай слово».",
    achievementTwoFiftyGamesTitle: "Каменный завсегдатай",
    achievementTwoFiftyGamesDescription: "Эта коллекция уже видела очень много партий.",
    achievementTwoFiftyGamesHint: "Сыграйте суммарно 250 партий в «Угадай слово».",
    achievementFifteenStreakTitle: "Пылающая полоса",
    achievementFifteenStreakDescription: "Пламя должно держаться дольше, чем кажется разумным.",
    achievementFifteenStreakHint: "Выиграйте 15 партий подряд.",
    achievementTwentyStreakTitle: "Маленькое солнце",
    achievementTwentyStreakDescription: "Серия должна стать почти астрономической.",
    achievementTwentyStreakHint: "Выиграйте 20 партий подряд.",
    achievementTwentyFiveFirstTryTitle: "Орлиный клуб",
    achievementTwentyFiveFirstTryDescription: "Угадайте слово первой зачтённой попыткой в 25 разных выигранных партиях.",
    achievementTwentyFiveNoHintTitle: "Архимаг",
    achievementTwentyFiveNoHintDescription: "Одержите 25 побед без использования подсказок в этих партиях.",
    achievementLabsEasterTitle: "Семь раз отмерь",
    achievementLabsEasterDescription: "Некоторые номера версий очень любят внимание.",
    achievementLabsEasterHint: "В глобальных настройках 7 раз быстро нажмите на номер версии и откройте Мовограй Labs.",
    achievementHintWhispererTitle: "Шёпот плитки",
    achievementHintWhispererDescription: "Коллекция любит тех, кто умеет вытягивать из неё секреты.",
    achievementHintWhispererHint: "Раскройте точные условия как минимум 12 разных загадочных достижений.",
    achievementMuseumVisitorTitle: "Посетитель музея",
    achievementMuseumVisitorDescription: "Коллекция любит, когда к ней возвращаются.",
    achievementMuseumVisitorHint: "Откройте окно «Достижения» 5 раз суммарно.",
    achievementMuseumCuratorTitle: "Куратор музея",
    achievementMuseumCuratorDescription: "Похоже, вы здесь уже работаете.",
    achievementMuseumCuratorHint: "Откройте окно «Достижения» 20 раз суммарно.",
    achievementDayNightTitle: "День / ночь / день / ночь",
    achievementDayNightDescription: "Иногда интерфейс тоже хочет поиграть.",
    achievementDayNightHint: "Переключите светлую/тёмную тему 10 раз суммарно.",
    achievementLogoSecretTitle: "Не тыкайте логотип",
    achievementLogoSecretDescription: "Серьёзно. Логотип просто стоит себе.",
    achievementLogoSecretHint: "В главном меню нажмите на логотип Мовограя 7 раз.",
    gameDescription: (length, attempts, letterWord, attemptWord, repeatText) => `Угадай русское слово из ${length} ${letterWord} за ${attempts} ${attemptWord}. ${repeatText}.`,
    dictionaryStats: (targets, allowed) => `Словарь игры: ${targets} для загадки · ${allowed} для попыток.`,
    shareModeCompact: (length, result, repeats) => `${length} букв · ${result} · ${repeats ? "с повторами" : "без повторов"}`,
    shareResult: (won, valid, limit) => won ? `Угадано за ${valid}/${limit}` : `Не угадано · ${limit} попыток`,
    shareModeFull: (language, length, attempts, repeats) => `${language} · ${length} букв · ${attempts} попыток · ${repeats ? "повторы" : "без повторов"}`,
    fullRules: (length, letterWord, attempts, attemptWord, repeats) => `Введите русское слово из ${length} ${letterWord}. ${repeats ? "Буквы могут повторяться" : "Буквы не должны повторяться"}. Зелёная буква стоит на правильном месте, жёлтая есть в слове, но в другой позиции, розовая отсутствует. Есть ${attempts} зачтённых ${attemptWord}. Доступны три уровня подсказок.`,
    lookupTitle: (word, dictionary) => `Посмотреть значение слова ${word} в ${dictionary}`,
    invalidReactions: ["Ой!", "Не-а 😄", "Ещё раз!", "Хитро 🤨", "Словарь сомневается"],
  },
  en: {
    brand: "Movohray", title: "Guess the word", menuDescription: "Guess the word using color clues.", soloMode: "Solo mode · Labs", rules: "Rules", showRules: "Show rules", howToPlay: "How to play", hintsTitle: "Hints",
    start: "Start game", backMenu: "← Menu", mainMenu: "Main menu", newGame: "New game",
    enter: "Enter", erase: "Erase letter", loading: "Loading dictionary...", loadError: "Could not load dictionary.",
    repeatOn: "Repeated letters allowed", repeatOff: "No repeated letters", repeatShortOn: "repeats", repeatShortOff: "no repeats", onlyLetters: "English letters only",
    noRepeats: "No repeated letters", notInDictionary: "Not in the game dictionary", hintsNone: "No hints used",
    hintsUsed: "Hints used", guessed: "Word guessed", attemptsOver: "No attempts left",
    targetWon: "Target word", targetLost: "Correct word", attempts: "Attempts", checked: "Checked", invalid: "Invalid",
    attemptsLabel: "Attempts:", noAttempts: "No attempts yet.", noAttemptsHistory: "No attempts yet.", noAttemptsResult: "No attempts were made.", invalidBadge: "Invalid",
    share: "Share", dictionaryPrompt: "Look up the target word",
    hint1: "Hint 1", hint2: "Hint 2", hint3: "Hint 3", firstHintAgain: "Show the first hint again", firstHintShow: "Show the first hint",
    secondHintAgain: "Show the second hint again", secondHintLocked: "Hint 2 unlocks after hint 1", thirdHintAgain: "Show the third hint again", thirdHintLocked: "Hint 3 unlocks after hint 2",
    firstHintNext: "Hint 2 will unlock next — one letter that is definitely in the word.", secondHintNext: "Hint 3 will unlock next — highlight all letters from the target word on the keyboard.", thirdHintText: "All letters from the target word are highlighted on the keyboard.",
    openHint1First: "Open hint 1 first", openHint2First: "Open hint 2 first", hintBeforeStart: "The hint will appear after the game starts.", firstLetter: "First letter", highlightedLetters: "Highlighted letters",
    languageAdjective: "English", keyboardLabel: "English keyboard", experimental: "Experimental Labs dictionary",
    hintLevels: "3 levels", close: "Close", modeTagsAria: "Current game settings", boardAria: "Game board",
    statsAria: "Game statistics", resultAttemptsAria: "Checked attempts", debugAria: "Technical information",
    vowelsLabel: "Vowels", firstLetterLabel: "First letter", nextHintGlow: "Next hint available",
    statusCorrect: "correct position", statusPresent: "in the word", statusAbsent: "not in the word",
    wordCountOne: "word", wordCountMany: "words", targetsShort: "targets", guessesShort: "guesses", invalidCount: "Invalid",
    shareImageShared: "Result image shared", shareImageCopied: "Result image copied", shareImageSaved: "Result image saved",
    shareTextCopied: "Result copied", shareFailed: "Could not share", shareFooter: "movohray · word game",
    shortRulesTitle: "Quick rules", shortRulesText: "Enter a word of the selected length. Green is the correct position, yellow means the letter exists elsewhere, pink means it is absent. Three hints are available.",
    labsEyebrow: "Labs · hidden test", labsTitle: "Experimental features", labsCopy: "The language changes only in Guess the word. Ukrainian remains the primary dictionary; RU and EN are experimental.", labsLanguageAria: "Guess the word language",
    labsStatusUk: "Primary verified dictionary: Ukrainian.", labsStatusRu: "Russian: experimental Labs mode. The dictionary is still being expanded and moderated.", labsStatusEn: "English: experimental Labs mode. The dictionary is still being expanded and moderated.",
    labsUnlocked: "Secret mode unlocked", achievementSectionEyebrow: "Achievements · Labs", achievementSectionTitle: "Awards & achievements", achievementSectionCopy: "Local achievements are stored on this device.", achievementProgress: "Unlocked", achievementUnlocked: "Unlocked", achievementLocked: "Not yet unlocked", achievementToast: "Achievement unlocked!", achievementDismiss: "Dismiss notification", achievementToastOpen: "Tap to view this achievement",
    achievementFirstWinTitle: "First victory", achievementFirstWinDescription: "Earn your first-ever win in Guess the word.",
    achievementFirstTryTitle: "First try", achievementFirstTryDescription: "Guess the word with the first counted attempt in a game.",
    achievementNoHintsTitle: "No training wheels", achievementNoHintsDescription: "Win one game without using any hints.",
    achievementRuWinTitle: "RU explorer", achievementRuWinDescription: "Win a game with the Russian Labs dictionary.",
    achievementEnWinTitle: "EN explorer", achievementEnWinDescription: "Win a game with the English Labs dictionary.",
    achievementStubbornTitle: "Persistent", achievementStubbornDescription: "Make at least 3 entries that the game rejects during one game.",
    achievementUkWinTitle: "Home turf", achievementUkWinDescription: "Win a game with the Ukrainian dictionary.",
    achievementLabsDuoTitle: "Double experiment", achievementLabsDuoDescription: "Earn at least 1 win in RU Labs and at least 1 win in EN Labs.",
    achievementPolyglotTitle: "Polyglot", achievementPolyglotDescription: "Earn at least 1 win in Ukrainian, Russian, and English.",
    achievementCleanWinTitle: "Clean run", achievementCleanWinDescription: "Win one game without any entry being rejected.",
    achievementOneHintTitle: "Just a peek", achievementOneHintDescription: "Win one game after using exactly 1 hint.",
    achievementFullHintsTitle: "Full briefing", achievementFullHintsDescription: "Sometimes it pays to hear the entire briefing.",
    achievementLastChanceTitle: "Last breath", achievementLastChanceDescription: "Guess the word on your final available counted attempt.",
    achievementSpeedrunTitle: "Lightning", achievementSpeedrunDescription: "Guess the word in under 30 seconds from the start of the game.",
    achievementSevenLetterTitle: "Long story", achievementSevenLetterDescription: "Win a game with a 7-letter target.",
    achievementRepeatMasterTitle: "Déjà vu", achievementRepeatMasterDescription: "Guess a target that contains at least one repeated letter.",
    achievementTrafficLightTitle: "Traffic light", achievementTrafficLightDescription: "Three colors need to meet in one place.",
    achievementYellowStormTitle: "Yellow storm", achievementYellowStormDescription: "Get at least 3 yellow letters in one counted guess.",
    achievementGreenWaveTitle: "Green wave", achievementGreenWaveDescription: "Place at least 3 letters correctly in one counted non-winning guess.",
    achievementAlphabetTourTitle: "Alphabet tour", achievementAlphabetTourDescription: "Use at least 15 different letters across counted guesses in one game.",
    achievementChaosAgentTitle: "Agent of chaos", achievementChaosAgentDescription: "Make at least 6 entries that the game rejects during one game.",
    achievementComebackTitle: "Still got it!", achievementComebackDescription: "Win a game after at least 3 entries have been rejected.",
    achievementAlmostTitle: "So close", achievementAlmostDescription: "Even a loss can be almost perfect.",
    achievementFiveWinsTitle: "Bronze run", achievementFiveWinsDescription: "Earn 5 total wins in Guess the word.",
    achievementTenWinsTitle: "Silver ten", achievementTenWinsDescription: "Earn 10 total wins in Guess the word.",
    achievementTwentyFiveWinsTitle: "Golden wordsmith", achievementTwentyFiveWinsDescription: "Earn 25 total wins in Guess the word.",
    achievementThreeStreakTitle: "On fire", achievementThreeStreakDescription: "Win 3 games in a row.",
    achievementTenGamesTitle: "Hooked", achievementTenGamesDescription: "Play 10 total Guess the word games.",
    achievementTwentyFiveGamesTitle: "Regular", achievementTwentyFiveGamesDescription: "Play 25 total Guess the word games.",
    achievementMenuEyebrow: "Guess the word",
    achievementMenuTitle: "Achievements",
    achievementMenuCopy: "Collect awards for skill, streaks, experiments, and funny moments in the game.",
    achievementMenuOpen: "Open achievements",
    achievementCategoryOddities: "Oddities & Easter Eggs",
    achievementGearGoblinTitle: "The gear knows too much",
    achievementGearGoblinDescription: "Some doors open with curiosity rather than a key.",
    achievementGearGoblinHint: "Tap the global ⚙️ Settings button 13 times.",
    achievementTrophyTapperTitle: "The trophy is a button too",
    achievementTrophyTapperDescription: "Even a museum sign can get tired of attention.",
    achievementTrophyTapperHint: "Tap the 🏆 Achievements button 13 times.",
    achievementRulesLawyerTitle: "Rules lawyer",
    achievementRulesLawyerDescription: "You are definitely looking for the fine print.",
    achievementRulesLawyerHint: "Open Guess the Word rules 7 times.",
    achievementLanguagePinballTitle: "Language pinball",
    achievementLanguagePinballDescription: "UA, RU, EN — the ball is still bouncing.",
    achievementLanguagePinballHint: "Switch Guess the Word language 12 times after unlocking Labs.",
    achievementLengthCarouselTitle: "Letter carousel",
    achievementLengthCarouselDescription: "Five? Six? Seven? Maybe one more spin.",
    achievementLengthCarouselHint: "Change word length in setup 15 times.",
    achievementAttemptCarouselTitle: "Wheel of chances",
    achievementAttemptCarouselDescription: "The number of chances refuses to settle down.",
    achievementAttemptCarouselHint: "Change the attempt limit in setup 15 times.",
    achievementRepeatSwitcherTitle: "Repeat the repeat",
    achievementRepeatSwitcherDescription: "This switch is starting to suspect something.",
    achievementRepeatSwitcherHint: "Toggle repeated letters on/off 10 times.",
    achievementMuseumNightShiftTitle: "Museum night shift",
    achievementMuseumNightShiftDescription: "The collection guard knows you by sight now.",
    achievementMuseumNightShiftHint: "Open the Achievements collection 50 times.",
    achievementThemeChameleonTitle: "UI chameleon",
    achievementThemeChameleonDescription: "Light. Dark. Light. Dark. Pick a side?",
    achievementThemeChameleonHint: "Toggle light/dark theme 25 times.",
    achievementFeedbackPioneerTitle: "First signal",
    achievementFeedbackPioneerDescription: "Save your first developer message or word rating.",
    achievementBugHunterTitle: "Bug hunter",
    achievementBugHunterDescription: "Save a bug report for the developer.",
    achievementWordFanTitle: "Good word",
    achievementWordFanDescription: "Give 👍 to at least one target word.",
    achievementWordCriticTitle: "Editor awakened",
    achievementWordCriticDescription: "Give 👎 to at least one target word.",
    achievementBalancedCriticTitle: "Carrot and stick",
    achievementBalancedCriticDescription: "A fair critic knows not everything is equal.",
    achievementBalancedCriticHint: "Give at least one 👍 and at least one 👎 to target words.",
    achievementShareTrioTitle: "Movohray goes social",
    achievementShareTrioDescription: "Share a game result 3 times.",
    achievementEmptyEnterSevenTitle: "Enter into the void",
    achievementEmptyEnterSevenDescription: "The submit button is patient. Not infinitely patient.",
    achievementEmptyEnterSevenHint: "In one game, press Enter 7 times while the word is still incomplete.",
    achievementBackspaceBlizzardTitle: "Backspace blizzard",
    achievementBackspaceBlizzardDescription: "Letters come and go. Mostly go.",
    achievementBackspaceBlizzardHint: "In one game, delete at least 50 typed letters with Backspace.",
    achievementInvalidTornadoTitle: "Invalid tornado",
    achievementInvalidTornadoDescription: "The dictionary is hiding under the desk now.",
    achievementInvalidTornadoHint: "Make 10 submissions in one game that are not accepted.",
    achievementLetterMonotonyTitle: "Parrot mode",
    achievementLetterMonotonyDescription: "One letter. Again. And again.",
    achievementLetterMonotonyHint: "While typing, make a sequence of at least 4 identical letters.",
    achievementVowelChoirTitle: "Vowel choir",
    achievementVowelChoirDescription: "A-a-a… somehow this became a strategy.",
    achievementVowelChoirHint: "While typing, enter at least 4 vowels in a row with no consonants.",
    achievementConsonantWallTitle: "Consonant wall",
    achievementConsonantWallDescription: "Not a breath of air between these letters.",
    achievementConsonantWallHint: "Try to submit a full-length word with no vowels.",
    achievementMirrorGuessTitle: "Mirror",
    achievementMirrorGuessDescription: "The beginning looks suspiciously like the end.",
    achievementMirrorGuessHint: "Try to submit a 5–7 letter palindrome.",
    achievementKeyboardTourLiveTitle: "Fingers saw everything",
    achievementKeyboardTourLiveDescription: "Press at least 20 different letter keys during one game.",
    achievementEraseBeforeFirstTitle: "Draft destroyed",
    achievementEraseBeforeFirstDescription: "The first idea did not survive editing.",
    achievementEraseBeforeFirstHint: "Before your first accepted guess, type a full word and erase it completely.",
    achievementNervousFingersTitle: "Nervous fingers",
    achievementNervousFingersDescription: "Your inner editor is very active today.",
    achievementNervousFingersHint: "Before your first accepted guess, delete at least 20 typed letters with Backspace.",
    achievementSilentMinuteTitle: "A minute of silence",
    achievementSilentMinuteDescription: "The thought took longer to ripen than the keyboard expected.",
    achievementSilentMinuteHint: "Make your first accepted guess no earlier than 60 seconds after the game starts.",
    achievementSpeedMistakeTitle: "Faster than thought",
    achievementSpeedMistakeDescription: "The hands pressed Enter while the brain was still loading.",
    achievementSpeedMistakeHint: "Get an unaccepted submission within the first 5 seconds of a game.",
    achievementNoGreenLossTitle: "Arctic game",
    achievementNoGreenLossDescription: "The green light never came on.",
    achievementNoGreenLossHint: "Lose a game without receiving a single green tile.",
    achievementYellowOnlyLossTitle: "Gold without victory",
    achievementYellowOnlyLossDescription: "The letters were nearby. Very nearby.",
    achievementYellowOnlyLossHint: "Lose a game with at least one yellow tile but no green tiles.",
    achievementThreeBlackoutsTitle: "Three blackouts",
    achievementThreeBlackoutsDescription: "Three times, and not one letter knew the answer.",
    achievementThreeBlackoutsHint: "In one game, get 3 accepted rows where every tile is absent.",
    achievementRainbowCollectorTitle: "Weather collector",
    achievementRainbowCollectorDescription: "This game had clouds, colors, and almost sunshine.",
    achievementRainbowCollectorHint: "In one game, get an all-absent row, a row containing all three status colors, and a non-winning row with no absent letters.",
    achievementSevenChaosWinTitle: "Seven-letter octopus",
    achievementSevenChaosWinDescription: "Seven letters, lots of chaos — and still a win.",
    achievementSevenChaosWinHint: "Win a 7-letter game after at least 5 unaccepted submissions.",
    supportEyebrow: "Data & support",
    supportTitle: "Reset & contact",
    supportReportTitle: "Message the developer",
    supportReportText: "Bug or odd behavior — for now the report is stored locally as a placeholder for the future server channel.",
    supportResetTitle: "Reset progress and settings",
    supportResetText: "Remove achievements, Labs and personal settings on this device.",
    supportResetConfirm: "Reset all Movohray achievements, Labs and settings on this device? Saved developer feedback will remain.",
    supportResetDone: "Progress and settings reset.",
    feedbackWordTitle: "Rate the target word",
    feedbackLike: "Like",
    feedbackDislike: "Dislike",
    feedbackReport: "Report / bug",
    feedbackThanks: "Thanks! Your rating was saved locally.",
    feedbackModalEyebrow: "Developer feedback",
    feedbackModalTitle: "Report a problem",
    feedbackModalCopy: "Describe a bug, a word, or anything odd. Server delivery is not connected yet — the report will stay on this device.",
    feedbackPlaceholder: "What happened? What did you expect?",
    feedbackSave: "Send to developer",
    feedbackSaved: "Saved locally. Server delivery will be connected later.",
    feedbackEmpty: "Write at least a few words about the problem.",
    feedbackContextWord: "Current word",
    feedbackExport: "Copy local report",
    achievementCategorySkill: "Skill",
    achievementCategoryPatterns: "Colors & patterns",
    achievementCategoryHints: "Hints",
    achievementCategoryChaos: "Mistakes & chaos",
    achievementCategoryLanguages: "Languages & Labs",
    achievementCategoryStreaks: "Streaks & style",
    achievementCategoryMilestones: "Collection milestones",
    achievementFiveLetterWinTitle: "High five",
    achievementFiveLetterWinDescription: "Win with a 5-letter target.",
    achievementSixLetterWinTitle: "Six appeal",
    achievementSixLetterWinDescription: "Win with a 6-letter target.",
    achievementAllLengthsTitle: "Full ruler",
    achievementAllLengthsDescription: "Earn at least 1 win with each target length: 5, 6, and 7 letters.",
    achievementTwoTryTitle: "Double tap",
    achievementTwoTryDescription: "Guess the word on your first or second counted attempt.",
    achievementAllYellowTitle: "Sunny anagram",
    achievementAllYellowDescription: "Everything is nearby, yet nothing is where it belongs.",
    achievementAllGrayTitle: "Total miss",
    achievementAllGrayDescription: "Make a counted guess in which every tile is pink, meaning none of its letters are in the target.",
    achievementHotHandTitle: "Hot!",
    achievementHotHandDescription: "Make a counted non-winning guess with no pink tiles.",
    achievementRepeatGuessTitle: "Sure about that?",
    achievementRepeatGuessDescription: "Maybe say that again. Exactly the same way.",
    achievementAlphabetExplorerTitle: "Almost the whole keyboard",
    achievementAlphabetExplorerDescription: "The keyboard wants a very long walk.",
    achievementFiveHintsTotalTitle: "Flashlight",
    achievementFiveHintsTotalDescription: "Use 5 hint levels in total across all played games.",
    achievementTenHintsTotalTitle: "Spotlight",
    achievementTenHintsTotalDescription: "Use 10 hint levels in total across all played games.",
    achievementTwentyFiveHintsTotalTitle: "Life ring",
    achievementTwentyFiveHintsTotalDescription: "Use 25 hint levels in total across all played games.",
    achievementTenInvalidTotalTitle: "Dictionary holds",
    achievementTenInvalidTotalDescription: "Accumulate 10 total entries that the game rejects.",
    achievementTwentyFiveInvalidTotalTitle: "Tough dictionary",
    achievementTwentyFiveInvalidTotalDescription: "Accumulate 25 total entries that the game rejects.",
    achievementFiftyInvalidTotalTitle: "Dictionary survived",
    achievementFiftyInvalidTotalDescription: "Accumulate 50 total entries that the game rejects.",
    achievementFiftyWinsTitle: "Word crown",
    achievementFiftyWinsDescription: "Earn 50 total wins in Guess the word.",
    achievementFiftyGamesTitle: "Half-century",
    achievementFiftyGamesDescription: "Play 50 total Guess the word games.",
    achievementHundredGamesTitle: "A hundred stories",
    achievementHundredGamesDescription: "Play 100 total Guess the word games.",
    achievementFiveStreakTitle: "Red hot",
    achievementFiveStreakDescription: "Win 5 games in a row.",
    achievementTenStreakTitle: "Comet",
    achievementTenStreakDescription: "Keep the comet burning for a very long time.",
    achievementFiveFirstTryTitle: "Sharpshooter",
    achievementFiveFirstTryDescription: "Guess the word on the first counted attempt in 5 different winning games.",
    achievementTenFirstTryTitle: "Eagle eye",
    achievementTenFirstTryDescription: "Guess the word on the first counted attempt in 10 different winning games.",
    achievementFiveNoHintTitle: "Be your own hint",
    achievementFiveNoHintDescription: "Earn 5 wins without using hints in those games.",
    achievementTenNoHintTitle: "Mentalist",
    achievementTenNoHintDescription: "Earn 10 wins without using hints in those games.",
    achievementFiveSevenLetterTitle: "Seven hunter",
    achievementFiveSevenLetterDescription: "Earn 5 wins in games with 7-letter targets.",
    achievementTenSevenLetterTitle: "Seven-letter dragon",
    achievementTenSevenLetterDescription: "Earn 10 wins in games with 7-letter targets.",
    achievementLanguageTouristTitle: "Language tourist",
    achievementLanguageTouristDescription: "Play at least 5 games in Ukrainian, 5 in Russian, and 5 in English.",
    achievementLanguageVeteranTitle: "Three passports",
    achievementLanguageVeteranDescription: "Three language passports need to look well travelled.",
    achievementTwoHintsTitle: "Two clues",
    achievementTwoHintsDescription: "Win one game after using exactly 2 hints.",
    achievementFiveLastChanceTitle: "Short fuse",
    achievementFiveLastChanceDescription: "In 5-letter mode, guess the word on the final available counted attempt.",
    achievementSevenFirstTryTitle: "Oracle",
    achievementSevenFirstTryDescription: "Seven symbols. One shot. No scouting.",
    achievementFlash15Title: "Flash",
    achievementFlash15Description: "Guess the word in 15 seconds or less from the start of the game.",
    achievementMarathonTitle: "Marathoner",
    achievementMarathonDescription: "Not every victory likes to be rushed.",
    achievementPhoenixTitle: "Phoenix",
    achievementPhoenixDescription: "A stylish rise can follow a pile of rejections.",
    achievementZeroToWordTitle: "Zero to bullseye",
    achievementZeroToWordDescription: "Start in total darkness and still find the light.",
    achievementCategorySecrets: "Secrets & Easter Eggs",
    achievementMysteryLabel: "Mysterious condition",
    achievementTapForHint: "Condition hidden",
    achievementHowTo: "How to unlock",
    achievementHintRevealed: "Condition revealed",
    achievementHintRevealedToast: "Hint revealed — the reward still has to be earned 🔎",
    achievementFullHintsHint: "Win one game after using all 3 hint levels.",
    achievementTrafficLightHint: "Get green, yellow, and pink tiles together in one counted guess.",
    achievementAlmostHint: "Lose a game when the final counted guess has every position correct except one.",
    achievementAllYellowHint: "Make a counted guess in which every tile is yellow.",
    achievementRepeatGuessHint: "Submit the same counted word twice during one game.",
    achievementAlphabetExplorerHint: "Use at least 20 different letters across counted guesses in one game.",
    achievementLanguageVeteranHint: "Play at least 10 games in Ukrainian, 10 in Russian, and 10 in English.",
    achievementTenStreakHint: "Win 10 games in a row.",
    achievementSevenFirstTryHint: "In 7-letter mode, guess the word with the first counted attempt.",
    achievementMarathonHint: "Finish a game with a win at least 3 minutes after it started.",
    achievementPhoenixHint: "Win one game after at least 5 rejected entries.",
    achievementZeroToWordHint: "Make a counted guess with all pink tiles, then win that same game.",
    achievementExactThreeTitle: "Third shot",
    achievementExactThreeDescription: "Guess the word with exactly the third counted attempt.",
    achievementExactFourTitle: "Fourth bell",
    achievementExactFourDescription: "Guess the word with exactly the fourth counted attempt.",
    achievementExactFiveTitle: "Fifth gear",
    achievementExactFiveDescription: "Guess the word with exactly the fifth counted attempt.",
    achievementSevenSpeedTitle: "Seven at speed",
    achievementSevenSpeedDescription: "Seven letters hate waiting.",
    achievementSevenSpeedHint: "Win a 7-letter game within 30 seconds of the start.",
    achievementSevenNoHintsTitle: "Seven without a net",
    achievementSevenNoHintsDescription: "Win a 7-letter game without using any hints.",
    achievementSevenTwoTryTitle: "Seven ninja",
    achievementSevenTwoTryDescription: "A big word can fall with almost no scouting.",
    achievementSevenTwoTryHint: "Guess a 7-letter word by the second counted attempt.",
    achievementFiveFlashTitle: "Five in a flash",
    achievementFiveFlashDescription: "Win a 5-letter game within 15 seconds.",
    achievementSixFlashTitle: "Six sparks",
    achievementSixFlashDescription: "Win a 6-letter game within 20 seconds.",
    achievementCleanFirstTryTitle: "Diamond shot",
    achievementCleanFirstTryDescription: "A perfect game should have no scratches at all.",
    achievementCleanFirstTryHint: "Guess the word on the first counted attempt, with no hints and no rejected entries.",
    achievementChaosLastChanceTitle: "Season finale",
    achievementChaosLastChanceDescription: "The final scene needs a little chaos first.",
    achievementChaosLastChanceHint: "Win on the final available counted attempt after at least 3 rejected entries.",
    achievementSlowPureTitle: "Zen mode",
    achievementSlowPureDescription: "Think for a long time, but ask for no help.",
    achievementSlowPureHint: "Win at least 3 minutes after the start without using any hints.",
    achievementFullBriefingLastTitle: "By the manual",
    achievementFullBriefingLastDescription: "Read everything, then save the answer for the finale.",
    achievementFullBriefingLastHint: "Use all 3 hints and guess the word on the final available counted attempt.",
    achievementFirstGreenTitle: "Green hello",
    achievementFirstGreenDescription: "Get at least 1 green tile in the first counted guess.",
    achievementFirstDoubleGreenTitle: "Position magnet",
    achievementFirstDoubleGreenDescription: "Get at least 2 green tiles in the first counted guess.",
    achievementFirstAllGrayTitle: "Dark start",
    achievementFirstAllGrayDescription: "Make the first counted guess entirely pink.",
    achievementFirstAllYellowTitle: "Yellow dawn",
    achievementFirstAllYellowDescription: "The first guess knows every letter but forgets the addresses.",
    achievementFirstAllYellowHint: "Make the first counted guess entirely yellow.",
    achievementOneAwayTitle: "One tile away",
    achievementOneAwayDescription: "In a non-winning counted guess, place every letter correctly except one.",
    achievementBlindStartWinTitle: "Out of the dark",
    achievementBlindStartWinDescription: "Start without a single exact hit and keep going.",
    achievementBlindStartWinHint: "Get zero green tiles in the first counted guess, then win that game.",
    achievementYellowToGreenTitle: "Chick finds a home",
    achievementYellowToGreenDescription: "One letter needs to move to where it truly belongs.",
    achievementYellowToGreenHint: "Across two consecutive counted guesses, make the same letter yellow first and green in the next guess.",
    achievementGreenAnchorTitle: "Green anchor",
    achievementGreenAnchorDescription: "Something correct must stay perfectly still for a while.",
    achievementGreenAnchorHint: "Keep the same position green across 3 consecutive counted guesses.",
    achievementTrafficWinTitle: "Winning traffic light",
    achievementTrafficWinDescription: "Get a guess with green, yellow, and pink tiles in one game, then win it.",
    achievementAllYellowWinTitle: "Sun assembled",
    achievementAllYellowWinDescription: "First everything is yellow, then everything clicks into place.",
    achievementAllYellowWinHint: "Get an all-yellow counted guess, then win that same game.",
    achievementHotWinTitle: "Hot lane",
    achievementHotWinDescription: "Get a non-winning guess with no pink tiles, then win the game.",
    achievementAlphabetMasterTitle: "Keyboard marathon",
    achievementAlphabetMasterDescription: "Looks like you decided to meet almost every letter.",
    achievementAlphabetMasterHint: "Use at least 25 different letters across counted guesses in one game.",
    achievementHintOneNextWinTitle: "One clue is enough",
    achievementHintOneNextWinDescription: "The first whisper should lead straight to the answer.",
    achievementHintOneNextWinHint: "Open only hint 1, then guess the word with the next counted attempt.",
    achievementHintTwoNextWinTitle: "Second beam",
    achievementHintTwoNextWinDescription: "The second clue should be the final bit of help you need.",
    achievementHintTwoNextWinHint: "Open exactly 2 hints, then guess the word with the next counted attempt.",
    achievementHintThreeNextWinTitle: "Full map",
    achievementHintThreeNextWinDescription: "After the third clue, there is nowhere left to retreat.",
    achievementHintThreeNextWinHint: "Open all 3 hints, then guess the word with the next counted attempt.",
    achievementPatientHintTitle: "Patient request",
    achievementPatientHintDescription: "Open your first hint no earlier than 60 seconds after the game starts.",
    achievementLateHintTitle: "Last argument",
    achievementLateHintDescription: "Ask for help only after thinking for a very long time.",
    achievementLateHintHint: "Open your first hint no earlier than 2 minutes after the game starts.",
    achievementHintsBeforeGuessTitle: "Read the manual first",
    achievementHintsBeforeGuessDescription: "Learn everything before making the first move.",
    achievementHintsBeforeGuessHint: "Open all 3 hints before the first counted guess in a game.",
    achievementFiftyHintsTotalTitle: "Help desk",
    achievementFiftyHintsTotalDescription: "Use a total of 50 hint levels across all games.",
    achievementHundredHintsTotalTitle: "Support satellite",
    achievementHundredHintsTotalDescription: "Use a total of 100 hint levels across all games.",
    achievementInvalidThenWinTitle: "Trip and carry on",
    achievementInvalidThenWinDescription: "Win a game after at least one rejected entry.",
    achievementThreeInvalidRowTitle: "Dictionary gutterball",
    achievementThreeInvalidRowDescription: "Make 3 rejected entries in a row during one game.",
    achievementFiveInvalidRowTitle: "Chaos vortex",
    achievementFiveInvalidRowDescription: "Make the dictionary say “no” five times in a row.",
    achievementFiveInvalidRowHint: "Make 5 rejected entries in a row during one game.",
    achievementDuplicateInvalidTitle: "Parrot",
    achievementDuplicateInvalidDescription: "The dictionary already answered, but you ask again.",
    achievementDuplicateInvalidHint: "Enter the same rejected word twice during one game.",
    achievementTenBackspacesGameTitle: "Eraser warmed up",
    achievementTenBackspacesGameDescription: "Press Backspace at least 10 times during one completed game.",
    achievementThirtyBackspacesGameTitle: "Cleanup of the century",
    achievementThirtyBackspacesGameDescription: "The erase key needs a serious workout.",
    achievementThirtyBackspacesGameHint: "Press Backspace at least 30 times during one completed game.",
    achievementFullEraseTitle: "That never happened",
    achievementFullEraseDescription: "Write something in full, then completely change your mind.",
    achievementFullEraseHint: "Type a full-length word and erase it back to empty before submitting it.",
    achievementTripleFullEraseTitle: "Reality rewriter",
    achievementTripleFullEraseDescription: "One complete change of mind is not enough.",
    achievementTripleFullEraseHint: "During one game, type a full-length word and erase it completely 3 separate times before submitting.",
    achievementThreeIncompleteSubmitsTitle: "Why the hurry?",
    achievementThreeIncompleteSubmitsDescription: "Press Enter 3 times in one game while fewer letters are typed than required.",
    achievementHundredBackspacesTotalTitle: "One hundred steps back",
    achievementHundredBackspacesTotalDescription: "Accumulate 100 Backspace presses across completed games.",
    achievementTenUkWinsTitle: "Sunflower ten",
    achievementTenUkWinsDescription: "Earn 10 wins in Ukrainian.",
    achievementTenRuWinsTitle: "Labs: ten test tubes",
    achievementTenRuWinsDescription: "Earn 10 wins with the Russian Labs dictionary.",
    achievementTenEnWinsTitle: "Labs: ten o’clock",
    achievementTenEnWinsDescription: "Earn 10 wins with the English Labs dictionary.",
    achievementGlobalTour25Title: "Around the world in words",
    achievementGlobalTour25Description: "Play at least 25 games in Ukrainian, 25 in Russian, and 25 in English.",
    achievementGlobalWins10Title: "Three flags at the finish",
    achievementGlobalWins10Description: "Every language needs its own full set of ten wins.",
    achievementGlobalWins10Hint: "Earn at least 10 wins in Ukrainian, 10 in Russian, and 10 in English.",
    achievementSevenAllLanguagesTitle: "Seven without borders",
    achievementSevenAllLanguagesDescription: "Seven letters need to speak three languages.",
    achievementSevenAllLanguagesHint: "Earn at least 1 win in 7-letter mode in Ukrainian, Russian, and English.",
    achievementFirstTryAllLanguagesTitle: "Three shots, no scouting",
    achievementFirstTryAllLanguagesDescription: "The first shot must work in every language.",
    achievementFirstTryAllLanguagesHint: "Earn at least 1 first-counted-attempt win in Ukrainian, Russian, and English.",
    achievementNoHintAllLanguagesTitle: "Brain without translator",
    achievementNoHintAllLanguagesDescription: "No language is allowed to ask for help.",
    achievementNoHintAllLanguagesHint: "Earn at least 1 no-hint win in Ukrainian, Russian, and English.",
    achievementSeventyFiveWinsTitle: "Word veteran",
    achievementSeventyFiveWinsDescription: "Earn 75 total wins in Guess the word.",
    achievementHundredWinsTitle: "One hundred hits",
    achievementHundredWinsDescription: "Earn 100 total wins in Guess the word.",
    achievementHundredFiftyGamesTitle: "Ticket #150",
    achievementHundredFiftyGamesDescription: "Play 150 total games of Guess the word.",
    achievementTwoFiftyGamesTitle: "Stone regular",
    achievementTwoFiftyGamesDescription: "This collection has already seen a lot of games.",
    achievementTwoFiftyGamesHint: "Play 250 total games of Guess the word.",
    achievementFifteenStreakTitle: "Burning lane",
    achievementFifteenStreakDescription: "Keep the flame alive longer than seems reasonable.",
    achievementFifteenStreakHint: "Win 15 games in a row.",
    achievementTwentyStreakTitle: "Tiny sun",
    achievementTwentyStreakDescription: "The streak needs to become almost astronomical.",
    achievementTwentyStreakHint: "Win 20 games in a row.",
    achievementTwentyFiveFirstTryTitle: "Eagle club",
    achievementTwentyFiveFirstTryDescription: "Guess the word with the first counted attempt in 25 different winning games.",
    achievementTwentyFiveNoHintTitle: "Archmage",
    achievementTwentyFiveNoHintDescription: "Earn 25 wins without using hints in those games.",
    achievementLabsEasterTitle: "Measure seven times",
    achievementLabsEasterDescription: "Some version numbers really enjoy attention.",
    achievementLabsEasterHint: "In global settings, rapidly tap the version number 7 times to unlock Movohray Labs.",
    achievementHintWhispererTitle: "Tile whisperer",
    achievementHintWhispererDescription: "The collection rewards people who know how to draw out its secrets.",
    achievementHintWhispererHint: "Reveal the exact conditions of at least 12 different mystery achievements.",
    achievementMuseumVisitorTitle: "Museum visitor",
    achievementMuseumVisitorDescription: "The collection likes repeat visitors.",
    achievementMuseumVisitorHint: "Open the Achievements window 5 times in total.",
    achievementMuseumCuratorTitle: "Museum curator",
    achievementMuseumCuratorDescription: "Looks like you work here now.",
    achievementMuseumCuratorHint: "Open the Achievements window 20 times in total.",
    achievementDayNightTitle: "Day / night / day / night",
    achievementDayNightDescription: "Sometimes the interface wants to play too.",
    achievementDayNightHint: "Switch between light and dark theme 10 times in total.",
    achievementLogoSecretTitle: "Do not tap the logo",
    achievementLogoSecretDescription: "Seriously. The logo is just sitting there.",
    achievementLogoSecretHint: "On the main menu, tap the Movohray logo 7 times.",
    gameDescription: (length, attempts, letterWord, attemptWord, repeatText) => `Guess an English ${length}-letter word in ${attempts} ${attemptWord}. ${repeatText}.`,
    dictionaryStats: (targets, allowed) => `Game dictionary: ${targets} targets · ${allowed} accepted guesses.`,
    shareModeCompact: (length, result, repeats) => `${length} letters · ${result} · ${repeats ? "repeats allowed" : "no repeats"}`,
    shareResult: (won, valid, limit) => won ? `Guessed in ${valid}/${limit}` : `Not guessed · ${limit} attempts`,
    shareModeFull: (language, length, attempts, repeats) => `${language} · ${length} letters · ${attempts} attempts · ${repeats ? "repeats" : "no repeats"}`,
    fullRules: (length, letterWord, attempts, attemptWord, repeats) => `Enter an English word with ${length} ${letterWord}. ${repeats ? "Repeated letters are allowed" : "Letters must not repeat"}. Green means the correct position, yellow means the letter is in the word but elsewhere, and pink means it is absent. You have ${attempts} counted ${attemptWord}. Three hint levels are available.`,
    lookupTitle: (word, dictionary) => `Look up ${word} in ${dictionary}`,
    invalidReactions: ["Oops!", "Nope 😄", "Try again!", "Sneaky 🤨", "Dictionary says hmm"],
  },
};
const WORD_GUESS_STATUS_PRIORITY = {
  absent: 1,
  present: 2,
  correct: 3,
};
const WORD_GUESS_FLIP_DURATION_MS = 300;
const WORD_GUESS_FLIP_STAGGER_MS = 50;
const WORD_GUESS_FLIP_MIDPOINT_MS = 150;
const WORD_GUESS_FLIP_WATCHDOG_GRACE_MS = 220;
const WORD_GUESS_BLOCKED_TARGETS = new Set([
  "адрес", "аптечка", "баночка", "білет", "блюдо", "дощик", "димок", "дубок",
  "ескім", "зірочка", "косий", "курочка", "лісок", "лютий", "матір", "молочко",
  "нотка", "нотки", "німий", "ніхто", "окрас", "паличка", "песик", "пиріжок",
  "робочий", "рукавиц", "сирок", "соломин", "сомик", "сонечко", "струнні",
  "сухарик", "турбо", "ужгород", "хатинка", "хотин", "цукорок", "чужий",
  "щедро", "шмель",
]);
const WORD_GUESS_DICTIONARY_LINKS = {
  uk: [
    { name: "СУМ", label: "словник «СУМ»", url: (word) => `https://sum.in.ua/s/${encodeURIComponent(word)}` },
    { name: "Горох", label: "словник «Горох»", url: (word) => `https://goroh.pp.ua/Тлумачення/${encodeURIComponent(word)}` },
    { name: "Вікісловник", label: "Вікісловник", url: (word) => `https://uk.wiktionary.org/wiki/${encodeURIComponent(word)}` },
  ],
  ru: [
    { name: "Викисловарь", label: "Викисловарь", url: (word) => `https://ru.wiktionary.org/wiki/${encodeURIComponent(word)}` },
  ],
  en: [
    { name: "Wiktionary", label: "Wiktionary", url: (word) => `https://en.wiktionary.org/wiki/${encodeURIComponent(word)}` },
  ],
};
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
let isRoundReviewWordsExpanded = false;

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
let roundTimerDeadlineMs = 0;
let roundTimerRemainingMs = 60000;
let roundTimerLastCountdownSecond = null;
let roundTimerIsActive = false;
let roundTimerPauseReasons = {};
let roundTimerFinishStarted = false;
let wasTimerRunningBeforeExitModal = false;
let wasWhoAmITimerRunningBeforeExitModal = false;
let isThemesPopoverOpen = false;
let isRoundPaused = false;
let gameAudioContext = null;
let isGameAudioUnlocked = false;
let isGameSoundEnabled = true;
let isHapticFeedbackEnabled = true;
let gameSoundBufferCache = {};
let gameSoundBufferPromises = {};
let gameSoundBufferFailures = {};
let pendingExitDestination = "menu";
let pendingExitFromPopState = false;
let appHistoryInitialized = false;
let isHandlingPopState = false;
let edgeSwipeState = null;
let edgeSwipeFrameId = null;
let edgeSwipeHapticFired = false;
let updateCheckPromise = null;
let lastOptionalUpdateNoticeRevision = "";
let pendingAppToastMessage = "";
let serviceWorkerRegistrationPromise = null;
let isServiceWorkerRegistrationScheduled = false;
let isServiceWorkerLifecycleBound = false;
let isUpdateReloadPending = false;
let requiredUpdateAttemptGeneration = 0;
let cancelRequiredUpdateActivation = null;

let wordGuessConfig = null;
let wordGuessDictionaryData = null;
let wordGuessDictionaryDataPromise = null;
let wordGuessDictionaryLanguage = "";
let wordGuessStartRequestId = 0;
let wordGuessLoadedModeKey = "";
let selectedWordGuessLanguage = readWordGuessLanguagePreference();
let wordGuessLabsUnlocked = readWordGuessLabsPreference();
let wordGuessLabsTapCount = 0;
let wordGuessLabsTapResetTimeoutId = null;
let selectedWordGuessLength = readWordGuessNumberPreference(WORD_GUESS_LENGTH_STORAGE_KEY, WORD_GUESS_DEFAULT_LENGTH);
let selectedWordGuessAttempts = readWordGuessNumberPreference(WORD_GUESS_ATTEMPTS_STORAGE_KEY, WORD_GUESS_DEFAULT_ATTEMPTS);
let selectedWordGuessAllowRepeats = readWordGuessRepeatsPreference();
let selectedWordGuessModeKey = getSelectedWordGuessModeKey();
let wordGuessAnswerWords = [];
let wordGuessAllowedGuesses = new Set();
let wordGuessTarget = "";
let wordGuessGuesses = [];
let wordGuessAttemptLog = [];
let wordGuessCurrentGuess = "";
let wordGuessKeyStatuses = {};
let wordGuessFinished = false;
let wordGuessHintUsed = false;
let wordGuessHintLevel = 0;
let wordGuessHintLetters = [];
let wordGuessInvalidClearTimeoutId = null;
let wordGuessInputLocked = false;
let wordGuessRevealGeneration = 0;
let wordGuessRevealState = null;
let wordGuessFeedbackChoice = "";
let wordGuessMessageTimeoutId = null;
let wordGuessFinaleEffectTimeoutId = null;
let wordGuessHintNudgeTimeoutId = null;
let wordGuessHintNudgeClearTimeoutId = null;
let wordGuessAchievementsState = readWordGuessAchievementsState();
let wordGuessAchievementToastQueue = [];
let wordGuessAchievementToastActive = false;
let wordGuessGameStartedAtMs = 0;
let wordGuessGameBackspaceCount = 0;
let wordGuessGameFullEraseCount = 0;
let wordGuessGameIncompleteSubmitCount = 0;
let wordGuessEraseArmed = false;
let wordGuessFirstHintUsedAtMs = 0;
let wordGuessFirstHintUsedGuessCount = -1;
let wordGuessSecondHintUsedGuessCount = -1;
let wordGuessThirdHintUsedGuessCount = -1;
let wordGuessAchievementCardTapCounts = {};
let wordGuessAchievementsModalCategoryId = WORD_GUESS_ACHIEVEMENT_CATEGORIES[0].id;
let wordGuessAchievementsModalDirty = true;
let wordGuessAchievementsModalLocale = "";
let wordGuessGameTypedLetters = new Set();
let wordGuessRuntimeSession = null;
let developerFeedbackContext = "bug";

let isWordGuessHistoryOpen = false;
let isWordGuessResultHistoryOpen = false;

let whoAmIData = null;
let whoAmIDataPromise = null;
let whoAmICategories = [];
let whoAmISelectedCategoryNames = [];
let whoAmISelectedDifficulties = ["easy", "medium"];
let whoAmIShowMode = "forehead";
let whoAmIPartyMode = "turns";
let whoAmIPlayerCount = WHOAMI_DEFAULT_PLAYER_COUNT;
let whoAmIPlayers = [];
let whoAmITeamCount = 0;
let whoAmITeams = [];
let whoAmITeamScores = [];
let whoAmIDuration = 60;
let whoAmIDeck = [];
let whoAmIAssignments = [];
let whoAmIRevealIndex = 0;
let whoAmIRoleVisible = false;
let whoAmICurrentIndex = 0;
let whoAmIRound = 1;
let whoAmIRoundLog = [];
let whoAmITimerId = null;
let whoAmITimeLeft = 60;
let whoAmITimerDeadlineMs = 0;
let whoAmITimerRemainingMs = 60000;
let whoAmITimerLastCountdownSecond = null;
let whoAmITimerIsActive = false;
let whoAmITimerPauseReasons = {};
let whoAmITimedRoles = [];
let whoAmITimedTeamIndex = 0;
let whoAmIResultMode = "continue";
let whoAmIFlowStage = "";
let whoAmISpoilerTimeoutId = null;
let whoAmIActiveSpoilerButton = null;
let whoAmIPendingGuessAssignment = null;

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
    id: "svitlohray",
    title: "Світлограй",
    description: "Світлова гра на реакцію без слів.",
    available: false,
  },
  {
    id: "whoami",
    title: "Хто я?",
    description: "Відгадувати персонажа за питаннями.",
    dataFile: WHOAMI_DATA_FILE,
    available: true,
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
const whoAmISettingsScreen = document.getElementById("whoAmISettingsScreen");
const whoAmIRevealScreen = document.getElementById("whoAmIRevealScreen");
const whoAmIGameScreen = document.getElementById("whoAmIGameScreen");
const whoAmIRoundScreen = document.getElementById("whoAmIRoundScreen");
const whoAmIFinalScreen = document.getElementById("whoAmIFinalScreen");
const teamReadyScreen = document.getElementById("teamReadyScreen");
const gameScreen = document.getElementById("gameScreen");
const roundReviewScreen = document.getElementById("roundReviewScreen");
const resultScreen = document.getElementById("resultScreen");
const winnerScreen = document.getElementById("winnerScreen");
const themeToggleBtn = document.getElementById("themeToggleBtn");
const themeToggleIcon = document.getElementById("themeToggleIcon");
const themeToggleText = document.getElementById("themeToggleText");
const appSettingsBtn = document.getElementById("appSettingsBtn");
const appSettingsModal = document.getElementById("appSettingsModal");
const appSettingsCloseBtn = document.getElementById("appSettingsCloseBtn");
const appSettingsVersion = document.getElementById("appSettingsVersion");
const appLabsSection = document.getElementById("appLabsSection");
const appLabsEyebrow = document.getElementById("appLabsEyebrow");
const appLabsTitle = document.getElementById("appLabsTitle");
const appLabsCopy = document.getElementById("appLabsCopy");
const appLabsLanguageRow = document.getElementById("appLabsLanguageRow");
const wordGuessLabsStatus = document.getElementById("wordGuessLabsStatus");
const wordGuessLanguageButtons = Array.from(document.querySelectorAll("[data-word-guess-language]"));
const settingsThemeToggleBtn = document.getElementById("settingsThemeToggleBtn");
const settingsThemeIcon = document.getElementById("settingsThemeIcon");
const settingsThemeTitle = document.getElementById("settingsThemeTitle");
const settingsThemeText = document.getElementById("settingsThemeText");
const settingsSoundToggleBtn = document.getElementById("settingsSoundToggleBtn");
const settingsSoundIcon = document.getElementById("settingsSoundIcon");
const settingsSoundTitle = document.getElementById("settingsSoundTitle");
const settingsSoundText = document.getElementById("settingsSoundText");
const settingsHapticToggleBtn = document.getElementById("settingsHapticToggleBtn");
const settingsHapticIcon = document.getElementById("settingsHapticIcon");
const settingsHapticTitle = document.getElementById("settingsHapticTitle");
const settingsHapticText = document.getElementById("settingsHapticText");
const wordCardUseAllShapesToggle = document.getElementById("wordCardUseAllShapesToggle");
const wordCardRandomColorsToggle = document.getElementById("wordCardRandomColorsToggle");
const wordCardShapeCheckboxes = Array.from(document.querySelectorAll("[data-word-card-shape]"));
const wordCardOutlineModeButtons = Array.from(document.querySelectorAll("[data-outline-theme][data-outline-mode]"));
const appTitle = document.getElementById("appTitle");
const appSubtitle = document.getElementById("appSubtitle");
const menuVersionInfo = document.getElementById("menuVersionInfo");
const menuAchievementsBtn = document.getElementById("menuAchievementsBtn");
const menuAchievementsTitle = document.getElementById("menuAchievementsTitle");
const menuAchievementsProgress = document.getElementById("menuAchievementsProgress");
const menuAchievementsProgressBar = document.getElementById("menuAchievementsProgressBar");
const achievementsModal = document.getElementById("achievementsModal");
const achievementsModalCloseBtn = document.getElementById("achievementsModalCloseBtn");
const achievementsModalEyebrow = document.getElementById("achievementsModalEyebrow");
const achievementsModalTitle = document.getElementById("achievementsModalTitle");
const achievementsModalProgress = document.getElementById("achievementsModalProgress");
const achievementsModalCopy = document.getElementById("achievementsModalCopy");
const achievementsModalCategoryNav = document.getElementById("achievementsModalCategoryNav");
const achievementsModalGrid = document.getElementById("achievementsModalGrid");
const settingsSupportEyebrow = document.getElementById("settingsSupportEyebrow");
const settingsSupportTitle = document.getElementById("settingsSupportTitle");
const settingsDeveloperReportBtn = document.getElementById("settingsDeveloperReportBtn");
const settingsDeveloperReportTitle = document.getElementById("settingsDeveloperReportTitle");
const settingsDeveloperReportText = document.getElementById("settingsDeveloperReportText");
const settingsResetAllBtn = document.getElementById("settingsResetAllBtn");
const settingsResetAllTitle = document.getElementById("settingsResetAllTitle");
const settingsResetAllText = document.getElementById("settingsResetAllText");
const developerFeedbackModal = document.getElementById("developerFeedbackModal");
const developerFeedbackCloseBtn = document.getElementById("developerFeedbackCloseBtn");
const developerFeedbackEyebrow = document.getElementById("developerFeedbackEyebrow");
const developerFeedbackTitle = document.getElementById("developerFeedbackTitle");
const developerFeedbackCopy = document.getElementById("developerFeedbackCopy");
const developerFeedbackContextEl = document.getElementById("developerFeedbackContext");
const developerFeedbackText = document.getElementById("developerFeedbackText");
const developerFeedbackSaveBtn = document.getElementById("developerFeedbackSaveBtn");
const developerFeedbackStatus = document.getElementById("developerFeedbackStatus");
const wordGuessFeedbackTitle = document.getElementById("wordGuessFeedbackTitle");
const wordGuessReportBtn = document.getElementById("wordGuessReportBtn");

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
const settingsRulesBtn = document.getElementById("settingsRulesBtn");
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
const wordCardMotion = document.getElementById("wordCardMotion");
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
const exitModalTitle = document.getElementById("exitModalTitle");
const exitModalDescription = document.getElementById("exitModalDescription");
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
const wordGuessSettingsEyebrow = document.getElementById("wordGuessSettingsEyebrow");
const wordGuessSettingsTitle = document.getElementById("wordGuessSettingsTitle");
const wordGuessGameTitle = document.getElementById("wordGuessGameTitle");
const wordGuessResultAppTitle = document.getElementById("wordGuessResultAppTitle");
const wordGuessShareLabel = document.getElementById("wordGuessShareLabel");
const wordGuessDictionaryPrompt = document.getElementById("wordGuessDictionaryPrompt");
const wordGuessLanguageBadge = document.getElementById("wordGuessLanguageBadge");
const wordGuessModeDescription = document.getElementById("wordGuessModeDescription");
const wordGuessLengthSummary = document.getElementById("wordGuessLengthSummary");
const wordGuessAttemptsSummary = document.getElementById("wordGuessAttemptsSummary");
const wordGuessRepeatsSummary = document.getElementById("wordGuessRepeatsSummary");
const wordGuessLengthButtons = Array.from(document.querySelectorAll("[data-word-guess-length]"));
const wordGuessAttemptButtons = Array.from(document.querySelectorAll("[data-word-guess-attempts]"));
const wordGuessRepeatButtons = Array.from(document.querySelectorAll("[data-word-guess-repeats]"));
const wordGuessModeButtons = Array.from(document.querySelectorAll("[data-word-guess-mode]"));
const wordGuessBackBtn = document.getElementById("wordGuessBackBtn");
const wordGuessTopMenuBtn = document.getElementById("wordGuessTopMenuBtn");
const wordGuessSettingsMessage = document.getElementById("wordGuessSettingsMessage");
const wordGuessBoard = document.getElementById("wordGuessBoard");
const wordGuessMessage = document.getElementById("wordGuessMessage");
const wordGuessHintFirstBtn = document.getElementById("wordGuessHintFirstBtn");
const wordGuessHintSecondBtn = document.getElementById("wordGuessHintSecondBtn");
const wordGuessHintThirdBtn = document.getElementById("wordGuessHintThirdBtn");
const wordGuessHintBtn = wordGuessHintFirstBtn;
const wordGuessHintsLabel = document.getElementById("wordGuessHintsLabel");
const wordGuessHintsLevels = document.getElementById("wordGuessHintsLevels");
const wordGuessRulesBtn = document.getElementById("wordGuessRulesBtn");
const wordGuessInfoModal = document.getElementById("wordGuessInfoModal");
const wordGuessInfoCloseBtn = document.getElementById("wordGuessInfoCloseBtn");
const wordGuessInfoEyebrow = document.getElementById("wordGuessInfoEyebrow");
const wordGuessInfoTitle = document.getElementById("wordGuessInfoTitle");
const wordGuessInfoText = document.getElementById("wordGuessInfoText");
const wordGuessSettingsRulesBtn = document.getElementById("wordGuessSettingsRulesBtn");
const setupRulesModal = document.getElementById("setupRulesModal");
const setupRulesCloseBtn = document.getElementById("setupRulesCloseBtn");
const setupRulesEyebrow = document.getElementById("setupRulesEyebrow");
const setupRulesTitle = document.getElementById("setupRulesTitle");
const setupRulesText = document.getElementById("setupRulesText");
const wordGuessHistoryBtn = document.getElementById("wordGuessHistoryBtn");
const wordGuessHistoryPanel = document.getElementById("wordGuessHistoryPanel");
const wordGuessModeTags = document.getElementById("wordGuessModeTags");
const wordGuessResultHistory = document.getElementById("wordGuessResultHistory");
const wordGuessResultHistoryBtn = document.getElementById("wordGuessResultHistoryBtn");
const wordGuessResultAttempts = document.getElementById("wordGuessResultAttempts");
const wordGuessKeyboard = document.getElementById("wordGuessKeyboard");
const wordGuessResult = document.getElementById("wordGuessResult");
const wordGuessResultTitle = document.getElementById("wordGuessResultTitle");
const wordGuessResultText = document.getElementById("wordGuessResultText");
const wordGuessResultStats = document.getElementById("wordGuessResultStats");
const wordGuessNewBtn = document.getElementById("wordGuessNewBtn");
const wordGuessMenuBtn = document.getElementById("wordGuessMenuBtn");
const wordGuessShareBtn = document.getElementById("wordGuessShareBtn");
const wordGuessDictionaryLinks = document.getElementById("wordGuessDictionaryLinks");
const wordGuessResultDebug = document.getElementById("wordGuessResultDebug");
const appLabsAchievementsSection = document.getElementById("appLabsAchievementsSection");
const appLabsAchievementsEyebrow = document.getElementById("appLabsAchievementsEyebrow");
const appLabsAchievementsTitle = document.getElementById("appLabsAchievementsTitle");
const appLabsAchievementsProgress = document.getElementById("appLabsAchievementsProgress");
const appLabsAchievementsCopy = document.getElementById("appLabsAchievementsCopy");
const appLabsAchievementsOpenBtn = document.getElementById("appLabsAchievementsOpenBtn");
const appLabsAchievementsDebug = document.getElementById("appLabsAchievementsDebug");
const appToast = document.getElementById("appToast");
const edgeSwipeUnderlay = document.getElementById("edgeSwipeUnderlay");
let appToastTimeoutId = null;
const wordGuessFeedback = document.getElementById("wordGuessFeedback");
const wordGuessLikeBtn = document.getElementById("wordGuessLikeBtn");
const wordGuessDislikeBtn = document.getElementById("wordGuessDislikeBtn");
const wordGuessFeedbackMessage = document.getElementById("wordGuessFeedbackMessage");
const wordGuessFeedbackExportBtn = document.getElementById("wordGuessFeedbackExportBtn");
const whoAmIShowModeButtons = Array.from(document.querySelectorAll("[data-whoami-show-mode]"));
const whoAmIPartyModeButtons = Array.from(document.querySelectorAll("[data-whoami-party-mode]"));
const whoAmIPlayerCountButtons = Array.from(document.querySelectorAll("[data-whoami-players]"));
const whoAmIDifficultyButtons = Array.from(document.querySelectorAll("[data-whoami-difficulty]"));
const whoAmIDurationButtons = Array.from(document.querySelectorAll("[data-whoami-seconds]"));
const whoAmITeamCountButtons = Array.from(document.querySelectorAll("[data-whoami-teams]"));
const whoAmIPlayersSection = document.getElementById("whoAmIPlayersSection");
const whoAmITimedSection = document.getElementById("whoAmITimedSection");
const whoAmIPlayerCountPicker = document.getElementById("whoAmIPlayerCountPicker");
const whoAmIPlayerCountSummary = document.getElementById("whoAmIPlayerCountSummary");
const whoAmIEditPlayersBtn = document.getElementById("whoAmIEditPlayersBtn");
const whoAmIPlayerFields = document.getElementById("whoAmIPlayerFields");
const whoAmIPlayersModal = document.getElementById("whoAmIPlayersModal");
const whoAmIPlayersCloseBtn = document.getElementById("whoAmIPlayersCloseBtn");
const whoAmIPlayersDoneBtn = document.getElementById("whoAmIPlayersDoneBtn");
const whoAmITeamFields = document.getElementById("whoAmITeamFields");
const whoAmICategoryList = document.getElementById("whoAmICategoryList");
const whoAmICategoryModalList = document.getElementById("whoAmICategoryModalList");
const whoAmICategoriesModal = document.getElementById("whoAmICategoriesModal");
const whoAmICategoriesCloseBtn = document.getElementById("whoAmICategoriesCloseBtn");
const whoAmICategoriesDoneBtn = document.getElementById("whoAmICategoriesDoneBtn");
const whoAmISettingsMessage = document.getElementById("whoAmISettingsMessage");
const whoAmISettingsRulesBtn = document.getElementById("whoAmISettingsRulesBtn");
const whoAmIStartBtn = document.getElementById("whoAmIStartBtn");
const whoAmIBackBtn = document.getElementById("whoAmIBackBtn");
const whoAmIRevealStep = document.getElementById("whoAmIRevealStep");
const whoAmIRevealTitle = document.getElementById("whoAmIRevealTitle");
const whoAmIRevealInstruction = document.getElementById("whoAmIRevealInstruction");
const whoAmIRevealRoleBox = document.getElementById("whoAmIRevealRoleBox");
const whoAmIRevealCategory = document.getElementById("whoAmIRevealCategory");
const whoAmIRevealRole = document.getElementById("whoAmIRevealRole");
const whoAmIRevealChangeRoleBtn = document.getElementById("whoAmIRevealChangeRoleBtn");
const whoAmIRevealPrimaryBtn = document.getElementById("whoAmIRevealPrimaryBtn");
const whoAmIRevealMenuBtn = document.getElementById("whoAmIRevealMenuBtn");
const whoAmIGameKicker = document.getElementById("whoAmIGameKicker");
const whoAmICurrentPlayer = document.getElementById("whoAmICurrentPlayer");
const whoAmIGameInfo = document.getElementById("whoAmIGameInfo");
const whoAmITimerBox = document.getElementById("whoAmITimerBox");
const whoAmITimerText = document.getElementById("whoAmITimerText");
const whoAmIForeheadCard = document.getElementById("whoAmIForeheadCard");
const whoAmIForeheadCategory = document.getElementById("whoAmIForeheadCategory");
const whoAmIForeheadRole = document.getElementById("whoAmIForeheadRole");
const whoAmIPlayersBoard = document.getElementById("whoAmIPlayersBoard");
const whoAmIYesBtn = document.getElementById("whoAmIYesBtn");
const whoAmINoBtn = document.getElementById("whoAmINoBtn");
const whoAmIAnswerGrid = document.querySelector(".whoami-answer-grid");
const whoAmIGuessedBtn = document.getElementById("whoAmIGuessedBtn");
const whoAmIGameChangeRoleBtn = document.getElementById("whoAmIGameChangeRoleBtn");
const whoAmISkipRoleBtn = document.getElementById("whoAmISkipRoleBtn");
const whoAmIParticipantsBtn = document.getElementById("whoAmIParticipantsBtn");
const whoAmIRulesBtn = document.getElementById("whoAmIRulesBtn");
const whoAmIEndRoundBtn = document.getElementById("whoAmIEndRoundBtn");
const whoAmIGameMenuBtn = document.getElementById("whoAmIGameMenuBtn");
const whoAmICurrentSpoiler = document.getElementById("whoAmICurrentSpoiler");
const whoAmICurrentSpoilerBtn = document.getElementById("whoAmICurrentSpoilerBtn");
const whoAmICurrentSpoilerValue = document.getElementById("whoAmICurrentSpoilerValue");
const whoAmICurrentSpoilerWarning = document.getElementById("whoAmICurrentSpoilerWarning");
const whoAmICurrentSpoilerRole = document.getElementById("whoAmICurrentSpoilerRole");
const whoAmICurrentSpoilerCategory = document.getElementById("whoAmICurrentSpoilerCategory");
const whoAmIRoundTitle = document.getElementById("whoAmIRoundTitle");
const whoAmIRoundSummary = document.getElementById("whoAmIRoundSummary");
const whoAmIRoundRoles = document.getElementById("whoAmIRoundRoles");
const whoAmIRoundScoreBoard = document.getElementById("whoAmIRoundScoreBoard");
const whoAmIRoundNextBtn = document.getElementById("whoAmIRoundNextBtn");
const whoAmIRoundMenuBtn = document.getElementById("whoAmIRoundMenuBtn");
const whoAmIFinalTitle = document.getElementById("whoAmIFinalTitle");
const whoAmIFinalSubtitle = document.getElementById("whoAmIFinalSubtitle");
const whoAmIFinalHero = document.getElementById("whoAmIFinalHero");
const whoAmIFinalBoard = document.getElementById("whoAmIFinalBoard");
const whoAmINewBtn = document.getElementById("whoAmINewBtn");
const whoAmIFinalMenuBtn = document.getElementById("whoAmIFinalMenuBtn");
const whoAmIRulesModal = document.getElementById("whoAmIRulesModal");
const whoAmIRulesCloseBtn = document.getElementById("whoAmIRulesCloseBtn");
const whoAmIParticipantsModal = document.getElementById("whoAmIParticipantsModal");
const whoAmIParticipantsCloseBtn = document.getElementById("whoAmIParticipantsCloseBtn");
const whoAmIParticipantsList = document.getElementById("whoAmIParticipantsList");
const whoAmIConfirmModal = document.getElementById("whoAmIConfirmModal");
const whoAmIConfirmText = document.getElementById("whoAmIConfirmText");
const whoAmIConfirmYesBtn = document.getElementById("whoAmIConfirmYesBtn");
const whoAmIConfirmNoBtn = document.getElementById("whoAmIConfirmNoBtn");

init().catch(handleAppInitializationError);

function updateStandaloneModeClass() {
  const isStandalone = Boolean(
    (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches)
    || window.navigator.standalone
  );

  document.body.classList.toggle("is-standalone", isStandalone);
  document.body.classList.toggle("is-browser-shell", !isStandalone);
}

async function init() {
  applyBrandText();
  updateStandaloneModeClass();
  initializeTheme();
  initializeSoundSetting();
  initializeHapticSetting();
  initializeWordCardSettings();
  validateWordGuessLocaleCoverage();
  initializeWordGuessLabs();
  registerServiceWorker();
  checkRequiredUpdate();
  await loadModeCategories(selectedMode);
  renderCategories();
  syncTeamNamesForCount();
  renderTeamNameInputs();
  resetTeamScores();
  updateModeLabels();
  syncPhraseFilterButton();
  syncLastWordButton();
  syncTeamNamesVisibility(false);
  renderWordGuessModeSelector();
  renderWordGuessBoard();
  renderWordGuessKeyboard();
  setupEvents();
  initializeAppHistory();
  flushPendingAppToast();
  setupEdgeSwipeNavigation();
}

function handleAppInitializationError(error) {
  console.error("Не вдалося ініціалізувати Мовограй", error);
  showAppToastWhenReady("Не вдалося повністю запустити гру. Оновіть сторінку.");
}

function showAppToastWhenReady(message) {
  if (!appToast) {
    pendingAppToastMessage = message;
    return;
  }
  showAppToast(message);
}

function flushPendingAppToast() {
  if (!pendingAppToastMessage) {
    return;
  }
  const message = pendingAppToastMessage;
  pendingAppToastMessage = "";
  showAppToast(message);
}

function getRevisionedAssetUrl(path) {
  return `${path}?rev=${encodeURIComponent(ASSET_REVISION)}`;
}

function checkRequiredUpdate() {
  if (updateCheckPromise) {
    return updateCheckPromise;
  }

  const checkPromise = fetchRemoteRelease().then((remoteRelease) => {
    if (!remoteRelease) {
      return null;
    }

    const localRelease = getLocalReleaseInfo();
    if (compareReleaseInfo(remoteRelease, localRelease) <= 0) {
      removeRequiredUpdateOverlay();
      clearCompletedUpdateTarget(localRelease);
      return remoteRelease;
    }

    if (remoteRelease.required) {
      showRequiredUpdateOverlay(remoteRelease);
    } else {
      removeRequiredUpdateOverlay();
      showOptionalUpdateNotice(remoteRelease);
    }
    return remoteRelease;
  });

  updateCheckPromise = checkPromise.then(
    (result) => {
      updateCheckPromise = null;
      return result;
    },
    (error) => {
      updateCheckPromise = null;
      console.warn("Не вдалося перевірити оновлення гри", error);
      return null;
    },
  );
  return updateCheckPromise;
}

async function fetchRemoteRelease() {
  const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
  const timeoutId = controller
    ? window.setTimeout(() => controller.abort(), VERSION_CHECK_TIMEOUT_MS)
    : null;

  try {
    const versionUrl = `${VERSION_CHECK_FILE}?t=${Date.now()}&local=${encodeURIComponent(DATA_REVISION)}`;
    const request = new Request(versionUrl, {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
      },
      signal: controller ? controller.signal : undefined,
    });
    const response = await fetch(request);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return normalizeReleaseInfo(data);
  } catch (error) {
    console.warn("Не вдалося перевірити версію гри", error);
    return null;
  } finally {
    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }
  }
}

function normalizeBuildLabel(build) {
  const normalizedBuild = String(build || "").trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(normalizedBuild) ? normalizedBuild : "";
}

function normalizeReleaseInfo(data) {
  const version = normalizeVersionLabel(data && data.version);
  if (!version) {
    return null;
  }
  const build = normalizeBuildLabel(data && data.build);
  return {
    version,
    build,
    revision: build ? `${version}-${build.replace(/-/g, "")}` : version,
    required: Boolean(data && data.required),
  };
}

function getLocalReleaseInfo() {
  return {
    version: DATA_VERSION,
    build: DATA_BUILD,
    revision: DATA_REVISION,
    required: true,
  };
}

function normalizeVersionLabel(version) {
  const match = /^v?(\d+(?:\.\d+)*)([a-z]*)$/i.exec(String(version || "").trim());
  if (!match) {
    return "";
  }
  return `${match[1]}${String(match[2] || "").toLowerCase()}`;
}

function parseVersionLabel(version) {
  const normalized = normalizeVersionLabel(version);
  const match = /^(\d+(?:\.\d+)*)([a-z]*)$/i.exec(normalized);
  if (!match) {
    return { parts: [0], suffix: "" };
  }
  return {
    parts: match[1]
      .split(".")
      .map((part) => Number.parseInt(part, 10))
      .map((part) => (Number.isFinite(part) ? part : 0)),
    suffix: String(match[2] || "").toLowerCase(),
  };
}

function compareVersionLabels(leftVersion, rightVersion) {
  const left = parseVersionLabel(leftVersion);
  const right = parseVersionLabel(rightVersion);
  const maxLength = Math.max(left.parts.length, right.parts.length);

  for (let index = 0; index < maxLength; index += 1) {
    const leftPart = left.parts[index] || 0;
    const rightPart = right.parts[index] || 0;

    if (leftPart > rightPart) {
      return 1;
    }

    if (leftPart < rightPart) {
      return -1;
    }
  }

  if (left.suffix === right.suffix) {
    return 0;
  }
  if (!left.suffix) {
    return -1;
  }
  if (!right.suffix) {
    return 1;
  }
  return left.suffix > right.suffix ? 1 : -1;
}

function compareReleaseInfo(leftRelease, rightRelease) {
  if (!leftRelease || !rightRelease) {
    return 0;
  }
  const versionComparison = compareVersionLabels(leftRelease.version, rightRelease.version);
  if (versionComparison !== 0) {
    return versionComparison;
  }
  if (!leftRelease.build || !rightRelease.build) {
    return 0;
  }
  if (leftRelease.build > rightRelease.build) {
    return 1;
  }
  if (leftRelease.build < rightRelease.build) {
    return -1;
  }
  return 0;
}

function clearCompletedUpdateTarget(localRelease) {
  try {
    const pendingRevision = String(localStorage.getItem(UPDATE_TARGET_STORAGE_KEY) || "").trim();
    if (!pendingRevision) {
      return;
    }
    const revisionMatch = /^(\d+(?:\.\d+)*[a-z]*)-(\d{4})(\d{2})(\d{2})$/i.exec(pendingRevision);
    const pendingRelease = revisionMatch ? {
      version: revisionMatch[1],
      build: `${revisionMatch[2]}-${revisionMatch[3]}-${revisionMatch[4]}`,
    } : null;
    if (!pendingRelease || compareReleaseInfo(localRelease, pendingRelease) >= 0) {
      localStorage.removeItem(UPDATE_TARGET_STORAGE_KEY);
    }
  } catch (error) {
    // The loaded revision remains the source of truth if storage is unavailable.
  }
}

function removeRequiredUpdateOverlay() {
  const existingOverlay = document.getElementById("requiredUpdateOverlay");
  const hadRequiredUpdate = Boolean(existingOverlay || document.body.classList.contains("required-update-open"));
  if (hadRequiredUpdate) {
    requiredUpdateAttemptGeneration += 1;
    if (cancelRequiredUpdateActivation) {
      cancelRequiredUpdateActivation();
    }
    isUpdateReloadPending = false;
  }
  if (existingOverlay) {
    existingOverlay.remove();
  }
  document.body.classList.remove("required-update-open");
  if (roundTimerPauseReasons["required-update"]) {
    resumeRoundTimer("required-update");
  }
  if (whoAmITimerPauseReasons["required-update"]) {
    resumeWhoAmITimer("required-update");
  }
}

function showOptionalUpdateNotice(remoteRelease) {
  if (!remoteRelease || lastOptionalUpdateNoticeRevision === remoteRelease.revision) {
    return;
  }
  lastOptionalUpdateNoticeRevision = remoteRelease.revision;
  showAppToastWhenReady(`Доступне оновлення v${remoteRelease.version}. Воно застосовується після наступного відкриття.`);
}

function showRequiredUpdateOverlay(remoteRelease) {
  if (!remoteRelease || compareReleaseInfo(remoteRelease, getLocalReleaseInfo()) <= 0) {
    removeRequiredUpdateOverlay();
    return;
  }

  pauseRoundTimer("required-update");
  pauseWhoAmITimer("required-update");

  const existingOverlay = document.getElementById("requiredUpdateOverlay");
  if (existingOverlay) {
    return;
  }

  document.body.classList.add("required-update-open");

  const overlay = document.createElement("div");
  overlay.id = "requiredUpdateOverlay";
  overlay.className = "required-update-overlay";
  overlay.setAttribute("role", "alertdialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-labelledby", "requiredUpdateTitle");
  overlay.setAttribute("aria-describedby", "requiredUpdateText");

  const card = document.createElement("div");
  card.className = "required-update-card";
  const icon = appendTextElement(card, "div", "required-update-icon", "↻");
  icon.setAttribute("aria-hidden", "true");
  appendTextElement(card, "p", "required-update-eyebrow", "ПОТРІБНО ОНОВИТИ");
  const title = appendTextElement(card, "h2", "", "Доступна нова версія гри");
  title.id = "requiredUpdateTitle";
  const text = appendTextElement(
    card,
    "p",
    "",
    `На пристрої відкрилася ревізія ${DATA_REVISION}, а на сайті вже є ${remoteRelease.revision}. Натисни кнопку, щоб завантажити оновлення.`,
  );
  text.id = "requiredUpdateText";
  const updateButton = appendTextElement(card, "button", "required-update-btn", "Оновити гру");
  updateButton.id = "requiredUpdateBtn";
  updateButton.type = "button";
  updateButton.dataset.remoteVersion = remoteRelease.version;
  updateButton.dataset.remoteBuild = remoteRelease.build;
  updateButton.dataset.remoteRevision = remoteRelease.revision;
  const updateStatus = document.createElement("p");
  updateStatus.className = "required-update-status";
  updateStatus.id = "requiredUpdateStatus";
  updateStatus.textContent = "";
  updateStatus.setAttribute("role", "status");
  updateStatus.setAttribute("aria-live", "polite");
  updateStatus.hidden = true;
  card.appendChild(updateStatus);
  appendTextElement(card, "p", "required-update-note", "Після оновлення сторінка перезавантажиться автоматично.");
  overlay.appendChild(card);

  document.body.appendChild(overlay);

  updateButton.focus();
  updateButton.addEventListener("click", () => forceRequiredUpdate(updateButton, remoteRelease));
}

function beginRequiredUpdateAttempt() {
  requiredUpdateAttemptGeneration += 1;
  if (cancelRequiredUpdateActivation) {
    cancelRequiredUpdateActivation();
  }
  return requiredUpdateAttemptGeneration;
}

function isRequiredUpdateAttemptCurrent(attemptId) {
  return attemptId === requiredUpdateAttemptGeneration
    && document.body.classList.contains("required-update-open");
}

function setRequiredUpdateAttemptPending(button) {
  const status = document.getElementById("requiredUpdateStatus");
  if (status) {
    status.textContent = "";
    status.hidden = true;
  }
  if (button) {
    button.disabled = true;
    button.textContent = "Оновлюємо...";
    button.setAttribute("aria-busy", "true");
  }
}

function setRequiredUpdateAttemptFailed(button) {
  const status = document.getElementById("requiredUpdateStatus");
  if (status) {
    status.textContent = "Не вдалося перевірити оновлення. Перевірте з’єднання та спробуйте ще раз.";
    status.hidden = false;
  }
  if (button) {
    button.disabled = false;
    button.textContent = "Оновити гру";
    button.removeAttribute("aria-busy");
  }
}

function updateServiceWorkerWithTimeout(registration, attemptId) {
  return new Promise((resolve, reject) => {
    let isSettled = false;
    let timeoutId = null;
    const finish = (error) => {
      if (isSettled) {
        return;
      }
      isSettled = true;
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    };

    timeoutId = window.setTimeout(() => {
      finish(new Error("Service worker update timed out"));
    }, SERVICE_WORKER_UPDATE_TIMEOUT_MS);

    let updatePromise;
    try {
      updatePromise = registration.update();
    } catch (error) {
      finish(error);
      return;
    }

    Promise.resolve(updatePromise).then(
      () => {
        if (!isRequiredUpdateAttemptCurrent(attemptId)) {
          finish(new Error("Service worker update attempt is no longer current"));
          return;
        }
        finish();
      },
      (error) => finish(error || new Error("Service worker update failed")),
    );
  });
}

async function forceRequiredUpdate(button, remoteRelease) {
  const attemptId = beginRequiredUpdateAttempt();
  const targetRelease = remoteRelease || normalizeReleaseInfo({
    version: button && button.dataset ? button.dataset.remoteVersion : "",
    build: button && button.dataset ? button.dataset.remoteBuild : "",
    required: true,
  });

  setRequiredUpdateAttemptPending(button);
  isUpdateReloadPending = true;
  try {
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.getRegistration("./");
      if (!isRequiredUpdateAttemptCurrent(attemptId)) {
        return false;
      }
      const expectedScope = new URL("./", document.baseURI).href;
      if (registration && registration.scope === expectedScope) {
        await updateServiceWorkerWithTimeout(registration, attemptId);
        if (!isRequiredUpdateAttemptCurrent(attemptId)) {
          return false;
        }
        await activateWaitingServiceWorker(registration, attemptId);
      }
    }
  } catch (error) {
    if (!isRequiredUpdateAttemptCurrent(attemptId)) {
      return false;
    }
    console.warn("Не вдалося активувати оновлення service worker", error);
    isUpdateReloadPending = false;
    setRequiredUpdateAttemptFailed(button);
    return false;
  }

  if (!isRequiredUpdateAttemptCurrent(attemptId)) {
    return false;
  }

  try {
    if (targetRelease) {
      localStorage.setItem(UPDATE_TARGET_STORAGE_KEY, targetRelease.revision);
    }
  } catch (error) {
    // Reload still works if storage is unavailable.
  }

  const cleanUrl = new URL("index.html", window.location.href);
  cleanUrl.searchParams.set("updated", Date.now().toString());
  if (targetRelease) {
    cleanUrl.searchParams.set("target", targetRelease.revision);
  }
  window.location.replace(cleanUrl.toString());
  return true;
}

function activateWaitingServiceWorker(registration, attemptId) {
  return new Promise((resolve, reject) => {
    let isSettled = false;
    let activationRequested = false;
    let timeoutId = null;
    let installingWorker = null;
    let handleInstallingState = null;
    const handleControllerChange = () => finish();
    const cleanup = () => {
      navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
      if (installingWorker && handleInstallingState) {
        installingWorker.removeEventListener("statechange", handleInstallingState);
      }
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
    const finish = (error) => {
      if (isSettled) {
        return;
      }
      isSettled = true;
      cleanup();
      if (cancelRequiredUpdateActivation === cancelActivation) {
        cancelRequiredUpdateActivation = null;
      }
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    };
    const cancelActivation = () => finish(new Error("Service worker activation was invalidated"));
    const requestActivation = (worker) => {
      if (isSettled || !isRequiredUpdateAttemptCurrent(attemptId)) {
        return false;
      }
      const waitingWorker = registration.waiting || worker;
      if (waitingWorker && waitingWorker.state === "installed") {
        if (!activationRequested) {
          activationRequested = true;
          try {
            waitingWorker.postMessage({ type: "SKIP_WAITING" });
          } catch (error) {
            finish(error);
            return false;
          }
        }
        return true;
      }
      return false;
    };

    cancelRequiredUpdateActivation = cancelActivation;
    timeoutId = window.setTimeout(() => {
      finish(new Error("Service worker activation timed out"));
    }, SERVICE_WORKER_ACTIVATION_TIMEOUT_MS);
    navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);

    const activationStarted = requestActivation();
    if (isSettled || activationStarted) {
      return;
    }
    installingWorker = registration.installing;
    if (!installingWorker) {
      finish();
      return;
    }
    handleInstallingState = () => {
      if (!isRequiredUpdateAttemptCurrent(attemptId)) {
        cancelActivation();
        return;
      }
      if (installingWorker.state === "installed") {
        requestActivation(installingWorker);
      } else if (installingWorker.state === "activated") {
        finish();
      } else if (installingWorker.state === "redundant") {
        finish(new Error("Service worker installation became redundant"));
      }
    };
    installingWorker.addEventListener("statechange", handleInstallingState);
    handleInstallingState();
  });
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator) || !window.isSecureContext) {
    return null;
  }

  if (!isServiceWorkerLifecycleBound) {
    isServiceWorkerLifecycleBound = true;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!isUpdateReloadPending) {
        checkRequiredUpdate();
      }
    });
  }

  if (document.readyState === "complete") {
    return registerCurrentServiceWorker();
  }
  if (!isServiceWorkerRegistrationScheduled) {
    isServiceWorkerRegistrationScheduled = true;
    window.addEventListener("load", () => {
      isServiceWorkerRegistrationScheduled = false;
      registerCurrentServiceWorker();
    }, { once: true });
  }
  return null;
}

function registerCurrentServiceWorker() {
  if (serviceWorkerRegistrationPromise) {
    return serviceWorkerRegistrationPromise;
  }
  serviceWorkerRegistrationPromise = navigator.serviceWorker
    .register(getRevisionedAssetUrl("./service-worker.js"), { scope: "./" })
    .then((registration) => {
      registration.update().catch(() => {});
      registration.addEventListener("updatefound", () => {
        const installingWorker = registration.installing;
        if (!installingWorker) {
          return;
        }
        installingWorker.addEventListener("statechange", () => {
          if (installingWorker.state === "installed" && navigator.serviceWorker.controller) {
            checkRequiredUpdate();
          }
        });
      });
      return registration;
    })
    .catch((error) => {
      serviceWorkerRegistrationPromise = null;
      console.warn("Не вдалося зареєструвати service worker", error);
      return null;
    });
  return serviceWorkerRegistrationPromise;
}

function applyBrandText() {
  document.title = GAME_TITLE;

  if (appTitle) {
    appTitle.textContent = GAME_TITLE;
  }

  if (appSubtitle) {
    appSubtitle.textContent = GAME_SUBTITLE;
  }

  updateMenuVersionInfo();
}

function updateMenuVersionInfo() {
  if (!menuVersionInfo) {
    return;
  }

  menuVersionInfo.textContent = `v${DATA_VERSION}`;

  if (appSettingsVersion) {
    appSettingsVersion.textContent = `v${DATA_VERSION}`;
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

  if (settingsThemeToggleBtn) {
    settingsThemeToggleBtn.setAttribute("aria-pressed", nextTheme === "dark" ? "true" : "false");
  }

  if (settingsThemeIcon) {
    settingsThemeIcon.textContent = nextTheme === "dark" ? "☀️" : "🌙";
  }

  if (settingsThemeTitle) {
    settingsThemeTitle.textContent = nextTheme === "dark" ? "Світла тема" : "Темна тема";
  }

  if (settingsThemeText) {
    settingsThemeText.textContent = nextTheme === "dark" ? "Перемкнути на світле оформлення" : "Перемкнути на темне оформлення";
  }

  if (wordCardSettings) {
    renderWordCardSettingsControls();
    refreshCurrentWordCardAppearance();
  }
}

function getPreferredSoundSetting() {
  try {
    const savedSound = localStorage.getItem(SOUND_STORAGE_KEY);
    if (savedSound === "off") {
      return false;
    }
    if (savedSound === "on") {
      return true;
    }
  } catch (error) {
    // localStorage can be unavailable; sound stays enabled for this session.
  }

  return true;
}

function applySoundSetting(isEnabled) {
  isGameSoundEnabled = Boolean(isEnabled);
  if (isGameSoundEnabled && gameAudioContext) {
    preloadGameSoundBuffers();
  }

  if (settingsSoundToggleBtn) {
    settingsSoundToggleBtn.setAttribute("aria-pressed", isGameSoundEnabled ? "true" : "false");
  }

  if (settingsSoundIcon) {
    settingsSoundIcon.textContent = isGameSoundEnabled ? "🔊" : "🔇";
  }

  if (settingsSoundTitle) {
    settingsSoundTitle.textContent = isGameSoundEnabled ? "Звук увімкнено" : "Звук вимкнено";
  }

  if (settingsSoundText) {
    settingsSoundText.textContent = isGameSoundEnabled ? "Вимкнути звуки гри" : "Увімкнути звуки гри";
  }
}

function initializeSoundSetting() {
  applySoundSetting(getPreferredSoundSetting());
}

function getPreferredHapticSetting() {
  try {
    const savedHaptic = localStorage.getItem(HAPTIC_STORAGE_KEY);
    if (savedHaptic === "off") {
      return false;
    }
    if (savedHaptic === "on") {
      return true;
    }
  } catch (error) {
    // localStorage can be unavailable; haptics stay enabled for this session.
  }

  return true;
}

function applyHapticSetting(isEnabled) {
  isHapticFeedbackEnabled = Boolean(isEnabled);

  if (settingsHapticToggleBtn) {
    settingsHapticToggleBtn.setAttribute("aria-pressed", isHapticFeedbackEnabled ? "true" : "false");
  }

  if (settingsHapticIcon) {
    settingsHapticIcon.textContent = isHapticFeedbackEnabled ? "📳" : "📴";
  }

  if (settingsHapticTitle) {
    settingsHapticTitle.textContent = isHapticFeedbackEnabled ? "Вібрація увімкнена" : "Вібрація вимкнена";
  }

  if (settingsHapticText) {
    settingsHapticText.textContent = isHapticFeedbackEnabled
      ? "Легкі вібрації для вгадано/пропущено"
      : "Увімкнути легку вібрацію";
  }
}

function initializeHapticSetting() {
  applyHapticSetting(getPreferredHapticSetting());
}

function toggleHapticSetting() {
  const nextHapticState = !isHapticFeedbackEnabled;
  applyHapticSetting(nextHapticState);

  try {
    localStorage.setItem(HAPTIC_STORAGE_KEY, nextHapticState ? "on" : "off");
  } catch (error) {
    // Haptics still change for the current session if persistence is blocked.
  }
}

function toggleSoundSetting() {
  const nextSoundState = !isGameSoundEnabled;
  applySoundSetting(nextSoundState);

  try {
    localStorage.setItem(SOUND_STORAGE_KEY, nextSoundState ? "on" : "off");
  } catch (error) {
    // Sound still changes for the current session if persistence is blocked.
  }
}

function getDefaultWordCardSettings() {
  return {
    useAllShapes: true,
    enabledShapes: WORD_CARD_SHAPES.map((shape) => shape.id),
    randomColors: true,
    outlineModes: {
      light: "random",
      dark: "random",
    },
  };
}

function normalizeWordCardSettings(rawSettings) {
  const defaults = getDefaultWordCardSettings();
  const normalized = {
    useAllShapes: defaults.useAllShapes,
    enabledShapes: [...defaults.enabledShapes],
    randomColors: defaults.randomColors,
    outlineModes: { ...defaults.outlineModes },
  };

  if (rawSettings && typeof rawSettings === "object") {
    if (typeof rawSettings.useAllShapes === "boolean") {
      normalized.useAllShapes = rawSettings.useAllShapes;
    }
    if (Array.isArray(rawSettings.enabledShapes)) {
      const uniqueShapes = rawSettings.enabledShapes.filter((shapeId, index, source) => (
        typeof shapeId === "string"
        && WORD_CARD_SHAPE_ID_SET.has(shapeId)
        && source.indexOf(shapeId) === index
      ));
      if (uniqueShapes.length > 0) {
        normalized.enabledShapes = uniqueShapes;
      }
    }
    if (typeof rawSettings.randomColors === "boolean") {
      normalized.randomColors = rawSettings.randomColors;
    }
    if (rawSettings.outlineModes && typeof rawSettings.outlineModes === "object") {
      ["light", "dark"].forEach((theme) => {
        const nextMode = rawSettings.outlineModes[theme];
        if (WORD_CARD_OUTLINE_MODES.has(nextMode)) {
          normalized.outlineModes[theme] = nextMode;
        }
      });
    }
  }

  if (normalized.enabledShapes.length === 0) {
    normalized.enabledShapes = [...defaults.enabledShapes];
  }

  return normalized;
}

function persistWordCardSettings() {
  if (!wordCardSettings) {
    return;
  }

  try {
    localStorage.setItem(WORD_CARD_SETTINGS_STORAGE_KEY, JSON.stringify(wordCardSettings));
  } catch (error) {
    // Ignore storage errors; settings still apply in current session.
  }
}

function getPreferredWordCardSettings() {
  try {
    const savedSettings = localStorage.getItem(WORD_CARD_SETTINGS_STORAGE_KEY);
    if (savedSettings) {
      return normalizeWordCardSettings(JSON.parse(savedSettings));
    }
  } catch (error) {
    // Ignore corrupted storage and fall back to defaults.
  }

  return normalizeWordCardSettings(null);
}

function getEnabledWordCardShapeIds() {
  const safeSettings = wordCardSettings || getDefaultWordCardSettings();
  const enabledShapes = Array.isArray(safeSettings.enabledShapes)
    ? safeSettings.enabledShapes.filter((shapeId) => WORD_CARD_SHAPE_ID_SET.has(shapeId))
    : [];

  if (safeSettings.useAllShapes || enabledShapes.length === 0) {
    return WORD_CARD_SHAPES.map((shape) => shape.id);
  }

  return enabledShapes;
}

function renderWordCardSettingsControls() {
  const safeSettings = wordCardSettings || getDefaultWordCardSettings();

  if (wordCardUseAllShapesToggle) {
    wordCardUseAllShapesToggle.checked = safeSettings.useAllShapes;
  }

  if (wordCardRandomColorsToggle) {
    wordCardRandomColorsToggle.checked = safeSettings.randomColors;
  }

  wordCardShapeCheckboxes.forEach((checkbox) => {
    const shapeId = checkbox.dataset.wordCardShape;
    checkbox.checked = safeSettings.useAllShapes || safeSettings.enabledShapes.includes(shapeId);
    checkbox.disabled = safeSettings.useAllShapes;
    const option = checkbox.closest(".app-settings-check");
    if (option) {
      option.classList.toggle("is-disabled", safeSettings.useAllShapes);
    }
  });

  wordCardOutlineModeButtons.forEach((button) => {
    const theme = button.dataset.outlineTheme;
    const mode = button.dataset.outlineMode;
    const isSelected = safeSettings.outlineModes[theme] === mode;
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-pressed", isSelected ? "true" : "false");
  });
}

function initializeWordCardSettings() {
  wordCardSettings = getPreferredWordCardSettings();
  renderWordCardSettingsControls();
}

function updateWordCardUseAllShapes(isEnabled) {
  wordCardSettings = normalizeWordCardSettings({
    ...wordCardSettings,
    useAllShapes: Boolean(isEnabled),
  });
  persistWordCardSettings();
  renderWordCardSettingsControls();
  refreshCurrentWordCardAppearance();
}

function updateWordCardRandomColors(isEnabled) {
  wordCardSettings = normalizeWordCardSettings({
    ...wordCardSettings,
    randomColors: Boolean(isEnabled),
  });
  persistWordCardSettings();
  renderWordCardSettingsControls();
  refreshCurrentWordCardAppearance();
}

function updateWordCardShapeSelection(shapeId, isEnabled) {
  if (!WORD_CARD_SHAPE_ID_SET.has(shapeId)) {
    return;
  }

  const currentEnabled = getEnabledWordCardShapeIds();
  let nextEnabled = currentEnabled.filter((currentId) => currentId !== shapeId);
  if (isEnabled) {
    nextEnabled.push(shapeId);
  }
  nextEnabled = WORD_CARD_SHAPES.map((shape) => shape.id).filter((id) => nextEnabled.includes(id));

  if (nextEnabled.length === 0) {
    renderWordCardSettingsControls();
    showAppToastWhenReady("Залиш хоча б одну форму картки.");
    return;
  }

  wordCardSettings = normalizeWordCardSettings({
    ...wordCardSettings,
    useAllShapes: false,
    enabledShapes: nextEnabled,
  });
  persistWordCardSettings();
  renderWordCardSettingsControls();
  refreshCurrentWordCardAppearance();
}

function updateWordCardOutlineMode(theme, mode) {
  if (!WORD_CARD_OUTLINE_MODES.has(mode) || (theme !== "light" && theme !== "dark")) {
    return;
  }

  wordCardSettings = normalizeWordCardSettings({
    ...wordCardSettings,
    outlineModes: {
      ...((wordCardSettings && wordCardSettings.outlineModes) ? wordCardSettings.outlineModes : {}),
      [theme]: mode,
    },
  });
  persistWordCardSettings();
  renderWordCardSettingsControls();
  refreshCurrentWordCardAppearance();
}

function getCurrentThemeName() {
  return document.body.dataset.theme === "dark" ? "dark" : "light";
}

function getWordCardPalettePool(theme) {
  return theme === "dark" ? WORD_CARD_DARK_PALETTES : WORD_CARD_LIGHT_PALETTES;
}

function getDefaultWordCardPalette(theme) {
  return theme === "dark"
    ? { fillTop: "#252d45", fillBottom: "#1f263a", outline: "rgba(222, 226, 242, 0.84)", text: "#eef2ff" }
    : { fillTop: "#fffdf8", fillBottom: "#fff7e8", outline: "rgba(255, 255, 255, 0.96)", text: "#2f3a67" };
}

function pickRandomIndex(items, previousIndex) {
  if (!Array.isArray(items) || items.length === 0) {
    return -1;
  }

  let nextIndex = Math.floor(Math.random() * items.length);
  if (items.length > 1 && nextIndex === previousIndex) {
    const step = 1 + Math.floor(Math.random() * (items.length - 1));
    nextIndex = (nextIndex + step) % items.length;
  }
  return nextIndex;
}

function chooseNextWordCardShapeId() {
  const enabledShapeIds = getEnabledWordCardShapeIds();
  if (enabledShapeIds.length === 0) {
    return WORD_CARD_SHAPES[0].id;
  }

  let nextShapeId = enabledShapeIds[Math.floor(Math.random() * enabledShapeIds.length)];
  if (enabledShapeIds.length > 1 && nextShapeId === lastWordCardShapeId) {
    const currentIndex = enabledShapeIds.indexOf(nextShapeId);
    const step = 1 + Math.floor(Math.random() * (enabledShapeIds.length - 1));
    nextShapeId = enabledShapeIds[(currentIndex + step) % enabledShapeIds.length];
  }

  lastWordCardShapeId = nextShapeId;
  return nextShapeId;
}

function chooseWordCardPalette(theme) {
  const palettePool = getWordCardPalettePool(theme);
  if (!wordCardSettings || !wordCardSettings.randomColors || palettePool.length === 0) {
    return getDefaultWordCardPalette(theme);
  }

  const paletteIndex = pickRandomIndex(palettePool, lastWordCardPaletteIndexByTheme[theme]);
  lastWordCardPaletteIndexByTheme[theme] = paletteIndex;
  return palettePool[paletteIndex] || getDefaultWordCardPalette(theme);
}

function resolveWordCardOutlineEnabled(theme) {
  const mode = wordCardSettings && wordCardSettings.outlineModes ? wordCardSettings.outlineModes[theme] : "random";
  if (mode === "on") {
    return true;
  }
  if (mode === "off") {
    return false;
  }
  return Math.random() >= 0.5;
}

function updateWordCardMotionWidth() {
  if (!wordCard || !wordCardMotion || !wordText) {
    return;
  }

  const containerWidth = wordCard.clientWidth || wordCard.getBoundingClientRect().width || 680;
  if (!containerWidth) {
    return;
  }

  const computedStyle = window.getComputedStyle(wordText);
  const fontSize = parseFloat(computedStyle.fontSize) || 40;
  const fontWeight = computedStyle.fontWeight || "900";
  const fontFamily = computedStyle.fontFamily || "sans-serif";
  let measuredTextWidth = String(wordText.textContent || "").length * fontSize * 0.58;

  try {
    const canvas = updateWordCardMotionWidth.canvas || (updateWordCardMotionWidth.canvas = document.createElement("canvas"));
    const context = canvas.getContext("2d");
    if (context) {
      context.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
      measuredTextWidth = context.measureText(String(wordText.textContent || "")).width;
    }
  } catch (error) {
    // The character-count estimate above is sufficient as a safe fallback.
  }

  const text = String(wordText.textContent || "").trim();
  const isMultiWord = /\s/.test(text);
  const minRatio = isMultiWord ? 0.74 : 0.58;
  const minWidth = Math.min(containerWidth, Math.max(270, containerWidth * minRatio));
  const maxWidth = Math.max(minWidth, containerWidth * 0.985);
  const horizontalBreathingRoom = Math.max(112, Math.min(180, containerWidth * 0.22));
  const desiredWidth = measuredTextWidth + horizontalBreathingRoom;
  const targetWidth = Math.round(Math.max(minWidth, Math.min(maxWidth, desiredWidth)));

  wordCardMotion.style.width = `${targetWidth}px`;
  wordCardMotion.style.marginLeft = `${Math.round(-targetWidth / 2)}px`;

  // Mobile hotfix: on phones the gesture area may be very tall. Keep the physical
  // token compact instead of stretching its SVG to the full card height.
  const isPhoneLayout = window.innerWidth <= 599;
  if (isPhoneLayout) {
    const containerHeight = wordCard.clientHeight || wordCard.getBoundingClientRect().height || 320;
    const heightCap = Math.max(145, Math.min(255, containerHeight * 0.72));
    const targetHeight = Math.round(Math.max(145, Math.min(heightCap, targetWidth * 0.58)));
    wordCardMotion.style.top = "50%";
    wordCardMotion.style.bottom = "auto";
    wordCardMotion.style.height = `${targetHeight}px`;
    wordCardMotion.style.marginTop = `${Math.round(-targetHeight / 2)}px`;
  } else {
    wordCardMotion.style.top = "";
    wordCardMotion.style.bottom = "";
    wordCardMotion.style.height = "";
    wordCardMotion.style.marginTop = "";
  }

  const usableTextWidth = targetWidth * 0.78;
  wordCard.classList.toggle("word-card-text-compact", measuredTextWidth > usableTextWidth);
  wordCard.classList.toggle("word-card-text-extra-compact", measuredTextWidth > usableTextWidth * 1.45);
}

function applyWordCardShapeClass(shapeId) {
  if (!wordCard) {
    return;
  }

  WORD_CARD_SHAPE_CLASS_NAMES.forEach((className) => {
    wordCard.classList.remove(className);
  });

  const shape = WORD_CARD_SHAPES.find((item) => item.id === shapeId) || WORD_CARD_SHAPES[0];
  currentWordCardShapeId = shape.id;
  wordCard.classList.add(shape.className);
  updateWordCardMotionWidth();
}

function applyWordCardPalette(palette) {
  if (!wordCard) {
    return;
  }

  const safePalette = palette || getDefaultWordCardPalette(getCurrentThemeName());
  wordCard.style.setProperty("--word-card-fill-top", safePalette.fillTop);
  wordCard.style.setProperty("--word-card-fill-bottom", safePalette.fillBottom);
  wordCard.style.setProperty("--word-card-outline-color", safePalette.outline);
  wordCard.style.setProperty("--word-card-text-color", safePalette.text);
}

function applyWordCardOutline(enabled) {
  if (!wordCard) {
    return;
  }

  wordCard.classList.toggle("word-card-outline-on", Boolean(enabled));
}

function clearWordCardAppearance() {
  if (!wordCard) {
    return;
  }

  WORD_CARD_SHAPE_CLASS_NAMES.forEach((className) => {
    wordCard.classList.remove(className);
  });
  wordCard.classList.remove("word-card-outline-on");
  wordCard.style.removeProperty("--word-card-fill-top");
  wordCard.style.removeProperty("--word-card-fill-bottom");
  wordCard.style.removeProperty("--word-card-outline-color");
  wordCard.style.removeProperty("--word-card-text-color");
}

function applyConfiguredWordCardAppearance(options) {
  if (!wordCard) {
    return;
  }

  const settings = options || {};
  if (selectedMode !== "explain" && selectedMode !== "charades") {
    currentWordCardShapeId = "";
    clearWordCardAppearance();
    return;
  }

  const enabledShapeIds = getEnabledWordCardShapeIds();
  const preserveShape = settings.preserveShape === true && currentWordCardShapeId && enabledShapeIds.includes(currentWordCardShapeId);
  const shapeId = preserveShape ? currentWordCardShapeId : chooseNextWordCardShapeId();
  applyWordCardShapeClass(shapeId);

  const theme = getCurrentThemeName();
  applyWordCardPalette(chooseWordCardPalette(theme));
  applyWordCardOutline(resolveWordCardOutlineEnabled(theme));
}

function refreshCurrentWordCardAppearance() {
  if (!wordCard) {
    return;
  }

  applyConfiguredWordCardAppearance({ preserveShape: true });
}

function openAppSettings() {
  if (!appSettingsModal) {
    return;
  }

  appSettingsModal.hidden = false;
  document.body.classList.add("app-settings-open");
  pauseRoundTimer("app-settings");
  pauseWhoAmITimer("app-settings");

  if (appSettingsCloseBtn) {
    appSettingsCloseBtn.focus();
  }
}

function closeAppSettings(options) {
  const settings = options || {};
  if (!appSettingsModal) {
    return;
  }

  appSettingsModal.hidden = true;
  document.body.classList.remove("app-settings-open");
  if (settings.resumeTimer !== false) {
    resumeRoundTimer("app-settings");
    resumeWhoAmITimer("app-settings");
  }
}

function initializeTheme() {
  applyTheme(getPreferredTheme());
}

function toggleTheme() {
  const nextTheme = document.body.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(nextTheme);
  wordGuessAchievementsState.themeToggles = (Number(wordGuessAchievementsState.themeToggles) || 0) + 1;
  persistWordGuessAchievementsState();
  evaluateWordGuessMetaAchievements();

  try {
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  } catch (error) {
    // Theme still changes for the current session if persistence is blocked.
  }
}

async function loadModeCategories(modeId = selectedMode) {
  const mode = modeConfigs.find((item) => item.id === modeId) || modeConfigs[0];

  if (modeCategoryCache[mode.id]) {
    if (selectedMode === mode.id) {
      categories = modeCategoryCache[mode.id];
    }
    return true;
  }

  try {
    if (!modeCategoryPromises[mode.id]) {
      const dictionaryUrl = getRevisionedAssetUrl(mode.dataFile);
      modeCategoryPromises[mode.id] = fetch(dictionaryUrl)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          return response.json();
        })
        .then((loadedCategories) => {
          modeCategoryCache[mode.id] = loadedCategories;
          modeCategoryPromises[mode.id] = null;
          return loadedCategories;
        });
    }

    const loadedCategories = await modeCategoryPromises[mode.id];
    if (selectedMode === mode.id) {
      categories = loadedCategories;
    }
    return true;
  } catch (error) {
    modeCategoryPromises[mode.id] = null;
    console.error(`Не вдалося завантажити ${mode.dataFile}`, error);
    if (selectedMode === mode.id) {
      categories = [];
      settingsMessage.textContent = "Не вдалося завантажити словник режиму.";
    }
    return false;
  }
}

function getWordGuessLanguageProfile(languageId = selectedWordGuessLanguage) {
  return WORD_GUESS_LANGUAGES[languageId] || WORD_GUESS_LANGUAGES[WORD_GUESS_DEFAULT_LANGUAGE];
}

function getWordGuessText(key) {
  const languageTexts = WORD_GUESS_TEXT[selectedWordGuessLanguage] || WORD_GUESS_TEXT.uk;
  return languageTexts[key] || WORD_GUESS_TEXT.uk[key] || key;
}

function formatWordGuessText(key, ...args) {
  const value = getWordGuessText(key);
  return typeof value === "function" ? value(...args) : String(value == null ? "" : value);
}

function validateWordGuessLocaleCoverage() {
  const requiredKeys = Object.keys(WORD_GUESS_TEXT.uk);
  Object.keys(WORD_GUESS_LANGUAGES).forEach(function (languageId) {
    const locale = WORD_GUESS_TEXT[languageId] || {};
    const missing = requiredKeys.filter(function (key) { return typeof locale[key] === "undefined"; });
    if (missing.length > 0) {
      console.warn(`Word Guess locale ${languageId} is missing keys: ${missing.join(", ")}`);
    }
  });
}

function getWordGuessLocale() {
  return getWordGuessLanguageProfile().locale;
}

function getWordGuessLetters() {
  return getWordGuessLanguageProfile().letters;
}

function getWordGuessKeyboardRows() {
  return getWordGuessLanguageProfile().keyboardRows;
}

function toWordGuessUpper(value) {
  return String(value || "").toLocaleUpperCase(getWordGuessLocale());
}

function readWordGuessAchievementsState() {
  const emptyLanguageLength = {
    uk: { "5": 0, "6": 0, "7": 0 },
    ru: { "5": 0, "6": 0, "7": 0 },
    en: { "5": 0, "6": 0, "7": 0 },
  };
  const emptyState = {
    schemaVersion: 4,
    unlocked: {},
    revealedHints: {},
    winsByLanguage: { uk: 0, ru: 0, en: 0 },
    gamesByLanguage: { uk: 0, ru: 0, en: 0 },
    winsByLanguageLength: emptyLanguageLength,
    firstTryWinsByLanguage: { uk: 0, ru: 0, en: 0 },
    noHintWinsByLanguage: { uk: 0, ru: 0, en: 0 },
    games: 0,
    wins: 0,
    losses: 0,
    currentWinStreak: 0,
    bestWinStreak: 0,
    totalInvalid: 0,
    totalHints: 0,
    totalBackspaces: 0,
    achievementModalOpens: 0,
    themeToggles: 0,
    labsUnlocks: 0,
    logoTaps: 0,
    achievementHintReveals: 0,
    winsByLength: { "5": 0, "6": 0, "7": 0 },
    gamesByLength: { "5": 0, "6": 0, "7": 0 },
    firstTryWins: 0,
    noHintWins: 0,
    settingsButtonTaps: 0,
    achievementButtonTaps: 0,
    rulesOpens: 0,
    languageSwitches: 0,
    lengthChanges: 0,
    attemptChanges: 0,
    repeatToggles: 0,
    feedbackSubmissions: 0,
    bugReports: 0,
    wordLikes: 0,
    wordDislikes: 0,
    shareCount: 0,
  };
  try {
    const raw = localStorage.getItem(WORD_GUESS_ACHIEVEMENTS_STORAGE_KEY);
    if (!raw) return emptyState;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return emptyState;
    const winsByLanguage = { ...emptyState.winsByLanguage, ...(parsed.winsByLanguage || {}) };
    const inferredWins = Object.keys(winsByLanguage).reduce(function (sum, key) {
      return sum + (Number(winsByLanguage[key]) || 0);
    }, 0);
    const parsedByLanguageLength = parsed.winsByLanguageLength || {};
    const winsByLanguageLength = {};
    Object.keys(emptyLanguageLength).forEach(function (language) {
      winsByLanguageLength[language] = { ...emptyLanguageLength[language], ...(parsedByLanguageLength[language] || {}) };
    });
    return {
      ...parsed,
      schemaVersion: Math.max(4, Number(parsed.schemaVersion) || 1),
      unlocked: parsed.unlocked && typeof parsed.unlocked === "object" ? parsed.unlocked : {},
      revealedHints: parsed.revealedHints && typeof parsed.revealedHints === "object" ? parsed.revealedHints : {},
      winsByLanguage,
      gamesByLanguage: { ...emptyState.gamesByLanguage, ...(parsed.gamesByLanguage || {}) },
      winsByLanguageLength,
      firstTryWinsByLanguage: { ...emptyState.firstTryWinsByLanguage, ...(parsed.firstTryWinsByLanguage || {}) },
      noHintWinsByLanguage: { ...emptyState.noHintWinsByLanguage, ...(parsed.noHintWinsByLanguage || {}) },
      games: Number(parsed.games) || 0,
      wins: Number(parsed.wins) || inferredWins,
      losses: Number(parsed.losses) || Math.max(0, (Number(parsed.games) || 0) - (Number(parsed.wins) || inferredWins)),
      currentWinStreak: Number(parsed.currentWinStreak) || 0,
      bestWinStreak: Number(parsed.bestWinStreak) || 0,
      totalInvalid: Number(parsed.totalInvalid) || 0,
      totalHints: Number(parsed.totalHints) || 0,
      totalBackspaces: Number(parsed.totalBackspaces) || 0,
      achievementModalOpens: Number(parsed.achievementModalOpens) || 0,
      themeToggles: Number(parsed.themeToggles) || 0,
      labsUnlocks: Number(parsed.labsUnlocks) || 0,
      logoTaps: Number(parsed.logoTaps) || 0,
      achievementHintReveals: Number(parsed.achievementHintReveals) || 0,
      winsByLength: { ...emptyState.winsByLength, ...(parsed.winsByLength || {}) },
      gamesByLength: { ...emptyState.gamesByLength, ...(parsed.gamesByLength || {}) },
      firstTryWins: Number(parsed.firstTryWins) || 0,
      noHintWins: Number(parsed.noHintWins) || 0,
      settingsButtonTaps: Number(parsed.settingsButtonTaps) || 0,
      achievementButtonTaps: Number(parsed.achievementButtonTaps) || 0,
      rulesOpens: Number(parsed.rulesOpens) || 0,
      languageSwitches: Number(parsed.languageSwitches) || 0,
      lengthChanges: Number(parsed.lengthChanges) || 0,
      attemptChanges: Number(parsed.attemptChanges) || 0,
      repeatToggles: Number(parsed.repeatToggles) || 0,
      feedbackSubmissions: Number(parsed.feedbackSubmissions) || 0,
      bugReports: Number(parsed.bugReports) || 0,
      wordLikes: Number(parsed.wordLikes) || 0,
      wordDislikes: Number(parsed.wordDislikes) || 0,
      shareCount: Number(parsed.shareCount) || 0,
    };
  } catch (error) {
    return emptyState;
  }
}

function persistWordGuessAchievementsState() {
  try {
    localStorage.setItem(WORD_GUESS_ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(wordGuessAchievementsState));
  } catch (error) {
    // Achievements stay available for the current session.
  }
}

function getWordGuessAchievementDefinition(achievementId) {
  return WORD_GUESS_ACHIEVEMENTS.find(function (item) { return item.id === achievementId; }) || null;
}

function getWordGuessAchievementCopy(definition) {
  if (!definition) return { title: "", description: "", hint: "" };
  return {
    title: getWordGuessText(definition.titleKey),
    description: getWordGuessText(definition.descriptionKey),
    hint: definition.hintKey ? getWordGuessText(definition.hintKey) : "",
  };
}

function evaluateWordGuessMetaAchievements() {
  const state = wordGuessAchievementsState;
  if ((Number(state.labsUnlocks) || 0) >= 1) unlockWordGuessAchievement("labs-easter");
  if ((Number(state.achievementHintReveals) || 0) >= 12) unlockWordGuessAchievement("hint-whisperer");
  if ((Number(state.achievementModalOpens) || 0) >= 5) unlockWordGuessAchievement("museum-visitor");
  if ((Number(state.achievementModalOpens) || 0) >= 20) unlockWordGuessAchievement("museum-curator");
  if ((Number(state.themeToggles) || 0) >= 10) unlockWordGuessAchievement("day-night");
  if ((Number(state.logoTaps) || 0) >= 7) unlockWordGuessAchievement("logo-secret");
  if ((Number(state.settingsButtonTaps) || 0) >= 13) unlockWordGuessAchievement("gear-goblin");
  if ((Number(state.achievementButtonTaps) || 0) >= 13) unlockWordGuessAchievement("trophy-tapper");
  if ((Number(state.rulesOpens) || 0) >= 7) unlockWordGuessAchievement("rules-lawyer");
  if ((Number(state.languageSwitches) || 0) >= 12) unlockWordGuessAchievement("language-pinball");
  if ((Number(state.lengthChanges) || 0) >= 15) unlockWordGuessAchievement("length-carousel");
  if ((Number(state.attemptChanges) || 0) >= 15) unlockWordGuessAchievement("attempt-carousel");
  if ((Number(state.repeatToggles) || 0) >= 10) unlockWordGuessAchievement("repeat-switcher");
  if ((Number(state.achievementModalOpens) || 0) >= 50) unlockWordGuessAchievement("museum-night-shift");
  if ((Number(state.themeToggles) || 0) >= 25) unlockWordGuessAchievement("theme-chameleon");
  if ((Number(state.feedbackSubmissions) || 0) >= 1) unlockWordGuessAchievement("feedback-pioneer");
  if ((Number(state.bugReports) || 0) >= 1) unlockWordGuessAchievement("bug-hunter");
  if ((Number(state.wordLikes) || 0) >= 1) unlockWordGuessAchievement("word-fan");
  if ((Number(state.wordDislikes) || 0) >= 1) unlockWordGuessAchievement("word-critic");
  if ((Number(state.wordLikes) || 0) >= 1 && (Number(state.wordDislikes) || 0) >= 1) unlockWordGuessAchievement("balanced-critic");
  if ((Number(state.shareCount) || 0) >= 3) unlockWordGuessAchievement("share-trio");
}

function revealWordGuessAchievementHint(achievementId) {
  // Revealing a condition is discovery only. It never unlocks the tapped achievement.
  const definition = getWordGuessAchievementDefinition(achievementId);
  if (!definition || !definition.mystery || !definition.hintKey) return false;
  if (!wordGuessAchievementsState.revealedHints) wordGuessAchievementsState.revealedHints = {};
  if (wordGuessAchievementsState.revealedHints[achievementId]) return false;
  wordGuessAchievementsState.revealedHints[achievementId] = true;
  wordGuessAchievementsState.achievementHintReveals = (Number(wordGuessAchievementsState.achievementHintReveals) || 0) + 1;
  persistWordGuessAchievementsState();
  showAppToastWhenReady(getWordGuessText("achievementHintRevealedToast"));
  evaluateWordGuessMetaAchievements();
  wordGuessAchievementsModalDirty = true;
  renderHiddenWordGuessAchievementsLab();
  if (achievementsModal && !achievementsModal.hidden) renderWordGuessAchievementsModalContent(true);
  return true;
}

function handleWordGuessAchievementCardTap(achievementId) {
  const definition = getWordGuessAchievementDefinition(achievementId);
  if (!definition || !definition.mystery || !definition.hintKey) return;
  if (wordGuessAchievementsState.revealedHints && wordGuessAchievementsState.revealedHints[achievementId]) return;
  const nextCount = (Number(wordGuessAchievementCardTapCounts[achievementId]) || 0) + 1;
  wordGuessAchievementCardTapCounts[achievementId] = nextCount;
  if (nextCount >= 3) {
    wordGuessAchievementCardTapCounts[achievementId] = 0;
    revealWordGuessAchievementHint(achievementId);
  }
}

function queueWordGuessAchievementToast(achievementId) {
  if (!achievementId) return;
  wordGuessAchievementToastQueue.push(achievementId);
  playNextWordGuessAchievementToast();
}

function playNextWordGuessAchievementToast() {
  if (wordGuessAchievementToastActive || wordGuessAchievementToastQueue.length === 0 || !document.body) return;
  const achievementId = wordGuessAchievementToastQueue.shift();
  const definition = getWordGuessAchievementDefinition(achievementId);
  if (!definition) { playNextWordGuessAchievementToast(); return; }
  wordGuessAchievementToastActive = true;
  const copy = getWordGuessAchievementCopy(definition);
  const toast = document.createElement("div");
  toast.className = "word-guess-achievement-toast";
  toast.setAttribute("role", "button");
  toast.setAttribute("tabindex", "0");
  toast.setAttribute("aria-live", "polite");
  toast.setAttribute("aria-label", `${getWordGuessText("achievementToast")} ${copy.title}. ${getWordGuessText("achievementToastOpen")}`);
  toast.setAttribute("title", getWordGuessText("achievementToastOpen"));

  const reward = document.createElement("span");
  reward.className = "word-guess-achievement-toast-reward";
  reward.textContent = definition.reward;
  reward.setAttribute("aria-hidden", "true");

  const copyWrap = document.createElement("span");
  copyWrap.className = "word-guess-achievement-toast-copy";
  appendTextElement(copyWrap, "small", "", getWordGuessText("achievementToast"));
  appendTextElement(copyWrap, "strong", "", copy.title);
  appendTextElement(copyWrap, "em", "", copy.description);
  appendTextElement(copyWrap, "span", "word-guess-achievement-toast-open", getWordGuessText("achievementToastOpen"));

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "word-guess-achievement-toast-close";
  closeBtn.setAttribute("aria-label", getWordGuessText("achievementDismiss"));
  closeBtn.textContent = "×";

  toast.appendChild(reward);
  toast.appendChild(copyWrap);
  toast.appendChild(closeBtn);
  document.body.appendChild(toast);
  playGameSound("medal");
  playHapticFeedback("achievement");

  let toastClosed = false;
  let autoCloseTimeoutId = null;
  function closeAchievementToast(onClosed) {
    if (toastClosed) return;
    toastClosed = true;
    if (autoCloseTimeoutId) {
      window.clearTimeout(autoCloseTimeoutId);
      autoCloseTimeoutId = null;
    }
    toast.classList.add("is-leaving");
    window.setTimeout(function () {
      toast.remove();
      wordGuessAchievementToastActive = false;
      if (typeof onClosed === "function") onClosed();
      playNextWordGuessAchievementToast();
    }, WORD_GUESS_ACHIEVEMENT_TOAST_EXIT_MS);
  }

  function openAchievementFromToast() {
    closeAchievementToast(function () {
      openWordGuessAchievementsModal({ focusAchievementId: achievementId, source: "toast" });
    });
  }

  toast.addEventListener("click", function (event) {
    if (event.target === closeBtn) return;
    openAchievementFromToast();
  });
  toast.addEventListener("keydown", function (event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openAchievementFromToast();
    }
  });
  closeBtn.addEventListener("click", function (event) {
    event.preventDefault();
    event.stopPropagation();
    closeAchievementToast();
  });

  window.requestAnimationFrame(function () { toast.classList.add("is-visible"); });
  autoCloseTimeoutId = window.setTimeout(function () { closeAchievementToast(); }, WORD_GUESS_ACHIEVEMENT_TOAST_HOLD_MS);
}
function unlockWordGuessAchievement(achievementId) {
  if (!achievementId || wordGuessAchievementsState.unlocked[achievementId]) return false;
  const definition = getWordGuessAchievementDefinition(achievementId);
  if (!definition) return false;
  wordGuessAchievementsState.unlocked[achievementId] = { unlockedAt: new Date().toISOString(), reward: definition.reward };
  persistWordGuessAchievementsState();
  wordGuessAchievementsModalDirty = true;
  renderHiddenWordGuessAchievementsLab();
  queueWordGuessAchievementToast(achievementId);
  return true;
}

function countWordGuessCorrectStatuses(guess) {
  return guess && Array.isArray(guess.statuses)
    ? guess.statuses.filter(function (status) { return status === "correct"; }).length
    : 0;
}

function hasRepeatedWordGuessLetters(word) {
  const letters = Array.from(String(word || ""));
  return new Set(letters).size < letters.length;
}

function getWordGuessMaxConsecutiveInvalidAttempts() {
  let current = 0;
  let best = 0;
  wordGuessAttemptLog.forEach(function (attempt) {
    if (attempt.status === "invalid") {
      current += 1;
      best = Math.max(best, current);
    } else {
      current = 0;
    }
  });
  return best;
}

function hasDuplicateInvalidWordGuessAttempt() {
  const seen = new Set();
  return wordGuessAttemptLog.some(function (attempt) {
    if (attempt.status !== "invalid" || !attempt.word) return false;
    if (seen.has(attempt.word)) return true;
    seen.add(attempt.word);
    return false;
  });
}

function hasWordGuessYellowToGreenTransition(validGuesses) {
  for (let index = 1; index < validGuesses.length; index += 1) {
    const previous = validGuesses[index - 1];
    const current = validGuesses[index];
    const previousLetters = Array.from(previous.word || "");
    const currentLetters = Array.from(current.word || "");
    for (let pos = 0; pos < currentLetters.length; pos += 1) {
      const letter = currentLetters[pos];
      if ((current.statuses || [])[pos] !== "correct") continue;
      for (let prevPos = 0; prevPos < previousLetters.length; prevPos += 1) {
        if (previousLetters[prevPos] === letter && (previous.statuses || [])[prevPos] === "present") return true;
      }
    }
  }
  return false;
}

function hasWordGuessGreenAnchor(validGuesses) {
  if (validGuesses.length < 3) return false;
  const wordLength = getWordGuessLength();
  for (let start = 0; start <= validGuesses.length - 3; start += 1) {
    for (let pos = 0; pos < wordLength; pos += 1) {
      if ((validGuesses[start].statuses || [])[pos] === "correct"
        && (validGuesses[start + 1].statuses || [])[pos] === "correct"
        && (validGuesses[start + 2].statuses || [])[pos] === "correct") return true;
    }
  }
  return false;
}

function recordWordGuessAchievements(isWon) {
  const language = selectedWordGuessLanguage || "uk";
  const invalidAttempts = wordGuessAttemptLog.filter(function (attempt) { return attempt.status === "invalid"; }).length;
  const wordLength = getWordGuessLength();
  const lengthKey = String(wordLength);
  const attemptLimit = getWordGuessAttempts();
  const elapsedMs = wordGuessGameStartedAtMs > 0 ? Math.max(0, Date.now() - wordGuessGameStartedAtMs) : 0;
  const validGuesses = wordGuessGuesses.slice();
  const firstGuess = validGuesses.length > 0 ? validGuesses[0] : null;
  const uniqueLetters = new Set();
  validGuesses.forEach(function (guess) {
    Array.from(guess.word || "").forEach(function (letter) { uniqueLetters.add(letter); });
  });
  const guessedWords = validGuesses.map(function (guess) { return String(guess.word || ""); });
  const hasDuplicateGuess = guessedWords.some(function (word, index) { return guessedWords.indexOf(word) !== index; });
  const hasAllYellow = validGuesses.some(function (guess) {
    return Array.isArray(guess.statuses) && guess.statuses.length === wordLength && guess.statuses.every(function (status) { return status === "present"; });
  });
  const hasAllAbsent = validGuesses.some(function (guess) {
    return Array.isArray(guess.statuses) && guess.statuses.length === wordLength && guess.statuses.every(function (status) { return status === "absent"; });
  });
  const hasHotGuess = validGuesses.some(function (guess) {
    return guess.word !== wordGuessTarget && Array.isArray(guess.statuses) && guess.statuses.length === wordLength && guess.statuses.every(function (status) { return status !== "absent"; });
  });
  const hasTrafficGuess = validGuesses.some(function (guess) {
    const statuses = new Set(guess.statuses || []);
    return statuses.has("correct") && statuses.has("present") && statuses.has("absent");
  });
  const firstCorrect = firstGuess ? countWordGuessCorrectStatuses(firstGuess) : 0;
  const firstAllAbsent = Boolean(firstGuess && (firstGuess.statuses || []).length === wordLength && firstGuess.statuses.every(function (status) { return status === "absent"; }));
  const firstAllYellow = Boolean(firstGuess && (firstGuess.statuses || []).length === wordLength && firstGuess.statuses.every(function (status) { return status === "present"; }));
  const hasOneAway = validGuesses.some(function (guess) { return guess.word !== wordGuessTarget && countWordGuessCorrectStatuses(guess) >= Math.max(1, wordLength - 1); });
  const maxInvalidRow = getWordGuessMaxConsecutiveInvalidAttempts();
  const duplicateInvalid = hasDuplicateInvalidWordGuessAttempt();
  const yellowToGreen = hasWordGuessYellowToGreenTransition(validGuesses);
  const greenAnchor = hasWordGuessGreenAnchor(validGuesses);
  const allAbsentRows = validGuesses.filter(function (guess) { return Array.isArray(guess.statuses) && guess.statuses.length === wordLength && guess.statuses.every(function (status) { return status === "absent"; }); }).length;
  const hasAnyGreen = validGuesses.some(function (guess) { return (guess.statuses || []).indexOf("correct") >= 0; });
  const hasAnyYellow = validGuesses.some(function (guess) { return (guess.statuses || []).indexOf("present") >= 0; });

  wordGuessAchievementsState.games = (Number(wordGuessAchievementsState.games) || 0) + 1;
  wordGuessAchievementsState.gamesByLanguage[language] = (Number(wordGuessAchievementsState.gamesByLanguage[language]) || 0) + 1;
  wordGuessAchievementsState.gamesByLength[lengthKey] = (Number(wordGuessAchievementsState.gamesByLength[lengthKey]) || 0) + 1;
  wordGuessAchievementsState.totalInvalid = (Number(wordGuessAchievementsState.totalInvalid) || 0) + invalidAttempts;
  wordGuessAchievementsState.totalHints = (Number(wordGuessAchievementsState.totalHints) || 0) + wordGuessHintLevel;
  wordGuessAchievementsState.totalBackspaces = (Number(wordGuessAchievementsState.totalBackspaces) || 0) + wordGuessGameBackspaceCount;

  if (isWon) {
    wordGuessAchievementsState.wins = (Number(wordGuessAchievementsState.wins) || 0) + 1;
    wordGuessAchievementsState.currentWinStreak = (Number(wordGuessAchievementsState.currentWinStreak) || 0) + 1;
    wordGuessAchievementsState.bestWinStreak = Math.max(Number(wordGuessAchievementsState.bestWinStreak) || 0, wordGuessAchievementsState.currentWinStreak);
    wordGuessAchievementsState.winsByLanguage[language] = (Number(wordGuessAchievementsState.winsByLanguage[language]) || 0) + 1;
    wordGuessAchievementsState.winsByLength[lengthKey] = (Number(wordGuessAchievementsState.winsByLength[lengthKey]) || 0) + 1;
    if (!wordGuessAchievementsState.winsByLanguageLength[language]) wordGuessAchievementsState.winsByLanguageLength[language] = { "5": 0, "6": 0, "7": 0 };
    wordGuessAchievementsState.winsByLanguageLength[language][lengthKey] = (Number(wordGuessAchievementsState.winsByLanguageLength[language][lengthKey]) || 0) + 1;
    if (wordGuessGuesses.length === 1) {
      wordGuessAchievementsState.firstTryWins = (Number(wordGuessAchievementsState.firstTryWins) || 0) + 1;
      wordGuessAchievementsState.firstTryWinsByLanguage[language] = (Number(wordGuessAchievementsState.firstTryWinsByLanguage[language]) || 0) + 1;
    }
    if (wordGuessHintLevel === 0) {
      wordGuessAchievementsState.noHintWins = (Number(wordGuessAchievementsState.noHintWins) || 0) + 1;
      wordGuessAchievementsState.noHintWinsByLanguage[language] = (Number(wordGuessAchievementsState.noHintWinsByLanguage[language]) || 0) + 1;
    }

    unlockWordGuessAchievement("first-win");
    if (wordGuessGuesses.length === 1) unlockWordGuessAchievement("first-try");
    if (wordGuessGuesses.length <= 2) unlockWordGuessAchievement("two-try");
    if (wordGuessGuesses.length === 3) unlockWordGuessAchievement("exact-three");
    if (wordGuessGuesses.length === 4) unlockWordGuessAchievement("exact-four");
    if (wordGuessGuesses.length === 5) unlockWordGuessAchievement("exact-five");
    if (wordGuessHintLevel === 0) unlockWordGuessAchievement("no-hints");
    if (wordGuessHintLevel === 1) unlockWordGuessAchievement("one-hint");
    if (wordGuessHintLevel === 2) unlockWordGuessAchievement("two-hints");
    if (wordGuessHintLevel >= 3) unlockWordGuessAchievement("full-hints");
    if (language === "uk") unlockWordGuessAchievement("uk-win");
    if (language === "ru") unlockWordGuessAchievement("ru-win");
    if (language === "en") unlockWordGuessAchievement("en-win");
    if (invalidAttempts === 0) unlockWordGuessAchievement("clean-win");
    if (wordGuessGuesses.length === 1 && invalidAttempts === 0 && wordGuessHintLevel === 0) unlockWordGuessAchievement("clean-first-try");
    if (invalidAttempts >= 1) unlockWordGuessAchievement("invalid-then-win");
    if (invalidAttempts >= 3) unlockWordGuessAchievement("comeback");
    if (invalidAttempts >= 5) unlockWordGuessAchievement("phoenix");
    if (wordGuessGuesses.length === attemptLimit) unlockWordGuessAchievement("last-chance");
    if (wordLength === 5 && wordGuessGuesses.length === attemptLimit) unlockWordGuessAchievement("five-last-chance");
    if (wordGuessGuesses.length === attemptLimit && invalidAttempts >= 3) unlockWordGuessAchievement("chaos-last-chance");
    if (wordGuessGuesses.length === attemptLimit && wordGuessHintLevel >= 3) unlockWordGuessAchievement("full-briefing-last");
    if (elapsedMs > 0 && elapsedMs <= 30000) unlockWordGuessAchievement("speedrun");
    if (elapsedMs > 0 && elapsedMs <= 15000) unlockWordGuessAchievement("flash-15");
    if (elapsedMs >= 180000) unlockWordGuessAchievement("marathon");
    if (elapsedMs >= 180000 && wordGuessHintLevel === 0) unlockWordGuessAchievement("slow-pure");
    if (wordLength === 5) unlockWordGuessAchievement("five-letter-win");
    if (wordLength === 6) unlockWordGuessAchievement("six-letter-win");
    if (wordLength === 7) unlockWordGuessAchievement("seven-letter");
    if (wordLength === 5 && elapsedMs > 0 && elapsedMs <= 15000) unlockWordGuessAchievement("five-flash");
    if (wordLength === 6 && elapsedMs > 0 && elapsedMs <= 20000) unlockWordGuessAchievement("six-flash");
    if (wordLength === 7 && elapsedMs > 0 && elapsedMs <= 30000) unlockWordGuessAchievement("seven-speed");
    if (wordLength === 7 && wordGuessHintLevel === 0) unlockWordGuessAchievement("seven-no-hints");
    if (wordLength === 7 && wordGuessGuesses.length <= 2) unlockWordGuessAchievement("seven-two-try");
    if (wordLength === 7 && wordGuessGuesses.length === 1) unlockWordGuessAchievement("seven-first-try");
    if (wordLength === 7 && invalidAttempts >= 5) unlockWordGuessAchievement("seven-chaos-win");
    if (hasRepeatedWordGuessLetters(wordGuessTarget)) unlockWordGuessAchievement("repeat-master");
    if (hasAllAbsent) unlockWordGuessAchievement("zero-to-word");
    if (firstCorrect === 0 && firstGuess) unlockWordGuessAchievement("blind-start-win");
    if (hasTrafficGuess) unlockWordGuessAchievement("traffic-win");
    if (hasAllYellow) unlockWordGuessAchievement("all-yellow-win");
    if (hasHotGuess) unlockWordGuessAchievement("hot-win");
    if (wordGuessHintLevel === 1 && wordGuessFirstHintUsedGuessCount >= 0 && wordGuessGuesses.length === wordGuessFirstHintUsedGuessCount + 1) unlockWordGuessAchievement("hint-one-next-win");
    if (wordGuessHintLevel === 2 && wordGuessSecondHintUsedGuessCount >= 0 && wordGuessGuesses.length === wordGuessSecondHintUsedGuessCount + 1) unlockWordGuessAchievement("hint-two-next-win");
    if (wordGuessHintLevel >= 3 && wordGuessThirdHintUsedGuessCount >= 0 && wordGuessGuesses.length === wordGuessThirdHintUsedGuessCount + 1) unlockWordGuessAchievement("hint-three-next-win");
  } else {
    wordGuessAchievementsState.losses = (Number(wordGuessAchievementsState.losses) || 0) + 1;
    wordGuessAchievementsState.currentWinStreak = 0;
    const lastGuess = validGuesses.length > 0 ? validGuesses[validGuesses.length - 1] : null;
    if (lastGuess && countWordGuessCorrectStatuses(lastGuess) >= Math.max(1, wordLength - 1)) unlockWordGuessAchievement("almost");
    if (!hasAnyGreen) unlockWordGuessAchievement("no-green-loss");
    if (!hasAnyGreen && hasAnyYellow) unlockWordGuessAchievement("yellow-only-loss");
  }

  if (allAbsentRows >= 3) unlockWordGuessAchievement("three-blackouts");
  if (hasAllAbsent && hasTrafficGuess && hasHotGuess) unlockWordGuessAchievement("rainbow-collector");
  if (invalidAttempts >= 3) unlockWordGuessAchievement("stubborn");
  if (invalidAttempts >= 6) unlockWordGuessAchievement("chaos-agent");
  if (maxInvalidRow >= 3) unlockWordGuessAchievement("three-invalid-row");
  if (maxInvalidRow >= 5) unlockWordGuessAchievement("five-invalid-row");
  if (duplicateInvalid) unlockWordGuessAchievement("duplicate-invalid");
  if (wordGuessGameBackspaceCount >= 10) unlockWordGuessAchievement("ten-backspaces-game");
  if (wordGuessGameBackspaceCount >= 30) unlockWordGuessAchievement("thirty-backspaces-game");
  if (wordGuessGameFullEraseCount >= 1) unlockWordGuessAchievement("full-erase");
  if (wordGuessGameFullEraseCount >= 3) unlockWordGuessAchievement("triple-full-erase");
  if (wordGuessGameIncompleteSubmitCount >= 3) unlockWordGuessAchievement("three-incomplete-submits");
  if (uniqueLetters.size >= 15) unlockWordGuessAchievement("alphabet-tour");
  if (uniqueLetters.size >= 20) unlockWordGuessAchievement("alphabet-explorer");
  if (uniqueLetters.size >= 25) unlockWordGuessAchievement("alphabet-master");
  if (hasDuplicateGuess) unlockWordGuessAchievement("repeat-guess");
  if (hasAllYellow) unlockWordGuessAchievement("all-yellow");
  if (hasAllAbsent) unlockWordGuessAchievement("all-gray");
  if (hasHotGuess) unlockWordGuessAchievement("hot-hand");
  if (hasTrafficGuess) unlockWordGuessAchievement("traffic-light");
  if (validGuesses.some(function (guess) { return (guess.statuses || []).filter(function (status) { return status === "present"; }).length >= 3; })) unlockWordGuessAchievement("yellow-storm");
  if (validGuesses.some(function (guess) { return guess.word !== wordGuessTarget && countWordGuessCorrectStatuses(guess) >= 3; })) unlockWordGuessAchievement("green-wave");
  if (firstGuess && firstCorrect >= 1) unlockWordGuessAchievement("first-green");
  if (firstGuess && firstCorrect >= 2) unlockWordGuessAchievement("first-double-green");
  if (firstAllAbsent) unlockWordGuessAchievement("first-all-gray");
  if (firstAllYellow) unlockWordGuessAchievement("first-all-yellow");
  if (hasOneAway) unlockWordGuessAchievement("one-away");
  if (yellowToGreen) unlockWordGuessAchievement("yellow-to-green");
  if (greenAnchor) unlockWordGuessAchievement("green-anchor");
  if (wordGuessFirstHintUsedAtMs > 0 && wordGuessGameStartedAtMs > 0 && wordGuessFirstHintUsedAtMs - wordGuessGameStartedAtMs >= 60000) unlockWordGuessAchievement("patient-hint");
  if (wordGuessFirstHintUsedAtMs > 0 && wordGuessGameStartedAtMs > 0 && wordGuessFirstHintUsedAtMs - wordGuessGameStartedAtMs >= 120000) unlockWordGuessAchievement("late-hint");
  if (wordGuessThirdHintUsedGuessCount === 0) unlockWordGuessAchievement("hints-before-guess");

  const winsByLanguage = wordGuessAchievementsState.winsByLanguage;
  const gamesByLanguage = wordGuessAchievementsState.gamesByLanguage;
  const winsByLength = wordGuessAchievementsState.winsByLength;
  const winsByLanguageLength = wordGuessAchievementsState.winsByLanguageLength;
  const firstTryByLanguage = wordGuessAchievementsState.firstTryWinsByLanguage;
  const noHintByLanguage = wordGuessAchievementsState.noHintWinsByLanguage;
  if ((Number(winsByLanguage.ru) || 0) > 0 && (Number(winsByLanguage.en) || 0) > 0) unlockWordGuessAchievement("labs-duo");
  if ((Number(winsByLanguage.uk) || 0) > 0 && (Number(winsByLanguage.ru) || 0) > 0 && (Number(winsByLanguage.en) || 0) > 0) unlockWordGuessAchievement("polyglot");
  if ((Number(gamesByLanguage.uk) || 0) >= 5 && (Number(gamesByLanguage.ru) || 0) >= 5 && (Number(gamesByLanguage.en) || 0) >= 5) unlockWordGuessAchievement("language-tourist");
  if ((Number(gamesByLanguage.uk) || 0) >= 10 && (Number(gamesByLanguage.ru) || 0) >= 10 && (Number(gamesByLanguage.en) || 0) >= 10) unlockWordGuessAchievement("language-veteran");
  if ((Number(gamesByLanguage.uk) || 0) >= 25 && (Number(gamesByLanguage.ru) || 0) >= 25 && (Number(gamesByLanguage.en) || 0) >= 25) unlockWordGuessAchievement("global-tour-25");
  if ((Number(winsByLanguage.uk) || 0) >= 10) unlockWordGuessAchievement("ten-uk-wins");
  if ((Number(winsByLanguage.ru) || 0) >= 10) unlockWordGuessAchievement("ten-ru-wins");
  if ((Number(winsByLanguage.en) || 0) >= 10) unlockWordGuessAchievement("ten-en-wins");
  if ((Number(winsByLanguage.uk) || 0) >= 10 && (Number(winsByLanguage.ru) || 0) >= 10 && (Number(winsByLanguage.en) || 0) >= 10) unlockWordGuessAchievement("global-wins-10");
  if ((Number(winsByLength["5"]) || 0) > 0 && (Number(winsByLength["6"]) || 0) > 0 && (Number(winsByLength["7"]) || 0) > 0) unlockWordGuessAchievement("all-lengths");
  if ((Number(winsByLength["7"]) || 0) >= 5) unlockWordGuessAchievement("five-seven-letter");
  if ((Number(winsByLength["7"]) || 0) >= 10) unlockWordGuessAchievement("ten-seven-letter");
  if ((Number((winsByLanguageLength.uk || {})["7"]) || 0) > 0 && (Number((winsByLanguageLength.ru || {})["7"]) || 0) > 0 && (Number((winsByLanguageLength.en || {})["7"]) || 0) > 0) unlockWordGuessAchievement("seven-all-languages");
  if ((Number(firstTryByLanguage.uk) || 0) > 0 && (Number(firstTryByLanguage.ru) || 0) > 0 && (Number(firstTryByLanguage.en) || 0) > 0) unlockWordGuessAchievement("first-try-all-languages");
  if ((Number(noHintByLanguage.uk) || 0) > 0 && (Number(noHintByLanguage.ru) || 0) > 0 && (Number(noHintByLanguage.en) || 0) > 0) unlockWordGuessAchievement("no-hint-all-languages");

  const totalWins = Number(wordGuessAchievementsState.wins) || 0;
  const totalGames = Number(wordGuessAchievementsState.games) || 0;
  const totalHints = Number(wordGuessAchievementsState.totalHints) || 0;
  const totalInvalid = Number(wordGuessAchievementsState.totalInvalid) || 0;
  const totalBackspaces = Number(wordGuessAchievementsState.totalBackspaces) || 0;
  const streak = Number(wordGuessAchievementsState.currentWinStreak) || 0;
  const firstTryWins = Number(wordGuessAchievementsState.firstTryWins) || 0;
  const noHintWins = Number(wordGuessAchievementsState.noHintWins) || 0;
  if (totalWins >= 5) unlockWordGuessAchievement("five-wins");
  if (totalWins >= 10) unlockWordGuessAchievement("ten-wins");
  if (totalWins >= 25) unlockWordGuessAchievement("twenty-five-wins");
  if (totalWins >= 50) unlockWordGuessAchievement("fifty-wins");
  if (totalWins >= 75) unlockWordGuessAchievement("seventy-five-wins");
  if (totalWins >= 100) unlockWordGuessAchievement("hundred-wins");
  if (streak >= 3) unlockWordGuessAchievement("three-streak");
  if (streak >= 5) unlockWordGuessAchievement("five-streak");
  if (streak >= 10) unlockWordGuessAchievement("ten-streak");
  if (streak >= 15) unlockWordGuessAchievement("fifteen-streak");
  if (streak >= 20) unlockWordGuessAchievement("twenty-streak");
  if (totalGames >= 10) unlockWordGuessAchievement("ten-games");
  if (totalGames >= 25) unlockWordGuessAchievement("twenty-five-games");
  if (totalGames >= 50) unlockWordGuessAchievement("fifty-games");
  if (totalGames >= 100) unlockWordGuessAchievement("hundred-games");
  if (totalGames >= 150) unlockWordGuessAchievement("hundred-fifty-games");
  if (totalGames >= 250) unlockWordGuessAchievement("two-fifty-games");
  if (totalHints >= 5) unlockWordGuessAchievement("five-hints-total");
  if (totalHints >= 10) unlockWordGuessAchievement("ten-hints-total");
  if (totalHints >= 25) unlockWordGuessAchievement("twenty-five-hints-total");
  if (totalHints >= 50) unlockWordGuessAchievement("fifty-hints-total");
  if (totalHints >= 100) unlockWordGuessAchievement("hundred-hints-total");
  if (totalInvalid >= 10) unlockWordGuessAchievement("ten-invalid-total");
  if (totalInvalid >= 25) unlockWordGuessAchievement("twenty-five-invalid-total");
  if (totalInvalid >= 50) unlockWordGuessAchievement("fifty-invalid-total");
  if (totalBackspaces >= 100) unlockWordGuessAchievement("hundred-backspaces-total");
  if (firstTryWins >= 5) unlockWordGuessAchievement("five-first-try");
  if (firstTryWins >= 10) unlockWordGuessAchievement("ten-first-try");
  if (firstTryWins >= 25) unlockWordGuessAchievement("twenty-five-first-try");
  if (noHintWins >= 5) unlockWordGuessAchievement("five-no-hint");
  if (noHintWins >= 10) unlockWordGuessAchievement("ten-no-hint");
  if (noHintWins >= 25) unlockWordGuessAchievement("twenty-five-no-hint");

  persistWordGuessAchievementsState();
  evaluateWordGuessMetaAchievements();
  renderHiddenWordGuessAchievementsLab();
}

function getKnownWordGuessAchievementUnlockedCount() {
  const unlocked = wordGuessAchievementsState.unlocked || {};
  return WORD_GUESS_ACHIEVEMENTS.filter(function (definition) { return Boolean(unlocked[definition.id]); }).length;
}

function renderWordGuessAchievementCards(container, grouped, categoryId) {
  if (!container) return;
  container.classList.toggle("is-grouped", Boolean(grouped));
  clearElement(container);
  const unlocked = wordGuessAchievementsState.unlocked || {};
  const revealedHints = wordGuessAchievementsState.revealedHints || {};
  const visibleDefinitions = categoryId
    ? WORD_GUESS_ACHIEVEMENTS.filter(function (definition) { return definition.category === categoryId; })
    : WORD_GUESS_ACHIEVEMENTS;
  const appendCard = function (target, definition) {
    const state = unlocked[definition.id] || null;
    const copy = getWordGuessAchievementCopy(definition);
    const isMystery = Boolean(definition.mystery && definition.hintKey);
    const isHintRevealed = Boolean(revealedHints[definition.id]);
    const card = document.createElement("article");
    card.className = `app-labs-achievement-card${state ? " is-unlocked" : " is-locked"}${isMystery ? " is-mystery" : ""}${isHintRevealed ? " is-hint-revealed" : ""}`;
    card.dataset.achievementId = definition.id;
    card.setAttribute("tabindex", "-1");
    const reward = document.createElement("span"); reward.className = "app-labs-achievement-reward"; reward.textContent = definition.reward; reward.setAttribute("aria-hidden", "true");
    const body = document.createElement("span"); body.className = "app-labs-achievement-body";
    appendTextElement(body, "strong", "", copy.title);
    appendTextElement(body, "small", "", copy.description);
    if (isMystery) {
      const mystery = document.createElement("span");
      mystery.className = "app-labs-achievement-mystery";
      mystery.textContent = isHintRevealed ? getWordGuessText("achievementHintRevealed") : getWordGuessText("achievementMysteryLabel");
      body.appendChild(mystery);
      if (isHintRevealed && copy.hint) {
        const detail = document.createElement("span");
        detail.className = "app-labs-achievement-hint-detail";
        const label = document.createElement("b"); label.textContent = `${getWordGuessText("achievementHowTo")}: `;
        detail.appendChild(label);
        detail.appendChild(document.createTextNode(copy.hint));
        body.appendChild(detail);
      }
      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");
      card.setAttribute("aria-label", `${copy.title}. ${copy.description}. ${isHintRevealed ? copy.hint : getWordGuessText("achievementMysteryLabel")}`);
      card.addEventListener("click", function () { handleWordGuessAchievementCardTap(definition.id); });
      card.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleWordGuessAchievementCardTap(definition.id);
        }
      });
    }
    appendTextElement(body, "em", "", state ? getWordGuessText("achievementUnlocked") : getWordGuessText("achievementLocked"));
    card.appendChild(reward); card.appendChild(body); target.appendChild(card);
  };
  if (!grouped) {
    visibleDefinitions.forEach(function (definition) { appendCard(container, definition); });
    return;
  }
  WORD_GUESS_ACHIEVEMENT_CATEGORIES.forEach(function (category) {
    const definitions = WORD_GUESS_ACHIEVEMENTS.filter(function (definition) { return definition.category === category.id; });
    if (definitions.length === 0) return;
    const section = document.createElement("section"); section.className = "achievements-category";
    const heading = document.createElement("div"); heading.className = "achievements-category-heading";
    appendTextElement(heading, "h3", "", getWordGuessText(category.titleKey));
    const unlockedInCategory = definitions.filter(function (definition) { return Boolean(unlocked[definition.id]); }).length;
    appendTextElement(heading, "span", "", `${unlockedInCategory}/${definitions.length}`);
    const grid = document.createElement("div"); grid.className = "app-labs-achievements-grid";
    definitions.forEach(function (definition) { appendCard(grid, definition); });
    section.appendChild(heading); section.appendChild(grid); container.appendChild(section);
  });
}

function renderWordGuessAchievementsModalCategoryNav() {
  if (!achievementsModalCategoryNav) return;
  clearElement(achievementsModalCategoryNav);
  const unlocked = wordGuessAchievementsState.unlocked || {};
  WORD_GUESS_ACHIEVEMENT_CATEGORIES.forEach(function (category) {
    const definitions = WORD_GUESS_ACHIEVEMENTS.filter(function (definition) { return definition.category === category.id; });
    if (definitions.length === 0) return;
    const unlockedInCategory = definitions.filter(function (definition) { return Boolean(unlocked[definition.id]); }).length;
    const button = document.createElement("button");
    button.type = "button";
    button.className = `achievements-category-tab${category.id === wordGuessAchievementsModalCategoryId ? " is-selected" : ""}`;
    button.dataset.achievementCategory = category.id;
    button.setAttribute("role", "tab");
    button.setAttribute("aria-selected", category.id === wordGuessAchievementsModalCategoryId ? "true" : "false");
    appendTextElement(button, "span", "achievements-category-tab-title", getWordGuessText(category.titleKey));
    appendTextElement(button, "small", "achievements-category-tab-count", `${unlockedInCategory}/${definitions.length}`);
    button.addEventListener("click", function () {
      if (wordGuessAchievementsModalCategoryId === category.id) return;
      wordGuessAchievementsModalCategoryId = category.id;
      wordGuessAchievementsModalDirty = true;
      renderWordGuessAchievementsModalContent(true);
      if (achievementsModalGrid) achievementsModalGrid.scrollTop = 0;
    });
    achievementsModalCategoryNav.appendChild(button);
  });
}

function renderWordGuessAchievementsModalContent(force) {
  if (!achievementsModalGrid) return;
  const localeKey = `${selectedWordGuessLanguage}:${wordGuessAchievementsModalCategoryId}`;
  if (!force && !wordGuessAchievementsModalDirty && wordGuessAchievementsModalLocale === localeKey) return;
  renderWordGuessAchievementsModalCategoryNav();
  renderWordGuessAchievementCards(achievementsModalGrid, false, wordGuessAchievementsModalCategoryId);
  wordGuessAchievementsModalLocale = localeKey;
  wordGuessAchievementsModalDirty = false;
}

function renderHiddenWordGuessAchievementsLab() {
  const unlockedCount = getKnownWordGuessAchievementUnlockedCount();
  const total = WORD_GUESS_ACHIEVEMENTS.length;
  const progressPercent = total > 0 ? Math.round((unlockedCount / total) * 100) : 0;
  if (appLabsAchievementsSection) {
    appLabsAchievementsSection.hidden = !wordGuessLabsUnlocked;
    appLabsAchievementsSection.setAttribute("aria-hidden", wordGuessLabsUnlocked ? "false" : "true");
  }
  if (appLabsAchievementsEyebrow) appLabsAchievementsEyebrow.textContent = getWordGuessText("achievementSectionEyebrow");
  if (appLabsAchievementsTitle) appLabsAchievementsTitle.textContent = getWordGuessText("achievementSectionTitle");
  if (appLabsAchievementsCopy) appLabsAchievementsCopy.textContent = getWordGuessText("achievementSectionCopy");
  if (appLabsAchievementsProgress) appLabsAchievementsProgress.textContent = `${getWordGuessText("achievementProgress")} ${unlockedCount}/${total}`;
  if (appLabsAchievementsDebug) appLabsAchievementsDebug.textContent = `${unlockedCount}/${total}`;
  if (appLabsAchievementsOpenBtn) appLabsAchievementsOpenBtn.textContent = `${getWordGuessText("achievementMenuOpen")} →`;

  if (menuAchievementsTitle) menuAchievementsTitle.textContent = getWordGuessText("achievementMenuTitle");
  if (menuAchievementsProgress) menuAchievementsProgress.textContent = `${unlockedCount}/${total}`;
  if (menuAchievementsProgressBar) menuAchievementsProgressBar.style.width = `${progressPercent}%`;
  if (menuAchievementsBtn) menuAchievementsBtn.setAttribute("aria-label", `${getWordGuessText("achievementMenuOpen")}. ${getWordGuessText("achievementProgress")} ${unlockedCount}/${total}`);
  if (achievementsModalEyebrow) achievementsModalEyebrow.textContent = getWordGuessText("achievementMenuEyebrow");
  if (achievementsModalTitle) achievementsModalTitle.textContent = getWordGuessText("achievementMenuTitle");
  if (achievementsModalCopy) achievementsModalCopy.textContent = getWordGuessText("achievementMenuCopy");
  if (achievementsModalProgress) achievementsModalProgress.textContent = `${unlockedCount}/${total}`;
  if (achievementsModalCloseBtn) achievementsModalCloseBtn.setAttribute("aria-label", getWordGuessText("close"));

  const localeKey = `${selectedWordGuessLanguage}:${wordGuessAchievementsModalCategoryId}`;
  if (wordGuessAchievementsModalLocale !== localeKey) wordGuessAchievementsModalDirty = true;
}

function focusWordGuessAchievementInModal(achievementId) {
  if (!achievementId || !achievementsModalGrid) return false;
  const definition = getWordGuessAchievementDefinition(achievementId);
  if (!definition) return false;
  if (wordGuessAchievementsModalCategoryId !== definition.category) {
    wordGuessAchievementsModalCategoryId = definition.category;
    wordGuessAchievementsModalDirty = true;
  }
  renderWordGuessAchievementsModalContent();
  const cards = achievementsModalGrid.querySelectorAll("[data-achievement-id]");
  let target = null;
  for (let index = 0; index < cards.length; index += 1) {
    if (cards[index].dataset && cards[index].dataset.achievementId === achievementId) {
      target = cards[index];
      break;
    }
  }
  if (!target) return false;
  target.classList.remove("is-jump-target");
  void target.offsetWidth;
  target.classList.add("is-jump-target");
  try {
    target.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
  } catch (error) {
    target.scrollIntoView();
  }
  window.setTimeout(function () {
    try { target.focus({ preventScroll: true }); }
    catch (error) { target.focus(); }
  }, 300);
  window.setTimeout(function () { target.classList.remove("is-jump-target"); }, 2600);
  return true;
}

function openWordGuessAchievementsModal(options) {
  if (!achievementsModal) return;
  const settings = options && typeof options === "object" && !options.currentTarget ? options : {};
  const focusAchievementId = String(settings.focusAchievementId || "");
  if (focusAchievementId) {
    const definition = getWordGuessAchievementDefinition(focusAchievementId);
    if (definition) wordGuessAchievementsModalCategoryId = definition.category;
  }
  wordGuessAchievementsState.achievementModalOpens = (Number(wordGuessAchievementsState.achievementModalOpens) || 0) + 1;
  persistWordGuessAchievementsState();
  evaluateWordGuessMetaAchievements();
  renderHiddenWordGuessAchievementsLab();
  renderWordGuessAchievementsModalContent();
  achievementsModal.hidden = false;
  document.body.classList.add("achievements-open");
  pauseRoundTimer("achievements");
  pauseWhoAmITimer("achievements");
  if (focusAchievementId) {
    window.requestAnimationFrame(function () {
      if (!focusWordGuessAchievementInModal(focusAchievementId) && achievementsModalCloseBtn) achievementsModalCloseBtn.focus();
    });
  } else if (achievementsModalCloseBtn) {
    achievementsModalCloseBtn.focus();
  }
}

function closeWordGuessAchievementsModal(options) {
  const settings = options || {};
  if (!achievementsModal) return;
  achievementsModal.hidden = true;
  document.body.classList.remove("achievements-open");
  if (settings.resumeTimer !== false) {
    resumeRoundTimer("achievements");
    resumeWhoAmITimer("achievements");
  }
}

function readWordGuessLabsPreference() {
  try {
    return localStorage.getItem(WORD_GUESS_LABS_STORAGE_KEY) === "true";
  } catch (error) {
    return false;
  }
}

function readWordGuessLanguagePreference() {
  try {
    const savedLanguage = String(localStorage.getItem(WORD_GUESS_LANGUAGE_STORAGE_KEY) || "").toLowerCase();
    if (WORD_GUESS_LANGUAGES[savedLanguage]) {
      return savedLanguage;
    }
  } catch (error) {
    // Use Ukrainian when storage is unavailable.
  }
  return WORD_GUESS_DEFAULT_LANGUAGE;
}

function persistWordGuessLanguagePreference() {
  try {
    localStorage.setItem(WORD_GUESS_LANGUAGE_STORAGE_KEY, selectedWordGuessLanguage);
  } catch (error) {
    // Language still changes for the current session.
  }
}

function renderWordGuessLabsControls() {
  if (appLabsSection) appLabsSection.hidden = !wordGuessLabsUnlocked;
  if (appLabsEyebrow) appLabsEyebrow.textContent = getWordGuessText("labsEyebrow");
  if (appLabsTitle) appLabsTitle.textContent = getWordGuessText("labsTitle");
  if (appLabsCopy) appLabsCopy.textContent = getWordGuessText("labsCopy");
  if (appLabsLanguageRow) appLabsLanguageRow.setAttribute("aria-label", getWordGuessText("labsLanguageAria"));
  wordGuessLanguageButtons.forEach((button) => {
    const languageId = String(button.dataset.wordGuessLanguage || "");
    const isSelected = languageId === selectedWordGuessLanguage;
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-pressed", isSelected ? "true" : "false");
  });
  if (wordGuessLabsStatus) {
    const key = selectedWordGuessLanguage === "ru" ? "labsStatusRu" : selectedWordGuessLanguage === "en" ? "labsStatusEn" : "labsStatusUk";
    wordGuessLabsStatus.textContent = getWordGuessText(key);
  }
  renderHiddenWordGuessAchievementsLab();
}
function playWordGuessLabsUnlockEffect() {
  if (!document.body) {
    return;
  }

  const existing = document.querySelector(".app-labs-unlock-effect");
  if (existing) {
    existing.remove();
  }

  const reducedMotion = window.matchMedia
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) {
    if (appLabsSection && appLabsSection.scrollIntoView) {
      appLabsSection.scrollIntoView({ block: "center" });
    }
    return;
  }

  const overlay = document.createElement("div");
  overlay.className = "app-labs-unlock-effect";
  overlay.setAttribute("aria-hidden", "true");

  const core = document.createElement("div");
  core.className = "app-labs-unlock-core";

  const orbit = document.createElement("div");
  orbit.className = "app-labs-unlock-orbit";
  core.appendChild(orbit);

  const icon = document.createElement("div");
  icon.className = "app-labs-unlock-icon";
  icon.textContent = "🧪";
  core.appendChild(icon);

  const title = document.createElement("strong");
  title.className = "app-labs-unlock-title";
  title.textContent = "МОВОГРАЙ LABS";
  core.appendChild(title);

  const subtitle = document.createElement("span");
  subtitle.className = "app-labs-unlock-subtitle";
  subtitle.textContent = getWordGuessText("labsUnlocked");
  core.appendChild(subtitle);

  const languages = document.createElement("span");
  languages.className = "app-labs-unlock-languages";
  languages.textContent = "RU  •  EN";
  core.appendChild(languages);

  overlay.appendChild(core);

  for (let index = 0; index < 28; index += 1) {
    const spark = document.createElement("i");
    spark.className = "app-labs-unlock-spark";
    spark.style.setProperty("--labs-angle", `${Math.round(Math.random() * 360)}deg`);
    spark.style.setProperty("--labs-distance", `${Math.round(90 + Math.random() * 230)}px`);
    spark.style.setProperty("--labs-delay", `${(Math.random() * 0.55).toFixed(2)}s`);
    spark.style.setProperty("--labs-size", `${Math.round(3 + Math.random() * 8)}px`);
    overlay.appendChild(spark);
  }

  let isDismissed = false;
  const dismiss = () => {
    if (isDismissed) return;
    isDismissed = true;
    overlay.classList.add("is-leaving");
    window.setTimeout(() => {
      overlay.remove();
      if (appLabsSection && appLabsSection.scrollIntoView) {
        appLabsSection.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 360);
  };

  overlay.addEventListener("click", dismiss, { once: true });
  document.body.appendChild(overlay);
  window.setTimeout(dismiss, 2700);
}

function unlockWordGuessLabs() {
  if (wordGuessLabsUnlocked) {
    return;
  }
  wordGuessLabsUnlocked = true;
  wordGuessAchievementsState.labsUnlocks = Math.max(1, Number(wordGuessAchievementsState.labsUnlocks) || 0);
  persistWordGuessAchievementsState();
  evaluateWordGuessMetaAchievements();
  try {
    localStorage.setItem(WORD_GUESS_LABS_STORAGE_KEY, "true");
  } catch (error) {
    // Labs remains unlocked for this session.
  }
  renderWordGuessLabsControls();
  playGameSound("medal");
  playWordGuessLabsUnlockEffect();
  showAppToastWhenReady(`Labs · ${getWordGuessText("labsUnlocked")}`);
}

function handleWordGuessLabsVersionTap() {
  if (wordGuessLabsUnlocked) {
    return;
  }
  wordGuessLabsTapCount += 1;
  if (wordGuessLabsTapResetTimeoutId) {
    window.clearTimeout(wordGuessLabsTapResetTimeoutId);
  }
  if (wordGuessLabsTapCount >= WORD_GUESS_LABS_UNLOCK_TAPS) {
    wordGuessLabsTapCount = 0;
    unlockWordGuessLabs();
    return;
  }
  wordGuessLabsTapResetTimeoutId = window.setTimeout(() => {
    wordGuessLabsTapCount = 0;
    wordGuessLabsTapResetTimeoutId = null;
  }, 3500);
}

function resetWordGuessDictionaryData() {
  wordGuessDictionaryData = null;
  wordGuessDictionaryDataPromise = null;
  wordGuessDictionaryLanguage = "";
  resetWordGuessDictionaryCache();
}

function selectWordGuessLanguage(languageId) {
  const normalizedLanguage = String(languageId || "").toLowerCase();
  if (!WORD_GUESS_LANGUAGES[normalizedLanguage]) {
    return;
  }
  if (normalizedLanguage !== "uk" && !wordGuessLabsUnlocked) {
    return;
  }
  if (normalizedLanguage === selectedWordGuessLanguage) {
    return;
  }
  wordGuessAchievementsState.languageSwitches = (Number(wordGuessAchievementsState.languageSwitches) || 0) + 1;
  persistWordGuessAchievementsState();
  evaluateWordGuessMetaAchievements();
  selectedWordGuessLanguage = normalizedLanguage;
  persistWordGuessLanguagePreference();
  resetWordGuessDictionaryData();
  wordGuessTarget = "";
  wordGuessCurrentGuess = "";
  wordGuessGuesses = [];
  wordGuessAttemptLog = [];
  wordGuessKeyStatuses = {};
  applyWordGuessLanguageUi();
  renderWordGuessModeSelector();
  renderWordGuessKeyboard();
  renderWordGuessLabsControls();
  renderModes();
}

function initializeWordGuessLabs() {
  if (wordGuessLabsUnlocked && (Number(wordGuessAchievementsState.labsUnlocks) || 0) < 1) {
    wordGuessAchievementsState.labsUnlocks = 1;
    persistWordGuessAchievementsState();
    evaluateWordGuessMetaAchievements();
  }
  renderHiddenWordGuessAchievementsLab();
  if (!wordGuessLabsUnlocked && selectedWordGuessLanguage !== "uk") {
    selectedWordGuessLanguage = "uk";
    persistWordGuessLanguagePreference();
  }
  renderWordGuessLabsControls();
  applyWordGuessLanguageUi();
}

function getWordGuessLanguageDescription(wordLength, attempts, allowRepeats) {
  const repeatText = allowRepeats ? getWordGuessText("repeatOn") : getWordGuessText("repeatOff");
  return formatWordGuessText("gameDescription", wordLength, attempts, getLetterWord(wordLength), getAttemptWord(attempts), repeatText);
}

function applyWordGuessLanguageUi() {
  const text = WORD_GUESS_TEXT[selectedWordGuessLanguage] || WORD_GUESS_TEXT.uk;
  if (wordGuessSettingsEyebrow) wordGuessSettingsEyebrow.textContent = text.soloMode;
  if (wordGuessSettingsTitle) wordGuessSettingsTitle.textContent = text.title;
  if (wordGuessGameTitle) wordGuessGameTitle.textContent = text.title;
  if (wordGuessResultAppTitle) wordGuessResultAppTitle.textContent = text.title;
  if (wordGuessStartBtn) wordGuessStartBtn.textContent = text.start;
  if (wordGuessBackBtn) wordGuessBackBtn.textContent = text.backMenu;
  if (wordGuessTopMenuBtn) wordGuessTopMenuBtn.textContent = text.backMenu;
  if (wordGuessNewBtn) wordGuessNewBtn.textContent = text.newGame;
  if (wordGuessMenuBtn) wordGuessMenuBtn.textContent = text.mainMenu;
  if (wordGuessShareLabel) wordGuessShareLabel.textContent = text.share;
  if (wordGuessShareBtn) wordGuessShareBtn.setAttribute("aria-label", text.share);
  if (wordGuessDictionaryPrompt) wordGuessDictionaryPrompt.textContent = text.dictionaryPrompt;
  if (wordGuessKeyboard) wordGuessKeyboard.setAttribute("aria-label", text.keyboardLabel);
  if (wordGuessSettingsRulesBtn) { wordGuessSettingsRulesBtn.setAttribute("aria-label", text.showRules); wordGuessSettingsRulesBtn.title = text.rules; }
  if (wordGuessRulesBtn) {
    wordGuessRulesBtn.setAttribute("aria-label", text.showRules);
    wordGuessRulesBtn.title = text.rules;
  }
  if (wordGuessInfoCloseBtn) wordGuessInfoCloseBtn.setAttribute("aria-label", text.close);
  if (setupRulesCloseBtn) setupRulesCloseBtn.setAttribute("aria-label", text.close);
  if (wordGuessLanguageBadge) {
    // The setup eyebrow already identifies Labs; a second experimental badge
    // between the description and controls made the compact card feel stacked.
    wordGuessLanguageBadge.hidden = true;
    wordGuessLanguageBadge.textContent = "";
  }
  if (wordGuessHintsLabel) {
    wordGuessHintsLabel.textContent = text.hintsTitle || "Підказки";
  }
  if (wordGuessHintsLevels) wordGuessHintsLevels.textContent = text.hintLevels;
  if (wordGuessModeTags) wordGuessModeTags.setAttribute("aria-label", text.modeTagsAria);
  if (wordGuessBoard) wordGuessBoard.setAttribute("aria-label", text.boardAria);
  if (wordGuessResultStats) wordGuessResultStats.setAttribute("aria-label", text.statsAria);
  if (wordGuessResultAttempts) wordGuessResultAttempts.setAttribute("aria-label", text.resultAttemptsAria);
  if (wordGuessResultDebug) wordGuessResultDebug.setAttribute("aria-label", text.debugAria);

  const hintLabels = [text.hint1, text.hint2, text.hint3];
  [wordGuessHintFirstBtn, wordGuessHintSecondBtn, wordGuessHintThirdBtn].forEach((button, index) => {
    if (!button) return;
    const label = button.querySelector(".word-guess-hint-label");
    if (label) label.textContent = hintLabels[index];
  });

  wordGuessLengthButtons.forEach((button) => {
    const value = Number(button.dataset.wordGuessLength) || 5;
    button.textContent = `${value} ${getLetterWord(value)}`;
  });
  wordGuessAttemptButtons.forEach((button) => {
    const value = Number(button.dataset.wordGuessAttempts) || 5;
    button.textContent = `${value} ${getAttemptWord(value)}`;
  });
  wordGuessRepeatButtons.forEach((button) => {
    button.textContent = String(button.dataset.wordGuessRepeats) === "true" ? text.repeatOn : text.repeatOff;
  });
  updateWordGuessHintState();
  renderDeveloperSupportUi();
}

async function loadWordGuessDictionary() {
  const selectedModeKey = getSelectedWordGuessModeKey();
  const profile = getWordGuessLanguageProfile();

  if (
    wordGuessDictionaryData
    && wordGuessDictionaryLanguage === selectedWordGuessLanguage
    && wordGuessLoadedModeKey === selectedModeKey
    && wordGuessConfig
    && wordGuessAnswerWords.length > 0
    && wordGuessAllowedGuesses.size > 0
  ) {
    return true;
  }

  if (wordGuessSettingsMessage) {
    wordGuessSettingsMessage.textContent = getWordGuessText("loading");
  }

  try {
    if (wordGuessDictionaryLanguage !== selectedWordGuessLanguage) {
      wordGuessDictionaryData = null;
      wordGuessDictionaryDataPromise = null;
      wordGuessDictionaryLanguage = selectedWordGuessLanguage;
    }

    if (!wordGuessDictionaryData) {
      if (!wordGuessDictionaryDataPromise) {
        const dictionaryUrl = getRevisionedAssetUrl(profile.dataFile);
        wordGuessDictionaryDataPromise = fetch(dictionaryUrl)
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}`);
            }
            return response.json();
          })
          .then((data) => {
            wordGuessDictionaryData = data;
            wordGuessDictionaryDataPromise = null;
            return data;
          });
      }
      await wordGuessDictionaryDataPromise;
    }

    const data = wordGuessDictionaryData;
    if (selectedModeKey !== getSelectedWordGuessModeKey()) {
      return false;
    }
    const dictionaryModeKey = getSelectedWordGuessDictionaryKey();
    const modeData = getWordGuessModeData(data, dictionaryModeKey);
    const wordLength = selectedWordGuessLength;
    const attempts = selectedWordGuessAttempts;
    const allowRepeats = selectedWordGuessAllowRepeats;
    const rawAnswerWords = Array.isArray(modeData.answers) ? modeData.answers : modeData.words || [];
    const answerWords = normalizeWordGuessList(rawAnswerWords, wordLength, allowRepeats)
      .filter((word) => selectedWordGuessLanguage !== "uk" || !WORD_GUESS_BLOCKED_TARGETS.has(word));
    const allowedGuessWords = normalizeWordGuessList(
      Array.isArray(modeData.allowedGuesses) ? modeData.allowedGuesses : answerWords,
      wordLength,
      allowRepeats,
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
      language: selectedWordGuessLanguage,
      modeKey: selectedModeKey,
      dictionaryModeKey,
      wordLength,
      attempts,
      allowRepeats,
    };
    wordGuessLoadedModeKey = selectedModeKey;
    wordGuessAnswerWords = answerWords;
    wordGuessAllowedGuesses = allowedGuessSet;

    renderWordGuessModeSelector();

    if (wordGuessSettingsMessage) {
      wordGuessSettingsMessage.textContent = "";
    }

    return true;
  } catch (error) {
    wordGuessDictionaryDataPromise = null;
    console.error(`Не вдалося завантажити ${profile.dataFile}`, error);
    wordGuessConfig = null;
    wordGuessLoadedModeKey = "";
    wordGuessAnswerWords = [];
    wordGuessAllowedGuesses = new Set();

    if (wordGuessSettingsMessage) {
      wordGuessSettingsMessage.textContent = getWordGuessText("loadError");
    }

    return false;
  }
}

function getSelectedWordGuessModeKey() {
  const length = Number(selectedWordGuessLength) || WORD_GUESS_DEFAULT_LENGTH;
  const attempts = Number(selectedWordGuessAttempts) || WORD_GUESS_DEFAULT_ATTEMPTS;
  return `${selectedWordGuessLanguage}-${length}-${attempts}-${selectedWordGuessAllowRepeats ? "repeat" : "unique"}`;
}

function getSelectedWordGuessDictionaryKey() {
  const length = Number(selectedWordGuessLength) || WORD_GUESS_DEFAULT_LENGTH;
  return String(length);
}

function getWordGuessModeData(data, modeKey = getSelectedWordGuessDictionaryKey()) {
  const modes = (data && data.modes) && typeof data.modes === "object" ? data.modes : null;
  const normalizedModeKey = String(modeKey || (data && data.defaultMode) || WORD_GUESS_DEFAULT_MODE);
  const fallbackLength = String(selectedWordGuessLength || (data && data.defaultMode) || WORD_GUESS_DEFAULT_MODE);

  if (modes && modes[normalizedModeKey]) {
    return modes[normalizedModeKey];
  }

  if (modes && modes[fallbackLength]) {
    return modes[fallbackLength];
  }

  if (modes && (data && data.defaultMode) && modes[String(data.defaultMode)]) {
    return modes[String(data.defaultMode)];
  }

  if (modes && modes[WORD_GUESS_DEFAULT_MODE]) {
    return modes[WORD_GUESS_DEFAULT_MODE];
  }

  return data || {};
}

function readWordGuessNumberPreference(storageKey, fallback) {
  try {
    const storedValue = Number(localStorage.getItem(storageKey));
    if ([5, 6, 7].includes(storedValue)) {
      return storedValue;
    }

    if (storageKey === WORD_GUESS_LENGTH_STORAGE_KEY) {
      const legacyMode = Number(localStorage.getItem(WORD_GUESS_MODE_STORAGE_KEY));
      if ([5, 6, 7].includes(legacyMode)) {
        return legacyMode;
      }
    }
  } catch (error) {
    console.warn("Не вдалося прочитати налаштування Вгадай слово", error);
  }

  return fallback;
}

function readWordGuessRepeatsPreference() {
  try {
    return localStorage.getItem(WORD_GUESS_REPEATS_STORAGE_KEY) === "true";
  } catch (error) {
    console.warn("Не вдалося прочитати налаштування повторів Вгадай слово", error);
  }

  return false;
}

function saveWordGuessSelectionPreference() {
  try {
    localStorage.setItem(WORD_GUESS_LENGTH_STORAGE_KEY, String(selectedWordGuessLength));
    localStorage.setItem(WORD_GUESS_ATTEMPTS_STORAGE_KEY, String(selectedWordGuessAttempts));
    localStorage.setItem(WORD_GUESS_REPEATS_STORAGE_KEY, String(selectedWordGuessAllowRepeats));
    localStorage.setItem(WORD_GUESS_MODE_STORAGE_KEY, String(selectedWordGuessLength));
  } catch (error) {
    console.warn("Не вдалося зберегти налаштування Вгадай слово", error);
  }
}

function getSelectedWordGuessModeNumbers() {
  const wordLength = Number(selectedWordGuessLength) || getWordGuessLength();
  const attempts = Number(selectedWordGuessAttempts) || getWordGuessAttempts();
  return { wordLength, attempts, allowRepeats: Boolean(selectedWordGuessAllowRepeats) };
}

function closeWordGuessStartPickers(exceptPicker) {
  document.querySelectorAll(".word-guess-select[open]").forEach((picker) => {
    if (exceptPicker && picker === exceptPicker) {
      return;
    }
    picker.removeAttribute("open");
  });
}

function bindWordGuessStartPickerEvents() {
  document.querySelectorAll(".word-guess-select").forEach((picker) => {
    picker.addEventListener("toggle", () => {
      if (picker.open) {
        closeWordGuessStartPickers(picker);
      }
    });
  });
}

function updateWordGuessSelectorButtons(buttons, activeValue, datasetName) {
  buttons.forEach((button) => {
    const isActive = String(button.dataset[datasetName] || "") === String(activeValue);
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
}

function getWordGuessShortRepeatLabel(allowRepeats) {
  return allowRepeats ? getWordGuessText("repeatShortOn") : getWordGuessText("repeatShortOff");
}

function getWordGuessTargetCountLabel(count) {
  const safeCount = Number(count) || 0;
  const unit = safeCount === 1 ? getWordGuessText("wordCountOne") : getWordGuessText("wordCountMany");
  return `${safeCount} ${unit}`;
}

function getWordGuessGameLanguageTag() {
  if (selectedWordGuessLanguage === "ru") return "RU · Labs";
  if (selectedWordGuessLanguage === "en") return "EN · Labs";
  return "UA";
}

function renderWordGuessGameTags() {
  if (!wordGuessModeTags) {
    return;
  }

  const { wordLength, attempts, allowRepeats } = getSelectedWordGuessModeNumbers();
  const labels = [
    { text: getWordGuessGameLanguageTag(), labs: selectedWordGuessLanguage !== "uk" },
    { text: `${wordLength} ${getLetterWord(wordLength)}`, labs: false },
    { text: `${attempts} ${getAttemptWord(attempts)}`, labs: false },
    { text: getWordGuessShortRepeatLabel(allowRepeats), labs: false },
  ];

  if (wordGuessAnswerWords.length > 0) {
    labels.push({ text: getWordGuessTargetCountLabel(wordGuessAnswerWords.length), labs: false });
  }

  clearElement(wordGuessModeTags);
  labels.forEach(function (item, index) {
    const tag = document.createElement("span");
    tag.className = `word-guess-mode-tag${item.labs ? " is-labs" : ""}${index === labels.length - 1 && wordGuessAnswerWords.length > 0 ? " is-count" : ""}`;
    tag.textContent = item.text;
    wordGuessModeTags.appendChild(tag);
  });
}

function renderWordGuessModeSelector() {
  const { wordLength, attempts, allowRepeats } = getSelectedWordGuessModeNumbers();

  selectedWordGuessModeKey = getSelectedWordGuessModeKey();

  if (wordGuessModeDescription) {
    wordGuessModeDescription.textContent = getWordGuessLanguageDescription(wordLength, attempts, allowRepeats);
  }

  if (wordGuessLengthSummary) {
    clearElement(wordGuessLengthSummary);
    appendTextElement(wordGuessLengthSummary, "strong", "", String(wordLength));
    wordGuessLengthSummary.appendChild(document.createTextNode(` ${getLetterWord(wordLength)}`));
  }

  if (wordGuessAttemptsSummary) {
    clearElement(wordGuessAttemptsSummary);
    appendTextElement(wordGuessAttemptsSummary, "strong", "", String(attempts));
    wordGuessAttemptsSummary.appendChild(document.createTextNode(` ${getAttemptWord(attempts)}`));
  }

  if (wordGuessRepeatsSummary) {
    wordGuessRepeatsSummary.textContent = allowRepeats ? getWordGuessText("repeatOn") : getWordGuessText("repeatOff");
  }

  updateWordGuessSelectorButtons(wordGuessLengthButtons, wordLength, "wordGuessLength");
  updateWordGuessSelectorButtons(wordGuessAttemptButtons, attempts, "wordGuessAttempts");
  updateWordGuessSelectorButtons(wordGuessRepeatButtons, String(allowRepeats), "wordGuessRepeats");

  wordGuessModeButtons.forEach((button) => {
    const modeKey = String(button.dataset.wordGuessMode || "");
    const isActive = modeKey === String(wordLength);
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  });

  applyWordGuessLanguageUi();
  renderWordGuessGameTags();
}

function resetWordGuessDictionaryCache() {
  wordGuessLoadedModeKey = "";
  wordGuessConfig = null;
  wordGuessAnswerWords = [];
  wordGuessAllowedGuesses = new Set();
}

function selectWordGuessMode(modeKey) {
  selectWordGuessLength(modeKey);
}

function selectWordGuessLength(length) {
  const normalizedLength = Number(length) || WORD_GUESS_DEFAULT_LENGTH;
  if (![5, 6, 7].includes(normalizedLength)) {
    return;
  }

  if (selectedWordGuessLength !== normalizedLength) {
    wordGuessAchievementsState.lengthChanges = (Number(wordGuessAchievementsState.lengthChanges) || 0) + 1;
    persistWordGuessAchievementsState();
    evaluateWordGuessMetaAchievements();
  }
  selectedWordGuessLength = normalizedLength;
  saveWordGuessSelectionPreference();
  resetWordGuessDictionaryCache();
  renderWordGuessModeSelector();
  closeWordGuessStartPickers();
}

function selectWordGuessAttempts(attempts) {
  const normalizedAttempts = Number(attempts) || WORD_GUESS_DEFAULT_ATTEMPTS;
  if (![5, 6, 7].includes(normalizedAttempts)) {
    return;
  }

  if (selectedWordGuessAttempts !== normalizedAttempts) {
    wordGuessAchievementsState.attemptChanges = (Number(wordGuessAchievementsState.attemptChanges) || 0) + 1;
    persistWordGuessAchievementsState();
    evaluateWordGuessMetaAchievements();
  }
  selectedWordGuessAttempts = normalizedAttempts;
  saveWordGuessSelectionPreference();
  resetWordGuessDictionaryCache();
  renderWordGuessModeSelector();
  closeWordGuessStartPickers();
}

function selectWordGuessRepeats(allowRepeats) {
  const nextAllowRepeats = allowRepeats === true || String(allowRepeats) === "true";
  if (selectedWordGuessAllowRepeats !== nextAllowRepeats) {
    wordGuessAchievementsState.repeatToggles = (Number(wordGuessAchievementsState.repeatToggles) || 0) + 1;
    persistWordGuessAchievementsState();
    evaluateWordGuessMetaAchievements();
  }
  selectedWordGuessAllowRepeats = nextAllowRepeats;
  saveWordGuessSelectionPreference();
  resetWordGuessDictionaryCache();
  renderWordGuessModeSelector();
  closeWordGuessStartPickers();
}

function getLetterWord(count) {
  const normalizedCount = Number(count);
  if (selectedWordGuessLanguage === "en") {
    return normalizedCount === 1 ? "letter" : "letters";
  }
  if (selectedWordGuessLanguage === "ru") {
    const mod10 = normalizedCount % 10;
    const mod100 = normalizedCount % 100;
    if (mod10 === 1 && mod100 !== 11) return "букву";
    if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) return "буквы";
    return "букв";
  }
  if (normalizedCount === 1) return "літеру";
  if (normalizedCount >= 2 && normalizedCount <= 4) return "літери";
  return "літер";
}

function normalizeWordGuessList(rawWords, length = 5, allowRepeats = false) {
  const normalizedWords = [];
  const seenWords = new Set();

  rawWords.forEach((item) => {
    const rawWord = typeof item === "string" ? item : (item && item.word);
    const word = normalizeWordGuessWord(rawWord || "");

    if (!isValidWordGuessWord(word, length, allowRepeats) || seenWords.has(word)) {
      return;
    }

    seenWords.add(word);
    normalizedWords.push(word);
  });

  return normalizedWords;
}

function normalizeWordGuessWord(word) {
  return String(word).trim().toLocaleLowerCase(getWordGuessLocale());
}

function isValidWordGuessWord(word, length = 5, allowRepeats = false) {
  const letters = Array.from(word);
  const allowedLetters = getWordGuessLetters();
  return letters.length === length
    && letters.every((letter) => allowedLetters.includes(letter))
    && (allowRepeats || new Set(letters).size === letters.length);
}

function getWordGuessValidationMessage(word, length = 5, allowRepeats = false) {
  const letters = Array.from(word);
  const allowedLetters = getWordGuessLetters();

  if (letters.length !== length) {
    if (selectedWordGuessLanguage === "en") return `Use ${length} ${getLetterWord(length)}`;
    if (selectedWordGuessLanguage === "ru") return `Нужно ${length} ${getLetterWord(length)}`;
    return `Потрібно ${length} ${getLetterWord(length)}`;
  }

  if (!letters.every((letter) => allowedLetters.includes(letter))) {
    return getWordGuessText("onlyLetters");
  }

  if (!allowRepeats && new Set(letters).size !== letters.length) {
    return getWordGuessText("noRepeats");
  }

  return "";
}

function getWordGuessLength() {
  return (wordGuessConfig && wordGuessConfig.wordLength) || selectedWordGuessLength || 5;
}

function getWordGuessAttempts() {
  return (wordGuessConfig && wordGuessConfig.attempts) || selectedWordGuessAttempts || 5;
}

function getWordGuessAllowsRepeats() {
  return Boolean((wordGuessConfig && typeof wordGuessConfig.allowRepeats !== "undefined" ? wordGuessConfig.allowRepeats : selectedWordGuessAllowRepeats));
}

function getWordGuessDictionaryStatsLabel() {
  const answerCount = wordGuessAnswerWords.length;
  const allowedCount = wordGuessAllowedGuesses.size;
  if (!answerCount || !allowedCount) return "";
  return formatWordGuessText("dictionaryStats", answerCount, allowedCount);
}

function getWordGuessDebugLabel() {
  const answerCount = wordGuessAnswerWords.length;
  const allowedCount = wordGuessAllowedGuesses.size;
  const languageLabel = getWordGuessLanguageProfile().shortLabel;
  if (!answerCount || !allowedCount) return `v${DATA_VERSION} · ${languageLabel}`;
  return `v${DATA_VERSION} · ${languageLabel} · ${getWordGuessText("targetsShort")}: ${answerCount} · ${getWordGuessText("guessesShort")}: ${allowedCount}`;
}

function isWordGuessStartContextValid(startRequestId, startScreenName) {
  if (startRequestId !== wordGuessStartRequestId || !isWordGuess()) {
    return false;
  }
  const isSettingsStart = startScreenName === "wordGuessSettings";
  const isResultStart = startScreenName === "wordGuessGame" && wordGuessResult && !wordGuessResult.hidden;
  return Boolean((isSettingsStart || isResultStart) && getCurrentAppScreenName() === startScreenName);
}

async function startWordGuessGame() {
  const startScreenName = getCurrentAppScreenName();
  const startRequestId = ++wordGuessStartRequestId;
  if (!isWordGuessStartContextValid(startRequestId, startScreenName)) {
    return false;
  }
  if (wordGuessStartBtn) {
    wordGuessStartBtn.disabled = true;
  }
  setWordGuessBackgroundLocked(false);
  clearWordGuessFinaleEffect();
  try {
    const isDictionaryReady = await loadWordGuessDictionary();
    if (!isWordGuessStartContextValid(startRequestId, startScreenName)) {
      return false;
    }
    if (!isDictionaryReady) {
      showScreen("wordGuessSettings");
      return false;
    }

  cancelWordGuessReveal();
  clearWordGuessInvalidClearTimer();
  wordGuessTarget = wordGuessAnswerWords[Math.floor(Math.random() * wordGuessAnswerWords.length)];
  wordGuessGuesses = [];
  wordGuessAttemptLog = [];
  wordGuessCurrentGuess = "";
  wordGuessKeyStatuses = {};
  wordGuessFinished = false;
  wordGuessGameStartedAtMs = Date.now();
  wordGuessGameBackspaceCount = 0;
  wordGuessGameFullEraseCount = 0;
  wordGuessGameIncompleteSubmitCount = 0;
  wordGuessGameTypedLetters = new Set();
  wordGuessEraseArmed = false;
  if (window.MovohraySession && typeof window.MovohraySession.createSession === "function") {
    wordGuessRuntimeSession = window.MovohraySession.createSession({
      game: "wordguess",
      playMode: "classic",
      playerCount: 1,
      syncMode: "solo",
      transport: "local",
      timeLimitSeconds: 0,
    });
    if (typeof window.MovohraySession.start === "function") {
      window.MovohraySession.start(wordGuessRuntimeSession, wordGuessGameStartedAtMs);
    }
  } else {
    wordGuessRuntimeSession = null;
  }
  wordGuessFirstHintUsedAtMs = 0;
  wordGuessFirstHintUsedGuessCount = -1;
  wordGuessSecondHintUsedGuessCount = -1;
  wordGuessThirdHintUsedGuessCount = -1;
  wordGuessHintUsed = false;
  wordGuessHintLevel = 0;
  wordGuessHintLetters = [];
  wordGuessFeedbackChoice = "";
  isWordGuessHistoryOpen = false;
  isWordGuessResultHistoryOpen = false;

  updateWordGuessHintState();

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
  renderWordGuessGameTags();
    showScreen("wordGuessGame");
    clearWordGuessHintNudgeTimers();
    clearWordGuessHintNudgeVisual();
    scheduleWordGuessHintNudge(WORD_GUESS_HINT_NUDGE_DELAY_MS);
    return true;
  } finally {
    if (wordGuessStartBtn && startRequestId === wordGuessStartRequestId) {
      wordGuessStartBtn.disabled = false;
    }
  }
}

function getWordGuessStatusLabel(status) {
  if (status === "correct") return getWordGuessText("statusCorrect");
  if (status === "present") return getWordGuessText("statusPresent");
  return getWordGuessText("statusAbsent");
}

function applyWordGuessCellStatus(cell, letter, status) {
  if (!cell) {
    return;
  }
  cell.classList.remove("is-filled", "is-flip-pending", "is-correct", "is-present", "is-absent");
  cell.classList.add(`is-${status || "absent"}`);
  cell.dataset.status = status || "absent";
  cell.setAttribute(
    "aria-label",
    `${toWordGuessUpper(letter)}: ${getWordGuessStatusLabel(status)}`,
  );
}

function renderWordGuessBoard() {
  if (!wordGuessBoard) {
    return;
  }

  const wordLength = getWordGuessLength();
  const attempts = getWordGuessAttempts();
  wordGuessBoard.style.setProperty("--word-guess-length", String(wordLength));
  wordGuessBoard.style.setProperty("--word-guess-attempts", String(attempts));
  wordGuessBoard.dataset.wordLength = String(wordLength);
  wordGuessBoard.dataset.attempts = String(attempts);
  wordGuessBoard.innerHTML = "";

  for (let rowIndex = 0; rowIndex < attempts; rowIndex++) {
    const row = document.createElement("div");
    row.className = "word-guess-row";

    const submittedGuess = wordGuessGuesses[rowIndex];
    const isActiveRow = rowIndex === wordGuessGuesses.length && !wordGuessFinished;
    if (isActiveRow) {
      row.classList.add("is-active");
    }
    const activeLetters = isActiveRow ? Array.from(wordGuessCurrentGuess) : [];

    for (let cellIndex = 0; cellIndex < wordLength; cellIndex++) {
      const cell = document.createElement("span");
      cell.className = "word-guess-cell";
      let letter = "";

      if (submittedGuess) {
        letter = submittedGuess.letters[cellIndex] || "";
        const isRevealingRow = wordGuessRevealState && wordGuessRevealState.rowIndex === rowIndex;
        const isCellRevealed = !isRevealingRow || cellIndex < wordGuessRevealState.revealedCount;
        if (isCellRevealed) {
          applyWordGuessCellStatus(cell, letter, submittedGuess.statuses[cellIndex] || "absent");
        } else {
          cell.classList.add("is-filled", "is-flip-pending");
        }
      } else if (isActiveRow && activeLetters[cellIndex]) {
        letter = activeLetters[cellIndex];
        cell.classList.add("is-filled");
      }

      const glyph = document.createElement("span");
      glyph.className = "word-guess-cell-glyph";
      glyph.textContent = toWordGuessUpper(letter);
      cell.appendChild(glyph);
      row.appendChild(cell);
    }

    wordGuessBoard.appendChild(row);
  }

}

function renderWordGuessKeyboard(revealedLetters = []) {
  if (!wordGuessKeyboard) {
    return;
  }

  const revealOrder = Array.isArray(revealedLetters) ? revealedLetters : [];
  wordGuessKeyboard.innerHTML = "";

  getWordGuessKeyboardRows().forEach((letters, rowIndex) => {
    const row = document.createElement("div");
    row.className = `word-guess-key-row word-guess-letter-row word-guess-key-row-${rowIndex + 1}`;

    letters.forEach((letter) => {
      row.appendChild(createWordGuessKey(letter, toWordGuessUpper(letter), "", revealOrder));
    });

    wordGuessKeyboard.appendChild(row);
  });

  const controlsRow = document.createElement("div");
  controlsRow.className = "word-guess-control-row";
  controlsRow.appendChild(createWordGuessKey("enter", getWordGuessText("enter"), "wide"));
  controlsRow.appendChild(createWordGuessKey("backspace", "⌫", "utility"));
  wordGuessKeyboard.appendChild(controlsRow);
}

function prefersReducedWordGuessMotion() {
  return Boolean(
    window.matchMedia
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
}

function setWordGuessInputLocked(isLocked) {
  wordGuessInputLocked = Boolean(isLocked);
  if (wordGuessGameScreen) {
    wordGuessGameScreen.classList.toggle("is-word-guess-revealing", wordGuessInputLocked);
  }
  if (wordGuessBoard) {
    wordGuessBoard.classList.toggle("is-revealing", wordGuessInputLocked);
    wordGuessBoard.setAttribute("aria-busy", wordGuessInputLocked ? "true" : "false");
  }
  if (wordGuessKeyboard) {
    wordGuessKeyboard.setAttribute("aria-disabled", wordGuessInputLocked ? "true" : "false");
    wordGuessKeyboard.querySelectorAll("[data-word-guess-key]").forEach(function (button) {
      button.disabled = wordGuessInputLocked || wordGuessFinished;
    });
  }
}

function clearWordGuessInvalidClearTimer() {
  if (wordGuessInvalidClearTimeoutId) {
    window.clearTimeout(wordGuessInvalidClearTimeoutId);
    wordGuessInvalidClearTimeoutId = null;
  }
  if (!wordGuessRevealState) {
    setWordGuessInputLocked(false);
  }
}

function cancelWordGuessReveal() {
  wordGuessRevealGeneration += 1;
  const revealState = wordGuessRevealState;
  wordGuessRevealState = null;
  if (revealState) {
    revealState.completed = true;
    revealState.timeoutIds.forEach(function (timeoutId) {
      window.clearTimeout(timeoutId);
    });
    if (revealState.frameId) {
      window.cancelAnimationFrame(revealState.frameId);
    }
    if (revealState.lastCell && revealState.endHandler) {
      revealState.lastCell.removeEventListener("animationend", revealState.endHandler);
      revealState.lastCell.removeEventListener("webkitAnimationEnd", revealState.endHandler);
    }
  }
  if (wordGuessBoard) {
    wordGuessBoard.querySelectorAll(".word-guess-cell.is-flipping").forEach(function (cell) {
      cell.classList.remove("is-flipping");
      cell.style.animationDelay = "";
      cell.style.webkitAnimationDelay = "";
    });
  }
  setWordGuessInputLocked(false);
}

function revealWordGuessAcceptedRow(rowIndex, acceptedGuess, onComplete) {
  const statuses = acceptedGuess.statuses.slice();
  const letters = acceptedGuess.letters.slice();
  const keyboardRevealLetters = acceptedGuess.keyboardRevealLetters || [];
  const generation = ++wordGuessRevealGeneration;

  if (prefersReducedWordGuessMotion()) {
    wordGuessRevealState = null;
    renderWordGuessBoard();
    if (onComplete) {
      onComplete();
    }
    renderWordGuessKeyboard(keyboardRevealLetters);
    return;
  }

  wordGuessRevealState = {
    id: generation,
    rowIndex,
    revealedCount: 0,
    timeoutIds: [],
    frameId: null,
    lastCell: null,
    endHandler: null,
    completed: false,
  };
  setWordGuessInputLocked(true);
  renderWordGuessBoard();

  const revealState = wordGuessRevealState;
  const row = wordGuessBoard && wordGuessBoard.children[rowIndex];
  const cells = row ? Array.from(row.querySelectorAll(".word-guess-cell")) : [];

  const completeReveal = function () {
    if (
      !wordGuessRevealState
      || wordGuessRevealState !== revealState
      || revealState.id !== wordGuessRevealGeneration
      || revealState.completed
    ) {
      return;
    }
    revealState.completed = true;
    revealState.timeoutIds.forEach(function (timeoutId) {
      window.clearTimeout(timeoutId);
    });
    if (revealState.lastCell && revealState.endHandler) {
      revealState.lastCell.removeEventListener("animationend", revealState.endHandler);
      revealState.lastCell.removeEventListener("webkitAnimationEnd", revealState.endHandler);
    }
    cells.forEach(function (cell, cellIndex) {
      applyWordGuessCellStatus(cell, letters[cellIndex], statuses[cellIndex]);
      cell.classList.remove("is-flipping");
      cell.style.animationDelay = "";
      cell.style.webkitAnimationDelay = "";
    });
    revealState.revealedCount = cells.length;
    wordGuessRevealState = null;
    setWordGuessInputLocked(false);
    renderWordGuessBoard();
    if (onComplete) {
      onComplete();
    }
    renderWordGuessKeyboard(keyboardRevealLetters);
  };

  if (cells.length !== letters.length || cells.length === 0) {
    completeReveal();
    return;
  }

  revealState.lastCell = cells[cells.length - 1];
  revealState.endHandler = function (event) {
    if (!event || event.target === revealState.lastCell) {
      completeReveal();
    }
  };
  revealState.lastCell.addEventListener("animationend", revealState.endHandler);
  revealState.lastCell.addEventListener("webkitAnimationEnd", revealState.endHandler);

  revealState.frameId = window.requestAnimationFrame(function () {
    if (!wordGuessRevealState || wordGuessRevealState !== revealState || revealState.completed) {
      return;
    }
    cells.forEach(function (cell, cellIndex) {
      const delay = cellIndex * WORD_GUESS_FLIP_STAGGER_MS;
      cell.style.animationDelay = `${delay}ms`;
      cell.style.webkitAnimationDelay = `${delay}ms`;
      cell.classList.add("is-flipping");
      const midpointId = window.setTimeout(function () {
        if (!wordGuessRevealState || wordGuessRevealState !== revealState || revealState.completed) {
          return;
        }
        applyWordGuessCellStatus(cell, letters[cellIndex], statuses[cellIndex]);
        revealState.revealedCount = Math.max(revealState.revealedCount, cellIndex + 1);
      }, delay + WORD_GUESS_FLIP_MIDPOINT_MS);
      revealState.timeoutIds.push(midpointId);
    });
  });

  const watchdogDelay = WORD_GUESS_FLIP_DURATION_MS
    + WORD_GUESS_FLIP_STAGGER_MS * Math.max(0, cells.length - 1)
    + WORD_GUESS_FLIP_WATCHDOG_GRACE_MS;
  revealState.timeoutIds.push(window.setTimeout(completeReveal, watchdogDelay));
}


function setWordGuessBackgroundLocked(isLocked) {
  const locked = Boolean(isLocked);
  document.body.classList.toggle("word-guess-result-open", locked);

  [wordGuessTopMenuBtn, wordGuessHintFirstBtn, wordGuessHintSecondBtn, wordGuessHintThirdBtn, wordGuessRulesBtn, wordGuessHistoryBtn].forEach((button) => {
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

function fitWordGuessBoardToViewport() {
  if (!isScreenActive(wordGuessGameScreen) || !wordGuessBoard || !wordGuessKeyboard) {
    return;
  }

  const wordLength = getWordGuessLength();
  const attempts = getWordGuessAttempts();
  const viewportHeight = (window.visualViewport ? window.visualViewport.height : 0) || window.innerHeight || document.documentElement.clientHeight;
  const boardRect = wordGuessBoard.getBoundingClientRect();
  const keyboardRect = wordGuessKeyboard.getBoundingClientRect();
  const boardStyle = window.getComputedStyle(wordGuessBoard);
  const boardGap = Number.parseFloat(boardStyle.rowGap || boardStyle.gap || "6") || 6;
  const sampleRow = wordGuessBoard.querySelector(".word-guess-row");
  const rowGap = Number.parseFloat(window.getComputedStyle(sampleRow || wordGuessBoard).columnGap || "6") || 6;
  const bottomReserve = 20;
  const availableHeight = Math.max(150, viewportHeight - boardRect.top - keyboardRect.height - bottomReserve);
  const boardParent = wordGuessBoard.parentElement;
  const parentWidth = (boardParent && boardParent.clientWidth) || wordGuessBoard.clientWidth || boardRect.width || 320;
  const maxBoardWidth = wordLength >= 7 ? 560 : wordLength === 6 ? 552 : 540;
  const availableWidth = Math.max(220, Math.min(parentWidth, maxBoardWidth));
  const heightCell = Math.floor((availableHeight - boardGap * Math.max(0, attempts - 1)) / attempts);
  const widthCell = Math.floor((availableWidth - rowGap * Math.max(0, wordLength - 1)) / wordLength);
  const maxCell = wordLength >= 7 ? 78 : wordLength === 6 ? 88 : 104;
  const minCell = attempts >= 7 ? 28 : 32;
  const fittedCell = Math.max(minCell, Math.min(maxCell, heightCell, widthCell));
  const fittedBoardWidth = fittedCell * wordLength + rowGap * Math.max(0, wordLength - 1);

  wordGuessBoard.style.setProperty("--word-guess-cell-size", `${fittedCell}px`);
  wordGuessBoard.style.setProperty("--word-guess-board-width", `${fittedBoardWidth}px`);
}

let wordGuessViewportFitFrameId = 0;
let wordGuessViewportFitSettleTimeoutId = 0;

function scheduleWordGuessViewportFit(options) {
  const settings = options || {};
  if (wordGuessViewportFitFrameId) {
    window.cancelAnimationFrame(wordGuessViewportFitFrameId);
    wordGuessViewportFitFrameId = 0;
  }
  if (wordGuessViewportFitSettleTimeoutId) {
    window.clearTimeout(wordGuessViewportFitSettleTimeoutId);
    wordGuessViewportFitSettleTimeoutId = 0;
  }

  // Wait until the newly activated screen has actually completed a layout pass.
  // The board size is intentionally NOT recalculated for every typed letter.
  wordGuessViewportFitFrameId = window.requestAnimationFrame(function () {
    wordGuessViewportFitFrameId = window.requestAnimationFrame(function () {
      wordGuessViewportFitFrameId = 0;
      fitWordGuessBoardToViewport();
    });
  });

  if (settings.settle !== false) {
    wordGuessViewportFitSettleTimeoutId = window.setTimeout(function () {
      wordGuessViewportFitSettleTimeoutId = 0;
      fitWordGuessBoardToViewport();
    }, 260);
  }
}

function createWordGuessKey(key, label, variant = "", revealedLetters = []) {
  const button = document.createElement("button");
  const status = wordGuessKeyStatuses[key];
  button.type = "button";
  button.className = `word-guess-key${variant ? ` word-guess-key-${variant}` : ""}`;
  button.dataset.wordGuessKey = key;

  if (key === "backspace") {
    button.classList.add("word-guess-key-icon");
    button.setAttribute("aria-label", getWordGuessText("erase"));
    button.innerHTML = `
      <svg class="word-guess-backspace-icon" viewBox="0 0 28 20" aria-hidden="true" focusable="false">
        <path d="M10 3.5H24.2C25.2 3.5 26 4.3 26 5.3V14.7C26 15.7 25.2 16.5 24.2 16.5H10L2.8 10L10 3.5Z" />
        <path d="M13 7.3L18.4 12.7M18.4 7.3L13 12.7" />
      </svg>
    `;
  } else {
    button.textContent = label;
  }

  const isHintedLetter = !status && wordGuessHintLetters.includes(key);
  if (isHintedLetter) {
    button.classList.add("is-hinted");
  }

  if (status) {
    button.classList.add(`is-${status}`);

    const revealIndex = Array.isArray(revealedLetters) ? revealedLetters.indexOf(key) : -1;
    if (revealIndex >= 0) {
      button.classList.add("is-status-revealing");
      const revealDelay = revealIndex * 35;
      button.style.animationDelay = `${revealDelay}ms`;
      button.style.webkitAnimationDelay = `${revealDelay}ms`;
    }
  }

  if (wordGuessFinished || wordGuessInputLocked) {
    button.disabled = true;
  }

  return button;
}

function getWordGuessVowelSet() {
  if (selectedWordGuessLanguage === "en") return new Set(["a", "e", "i", "o", "u", "y"]);
  if (selectedWordGuessLanguage === "ru") return new Set(["а", "е", "ё", "и", "о", "у", "ы", "э", "ю", "я"]);
  return new Set(["а", "е", "є", "и", "і", "ї", "о", "у", "ю", "я"]);
}

function isWordGuessPalindrome(word) {
  const letters = Array.from(String(word || ""));
  return letters.length >= 5 && letters.join("") === letters.slice().reverse().join("");
}

function checkWordGuessLiveTypingAchievements() {
  const letters = Array.from(wordGuessCurrentGuess);
  if (wordGuessGameTypedLetters.size >= 20) unlockWordGuessAchievement("keyboard-tour-live");
  if (letters.length >= 4 && new Set(letters).size === 1) unlockWordGuessAchievement("letter-monotony");
  if (letters.length >= 4) {
    const vowels = getWordGuessVowelSet();
    if (letters.every(function (letter) { return vowels.has(letter); })) unlockWordGuessAchievement("vowel-choir");
  }
}

function handleWordGuessInput(rawKey) {
  if (wordGuessFinished || wordGuessInputLocked || !isScreenActive(wordGuessGameScreen)) {
    return;
  }

  const key = normalizeWordGuessWord(rawKey);

  if (key === "enter") {
    submitWordGuess();
    return;
  }

  if (key === "backspace") {
    const beforeLetters = Array.from(wordGuessCurrentGuess);
    if (beforeLetters.length > 0) wordGuessGameBackspaceCount += 1;
    if (beforeLetters.length === getWordGuessLength()) wordGuessEraseArmed = true;
    wordGuessCurrentGuess = beforeLetters.slice(0, -1).join("");
    if (wordGuessEraseArmed && wordGuessCurrentGuess.length === 0) {
      wordGuessGameFullEraseCount += 1;
      if (wordGuessGuesses.length === 0) unlockWordGuessAchievement("erase-before-first");
      wordGuessEraseArmed = false;
    }
    if (wordGuessGameBackspaceCount >= 20 && wordGuessGuesses.length === 0) unlockWordGuessAchievement("nervous-fingers");
    if (wordGuessGameBackspaceCount >= 50) unlockWordGuessAchievement("backspace-blizzard");
    renderWordGuessBoard();
    setWordGuessMessage("");
    return;
  }

  if (!getWordGuessLetters().includes(key) || Array.from(key).length !== 1) {
    return;
  }

  const letters = Array.from(wordGuessCurrentGuess);
  if (letters.length >= getWordGuessLength()) {
    return;
  }

  wordGuessCurrentGuess += key;
  wordGuessGameTypedLetters.add(key);
  if (Array.from(wordGuessCurrentGuess).length === getWordGuessLength()) wordGuessEraseArmed = false;
  checkWordGuessLiveTypingAchievements();
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
  if (getWordGuessLetters().includes(key) && Array.from(key).length === 1) {
    event.preventDefault();
    handleWordGuessInput(key);
  }
}

function playWordGuessInvalidReaction() {
  if (!wordGuessGameScreen || !document.body) {
    return;
  }

  const reducedMotion = window.matchMedia
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) {
    return;
  }

  const emojis = ["🙃", "🤨", "😵‍💫", "🫠", "😅", "👀"];
  const copy = getWordGuessText("invalidReactions") || WORD_GUESS_TEXT.uk.invalidReactions;
  const bubble = document.createElement("span");
  bubble.className = `word-guess-invalid-reaction reaction-${1 + Math.floor(Math.random() * 4)}`;
  bubble.textContent = `${emojis[Math.floor(Math.random() * emojis.length)]} ${copy[Math.floor(Math.random() * copy.length)]}`;
  bubble.style.setProperty("--reaction-x", `${Math.round(42 + Math.random() * 16)}vw`);
  bubble.style.setProperty("--reaction-y", `${Math.round(34 + Math.random() * 18)}vh`);
  bubble.style.setProperty("--reaction-rot", `${Math.round(Math.random() * 18 - 9)}deg`);
  document.body.appendChild(bubble);
  window.setTimeout(() => bubble.remove(), 2100);
}

function submitWordGuess() {
  if (wordGuessFinished || wordGuessInputLocked || !isScreenActive(wordGuessGameScreen)) {
    return;
  }
  const wordLength = getWordGuessLength();
  const guess = normalizeWordGuessWord(wordGuessCurrentGuess);
  const guessLettersForOddities = Array.from(guess);
  if (guessLettersForOddities.length === wordLength) {
    const vowelsForOddities = getWordGuessVowelSet();
    if (guessLettersForOddities.length > 0 && guessLettersForOddities.every(function (letter) { return !vowelsForOddities.has(letter); })) unlockWordGuessAchievement("consonant-wall");
    if (isWordGuessPalindrome(guess)) unlockWordGuessAchievement("mirror-guess");
  }
  const validationMessage = getWordGuessValidationMessage(guess, wordLength, getWordGuessAllowsRepeats());

  if (validationMessage) {
    if (Array.from(guess).length !== wordLength) wordGuessGameIncompleteSubmitCount += 1;
    playGameSound("wrong");
    addWordGuessAttemptLog(guess, "invalid", [], validationMessage);
    if (wordGuessGameIncompleteSubmitCount >= 7) unlockWordGuessAchievement("empty-enter-seven");
    if (wordGuessAttemptLog.filter(function (attempt) { return attempt.status === "invalid"; }).length >= 10) unlockWordGuessAchievement("invalid-tornado");
    if (wordGuessGameStartedAtMs > 0 && Date.now() - wordGuessGameStartedAtMs <= 5000) unlockWordGuessAchievement("speed-mistake");
    setWordGuessMessage(validationMessage);
    renderWordGuessBoard();
    shakeWordGuessBoard();
    playWordGuessInvalidReaction();
    clearInvalidWordGuessAfterShake();
    renderWordGuessHistory();
    return;
  }

  if (!wordGuessAllowedGuesses.has(guess)) {
    playGameSound("wrong");
    addWordGuessAttemptLog(guess, "invalid", [], getWordGuessText("notInDictionary"));
    if (wordGuessAttemptLog.filter(function (attempt) { return attempt.status === "invalid"; }).length >= 10) unlockWordGuessAchievement("invalid-tornado");
    if (wordGuessGameStartedAtMs > 0 && Date.now() - wordGuessGameStartedAtMs <= 5000) unlockWordGuessAchievement("speed-mistake");
    setWordGuessMessage(getWordGuessText("notInDictionary"));
    renderWordGuessBoard();
    shakeWordGuessBoard();
    playWordGuessInvalidReaction();
    clearInvalidWordGuessAfterShake();
    renderWordGuessHistory();
    return;
  }

  const statuses = evaluateWordGuess(guess, wordGuessTarget);
  if (wordGuessGuesses.length === 0 && wordGuessGameStartedAtMs > 0 && Date.now() - wordGuessGameStartedAtMs >= 60000) unlockWordGuessAchievement("silent-minute");
  const acceptedGuess = {
    word: guess,
    letters: Array.from(guess),
    statuses,
  };
  wordGuessGuesses.push(acceptedGuess);
  addWordGuessAttemptLog(guess, "valid", statuses, "");
  clearWordGuessHintNudgeVisual();
  scheduleWordGuessHintNudge(WORD_GUESS_HINT_NUDGE_DELAY_MS);
  playGameSound("reveal");

  clearWordGuessInvalidClearTimer();
  acceptedGuess.keyboardRevealLetters = updateWordGuessKeyboardStatuses(guess, statuses);
  wordGuessCurrentGuess = "";
  setWordGuessMessage("");
  const isWon = guess === wordGuessTarget;
  const isLost = !isWon && wordGuessGuesses.length >= getWordGuessAttempts();
  const rowIndex = wordGuessGuesses.length - 1;
  revealWordGuessAcceptedRow(rowIndex, acceptedGuess, function () {
    renderWordGuessHistory();
    if (isWon || isLost) {
      finishWordGuessGame(isWon);
    }
  });
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
  const changedLetters = [];

  Array.from(guess).forEach((letter, index) => {
    const currentStatus = wordGuessKeyStatuses[letter];
    const nextStatus = statuses[index];
    const currentPriority = WORD_GUESS_STATUS_PRIORITY[currentStatus] || 0;
    const nextPriority = WORD_GUESS_STATUS_PRIORITY[nextStatus] || 0;

    if (nextPriority > currentPriority) {
      wordGuessKeyStatuses[letter] = nextStatus;
      if (!changedLetters.includes(letter)) {
        changedLetters.push(letter);
      }
    }
  });

  return changedLetters;
}

function getWordGuessHintResultLabel() {
  if (!wordGuessHintLevel) {
    return getWordGuessText("hintsNone");
  }
  const usedHints = [];
  for (let level = 1; level <= wordGuessHintLevel; level++) {
    usedHints.push(String(level));
  }
  return `${getWordGuessText("hintsUsed")}: ${usedHints.join(", ")}`;
}

function getWordGuessShareGrid() {
  return wordGuessAttemptLog
    .filter((attempt) => attempt.status !== "invalid")
    .map((attempt) => {
      const statuses = Array.isArray(attempt.statuses) ? attempt.statuses : [];
      return statuses.map((status) => {
        if (status === "correct") return "🟩";
        if (status === "present") return "🟨";
        return "🟥";
      }).join("");
    })
    .join("\n");
}

function buildWordGuessShareText() {
  const isWon = wordGuessGuesses.some((guess) => guess.word === wordGuessTarget || guess === wordGuessTarget);
  const wordLength = getWordGuessLength();
  const attemptsLimit = getWordGuessAttempts();
  const validAttempts = wordGuessGuesses.length;
  const resultLabel = isWon ? `${validAttempts}/${attemptsLimit}` : `—/${attemptsLimit}`;
  const grid = getWordGuessShareGrid();
  const modeLine = formatWordGuessText("shareModeCompact", wordLength, resultLabel, getWordGuessAllowsRepeats());
  return [
    `${getWordGuessText("brand")} · ${getWordGuessText("title")} · ${getWordGuessLanguageProfile().shortLabel}`,
    modeLine,
    getWordGuessHintResultLabel(),
    grid,
    window.location.origin + window.location.pathname,
  ].filter(Boolean).join("\n");
}

function showAppToast(message) {
  if (!appToast) {
    return;
  }

  if (appToastTimeoutId) {
    clearTimeout(appToastTimeoutId);
  }

  appToast.textContent = message;
  appToast.hidden = false;
  appToast.classList.remove("is-visible");
  window.requestAnimationFrame(function () {
    appToast.classList.add("is-visible");
  });

  appToastTimeoutId = setTimeout(function () {
    appToast.classList.remove("is-visible");
    setTimeout(function () {
      if (!appToast.classList.contains("is-visible")) {
        appToast.hidden = true;
      }
    }, 180);
  }, 2200);
}

function drawRoundedCanvasRect(context, x, y, width, height, radius) {
  const safeRadius = Math.max(0, Math.min(radius, width / 2, height / 2));
  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.lineTo(x + width - safeRadius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  context.lineTo(x + width, y + height - safeRadius);
  context.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
  context.lineTo(x + safeRadius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
  context.lineTo(x, y + safeRadius);
  context.quadraticCurveTo(x, y, x + safeRadius, y);
  context.closePath();
}

function getWordGuessShareResultLabel(isWon, validAttempts, attemptsLimit) {
  return formatWordGuessText("shareResult", isWon, validAttempts, attemptsLimit);
}

function getWordGuessShareModeLabel() {
  const wordLength = getWordGuessLength();
  const attemptsLimit = getWordGuessAttempts();
  const repeats = getWordGuessAllowsRepeats();
  const language = getWordGuessLanguageProfile().shortLabel + (selectedWordGuessLanguage === "uk" ? "" : " · Labs");
  return formatWordGuessText("shareModeFull", language, wordLength, attemptsLimit, repeats);
}

function createWordGuessShareImageBlob() {
  return new Promise(function (resolve, reject) {
    try {
      const canvas = document.createElement("canvas");
      const width = 1080;
      const height = 1350;
      const scale = 1;
      canvas.width = width * scale;
      canvas.height = height * scale;
      const context = canvas.getContext("2d");
      if (!context) {
        reject(new Error("Canvas unavailable"));
        return;
      }

      const darkTheme = document.body && document.body.dataset.theme === "dark";
      const colors = darkTheme ? {
        bg1: "#151b2c", bg2: "#222b45", panel: "#202943", text: "#f7f3eb", muted: "#b8bfd4",
        correct: "#5ea878", present: "#d8ad4f", absent: "#8b5669", border: "#4a5575", accent: "#7dd6d4",
      } : {
        bg1: "#f7f1e8", bg2: "#ebe6f1", panel: "#fffaf1", text: "#27314f", muted: "#6e7592",
        correct: "#74bd92", present: "#e2b756", absent: "#bd7182", border: "#d8d3e2", accent: "#4c8f96",
      };

      const gradient = context.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, colors.bg1);
      gradient.addColorStop(1, colors.bg2);
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);

      // Quiet doodle-like background so the card feels like Movohray, not a raw grid export.
      context.globalAlpha = darkTheme ? 0.075 : 0.055;
      context.strokeStyle = colors.muted;
      context.lineWidth = 3;
      for (let row = 0; row < 7; row++) {
        for (let col = 0; col < 6; col++) {
          const x = 72 + col * 190 + (row % 2) * 34;
          const y = 92 + row * 190;
          const kind = (row + col) % 4;
          context.beginPath();
          if (kind === 0) {
            context.arc(x, y, 24, 0, Math.PI * 2);
            context.moveTo(x - 15, y); context.lineTo(x + 15, y);
            context.moveTo(x, y - 15); context.lineTo(x, y + 15);
          } else if (kind === 1) {
            drawRoundedCanvasRect(context, x - 28, y - 20, 56, 40, 12);
          } else if (kind === 2) {
            context.moveTo(x, y - 28); context.lineTo(x + 9, y - 8); context.lineTo(x + 30, y - 6);
            context.lineTo(x + 14, y + 8); context.lineTo(x + 19, y + 29); context.lineTo(x, y + 17);
            context.lineTo(x - 19, y + 29); context.lineTo(x - 14, y + 8); context.lineTo(x - 30, y - 6);
            context.lineTo(x - 9, y - 8); context.closePath();
          } else {
            context.moveTo(x - 26, y - 12); context.quadraticCurveTo(x, y - 34, x + 26, y - 12);
            context.quadraticCurveTo(x + 30, y + 16, x, y + 24); context.quadraticCurveTo(x - 30, y + 16, x - 26, y - 12);
          }
          context.stroke();
        }
      }
      context.globalAlpha = 1;

      const panelX = 76;
      const panelY = 72;
      const panelW = width - 152;
      const panelH = height - 144;
      context.fillStyle = colors.panel;
      context.strokeStyle = colors.border;
      context.lineWidth = 3;
      drawRoundedCanvasRect(context, panelX, panelY, panelW, panelH, 52);
      context.fill();
      context.stroke();

      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillStyle = colors.accent;
      context.font = '800 34px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';
      context.fillText(String(getWordGuessText("brand")).toUpperCase(), width / 2, 145);

      context.fillStyle = colors.text;
      context.font = '900 58px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';
      context.fillText(getWordGuessText("title"), width / 2, 220);

      const isWon = wordGuessGuesses.some(function (guess) {
        return guess.word === wordGuessTarget || guess === wordGuessTarget;
      });
      const validAttempts = wordGuessGuesses.length;
      const attemptsLimit = getWordGuessAttempts();
      context.fillStyle = colors.muted;
      context.font = '700 30px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';
      context.fillText(getWordGuessShareResultLabel(isWon, validAttempts, attemptsLimit), width / 2, 286);

      context.fillStyle = colors.text;
      context.font = '900 82px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';
      context.fillText(toWordGuessUpper(wordGuessTarget), width / 2, 382);

      context.fillStyle = colors.muted;
      context.font = '700 25px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';
      context.fillText(getWordGuessShareModeLabel(), width / 2, 452);

      const validRows = wordGuessAttemptLog.filter(function (attempt) { return attempt.status !== "invalid"; });
      const wordLength = getWordGuessLength();
      const tileGap = wordLength >= 7 ? 12 : 15;
      const tileSize = Math.min(104, Math.floor((720 - tileGap * (wordLength - 1)) / wordLength));
      const rowHeight = tileSize + 18;
      const gridWidth = tileSize * wordLength + tileGap * (wordLength - 1);
      const gridStartX = Math.round((width - gridWidth) / 2);
      const gridStartY = 520;
      const maxVisibleRows = Math.min(validRows.length, attemptsLimit, 7);

      for (let rowIndex = 0; rowIndex < maxVisibleRows; rowIndex++) {
        const attempt = validRows[rowIndex];
        const letters = Array.from(attempt.word || "");
        const statuses = Array.isArray(attempt.statuses) ? attempt.statuses : [];
        const y = gridStartY + rowIndex * rowHeight;
        for (let letterIndex = 0; letterIndex < wordLength; letterIndex++) {
          const status = statuses[letterIndex] || "absent";
          const x = gridStartX + letterIndex * (tileSize + tileGap);
          context.fillStyle = status === "correct" ? colors.correct : status === "present" ? colors.present : colors.absent;
          drawRoundedCanvasRect(context, x, y, tileSize, tileSize, 20);
          context.fill();
          context.fillStyle = "#fffaf4";
          context.font = `900 ${Math.round(tileSize * 0.48)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif`;
          context.fillText(toWordGuessUpper(letters[letterIndex] || ""), x + tileSize / 2, y + tileSize / 2 + 2);
        }
      }

      const invalidCount = wordGuessAttemptLog.filter(function (attempt) { return attempt.status === "invalid"; }).length;
      const footerY = Math.max(1130, gridStartY + maxVisibleRows * rowHeight + 55);
      context.fillStyle = colors.muted;
      context.font = '700 27px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';
      const hintLine = getWordGuessHintResultLabel();
      context.fillText(hintLine, width / 2, Math.min(footerY, 1170));
      if (invalidCount > 0) {
        const invalidLine = `${getWordGuessText("invalidCount")}: ${invalidCount}`;
        context.fillText(invalidLine, width / 2, Math.min(footerY + 42, 1212));
      }
      context.fillStyle = colors.accent;
      context.font = '800 25px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';
      context.fillText(getWordGuessText("shareFooter"), width / 2, 1266);

      canvas.toBlob(function (blob) {
        if (blob) resolve(blob);
        else reject(new Error("Could not create image"));
      }, "image/png", 0.96);
    } catch (error) {
      reject(error);
    }
  });
}

function downloadWordGuessShareImage(blob) {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = `movohray-${selectedWordGuessLanguage}-${Date.now()}.png`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(function () { URL.revokeObjectURL(objectUrl); }, 1500);
}

function recordWordGuessShareSuccess() {
  wordGuessAchievementsState.shareCount = (Number(wordGuessAchievementsState.shareCount) || 0) + 1;
  persistWordGuessAchievementsState();
  evaluateWordGuessMetaAchievements();
}

async function shareWordGuessResult() {
  const shareText = buildWordGuessShareText();
  try {
    const imageBlob = await createWordGuessShareImageBlob();
    const imageFile = new File([imageBlob], `movohray-result-${selectedWordGuessLanguage}.png`, { type: "image/png" });
    const shareData = {
      title: `${getWordGuessText("brand")} — ${getWordGuessText("title")}`,
      text: window.location.origin + window.location.pathname,
      files: [imageFile],
    };

    if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [imageFile] }))) {
      await navigator.share(shareData);
      showAppToast(getWordGuessText("shareImageShared"));
      recordWordGuessShareSuccess();
      return;
    }

    if (navigator.clipboard && navigator.clipboard.write && window.ClipboardItem) {
      const clipboardItem = new ClipboardItem({ "image/png": imageBlob });
      await navigator.clipboard.write([clipboardItem]);
      showAppToast(getWordGuessText("shareImageCopied"));
      recordWordGuessShareSuccess();
      return;
    }

    downloadWordGuessShareImage(imageBlob);
    showAppToast(getWordGuessText("shareImageSaved"));
    recordWordGuessShareSuccess();
  } catch (error) {
    if (error && error.name === "AbortError") {
      return;
    }
    console.warn("Не вдалося створити або поширити картинку результату", error);
    try {
      if (navigator.share) {
        await navigator.share({ title: `${getWordGuessText("brand")} — ${getWordGuessText("title")}`, text: shareText });
        recordWordGuessShareSuccess();
        return;
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareText);
        showAppToast(getWordGuessText("shareTextCopied"));
        recordWordGuessShareSuccess();
        return;
      }
    } catch (fallbackError) {
      if (!(fallbackError && fallbackError.name === "AbortError")) {
        console.warn("Не вдалося поділитися резервним способом", fallbackError);
      }
    }
    showAppToast(getWordGuessText("shareFailed"));
  }
}

function finishWordGuessGame(isWon) {
  wordGuessFinished = true;
  clearWordGuessHintNudgeTimers();
  clearWordGuessHintNudgeVisual();
  isWordGuessHistoryOpen = false;
  isWordGuessResultHistoryOpen = false;
  const targetLabel = toWordGuessUpper(wordGuessTarget);
  const totalAttempts = wordGuessAttemptLog.length;
  const invalidAttempts = wordGuessAttemptLog.filter((attempt) => attempt.status === "invalid").length;
  const validAttempts = wordGuessGuesses.length;
  recordWordGuessAchievements(isWon);

  if (wordGuessResultTitle) {
    wordGuessResultTitle.textContent = isWon ? getWordGuessText("guessed") : getWordGuessText("attemptsOver");
  }

  if (wordGuessResultText) {
    wordGuessResultText.textContent = "";
    const targetCaption = document.createElement("span");
    targetCaption.className = "word-guess-result-caption";
    targetCaption.textContent = isWon ? getWordGuessText("targetWon") : getWordGuessText("targetLost");
    const targetWord = document.createElement("strong");
    targetWord.className = "word-guess-result-word";
    targetWord.textContent = targetLabel;
    const hintSummary = document.createElement("span");
    hintSummary.className = `word-guess-result-hints is-level-${wordGuessHintLevel}`;
    hintSummary.textContent = getWordGuessHintResultLabel();
    wordGuessResultText.appendChild(targetCaption);
    wordGuessResultText.appendChild(targetWord);
    wordGuessResultText.appendChild(hintSummary);
  }

  if (wordGuessResultStats) {
    wordGuessResultStats.innerHTML = "";
    [
      [getWordGuessText("attempts"), validAttempts],
      [getWordGuessText("checked"), totalAttempts],
      [getWordGuessText("invalid"), invalidAttempts],
    ].forEach(function (item) {
      const stat = document.createElement("span");
      stat.className = "word-guess-result-stat";
      stat.textContent = item[0] + ": ";
      const value = document.createElement("strong");
      value.textContent = String(item[1]);
      stat.appendChild(value);
      wordGuessResultStats.appendChild(stat);
    });
  }

  if (wordGuessResultDebug) {
    wordGuessResultDebug.textContent = "";
    wordGuessResultDebug.hidden = true;
  }

  renderWordGuessDictionaryLinks(wordGuessTarget);
  updateWordGuessFeedbackState();
  renderWordGuessResultAttempts();
  renderWordGuessHistory();
  updateWordGuessHintState();

  if (wordGuessResult) {
    wordGuessResult.classList.toggle("is-won", isWon);
    wordGuessResult.classList.toggle("is-lost", !isWon);
    wordGuessResult.hidden = false;
  }

  syncAppHistory("wordGuessGame", "push", "result");
  setWordGuessBackgroundLocked(true);
  playGameCompleteSound(isWon ? "win" : "loss");
  playWordGuessFinaleEffect(isWon);
}

function clearWordGuessFinaleEffect() {
  if (wordGuessFinaleEffectTimeoutId) {
    clearTimeout(wordGuessFinaleEffectTimeoutId);
    wordGuessFinaleEffectTimeoutId = null;
  }

  document.querySelectorAll(".word-guess-finale-effects").forEach((layer) => layer.remove());
}

function playWordGuessFinaleEffect(isWon) {
  clearWordGuessFinaleEffect();

  const prefersReducedMotion = window.matchMedia
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion || !document.body) {
    return;
  }

  const layer = document.createElement("div");
  layer.className = `word-guess-finale-effects ${isWon ? "is-win" : "is-loss"}`;
  layer.setAttribute("aria-hidden", "true");

  if (isWon) {
    const confettiColors = ["#76c49a", "#7dd6d4", "#e0b864", "#df8fab", "#aaa1f0", "#f7e4a1"];
    for (let index = 0; index < 96; index++) {
      const particle = document.createElement("span");
      particle.className = "word-guess-confetti";
      particle.style.setProperty("--x", `${Math.round(Math.random() * 100)}vw`);
      particle.style.setProperty("--dx", `${Math.round(Math.random() * 220 - 110)}px`);
      particle.style.setProperty("--rot", `${Math.round(Math.random() * 720 - 360)}deg`);
      particle.style.setProperty("--delay", `${(Math.random() * 0.75).toFixed(2)}s`);
      particle.style.setProperty("--duration", `${(2.6 + Math.random() * 1.7).toFixed(2)}s`);
      particle.style.setProperty("--size", `${Math.round(6 + Math.random() * 7)}px`);
      particle.style.background = confettiColors[index % confettiColors.length];
      layer.appendChild(particle);
    }

    for (let index = 0; index < 8; index++) {
      const burst = document.createElement("span");
      burst.className = "word-guess-firework";
      burst.style.setProperty("--fx", `${18 + Math.round(Math.random() * 64)}vw`);
      burst.style.setProperty("--fy", `${14 + Math.round(Math.random() * 34)}vh`);
      burst.style.setProperty("--delay", `${(0.1 + Math.random() * 0.9).toFixed(2)}s`);
      layer.appendChild(burst);
    }

    const victoryEmojis = ["🏆", "🎉", "🥳", "✨", "⭐", "👑"];
    for (let index = 0; index < 16; index += 1) {
      const emoji = document.createElement("span");
      emoji.className = "word-guess-victory-emoji";
      emoji.textContent = victoryEmojis[index % victoryEmojis.length];
      emoji.style.setProperty("--vx", `${Math.round(8 + Math.random() * 84)}vw`);
      emoji.style.setProperty("--vy", `${Math.round(62 + Math.random() * 25)}vh`);
      emoji.style.setProperty("--vdx", `${Math.round(Math.random() * 180 - 90)}px`);
      emoji.style.setProperty("--vdelay", `${(0.15 + Math.random() * 1.0).toFixed(2)}s`);
      emoji.style.setProperty("--vduration", `${(2.1 + Math.random() * 1.5).toFixed(2)}s`);
      emoji.style.setProperty("--vrot", `${Math.round(Math.random() * 120 - 60)}deg`);
      layer.appendChild(emoji);
    }

    for (let index = 0; index < 30; index += 1) {
      const spark = document.createElement("span");
      spark.className = "word-guess-victory-spark";
      spark.style.setProperty("--sx", `${Math.round(Math.random() * 100)}vw`);
      spark.style.setProperty("--sy", `${Math.round(8 + Math.random() * 70)}vh`);
      spark.style.setProperty("--sdelay", `${(Math.random() * 1.35).toFixed(2)}s`);
      spark.style.setProperty("--ssize", `${Math.round(3 + Math.random() * 8)}px`);
      layer.appendChild(spark);
    }

    for (let index = 0; index < 3; index += 1) {
      const ring = document.createElement("span");
      ring.className = "word-guess-victory-ring";
      ring.style.setProperty("--ring-delay", `${(0.18 + index * 0.34).toFixed(2)}s`);
      layer.appendChild(ring);
    }
  } else {
    const emojis = ["🤷‍♂️", "🤷", "🤷‍♀️", "🤔", "😕", "🙃", "😶", "🫤"];
    for (let index = 0; index < 28; index++) {
      const emoji = document.createElement("span");
      emoji.className = "word-guess-loss-emoji";
      emoji.textContent = emojis[index % emojis.length];
      emoji.style.setProperty("--start-x", `${44 + Math.round(Math.random() * 12)}vw`);
      emoji.style.setProperty("--start-y", `${38 + Math.round(Math.random() * 16)}vh`);
      emoji.style.setProperty("--end-x", `${Math.round(Math.random() * 220 - 110)}vw`);
      emoji.style.setProperty("--end-y", `${Math.round(Math.random() * 130 - 65)}vh`);
      emoji.style.setProperty("--rot", `${Math.round(Math.random() * 520 - 260)}deg`);
      emoji.style.setProperty("--delay", `${(Math.random() * 0.85).toFixed(2)}s`);
      emoji.style.setProperty("--duration", `${(2.8 + Math.random() * 1.5).toFixed(2)}s`);
      layer.appendChild(emoji);
    }
  }

  document.body.appendChild(layer);
  wordGuessFinaleEffectTimeoutId = setTimeout(clearWordGuessFinaleEffect, isWon ? 6400 : 4800);
}

function getWordGuessVowelCount(word) {
  const vowels = getWordGuessLanguageProfile().vowels;
  return Array.from(word).filter((letter) => vowels.includes(letter)).length;
}

function getWordGuessBasicHintMessage() {
  if (!wordGuessTarget) {
    return getWordGuessText("hintBeforeStart");
  }
  const firstRaw = Array.from(wordGuessTarget)[0] || "";
  const firstLetter = toWordGuessUpper(firstRaw);
  const vowelCount = getWordGuessVowelCount(wordGuessTarget);
  return `${getWordGuessText("firstLetterLabel")}: ${firstLetter}\n${getWordGuessText("vowelsLabel")}: ${vowelCount}`;
}

function getWordGuessSecondHintLetter() {
  if (!wordGuessTarget) {
    return "";
  }

  const targetLetters = Array.from(wordGuessTarget);
  const knownLetters = new Set(wordGuessHintLetters);
  const firstLetter = targetLetters[0];
  const discoveredLetters = new Set();

  wordGuessGuesses.forEach((guess) => {
    Array.from(guess.word || "").forEach((letter, index) => {
      const status = (guess.statuses ? guess.statuses[index] : undefined);
      if (status === "correct" || status === "present") {
        discoveredLetters.add(letter);
      }
    });
  });

  const candidates = targetLetters.filter((letter) => letter !== firstLetter && !knownLetters.has(letter) && !discoveredLetters.has(letter));
  const fallbackCandidates = targetLetters.filter((letter) => !knownLetters.has(letter) && !discoveredLetters.has(letter));
  const fallbackAll = targetLetters.filter((letter) => !knownLetters.has(letter));

  return candidates[0] || fallbackCandidates[0] || fallbackAll[0] || targetLetters[1] || targetLetters[0] || "";
}

function getWordGuessAllHintLetters() {
  if (!wordGuessTarget) {
    return [];
  }

  return Array.from(new Set(Array.from(wordGuessTarget)));
}

function getWordGuessHintTitle() {
  const parts = [getWordGuessBasicHintMessage()];
  if (wordGuessHintLetters.length > 0) {
    const letters = wordGuessHintLetters.map((letter) => toWordGuessUpper(letter)).join(", ");
    parts.push(`${getWordGuessText("highlightedLetters")}: ${letters}`);
  }
  return parts.join("\n");
}

function clearWordGuessHintNudgeTimers() {
  if (wordGuessHintNudgeTimeoutId) {
    window.clearTimeout(wordGuessHintNudgeTimeoutId);
    wordGuessHintNudgeTimeoutId = null;
  }
  if (wordGuessHintNudgeClearTimeoutId) {
    window.clearTimeout(wordGuessHintNudgeClearTimeoutId);
    wordGuessHintNudgeClearTimeoutId = null;
  }
}

function clearWordGuessHintNudgeVisual() {
  [wordGuessHintFirstBtn, wordGuessHintSecondBtn, wordGuessHintThirdBtn].forEach(function (button) {
    if (button) button.classList.remove("is-hint-nudged");
  });
  if (wordGuessHintNudgeClearTimeoutId) {
    window.clearTimeout(wordGuessHintNudgeClearTimeoutId);
    wordGuessHintNudgeClearTimeoutId = null;
  }
}

function getNextAvailableWordGuessHintButton() {
  if (!wordGuessTarget || wordGuessFinished) return null;
  if (wordGuessHintLevel <= 0) return wordGuessHintFirstBtn;
  if (wordGuessHintLevel === 1) return wordGuessHintSecondBtn;
  if (wordGuessHintLevel === 2) return wordGuessHintThirdBtn;
  return null;
}

function showWordGuessHintNudge() {
  clearWordGuessHintNudgeVisual();
  const button = getNextAvailableWordGuessHintButton();
  if (!button || button.disabled || !isScreenActive(wordGuessGameScreen)) return;
  button.classList.add("is-hint-nudged");
  button.setAttribute("data-hint-nudge-label", getWordGuessText("nextHintGlow"));
  wordGuessHintNudgeClearTimeoutId = window.setTimeout(function () {
    button.classList.remove("is-hint-nudged");
    wordGuessHintNudgeClearTimeoutId = null;
  }, WORD_GUESS_HINT_NUDGE_VISIBLE_MS);
}

function scheduleWordGuessHintNudge(delayMs) {
  if (wordGuessHintNudgeTimeoutId) window.clearTimeout(wordGuessHintNudgeTimeoutId);
  wordGuessHintNudgeTimeoutId = null;
  if (!wordGuessTarget || wordGuessFinished || wordGuessHintLevel >= 3) return;
  const wait = Number(delayMs) >= 0 ? Number(delayMs) : WORD_GUESS_HINT_NUDGE_DELAY_MS;
  wordGuessHintNudgeTimeoutId = window.setTimeout(function () {
    wordGuessHintNudgeTimeoutId = null;
    showWordGuessHintNudge();
  }, wait);
}

function updateWordGuessHintState() {
  const isFirstUsed = Boolean(wordGuessHintLevel >= 1 && wordGuessTarget);
  const isSecondAvailable = Boolean(wordGuessHintLevel >= 1 && wordGuessTarget);
  const isSecondUsed = Boolean(wordGuessHintLevel >= 2 && wordGuessTarget);
  const isThirdAvailable = Boolean(wordGuessHintLevel >= 2 && wordGuessTarget);
  const isThirdUsed = Boolean(wordGuessHintLevel >= 3 && wordGuessTarget);

  if (wordGuessHintFirstBtn) {
    wordGuessHintFirstBtn.disabled = !wordGuessTarget;
    wordGuessHintFirstBtn.classList.toggle("is-used", isFirstUsed);
    wordGuessHintFirstBtn.setAttribute("aria-pressed", isFirstUsed ? "true" : "false");
    wordGuessHintFirstBtn.setAttribute("aria-label", isFirstUsed ? getWordGuessText("firstHintAgain") : getWordGuessText("firstHintShow"));
    wordGuessHintFirstBtn.title = getWordGuessText("hint1");
  }
  if (wordGuessHintSecondBtn) {
    wordGuessHintSecondBtn.disabled = !wordGuessTarget;
    wordGuessHintSecondBtn.classList.toggle("is-available", isSecondAvailable);
    wordGuessHintSecondBtn.classList.toggle("is-used", isSecondUsed);
    wordGuessHintSecondBtn.setAttribute("aria-pressed", isSecondUsed ? "true" : "false");
    wordGuessHintSecondBtn.setAttribute("aria-disabled", isSecondAvailable ? "false" : "true");
    wordGuessHintSecondBtn.setAttribute("aria-label", isSecondUsed ? getWordGuessText("secondHintAgain") : getWordGuessText("secondHintLocked"));
    wordGuessHintSecondBtn.title = isSecondAvailable ? getWordGuessText("hint2") : getWordGuessText("secondHintLocked");
  }
  if (wordGuessHintThirdBtn) {
    wordGuessHintThirdBtn.disabled = !wordGuessTarget;
    wordGuessHintThirdBtn.classList.toggle("is-available", isThirdAvailable);
    wordGuessHintThirdBtn.classList.toggle("is-used", isThirdUsed);
    wordGuessHintThirdBtn.setAttribute("aria-pressed", isThirdUsed ? "true" : "false");
    wordGuessHintThirdBtn.setAttribute("aria-disabled", isThirdAvailable ? "false" : "true");
    wordGuessHintThirdBtn.setAttribute("aria-label", isThirdUsed ? getWordGuessText("thirdHintAgain") : getWordGuessText("thirdHintLocked"));
    wordGuessHintThirdBtn.title = isThirdAvailable ? getWordGuessText("hint3") : getWordGuessText("thirdHintLocked");
  }
}

function showWordGuessFirstHint() {
  if (!wordGuessTarget || wordGuessInputLocked) return;
  clearWordGuessHintNudgeVisual();
  playGameSound("reveal");
  if (wordGuessHintLevel === 0) {
    wordGuessHintLevel = 1;
    wordGuessHintUsed = true;
    wordGuessFirstHintUsedAtMs = Date.now();
    wordGuessFirstHintUsedGuessCount = wordGuessGuesses.length;
  }
  setWordGuessMessage("");
  updateWordGuessHintState();
  scheduleWordGuessHintNudge(WORD_GUESS_HINT_NUDGE_DELAY_MS);
  openWordGuessInfoModal({ eyebrow: getWordGuessText("hint1"), title: getWordGuessBasicHintMessage(), text: getWordGuessText("firstHintNext"), type: "hint" });
}

function showWordGuessSecondHint() {
  if (wordGuessInputLocked) return;
  clearWordGuessHintNudgeVisual();
  if (!wordGuessTarget || wordGuessHintLevel < 1) {
    playGameSound("wrong");
    triggerInvalidShake(wordGuessHintSecondBtn);
    setWordGuessMessage(getWordGuessText("openHint1First"));
    return;
  }
  playGameSound("reveal");
  if (wordGuessHintLevel === 1) {
    wordGuessHintLevel = 2;
    wordGuessSecondHintUsedGuessCount = wordGuessGuesses.length;
    const hintedLetter = getWordGuessSecondHintLetter();
    if (hintedLetter && !wordGuessHintLetters.includes(hintedLetter)) wordGuessHintLetters.push(hintedLetter);
    renderWordGuessKeyboard();
  }
  setWordGuessMessage("");
  updateWordGuessHintState();
  scheduleWordGuessHintNudge(WORD_GUESS_HINT_NUDGE_DELAY_MS);
  openWordGuessInfoModal({ eyebrow: getWordGuessText("hint2"), title: getWordGuessHintTitle(), text: getWordGuessText("secondHintNext"), type: "hint" });
}

function showWordGuessThirdHint() {
  if (wordGuessInputLocked) return;
  clearWordGuessHintNudgeVisual();
  if (!wordGuessTarget || wordGuessHintLevel < 2) {
    playGameSound("wrong");
    triggerInvalidShake(wordGuessHintThirdBtn);
    setWordGuessMessage(getWordGuessText("openHint2First"));
    return;
  }
  playGameSound("reveal");
  if (wordGuessHintLevel === 2) {
    wordGuessHintLevel = 3;
    wordGuessThirdHintUsedGuessCount = wordGuessGuesses.length;
    getWordGuessAllHintLetters().forEach((letter) => {
      if (!wordGuessHintLetters.includes(letter)) wordGuessHintLetters.push(letter);
    });
    renderWordGuessKeyboard();
  }
  setWordGuessMessage("");
  updateWordGuessHintState();
  clearWordGuessHintNudgeTimers();
  clearWordGuessHintNudgeVisual();
  openWordGuessInfoModal({ eyebrow: getWordGuessText("hint3"), title: getWordGuessHintTitle(), text: getWordGuessText("thirdHintText"), type: "hint" });
}

function showWordGuessHint() {
  showWordGuessFirstHint();
}

function showWordGuessRules() {
  wordGuessAchievementsState.rulesOpens = (Number(wordGuessAchievementsState.rulesOpens) || 0) + 1;
  persistWordGuessAchievementsState();
  evaluateWordGuessMetaAchievements();
  const length = getWordGuessLength();
  const attempts = getWordGuessAttempts();
  const rulesText = formatWordGuessText("fullRules", length, getLetterWord(length), attempts, getAttemptWord(attempts), getWordGuessAllowsRepeats());
  openWordGuessInfoModal({ eyebrow: getWordGuessText("rules"), title: getWordGuessText("howToPlay"), text: rulesText, type: "rules" });
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

  const wasHintModal = wordGuessInfoModal.classList.contains("is-hint-modal");
  wordGuessInfoModal.hidden = true;
  document.body.classList.remove("modal-open");
  if (wasHintModal && wordGuessHintLevel < 3 && !wordGuessFinished) {
    window.setTimeout(showWordGuessHintNudge, 140);
  }
}

function getSetupRules(modeId) {
  if (modeId === "charades") {
    return {
      eyebrow: "Покажи слово",
      title: "Короткі правила",
      text: "Гравець показує слово жестами без звуків і підказок літерами. Команда відгадує якомога більше завдань за раунд або грає по одному слову.",
    };
  }

  if (modeId === "wordguess") {
    return { eyebrow: getWordGuessText("title"), title: getWordGuessText("shortRulesTitle"), text: getWordGuessText("shortRulesText") };
  }

  if (modeId === "whoami") {
    return {
      eyebrow: "Хто я?",
      title: "Короткі правила",
      text: "Кожен має приховану роль. Сам гравець її не бачить, ставить питання, а інші відповідають тільки “так” або “ні”. Після відгадування роль підтверджують інші.",
    };
  }

  return {
    eyebrow: "Поясни слово",
    title: "Короткі правила",
    text: "Пояснюй слово своїй команді, не називаючи його та спільнокореневі слова. За вгадані слова команда отримує очки.",
  };
}

function openSetupRules(modeId) {
  if (!setupRulesModal) {
    return;
  }

  const rules = getSetupRules(modeId);
  if (setupRulesEyebrow) {
    setupRulesEyebrow.textContent = rules.eyebrow;
  }
  if (setupRulesTitle) {
    setupRulesTitle.textContent = rules.title;
  }
  if (setupRulesText) {
    setupRulesText.textContent = rules.text;
  }

  setupRulesModal.hidden = false;
  document.body.classList.add("modal-open");
  if (setupRulesCloseBtn) {
    setupRulesCloseBtn.focus();
  }
}

function closeSetupRules() {
  if (!setupRulesModal || setupRulesModal.hidden) {
    return;
  }

  setupRulesModal.hidden = true;
  document.body.classList.remove("modal-open");
}

function getAttemptWord(count) {
  const normalizedCount = Number(count);
  if (selectedWordGuessLanguage === "en") {
    return normalizedCount === 1 ? "attempt" : "attempts";
  }
  if (selectedWordGuessLanguage === "ru") {
    const mod10 = normalizedCount % 10;
    const mod100 = normalizedCount % 100;
    if (mod10 === 1 && mod100 !== 11) return "попытку";
    if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) return "попытки";
    return "попыток";
  }
  if (normalizedCount === 1) return "спробу";
  if (normalizedCount >= 2 && normalizedCount <= 4) return "спроби";
  return "спроб";
}


function renderWordGuessResultAttempts() {
  if (!wordGuessResultAttempts) return;
  wordGuessResultAttempts.innerHTML = "";
  const wordLength = getWordGuessLength();
  wordGuessResultAttempts.style.setProperty("--word-guess-length", String(wordLength));

  const label = document.createElement("span");
  label.className = "word-guess-result-attempts-label";
  label.textContent = getWordGuessText("attemptsLabel");
  wordGuessResultAttempts.appendChild(label);

  if (wordGuessAttemptLog.length === 0) {
    const empty = document.createElement("span");
    empty.className = "word-guess-result-attempts-empty";
    empty.textContent = getWordGuessText("noAttempts");
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
    lettersWrap.style.setProperty("--word-guess-length", String(wordLength));
    const letters = Array.from(attempt.word || "");
    for (let letterIndex = 0; letterIndex < wordLength; letterIndex++) {
      const letterCell = document.createElement("span");
      const letter = letters[letterIndex] || "";
      const status = isInvalidAttempt ? "invalid" : attempt.statuses[letterIndex] || "absent";
      letterCell.className = `word-guess-result-attempt-letter is-${status}`;
      letterCell.textContent = toWordGuessUpper(letter);
      lettersWrap.appendChild(letterCell);
    }
    if (isInvalidAttempt && attempt.message) row.title = `${getWordGuessText("invalidBadge")}: ${attempt.message}`;
    row.appendChild(lettersWrap);
    if (isInvalidAttempt) {
      const invalidBadge = document.createElement("span");
      invalidBadge.className = "word-guess-result-invalid-badge";
      invalidBadge.textContent = getWordGuessText("invalidBadge");
      row.appendChild(invalidBadge);
    }
    list.appendChild(row);
  });
  wordGuessResultAttempts.appendChild(list);
}

function renderWordGuessDictionaryLinks(word) {
  if (!wordGuessDictionaryLinks) return;
  wordGuessDictionaryLinks.innerHTML = "";
  const links = WORD_GUESS_DICTIONARY_LINKS[selectedWordGuessLanguage] || WORD_GUESS_DICTIONARY_LINKS.uk;
  links.forEach((link) => {
    const anchor = document.createElement("a");
    anchor.href = link.url(word);
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.textContent = link.label || link.name;
    anchor.title = formatWordGuessText("lookupTitle", toWordGuessUpper(word), link.name);
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
  return `${getWordGuessText("attempts")} · ${count}`;
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
    cell.textContent = toWordGuessUpper(letter);
    lettersWrap.appendChild(cell);
  }

  item.appendChild(lettersWrap);

  if (isInvalidAttempt && guess.message) {
    item.title = `${getWordGuessText("invalidBadge")}: ${guess.message}`;
  }

  return item;
}

function renderWordGuessHistoryList(targetElement, emptyText = "") {
  if (!targetElement) {
    return;
  }

  targetElement.innerHTML = "";

  if (wordGuessAttemptLog.length === 0) {
    const empty = document.createElement("p");
    empty.className = "word-guess-history-empty";
    empty.textContent = emptyText || getWordGuessText("noAttemptsHistory");
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
    renderWordGuessHistoryList(wordGuessResultHistory, getWordGuessText("noAttemptsResult"));
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

function triggerInvalidShake(element) {
  if (!element) {
    return;
  }

  if (element._invalidShakeTimeoutId) {
    window.clearTimeout(element._invalidShakeTimeoutId);
    element._invalidShakeTimeoutId = null;
  }

  element.classList.remove("is-invalid-shaking");
  void element.offsetWidth;
  element.classList.add("is-invalid-shaking");
  element._invalidShakeTimeoutId = window.setTimeout(() => {
    element.classList.remove("is-invalid-shaking");
    element._invalidShakeTimeoutId = null;
  }, 420);
}

function getActiveWordGuessRow() {
  if (!wordGuessBoard) {
    return null;
  }

  return wordGuessBoard.querySelector(".word-guess-row.is-active");
}

function shakeWordGuessBoard() {
  triggerInvalidShake(getActiveWordGuessRow() || wordGuessBoard);
}

const WORD_GUESS_INVALID_GLYPH_EFFECTS = ["fade", "dust", "scatter", "drop", "twirl", "shrink", "flip"];

function appendInvalidDustParticles(cell, delay) {
  const dustCount = 22 + Math.floor(Math.random() * 13);
  for (let particleIndex = 0; particleIndex < dustCount; particleIndex += 1) {
    const particle = document.createElement("span");
    particle.className = "word-guess-invalid-dust";

    const originX = 22 + Math.round(Math.random() * 56);
    const originY = 18 + Math.round(Math.random() * 64);
    const direction = Math.random() < 0.5 ? -1 : 1;
    const particleX = direction * Math.round(18 + Math.random() * 58);
    const particleY = Math.round(-12 - Math.random() * 62);
    const particleDelay = delay + 250 + Math.floor(Math.random() * 280);
    const particleDuration = 900 + Math.floor(Math.random() * 520);
    const particleSize = 2 + Math.floor(Math.random() * 4);
    const particleRotation = Math.round((Math.random() * 320) - 160);

    particle.style.setProperty("--dust-origin-x", `${originX}%`);
    particle.style.setProperty("--dust-origin-y", `${originY}%`);
    particle.style.setProperty("--dust-x", `${particleX}px`);
    particle.style.setProperty("--dust-y", `${particleY}px`);
    particle.style.setProperty("--dust-x-1", `${Math.round(particleX * 0.22)}px`);
    particle.style.setProperty("--dust-y-1", `${Math.round(particleY * 0.22)}px`);
    particle.style.setProperty("--dust-x-2", `${Math.round(particleX * 0.68)}px`);
    particle.style.setProperty("--dust-y-2", `${Math.round(particleY * 0.68)}px`);
    particle.style.setProperty("--dust-delay", `${particleDelay}ms`);
    particle.style.setProperty("--dust-duration", `${particleDuration}ms`);
    particle.style.setProperty("--dust-size", `${particleSize}px`);
    particle.style.setProperty("--dust-rotation", `${particleRotation}deg`);
    particle.style.setProperty("--dust-rotation-1", `${Math.round(particleRotation * 0.28)}deg`);
    particle.style.setProperty("--dust-rotation-2", `${Math.round(particleRotation * 0.72)}deg`);
    cell.appendChild(particle);
  }
}

function prepareInvalidWordGuessGlyphEffects(activeRow) {
  if (!activeRow) {
    return;
  }

  const cells = Array.from(activeRow.querySelectorAll(".word-guess-cell.is-filled"));
  if (cells.length === 0) {
    return;
  }

  // Always make at least one letter visibly disintegrate, so the special effect
  // cannot disappear just because random selection did not choose "dust".
  const guaranteedDustIndex = Math.floor(Math.random() * cells.length);
  let previousEffect = "";

  cells.forEach((cell, index) => {
    const glyph = cell.querySelector(".word-guess-cell-glyph");
    if (!glyph) {
      return;
    }

    let effect = index === guaranteedDustIndex
      ? "dust"
      : WORD_GUESS_INVALID_GLYPH_EFFECTS[Math.floor(Math.random() * WORD_GUESS_INVALID_GLYPH_EFFECTS.length)];

    if (effect === previousEffect && effect !== "dust") {
      const currentIndex = WORD_GUESS_INVALID_GLYPH_EFFECTS.indexOf(effect);
      effect = WORD_GUESS_INVALID_GLYPH_EFFECTS[(currentIndex + 1 + Math.floor(Math.random() * (WORD_GUESS_INVALID_GLYPH_EFFECTS.length - 1))) % WORD_GUESS_INVALID_GLYPH_EFFECTS.length];
    }
    previousEffect = effect;

    // A visible left-to-right wave: the word stays readable first, then letters
    // leave one by one instead of all fading at once.
    const delay = 500 + index * 165 + Math.floor(Math.random() * 95);
    const duration = 1050 + Math.floor(Math.random() * 430);
    const direction = Math.random() < 0.5 ? -1 : 1;
    const x = direction * Math.round(28 + Math.random() * 52);
    const y = Math.round(-14 - Math.random() * 52);
    const rotation = direction * Math.round(24 + Math.random() * 72);

    glyph.classList.add(`invalid-effect-${effect}`);
    glyph.style.setProperty("--invalid-delay", `${delay}ms`);
    glyph.style.setProperty("--invalid-duration", `${duration}ms`);
    glyph.style.setProperty("--invalid-x", `${x}px`);
    glyph.style.setProperty("--invalid-y", `${y}px`);
    glyph.style.setProperty("--invalid-rotation", `${rotation}deg`);
    glyph.style.setProperty("--invalid-mid-x", `${Math.round(x * 0.44)}px`);
    glyph.style.setProperty("--invalid-mid-y", `${Math.round(y * 0.44)}px`);
    glyph.style.setProperty("--invalid-mid-rotation", `${Math.round(rotation * 0.52)}deg`);

    if (effect === "dust") {
      appendInvalidDustParticles(cell, delay);
    }
  });
}

function clearInvalidWordGuessAfterShake() {
  clearWordGuessInvalidClearTimer();

  const activeRow = getActiveWordGuessRow();
  const reducedMotion = prefersReducedWordGuessMotion();
  const clearDelay = reducedMotion ? 720 : 3250;

  setWordGuessInputLocked(true);
  if (activeRow && !reducedMotion) {
    activeRow.classList.remove("is-invalid-dissolving");
    prepareInvalidWordGuessGlyphEffects(activeRow);
    void activeRow.offsetWidth;
    activeRow.classList.add("is-invalid-dissolving");
  }

  wordGuessInvalidClearTimeoutId = window.setTimeout(() => {
    wordGuessCurrentGuess = "";
    renderWordGuessBoard();
    setWordGuessInputLocked(false);
    wordGuessInvalidClearTimeoutId = null;
  }, clearDelay);
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
    }, 4400);
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
    type: "word-vote",
    word: wordGuessTarget,
    language: selectedWordGuessLanguage,
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
    wordGuessAchievementsState.feedbackSubmissions = (Number(wordGuessAchievementsState.feedbackSubmissions) || 0) + 1;
    if (normalizedVote === "like") wordGuessAchievementsState.wordLikes = (Number(wordGuessAchievementsState.wordLikes) || 0) + 1;
    if (normalizedVote === "dislike") wordGuessAchievementsState.wordDislikes = (Number(wordGuessAchievementsState.wordDislikes) || 0) + 1;
    persistWordGuessAchievementsState();
    evaluateWordGuessMetaAchievements();
    updateWordGuessFeedbackState();
    if (wordGuessFeedbackMessage) wordGuessFeedbackMessage.textContent = getWordGuessText("feedbackThanks");
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
  if (!wordGuessFeedback) return;
  wordGuessFeedback.hidden = !wordGuessTarget || !wordGuessFinished;
  if (wordGuessFeedbackTitle) wordGuessFeedbackTitle.textContent = getWordGuessText("feedbackWordTitle");
  if (wordGuessLikeBtn) {
    wordGuessLikeBtn.textContent = `👍 ${getWordGuessText("feedbackLike")}`;
    wordGuessLikeBtn.classList.toggle("is-selected", wordGuessFeedbackChoice === "like");
    wordGuessLikeBtn.setAttribute("aria-pressed", wordGuessFeedbackChoice === "like" ? "true" : "false");
  }
  if (wordGuessDislikeBtn) {
    wordGuessDislikeBtn.textContent = `👎 ${getWordGuessText("feedbackDislike")}`;
    wordGuessDislikeBtn.classList.toggle("is-selected", wordGuessFeedbackChoice === "dislike");
    wordGuessDislikeBtn.setAttribute("aria-pressed", wordGuessFeedbackChoice === "dislike" ? "true" : "false");
  }
  if (wordGuessReportBtn) wordGuessReportBtn.textContent = `⚑ ${getWordGuessText("feedbackReport")}`;
  if (wordGuessFeedbackExportBtn) wordGuessFeedbackExportBtn.textContent = getWordGuessText("feedbackExport");
}

function renderDeveloperSupportUi() {
  if (settingsSupportEyebrow) settingsSupportEyebrow.textContent = getWordGuessText("supportEyebrow");
  if (settingsSupportTitle) settingsSupportTitle.textContent = getWordGuessText("supportTitle");
  if (settingsDeveloperReportTitle) settingsDeveloperReportTitle.textContent = getWordGuessText("supportReportTitle");
  if (settingsDeveloperReportText) settingsDeveloperReportText.textContent = getWordGuessText("supportReportText");
  if (settingsResetAllTitle) settingsResetAllTitle.textContent = getWordGuessText("supportResetTitle");
  if (settingsResetAllText) settingsResetAllText.textContent = getWordGuessText("supportResetText");
  if (developerFeedbackEyebrow) developerFeedbackEyebrow.textContent = getWordGuessText("feedbackModalEyebrow");
  if (developerFeedbackTitle) developerFeedbackTitle.textContent = getWordGuessText("feedbackModalTitle");
  if (developerFeedbackCopy) developerFeedbackCopy.textContent = getWordGuessText("feedbackModalCopy");
  if (developerFeedbackText) developerFeedbackText.placeholder = getWordGuessText("feedbackPlaceholder");
  if (developerFeedbackSaveBtn) developerFeedbackSaveBtn.textContent = getWordGuessText("feedbackSave");
  updateWordGuessFeedbackState();
}

function openDeveloperFeedbackModal(context) {
  if (!developerFeedbackModal) return;
  developerFeedbackContext = context === "word" ? "word" : "bug";
  renderDeveloperSupportUi();
  if (developerFeedbackStatus) developerFeedbackStatus.textContent = "";
  if (developerFeedbackText) developerFeedbackText.value = "";
  if (developerFeedbackContextEl) {
    if (developerFeedbackContext === "word" && wordGuessTarget) {
      developerFeedbackContextEl.hidden = false;
      developerFeedbackContextEl.textContent = `${getWordGuessText("feedbackContextWord")}: ${toWordGuessUpper(wordGuessTarget)}`;
    } else {
      developerFeedbackContextEl.hidden = true;
      developerFeedbackContextEl.textContent = "";
    }
  }
  developerFeedbackModal.hidden = false;
  document.body.classList.add("developer-feedback-open");
  if (developerFeedbackText) window.setTimeout(function () { developerFeedbackText.focus(); }, 30);
}

function closeDeveloperFeedbackModal() {
  if (!developerFeedbackModal) return;
  developerFeedbackModal.hidden = true;
  document.body.classList.remove("developer-feedback-open");
}

function saveDeveloperFeedbackReport() {
  const message = developerFeedbackText ? String(developerFeedbackText.value || "").trim() : "";
  if (message.length < 4) {
    if (developerFeedbackStatus) developerFeedbackStatus.textContent = getWordGuessText("feedbackEmpty");
    return;
  }
  const entries = getWordGuessFeedbackEntries();
  entries.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: developerFeedbackContext === "word" ? "word-report" : "bug",
    message,
    word: developerFeedbackContext === "word" ? wordGuessTarget : "",
    language: selectedWordGuessLanguage,
    version: DATA_VERSION,
    revision: ASSET_REVISION,
    screen: getCurrentAppScreenName(),
    userAgent: navigator.userAgent || "",
    createdAt: new Date().toISOString(),
  });
  try {
    localStorage.setItem(WORD_GUESS_FEEDBACK_STORAGE_KEY, JSON.stringify(entries));
    wordGuessAchievementsState.feedbackSubmissions = (Number(wordGuessAchievementsState.feedbackSubmissions) || 0) + 1;
    if (developerFeedbackContext === "bug") {
      wordGuessAchievementsState.bugReports = (Number(wordGuessAchievementsState.bugReports) || 0) + 1;
    }
    persistWordGuessAchievementsState();
    evaluateWordGuessMetaAchievements();
    if (developerFeedbackStatus) developerFeedbackStatus.textContent = getWordGuessText("feedbackSaved");
    if (developerFeedbackText) developerFeedbackText.value = "";
  } catch (error) {
    if (developerFeedbackStatus) developerFeedbackStatus.textContent = getWordGuessText("shareFailed");
  }
}

function resetMovohrayProgressAndSettings() {
  if (!window.confirm(getWordGuessText("supportResetConfirm"))) return;
  MOVOHRAY_USER_RESET_STORAGE_KEYS.forEach(function (key) {
    try { localStorage.removeItem(key); } catch (error) { /* continue reset */ }
  });
  showAppToast(getWordGuessText("supportResetDone"));
  window.setTimeout(function () { window.location.reload(); }, 450);
}

function isWhoAmI() {
  return selectedMode === "whoami";
}

async function loadWhoAmIData() {
  if (whoAmIData && whoAmICategories.length > 0) {
    return true;
  }

  if (whoAmISettingsMessage) {
    whoAmISettingsMessage.textContent = "Завантажуємо ролі...";
  }

  try {
    if (!whoAmIDataPromise) {
      whoAmIDataPromise = fetch(getRevisionedAssetUrl(WHOAMI_DATA_FILE))
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          whoAmIDataPromise = null;
          return data;
        });
    }

    whoAmIData = await whoAmIDataPromise;
    whoAmICategories = normalizeWhoAmICategories(whoAmIData);
    if (whoAmICategories.length === 0) {
      throw new Error("Empty whoami dictionary");
    }

    if (whoAmISelectedCategoryNames.length === 0) {
      whoAmISelectedCategoryNames = whoAmICategories.map((category) => category.name);
    }

    if (whoAmISettingsMessage) {
      whoAmISettingsMessage.textContent = "";
    }

    renderWhoAmISettings();
    return true;
  } catch (error) {
    whoAmIDataPromise = null;
    console.error(`Не вдалося завантажити ${WHOAMI_DATA_FILE}`, error);
    whoAmIData = null;
    whoAmICategories = [];
    if (whoAmISettingsMessage) {
      whoAmISettingsMessage.textContent = "Не вдалося завантажити ролі.";
    }
    return false;
  }
}

function normalizeWhoAmICategories(data) {
  const source = data && data.categories ? data.categories : {};
  return Object.keys(source).map((name) => {
    const levels = source[name] || {};
    return {
      name,
      levels: {
        easy: Array.isArray(levels.easy) ? levels.easy : [],
        medium: Array.isArray(levels.medium) ? levels.medium : [],
        hard: Array.isArray(levels.hard) ? levels.hard : [],
      },
    };
  });
}

function getWhoAmIPlayerName(index) {
  const name = whoAmIPlayers[index];
  if (name && name.trim()) {
    return name.trim();
  }
  return `Гравець ${index + 1}`;
}

function getWhoAmITeamName(index) {
  const name = whoAmITeams[index];
  if (name && name.trim()) {
    return name.trim();
  }
  return `Команда ${index + 1}`;
}

function syncWhoAmIPlayers() {
  const nextPlayers = [];
  for (let index = 0; index < whoAmIPlayerCount; index += 1) {
    nextPlayers.push(whoAmIPlayers[index] || `Гравець ${index + 1}`);
  }
  whoAmIPlayers = nextPlayers;
}

function syncWhoAmITeams() {
  const nextTeams = [];
  for (let index = 0; index < whoAmITeamCount; index += 1) {
    nextTeams.push(whoAmITeams[index] || getDefaultTeamName(index));
  }
  whoAmITeams = nextTeams;
  whoAmITeamScores = Array.from({ length: whoAmITeamCount }, () => 0);
}

function renderWhoAmISettings() {
  renderWhoAmIPlayerFields();
  renderWhoAmITeamFields();
  renderWhoAmICategories();
  updateWhoAmISettingsVisibility();
  syncWhoAmIButtons();
}

function renderWhoAmIPlayerFields() {
  if (!whoAmIPlayerFields) {
    return;
  }

  syncWhoAmIPlayers();
  whoAmIPlayerFields.innerHTML = "";

  for (let index = 0; index < whoAmIPlayerCount; index += 1) {
    const field = document.createElement("div");
    field.className = "team-name-field";

    const label = document.createElement("label");
    label.htmlFor = `whoAmIPlayer${index + 1}`;
    label.textContent = `Гравець ${index + 1}`;

    const input = document.createElement("input");
    input.id = `whoAmIPlayer${index + 1}`;
    input.type = "text";
    input.placeholder = `Гравець ${index + 1}`;
    input.value = getWhoAmIPlayerName(index);
    input.addEventListener("input", (event) => {
      whoAmIPlayers[index] = event.target.value;
    });

    field.appendChild(label);
    field.appendChild(input);
    whoAmIPlayerFields.appendChild(field);
  }

  syncWhoAmISetupSummaries();
}

function renderWhoAmITeamFields() {
  if (!whoAmITeamFields) {
    return;
  }

  syncWhoAmITeams();
  whoAmITeamFields.innerHTML = "";

  for (let index = 0; index < whoAmITeamCount; index += 1) {
    const field = document.createElement("div");
    field.className = "team-name-field";

    const label = document.createElement("label");
    label.htmlFor = `whoAmITeam${index + 1}`;
    label.textContent = getDefaultTeamName(index);

    const input = document.createElement("input");
    input.id = `whoAmITeam${index + 1}`;
    input.type = "text";
    input.placeholder = getDefaultTeamName(index);
    input.value = getWhoAmITeamName(index);
    input.addEventListener("input", (event) => {
      whoAmITeams[index] = event.target.value;
    });

    field.appendChild(label);
    field.appendChild(input);
    whoAmITeamFields.appendChild(field);
  }
}

function renderWhoAmICategories() {
  if (!whoAmICategoryList) {
    return;
  }

  whoAmICategoryList.innerHTML = "";

  const summaryCard = document.createElement("div");
  summaryCard.className = "whoami-category-summary-card";

  const summaryCopy = document.createElement("div");
  summaryCopy.className = "whoami-category-summary-copy";
  const summaryTitle = document.createElement("strong");
  summaryTitle.textContent = getWhoAmICategorySummaryTitle();
  const summaryText = document.createElement("span");
  summaryText.textContent = getWhoAmICategoryStatus();
  summaryCopy.appendChild(summaryTitle);
  summaryCopy.appendChild(summaryText);

  const changeButton = document.createElement("button");
  changeButton.className = "secondary-btn whoami-category-change";
  changeButton.type = "button";
  changeButton.textContent = "Змінити категорії";
  changeButton.addEventListener("click", openWhoAmICategoriesModal);

  summaryCard.appendChild(summaryCopy);
  summaryCard.appendChild(changeButton);
  whoAmICategoryList.appendChild(summaryCard);

  renderWhoAmICategoryModalList();
}

function renderWhoAmICategoryModalList() {
  if (!whoAmICategoryModalList) {
    return;
  }

  whoAmICategoryModalList.innerHTML = "";

  const controls = document.createElement("div");
  controls.className = "category-picker-controls whoami-category-controls";

  const allButton = document.createElement("button");
  allButton.className = "secondary-btn whoami-category-mini-btn";
  allButton.type = "button";
  allButton.textContent = "Усі ролі";
  allButton.addEventListener("click", () => {
    whoAmISelectedCategoryNames = whoAmICategories.map((category) => category.name);
    renderWhoAmICategories();
  });

  const clearButton = document.createElement("button");
  clearButton.className = "secondary-btn whoami-category-mini-btn";
  clearButton.type = "button";
  clearButton.textContent = "Очистити";
  clearButton.addEventListener("click", () => {
    whoAmISelectedCategoryNames = [];
    renderWhoAmICategories();
  });

  controls.appendChild(allButton);
  controls.appendChild(clearButton);

  const list = document.createElement("div");
  list.className = "category-list whoami-category-list whoami-category-grid";

  whoAmICategories.forEach((category) => {
    const button = document.createElement("button");
    const isSelected = whoAmISelectedCategoryNames.indexOf(category.name) >= 0;
    button.className = "whoami-category-option";
    button.type = "button";
    const title = document.createElement("span");
    title.className = "whoami-category-option-title";
    const nameText = document.createElement("span");
    nameText.textContent = category.name;
    const check = document.createElement("span");
    check.className = "whoami-category-check";
    check.setAttribute("aria-hidden", "true");
    check.textContent = "✓";
    title.appendChild(nameText);
    title.appendChild(check);
    const countText = document.createElement("small");
    countText.textContent = `${getWhoAmICategoryCount(category)} ролей`;
    button.appendChild(title);
    button.appendChild(countText);
    button.classList.toggle("selected", isSelected);
    button.setAttribute("aria-pressed", isSelected ? "true" : "false");
    button.addEventListener("click", () => {
      if (isSelected) {
        whoAmISelectedCategoryNames = whoAmISelectedCategoryNames.filter((name) => name !== category.name);
      } else {
        whoAmISelectedCategoryNames = whoAmISelectedCategoryNames.concat(category.name);
      }
      renderWhoAmICategories();
    });
    list.appendChild(button);
  });

  whoAmICategoryModalList.appendChild(controls);
  whoAmICategoryModalList.appendChild(list);
}

function getWhoAmICategorySummaryTitle() {
  const count = whoAmISelectedCategoryNames.length;
  if (count === whoAmICategories.length) {
    return "Усі ролі";
  }
  if (count === 0) {
    return "Категорії не вибрано";
  }
  return `Вибрано ${count} категорій`;
}

function getWhoAmICategoryStatus() {
  const count = whoAmISelectedCategoryNames.length;
  if (count === 0) {
    return "Оберіть хоча б одну категорію.";
  }
  if (count === whoAmICategories.length) {
    return `Усі категорії · ${getWhoAmIRolePool().length} ролей`;
  }
  return `${count} категорій · ${getWhoAmIRolePool().length} ролей`;
}

function getWhoAmICategoryCount(category) {
  let total = 0;
  whoAmISelectedDifficulties.forEach((difficulty) => {
    total += category.levels[difficulty].length;
  });
  return total;
}

function syncWhoAmISetupSummaries() {
  if (whoAmIPlayerCountSummary) {
    whoAmIPlayerCountSummary.textContent = `Кількість: ${whoAmIPlayerCount}`;
  }
  if (whoAmIEditPlayersBtn) {
    whoAmIEditPlayersBtn.textContent = "Змінити імена";
    whoAmIEditPlayersBtn.setAttribute("aria-label", `Змінити імена гравців, зараз ${whoAmIPlayerCount}`);
  }
}

function closeWhoAmISetupDropdowns(exceptPicker) {
  if (whoAmIPlayerCountPicker && whoAmIPlayerCountPicker !== exceptPicker) {
    whoAmIPlayerCountPicker.removeAttribute("open");
  }
}

function openWhoAmIPlayersModal() {
  closeWhoAmISetupDropdowns();
  closeWhoAmICategoriesModal();
  renderWhoAmIPlayerFields();
  if (whoAmIPlayersModal) {
    whoAmIPlayersModal.hidden = false;
  }
}

function closeWhoAmIPlayersModal() {
  if (whoAmIPlayersModal) {
    whoAmIPlayersModal.hidden = true;
  }
}

function openWhoAmICategoriesModal() {
  closeWhoAmISetupDropdowns();
  closeWhoAmIPlayersModal();
  renderWhoAmICategoryModalList();
  if (whoAmICategoriesModal) {
    whoAmICategoriesModal.hidden = false;
  }
}

function closeWhoAmICategoriesModal() {
  if (whoAmICategoriesModal) {
    whoAmICategoriesModal.hidden = true;
  }
}

function getWhoAmIRolePool() {
  const selectedNames = whoAmISelectedCategoryNames;
  const roles = [];

  whoAmICategories.forEach((category) => {
    if (selectedNames.indexOf(category.name) < 0) {
      return;
    }

    whoAmISelectedDifficulties.forEach((difficulty) => {
      category.levels[difficulty].forEach((role) => {
        roles.push({
          role,
          category: category.name,
          difficulty,
          status: "active",
        });
      });
    });
  });

  return roles;
}

function syncWhoAmIButtons() {
  whoAmIShowModeButtons.forEach((button) => {
    button.classList.toggle("selected", button.dataset.whoamiShowMode === whoAmIShowMode);
  });
  whoAmIPartyModeButtons.forEach((button) => {
    button.classList.toggle("selected", button.dataset.whoamiPartyMode === whoAmIPartyMode);
  });
  whoAmIPlayerCountButtons.forEach((button) => {
    button.classList.toggle("selected", Number(button.dataset.whoamiPlayers) === whoAmIPlayerCount);
  });
  whoAmIDifficultyButtons.forEach((button) => {
    const active = whoAmISelectedDifficulties.indexOf(button.dataset.whoamiDifficulty) >= 0;
    button.classList.toggle("selected", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });
  whoAmIDurationButtons.forEach((button) => {
    button.classList.toggle("selected", Number(button.dataset.whoamiSeconds) === whoAmIDuration);
  });
  whoAmITeamCountButtons.forEach((button) => {
    button.classList.toggle("selected", Number(button.dataset.whoamiTeams) === whoAmITeamCount);
  });

  syncWhoAmISetupSummaries();
}

function updateWhoAmISettingsVisibility() {
  if (whoAmIPlayersSection) {
    whoAmIPlayersSection.hidden = whoAmIPartyMode !== "turns";
  }
  if (whoAmITimedSection) {
    whoAmITimedSection.hidden = whoAmIPartyMode !== "timed";
  }
}

function validateWhoAmISettings() {
  const pool = getWhoAmIRolePool();
  if (whoAmISelectedDifficulties.length === 0) {
    whoAmISettingsMessage.textContent = "Оберіть хоча б один рівень складності.";
    return false;
  }
  if (whoAmISelectedCategoryNames.length === 0) {
    whoAmISettingsMessage.textContent = "Оберіть хоча б одну категорію.";
    return false;
  }
  if (pool.length === 0) {
    whoAmISettingsMessage.textContent = "Для цих категорій немає ролей.";
    return false;
  }
  if (whoAmIPartyMode === "turns" && pool.length < whoAmIPlayerCount) {
    whoAmISettingsMessage.textContent = "Ролей менше, ніж гравців. Додайте категорії або складність.";
    return false;
  }
  whoAmISettingsMessage.textContent = "";
  return true;
}

function startWhoAmIGame() {
  if (!validateWhoAmISettings()) {
    return;
  }

  clearWhoAmITimer();
  whoAmIDeck = shuffleArray(getWhoAmIRolePool());
  whoAmIRound = 1;
  whoAmIRoundLog = [];
  whoAmIResultMode = "continue";

  if (whoAmIPartyMode === "turns") {
    startWhoAmITurnsGame();
    return;
  }

  if (whoAmIPartyMode === "timed") {
    startWhoAmITimedGame();
    return;
  }

  startWhoAmISingleRole();
}

function takeWhoAmIRole() {
  if (whoAmIDeck.length === 0) {
    whoAmIDeck = shuffleArray(getWhoAmIRolePool());
  }
  return whoAmIDeck.pop();
}

function replaceWhoAmIAssignmentRole(assignment) {
  if (!assignment) {
    return false;
  }

  const nextRole = takeWhoAmIRole();
  if (!nextRole) {
    return false;
  }

  assignment.role = nextRole.role;
  assignment.category = nextRole.category;
  assignment.difficulty = nextRole.difficulty;
  assignment.guessed = false;
  assignment.skipped = false;
  assignment.guessedRound = 0;
  return true;
}

function startWhoAmITurnsGame() {
  syncWhoAmIPlayers();
  whoAmIAssignments = [];
  for (let index = 0; index < whoAmIPlayerCount; index += 1) {
    const role = takeWhoAmIRole();
    whoAmIAssignments.push({
      player: getWhoAmIPlayerName(index),
      role: role.role,
      category: role.category,
      difficulty: role.difficulty,
      guessed: false,
      skipped: false,
      yes: 0,
      no: 0,
      turns: 0,
      guessedRound: 0,
    });
  }

  whoAmIRevealIndex = 0;
  whoAmIRoleVisible = false;
  whoAmICurrentIndex = 0;
  if (whoAmIShowMode === "forehead") {
    showWhoAmITurnIntro();
    return;
  }
  showWhoAmIReveal();
}

function startWhoAmISingleRole() {
  const role = takeWhoAmIRole();
  whoAmIAssignments = [{
    player: "Гравець",
    role: role.role,
    category: role.category,
    difficulty: role.difficulty,
    guessed: false,
    skipped: false,
    yes: 0,
    no: 0,
    turns: 0,
    guessedRound: 0,
  }];
  whoAmICurrentIndex = 0;
  beginWhoAmITurn();
}

function startWhoAmITimedGame() {
  syncWhoAmITeams();
  whoAmITimedTeamIndex = 0;
  whoAmITeamScores = Array.from({ length: whoAmITeamCount }, () => 0);
  startWhoAmITimedRound();
}

function startWhoAmITimedRound() {
  whoAmITimedRoles = [];
  whoAmITimeLeft = whoAmIDuration;
  whoAmITimerRemainingMs = whoAmIDuration * 1000;
  whoAmITimerLastCountdownSecond = null;
  whoAmITimerPauseReasons = {};
  whoAmITimerIsActive = true;
  whoAmICurrentIndex = 0;
  startWhoAmIActiveTurn();
  startWhoAmITimer();
}

function showWhoAmIReveal() {
  const assignment = whoAmIAssignments[whoAmIRevealIndex];
  if (!assignment) {
    showWhoAmITurnIntro();
    return;
  }

  whoAmIFlowStage = "deal";
  whoAmIRoleVisible = false;
  whoAmIRevealRoleBox.hidden = true;
  if (whoAmIRevealChangeRoleBtn) {
    whoAmIRevealChangeRoleBtn.hidden = true;
  }
  whoAmIRevealStep.textContent = `Роль ${whoAmIRevealIndex + 1} з ${whoAmIAssignments.length}`;
  whoAmIRevealTitle.textContent = `${assignment.player} має відвернутися від екрана`;
  whoAmIRevealInstruction.textContent = "Покажіть роль іншим учасникам. Сам гравець не повинен бачити екран.";
  whoAmIRevealPrimaryBtn.textContent = "Показати роль іншим";
  showScreen("whoAmIReveal");
}

function handleWhoAmIRevealPrimary() {
  if (whoAmIFlowStage === "turn-host" || whoAmIFlowStage === "turn-forehead") {
    startWhoAmIActiveTurn();
    return;
  }

  const assignment = whoAmIAssignments[whoAmIRevealIndex];
  if (!assignment) {
    showWhoAmITurnIntro();
    return;
  }

  if (!whoAmIRoleVisible) {
    whoAmIRoleVisible = true;
    whoAmIRevealRoleBox.hidden = false;
    if (whoAmIRevealChangeRoleBtn) {
      whoAmIRevealChangeRoleBtn.hidden = false;
    }
    whoAmIRevealCategory.textContent = assignment.category;
    whoAmIRevealRole.textContent = assignment.role;
    whoAmIRevealTitle.textContent = assignment.player;
    whoAmIRevealInstruction.textContent = "Усі запам'ятали? Натисніть кнопку, щоб сховати роль.";
    whoAmIRevealPrimaryBtn.textContent = "Усі запам'ятали";
    playGameSound("reveal");
    playHapticFeedback("tap");
    return;
  }

  whoAmIRevealIndex += 1;
  playGameSound("uiClose");
  if (whoAmIRevealIndex >= whoAmIAssignments.length) {
    showWhoAmITurnIntro();
    return;
  }

  showWhoAmIReveal();
}

function changeWhoAmIRevealRole() {
  const assignment = whoAmIAssignments[whoAmIRevealIndex];
  if (!whoAmIRoleVisible || !assignment) {
    return;
  }

  if (!replaceWhoAmIAssignmentRole(assignment)) {
    return;
  }

  whoAmIRevealCategory.textContent = assignment.category;
  whoAmIRevealRole.textContent = assignment.role;
  playHapticFeedback("tap");
}

function beginWhoAmITurn() {
  playGameSound("turnChange");
  showWhoAmITurnIntro();
}

function showWhoAmITurnIntro() {
  const assignment = getWhoAmICurrentAssignment();
  if (!assignment) {
    showWhoAmIFinal();
    return;
  }

  whoAmIRoleVisible = false;
  whoAmIRevealRoleBox.hidden = true;
  if (whoAmIRevealChangeRoleBtn) {
    whoAmIRevealChangeRoleBtn.hidden = true;
  }
  whoAmIRevealStep.textContent = whoAmIPartyMode === "turns" ? `Коло ${whoAmIRound}` : "Хід";

  if (whoAmIShowMode === "forehead") {
    whoAmIFlowStage = "turn-forehead";
    whoAmIRevealTitle.textContent = `Передайте телефон гравцю ${assignment.player}`;
    whoAmIRevealInstruction.textContent = "Піднесіть телефон до чола екраном до інших. Сам гравець фізично не бачить роль.";
    whoAmIRevealPrimaryBtn.textContent = "Показати роль";
  } else {
    whoAmIFlowStage = "turn-host";
    whoAmIRevealTitle.textContent = "Передайте телефон ведучому";
    whoAmIRevealInstruction.textContent = `Гравець ${assignment.player} не повинен бачити екран.`;
    whoAmIRevealPrimaryBtn.textContent = "Почати хід";
  }

  showScreen("whoAmIReveal");
}

function startWhoAmIActiveTurn() {
  const assignment = getWhoAmICurrentAssignment();
  if (!assignment) {
    showWhoAmIFinal();
    return;
  }

  if (whoAmIPartyMode === "turns") {
    assignment.turns += 1;
  }

  whoAmIFlowStage = "game";
  renderWhoAmIGame();
  showScreen("whoAmIGame");
}

function getWhoAmICurrentAssignment() {
  if (whoAmIPartyMode === "timed") {
    if (!whoAmIAssignments[0] || whoAmIAssignments[0].guessed || whoAmIAssignments[0].skipped) {
      const role = takeWhoAmIRole();
      whoAmIAssignments[0] = {
        player: whoAmITeamCount > 0 ? getWhoAmITeamName(whoAmITimedTeamIndex) : "Гравець",
        role: role.role,
        category: role.category,
        difficulty: role.difficulty,
        guessed: false,
        skipped: false,
        yes: 0,
        no: 0,
        turns: 0,
        guessedRound: 0,
      };
    }
    return whoAmIAssignments[0];
  }

  return whoAmIAssignments[whoAmICurrentIndex];
}

function renderWhoAmIGame() {
  const assignment = getWhoAmICurrentAssignment();
  if (!assignment) {
    return;
  }

  const isTimed = whoAmIPartyMode === "timed";
  const isSingle = whoAmIPartyMode === "single";
  whoAmIGameKicker.textContent = isTimed ? "РАУНД" : "ХІД ГРАВЦЯ";
  whoAmICurrentPlayer.textContent = assignment.player;
  whoAmIGameInfo.textContent = isTimed
    ? `${whoAmITimedRoles.filter((item) => item.status === "guessed").length} вгадано · ${whoAmITimedRoles.filter((item) => item.status === "skipped").length} пропущено`
    : isSingle ? "Одна роль" : `Коло ${whoAmIRound}`;

  whoAmITimerBox.hidden = !isTimed;
  whoAmITimerText.textContent = whoAmITimeLeft;
  if (whoAmIAnswerGrid) {
    whoAmIAnswerGrid.classList.add("is-two-answer");
  }

  const showForehead = whoAmIShowMode === "forehead";
  if (whoAmIGameScreen) {
    whoAmIGameScreen.classList.toggle("is-whoami-timed", isTimed);
    whoAmIGameScreen.classList.toggle("is-whoami-turns", whoAmIPartyMode === "turns");
    whoAmIGameScreen.classList.toggle("is-whoami-forehead", showForehead);
    whoAmIGameScreen.classList.toggle("is-whoami-host", !showForehead);
  }
  whoAmIForeheadCard.hidden = !showForehead;
  if (showForehead) {
    whoAmIForeheadCategory.textContent = assignment.category;
    whoAmIForeheadRole.textContent = assignment.role;
  }

  updateWhoAmICurrentSpoiler(assignment, !showForehead);
  if (whoAmIParticipantsBtn) {
    const count = whoAmIPartyMode === "turns" ? whoAmIAssignments.length : whoAmITeamCount > 0 ? whoAmITeamCount : 1;
    whoAmIParticipantsBtn.textContent = `Учасники · ${count}`;
  }
  if (whoAmISkipRoleBtn) {
    whoAmISkipRoleBtn.hidden = whoAmIPartyMode === "turns";
  }

  renderWhoAmIPlayersBoard();
}

function updateWhoAmICurrentSpoiler(assignment, visible) {
  hideWhoAmISpoiler();
  if (!whoAmICurrentSpoiler || !whoAmICurrentSpoilerBtn || !whoAmICurrentSpoilerValue) {
    return;
  }

  whoAmICurrentSpoiler.hidden = !visible;
  if (!visible || !assignment) {
    return;
  }

  whoAmICurrentSpoilerBtn.textContent = `Роль ${assignment.player} — утримуйте, щоб нагадати`;
  whoAmICurrentSpoilerBtn.dataset.whoamiRole = assignment.role;
  whoAmICurrentSpoilerBtn.dataset.whoamiCategory = assignment.category;
  whoAmICurrentSpoilerBtn.dataset.whoamiPlayer = assignment.player;
  whoAmICurrentSpoilerBtn.setAttribute("aria-controls", "whoAmICurrentSpoilerValue");
  whoAmICurrentSpoilerBtn.setAttribute("aria-label", `Роль ${assignment.player}. Натисніть або утримуйте, щоб нагадати роль`);
  whoAmICurrentSpoilerWarning.textContent = `Не показуйте екран гравцю ${assignment.player}`;
  whoAmICurrentSpoilerRole.textContent = assignment.role;
  whoAmICurrentSpoilerCategory.textContent = assignment.category;
}

function showWhoAmISpoiler(button) {
  if (!button) {
    return;
  }

  hideWhoAmISpoiler();
  whoAmIActiveSpoilerButton = button;
  button.classList.add("is-revealed");
  button.setAttribute("aria-pressed", "true");
  button.setAttribute("aria-expanded", "true");

  const targetId = button.getAttribute("aria-controls");
  const target = targetId ? document.getElementById(targetId) : whoAmICurrentSpoilerValue;
  if (target) {
    target.hidden = false;
    target.classList.add("is-revealed");
  }

  playGameSound("reveal");
  whoAmISpoilerTimeoutId = window.setTimeout(hideWhoAmISpoiler, 2500);
}

function hideWhoAmISpoiler() {
  const hadVisibleSpoiler = !!whoAmIActiveSpoilerButton;
  if (whoAmISpoilerTimeoutId) {
    window.clearTimeout(whoAmISpoilerTimeoutId);
    whoAmISpoilerTimeoutId = null;
  }

  if (whoAmIActiveSpoilerButton) {
    const targetId = whoAmIActiveSpoilerButton.getAttribute("aria-controls");
    const target = targetId ? document.getElementById(targetId) : whoAmICurrentSpoilerValue;
    whoAmIActiveSpoilerButton.classList.remove("is-revealed");
    whoAmIActiveSpoilerButton.setAttribute("aria-pressed", "false");
    whoAmIActiveSpoilerButton.setAttribute("aria-expanded", "false");
    if (target) {
      target.hidden = true;
      target.classList.remove("is-revealed");
    }
  }

  if (whoAmICurrentSpoilerValue) {
    whoAmICurrentSpoilerValue.hidden = true;
    whoAmICurrentSpoilerValue.classList.remove("is-revealed");
  }

  whoAmIActiveSpoilerButton = null;
  if (hadVisibleSpoiler) {
    playGameSound("uiClose");
  }
}

function bindWhoAmISpoilerButton(button) {
  if (!button || button.dataset.whoamiSpoilerBound === "true") {
    return;
  }

  button.dataset.whoamiSpoilerBound = "true";
  button.setAttribute("aria-pressed", "false");
  button.setAttribute("aria-expanded", "false");

  let suppressClick = false;
  let pressStartedAt = 0;
  const start = (event) => {
    if (event && event.cancelable) {
      event.preventDefault();
    }
    pressStartedAt = Date.now();
    showWhoAmISpoiler(button);
  };
  const end = (event) => {
    const pressDuration = pressStartedAt ? Date.now() - pressStartedAt : 0;
    hideWhoAmISpoiler();
    if (event && (event.type === "touchend" || event.type === "touchcancel" || pressDuration > 260)) {
      suppressClick = true;
      window.setTimeout(() => {
        suppressClick = false;
      }, 350);
    }
    pressStartedAt = 0;
  };
  const revealForClick = () => {
    if (suppressClick) {
      return;
    }
    showWhoAmISpoiler(button);
  };
  const revealForKeyboard = (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }
    event.preventDefault();
    showWhoAmISpoiler(button);
  };

  button.addEventListener("touchstart", start, { passive: false });
  button.addEventListener("touchend", end);
  button.addEventListener("touchcancel", end);
  button.addEventListener("mousedown", start);
  button.addEventListener("mouseup", end);
  button.addEventListener("mouseleave", end);
  button.addEventListener("blur", end);
  button.addEventListener("click", revealForClick);
  button.addEventListener("keydown", revealForKeyboard);

  if (window.PointerEvent) {
    button.addEventListener("pointerdown", start);
    button.addEventListener("pointerup", end);
    button.addEventListener("pointercancel", end);
    button.addEventListener("pointerleave", end);
  }
}

function renderWhoAmIPlayersBoard() {
  if (!whoAmIPlayersBoard) {
    return;
  }

  whoAmIPlayersBoard.innerHTML = "";
  if (whoAmIPartyMode === "timed") {
    renderWhoAmITimedBoard();
    return;
  }

  whoAmIAssignments.forEach((assignment, index) => {
    const item = document.createElement("div");
    item.className = "whoami-player-item";
    item.classList.toggle("is-current", index === whoAmICurrentIndex);
    item.classList.toggle("is-done", assignment.guessed);
    item.classList.toggle("is-out", assignment.skipped);
    const status = index === whoAmICurrentIndex ? "грає" : assignment.guessed ? "відгадав" : assignment.skipped ? "вибув" : "у грі";
    appendTextElement(item, "strong", "", assignment.player);
    appendTextElement(item, "span", "", status);
    appendTextElement(item, "em", "", "роль прихована");
    appendTextElement(item, "small", "", `так ${assignment.yes} · ні ${assignment.no}`);
    whoAmIPlayersBoard.appendChild(item);
  });
}

function renderWhoAmITimedBoard() {
  const guessed = whoAmITimedRoles.filter((item) => item.status === "guessed").length;
  const skippedCount = whoAmITimedRoles.filter((item) => item.status === "skipped").length;
  const summary = document.createElement("div");
  summary.className = "whoami-player-item is-current";
  appendTextElement(summary, "strong", "", String(guessed));
  appendTextElement(summary, "span", "", "вгадано");
  appendTextElement(summary, "small", "", `${skippedCount} пропущено`);
  whoAmIPlayersBoard.appendChild(summary);

  if (whoAmITeamCount > 0) {
    whoAmITeamScores.forEach((scoreValue, index) => {
      const item = document.createElement("div");
      item.className = "whoami-player-item";
      item.classList.toggle("is-current", index === whoAmITimedTeamIndex);
      appendTextElement(item, "strong", "", getWhoAmITeamName(index));
      appendTextElement(item, "span", "", `${scoreValue} очок`);
      appendTextElement(item, "small", "", index === whoAmITimedTeamIndex ? "грає зараз" : "очікує");
      whoAmIPlayersBoard.appendChild(item);
    });
  }
}

function handleWhoAmIAnswer(type) {
  const assignment = getWhoAmICurrentAssignment();
  if (!assignment) {
    return;
  }

  if (type !== "yes" && type !== "no") {
    return;
  }

  assignment[type] += 1;

  if (type === "yes") {
    playGameSound("positiveTick");
    playHapticFeedback("tap");
  } else {
    playSkipSound();
  }

  flashWhoAmIAnswer(type);

  if (whoAmIPartyMode === "turns" && type === "no") {
    moveToNextWhoAmIPlayer();
    return;
  }

  renderWhoAmIGame();
}

function flashWhoAmIAnswer(type) {
  if (!whoAmIGameScreen) {
    return;
  }

  whoAmIGameScreen.classList.remove("whoami-feedback-yes", "whoami-feedback-no");
  void whoAmIGameScreen.offsetWidth;
  whoAmIGameScreen.classList.add(`whoami-feedback-${type}`);
  window.setTimeout(() => {
    whoAmIGameScreen.classList.remove("whoami-feedback-yes", "whoami-feedback-no");
  }, 420);
}

function markWhoAmIGuessed() {
  const assignment = getWhoAmICurrentAssignment();
  if (!assignment) {
    return;
  }

  openWhoAmIConfirmModal(assignment);
}

function changeWhoAmICurrentRole() {
  const assignment = getWhoAmICurrentAssignment();
  if (!assignment) {
    return;
  }

  if (!replaceWhoAmIAssignmentRole(assignment)) {
    return;
  }

  hideWhoAmISpoiler();
  playHapticFeedback("tap");
  renderWhoAmIGame();
}

function confirmWhoAmIGuessed() {
  const assignment = whoAmIPendingGuessAssignment || getWhoAmICurrentAssignment();
  closeWhoAmIConfirmModal({ resumeTimer: false });
  if (!assignment) {
    return;
  }

  assignment.guessed = true;
  assignment.guessedRound = whoAmIRound;
  playCorrectSound();

  if (whoAmIPartyMode === "timed") {
    whoAmITimedRoles.push({
      role: assignment.role,
      category: assignment.category,
      status: "guessed",
    });
    if (whoAmITeamCount > 0) {
      whoAmITeamScores[whoAmITimedTeamIndex] += 1;
    }
    whoAmIAssignments[0] = null;
    delete whoAmITimerPauseReasons["guess-confirm"];
    resumeWhoAmITimer();
    beginWhoAmITurn();
    return;
  }

  if (whoAmIPartyMode === "single") {
    showWhoAmIRound("single");
    return;
  }

  if (getWhoAmIActiveAssignments().length <= 1) {
    showWhoAmIFinal();
    return;
  }

  moveToNextWhoAmIPlayer();
}

function openWhoAmIConfirmModal(assignment) {
  if (!whoAmIConfirmModal) {
    whoAmIPendingGuessAssignment = assignment;
    confirmWhoAmIGuessed();
    return;
  }

  whoAmIPendingGuessAssignment = assignment;
  if (whoAmIConfirmText) {
    whoAmIConfirmText.textContent = `${assignment.player} справді правильно назвав свою роль?`;
  }
  pauseWhoAmITimer("guess-confirm");
  whoAmIConfirmModal.hidden = false;
  document.body.classList.add("modal-open");
  playGameSound("uiOpen");
}

function closeWhoAmIConfirmModal(options) {
  const settings = options || {};
  if (whoAmIConfirmModal) {
    whoAmIConfirmModal.hidden = true;
  }
  document.body.classList.remove("modal-open");
  whoAmIPendingGuessAssignment = null;
  playGameSound("uiClose");
  if (settings.resumeTimer !== false) {
    resumeWhoAmITimer("guess-confirm");
  }
}

function skipWhoAmIRole() {
  const assignment = getWhoAmICurrentAssignment();
  if (!assignment) {
    return;
  }

  assignment.skipped = true;
  playSkipSound();

  if (whoAmIPartyMode === "timed") {
    whoAmITimedRoles.push({
      role: assignment.role,
      category: assignment.category,
      status: "skipped",
    });
    whoAmIAssignments[0] = null;
    beginWhoAmITurn();
    return;
  }

  if (whoAmIPartyMode === "single") {
    showWhoAmIRound("single");
    return;
  }

  moveToNextWhoAmIPlayer();
}

function getWhoAmIActiveAssignments() {
  return whoAmIAssignments.filter((assignment) => assignment && !assignment.guessed && !assignment.skipped);
}

function moveToNextWhoAmIPlayer() {
  const active = getWhoAmIActiveAssignments();
  if (active.length === 0) {
    showWhoAmIFinal();
    return;
  }

  let guard = 0;
  do {
    whoAmICurrentIndex = (whoAmICurrentIndex + 1) % whoAmIAssignments.length;
    if (whoAmICurrentIndex === 0) {
      whoAmIRound += 1;
    }
    guard += 1;
  } while (
    guard <= whoAmIAssignments.length
    && whoAmIAssignments[whoAmICurrentIndex]
    && (whoAmIAssignments[whoAmICurrentIndex].guessed || whoAmIAssignments[whoAmICurrentIndex].skipped)
  );

  beginWhoAmITurn();
}

function hasTimerPauseReasons(reasons) {
  return Object.keys(reasons).some((reason) => reasons[reason]);
}

function clearWhoAmITimerHandle() {
  if (whoAmITimerId) {
    clearInterval(whoAmITimerId);
    whoAmITimerId = null;
  }
}

function isWhoAmITimedStageActive() {
  return whoAmIPartyMode === "timed"
    && (isScreenActive(whoAmIGameScreen) || isScreenActive(whoAmIRevealScreen));
}

function updateWhoAmITimerFromDeadline(now) {
  if (!whoAmITimerIsActive || !whoAmITimerDeadlineMs) {
    return;
  }
  whoAmITimerRemainingMs = Math.max(0, whoAmITimerDeadlineMs - (typeof now === "number" ? now : Date.now()));
  const nextSeconds = Math.max(0, Math.ceil(whoAmITimerRemainingMs / 1000));
  whoAmITimeLeft = nextSeconds;
  if (whoAmITimerText) {
    whoAmITimerText.textContent = whoAmITimeLeft;
  }
  if (nextSeconds > 0 && nextSeconds <= 3 && nextSeconds !== whoAmITimerLastCountdownSecond) {
    whoAmITimerLastCountdownSecond = nextSeconds;
    playGameSound("countdown");
  }
  if (whoAmITimerRemainingMs <= 0) {
    finishWhoAmITimedRound();
  }
}

function startWhoAmITimerInterval() {
  if (whoAmITimerId || !whoAmITimerIsActive || hasTimerPauseReasons(whoAmITimerPauseReasons) || whoAmITimerRemainingMs <= 0) {
    return;
  }
  whoAmITimerId = setInterval(updateWhoAmITimerFromDeadline, 250);
}

function startWhoAmITimer() {
  clearWhoAmITimerHandle();
  if (!whoAmITimerIsActive || hasTimerPauseReasons(whoAmITimerPauseReasons) || whoAmITimerRemainingMs <= 0) {
    return;
  }
  whoAmITimerDeadlineMs = Date.now() + whoAmITimerRemainingMs;
  updateWhoAmITimerFromDeadline();
  startWhoAmITimerInterval();
}

function pauseWhoAmITimer(reason) {
  if (!reason || !whoAmITimerIsActive) {
    return false;
  }
  if (!whoAmITimerPauseReasons[reason]) {
    if (whoAmITimerId && whoAmITimerDeadlineMs) {
      whoAmITimerRemainingMs = Math.max(0, whoAmITimerDeadlineMs - Date.now());
      whoAmITimeLeft = Math.max(0, Math.ceil(whoAmITimerRemainingMs / 1000));
    }
    whoAmITimerPauseReasons[reason] = true;
  }
  whoAmITimerDeadlineMs = 0;
  clearWhoAmITimerHandle();
  if (whoAmITimerText) {
    whoAmITimerText.textContent = whoAmITimeLeft;
  }
  return true;
}

function resumeWhoAmITimer(reason) {
  if (reason) {
    delete whoAmITimerPauseReasons[reason];
  }
  if (!whoAmITimerIsActive || hasTimerPauseReasons(whoAmITimerPauseReasons) || !isWhoAmITimedStageActive()) {
    return;
  }
  if (whoAmITimerId) {
    return;
  }
  if (whoAmITimerRemainingMs <= 0) {
    finishWhoAmITimedRound();
    return;
  }
  startWhoAmITimer();
}

function clearWhoAmITimer() {
  clearWhoAmITimerHandle();
  whoAmITimerDeadlineMs = 0;
  whoAmITimerRemainingMs = 0;
  whoAmITimerIsActive = false;
  whoAmITimerPauseReasons = {};
}

function finishWhoAmITimedRound() {
  if (!whoAmITimerIsActive) {
    return;
  }
  clearWhoAmITimer();
  playRoundCompleteSound();
  showWhoAmIRound("timed");
}

function showWhoAmIRound(mode) {
  clearWhoAmITimer();
  const isTimed = mode === "timed";
  const roles = isTimed ? whoAmITimedRoles : whoAmIAssignments;
  const guessed = roles.filter((item) => item && (item.status === "guessed" || item.guessed)).length;
  const skippedCount = roles.filter((item) => item && (item.status === "skipped" || item.skipped)).length;

  whoAmIRoundTitle.textContent = isTimed ? "Раунд завершено" : "Роль завершено";
  whoAmIRoundSummary.textContent = `${guessed} вгадано · ${skippedCount} пропущено`;
  whoAmIRoundRoles.innerHTML = "";

  roles.forEach((item) => {
    if (!item) {
      return;
    }
    const row = document.createElement("div");
    row.className = "whoami-role-row";
    const status = item.status || (item.guessed ? "guessed" : item.skipped ? "skipped" : "active");
    appendTextElement(row, "strong", "", item.role);
    appendTextElement(row, "span", "", item.category);
    const statusButton = appendTextElement(row, "button", "setting-chip", status === "guessed" ? "Вгадано" : "Пропущено");
    statusButton.type = "button";
    statusButton.dataset.whoamiToggleRole = item.role;
    whoAmIRoundRoles.appendChild(row);
  });

  renderWhoAmIRoundScoreBoard();
  whoAmIRoundNextBtn.textContent = isTimed && whoAmITeamCount > 0 && whoAmITimedTeamIndex < whoAmITeamCount - 1
    ? "Наступна команда"
    : "Показати результат";
  whoAmIResultMode = isTimed ? "timed" : "single";
  showScreen("whoAmIRound");
}

function renderWhoAmIRoundScoreBoard() {
  if (!whoAmIRoundScoreBoard) {
    return;
  }
  whoAmIRoundScoreBoard.innerHTML = "";
  if (whoAmITeamCount <= 0) {
    return;
  }
  whoAmITeamScores.forEach((scoreValue, index) => {
    const row = document.createElement("div");
    row.className = "team-score-row";
    appendTextElement(row, "span", "", getWhoAmITeamName(index));
    appendTextElement(row, "strong", "", String(scoreValue));
    whoAmIRoundScoreBoard.appendChild(row);
  });
}

function continueAfterWhoAmIRound() {
  if (whoAmIResultMode === "timed" && whoAmITeamCount > 0 && whoAmITimedTeamIndex < whoAmITeamCount - 1) {
    whoAmITimedTeamIndex += 1;
    startWhoAmITimedRound();
    return;
  }
  showWhoAmIFinal();
}

function getFinalMedalSymbol(place) {
  if (place === 1) {
    return "🏆";
  }
  if (place === 2) {
    return "🥈";
  }
  if (place === 3) {
    return "🥉";
  }
  return String(place || "");
}

function clearElement(element) {
  if (element) {
    element.innerHTML = "";
  }
}

function appendTextElement(parent, tagName, className, text) {
  if (!parent || text === undefined || text === null || text === "") {
    return null;
  }
  const element = document.createElement(tagName);
  if (className) {
    element.className = className;
  }
  element.textContent = text;
  parent.appendChild(element);
  return element;
}

function createFinalResultCard(entry, options = {}) {
  const place = entry.place || 0;
  const isPodium = Boolean(options.isPodium);
  const item = document.createElement("article");
  item.className = "game-final-entry";
  item.classList.toggle("is-podium", isPodium);
  item.classList.toggle("is-rank-1", place === 1);
  item.classList.toggle("is-rank-2", place === 2);
  item.classList.toggle("is-rank-3", place === 3);
  item.classList.toggle("is-tied", Boolean(entry.isTied));
  if (place) {
    item.setAttribute("data-place", String(place));
  }

  const badge = document.createElement("span");
  badge.className = "game-final-medal";
  badge.setAttribute("aria-hidden", "true");
  badge.textContent = place <= 3 && place > 0 ? getFinalMedalSymbol(place) : String(place || "•");
  item.appendChild(badge);

  const copy = document.createElement("div");
  copy.className = "game-final-entry-copy";

  appendTextElement(copy, "span", "game-final-entry-kicker", entry.kicker || (place ? `${place} місце` : ""));
  appendTextElement(copy, "strong", "game-final-entry-name", entry.name);

  if (entry.role) {
    appendTextElement(copy, "span", "game-final-entry-role", entry.role);
  }

  if (entry.score !== undefined && entry.score !== null && entry.score !== "") {
    appendTextElement(copy, "span", "game-final-entry-score", `${entry.score} ${entry.scoreLabel || "очок"}`);
  }

  const metaParts = [];
  if (entry.category) {
    metaParts.push(entry.category);
  }
  if (entry.detail) {
    metaParts.push(entry.detail);
  }
  appendTextElement(copy, "small", "game-final-entry-detail", metaParts.join(" · "));

  item.appendChild(copy);
  return item;
}

function shouldUsePodium(entries, isTie) {
  if (isTie || !entries || entries.length < 3) {
    return false;
  }
  return entries[0] && entries[1] && entries[2]
    && entries[0].place === 1
    && entries[1].place === 2
    && entries[2].place === 3;
}

function renderGameFinalResults(resultData) {
  if (!resultData || !resultData.container) {
    return;
  }

  const container = resultData.container;
  clearElement(container);
  container.className = `game-final-results mode-${resultData.mode || "generic"}`;
  container.classList.toggle("is-tie", Boolean(resultData.isTie));

  if (resultData.titleElement) {
    resultData.titleElement.textContent = resultData.title || "Гру завершено";
  }
  if (resultData.subtitleElement) {
    resultData.subtitleElement.textContent = resultData.subtitle || "";
  }

  const entries = resultData.entries || [];
  const usePodium = shouldUsePodium(entries, Boolean(resultData.isTie));

  if (usePodium) {
    const podium = document.createElement("div");
    podium.className = "game-final-podium";
    [entries[1], entries[0], entries[2]].forEach((entry) => {
      podium.appendChild(createFinalResultCard(entry, { isPodium: true }));
    });
    container.appendChild(podium);

    if (entries.length > 3) {
      const list = document.createElement("div");
      list.className = "game-final-list";
      entries.slice(3).forEach((entry) => {
        list.appendChild(createFinalResultCard(entry));
      });
      container.appendChild(list);
    }
  } else {
    const list = document.createElement("div");
    list.className = "game-final-list";
    entries.forEach((entry) => {
      list.appendChild(createFinalResultCard(entry));
    });
    container.appendChild(list);
  }

  playGameSound("reveal");
  if (usePodium) {
    window.setTimeout(() => {
      playGameSound("medal");
    }, 680);
  }
}

function getRankedTeamResultEntries(scores, nameGetter, scoreLabel, roundsGetter) {
  const sorted = scores.map((scoreValue, index) => ({
    index,
    name: nameGetter(index),
    score: scoreValue,
  })).sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.index - b.index;
  });

  let previousScore = null;
  let previousPlace = 0;
  return sorted.map((team, index) => {
    const place = previousScore === team.score ? previousPlace : index + 1;
    previousScore = team.score;
    previousPlace = place;
    const rounds = typeof roundsGetter === "function" ? roundsGetter(team.index) : 0;
    return {
      place,
      name: team.name,
      score: team.score,
      scoreLabel,
      detail: rounds ? `${rounds} раунд(ів)` : "",
    };
  });
}

function showWhoAmIFinal() {
  clearWhoAmITimer();
  const isTimed = whoAmIPartyMode === "timed";
  clearElement(whoAmIFinalHero);
  if (whoAmIFinalHero) {
    whoAmIFinalHero.hidden = true;
  }

  if (isTimed && whoAmITeamCount > 0) {
    const highest = Math.max.apply(null, whoAmITeamScores);
    const entries = getRankedTeamResultEntries(whoAmITeamScores, getWhoAmITeamName, "ролей");
    const winners = entries.filter((entry) => entry.score === highest).map((entry) => entry.name);
    const isTie = winners.length > 1;
    entries.forEach((entry) => {
      entry.isTied = isTie && entry.score === highest;
    });
    renderGameFinalResults({
      mode: "whoami",
      title: isTie ? "Нічия" : "Гру завершено",
      subtitle: isTie ? `Команди ${winners.join(", ")} мають однаковий результат.` : `Перемогла ${winners[0]}.`,
      entries,
      isTie,
      container: whoAmIFinalBoard,
      titleElement: whoAmIFinalTitle,
      subtitleElement: whoAmIFinalSubtitle,
    });
    window.setTimeout(() => {
      playGameCompleteSound(isTie ? "tie" : "win");
    }, 240);
  } else if (isTimed) {
    const guessed = whoAmITimedRoles.filter((item) => item.status === "guessed").length;
    const entries = whoAmITimedRoles.map((item, index) => ({
      place: 0,
      kicker: `роль ${index + 1}`,
      name: item.player || `Роль ${index + 1}`,
      role: item.role,
      category: item.category,
      detail: item.status === "guessed" ? "вгадано" : "пропущено",
    }));
    renderGameFinalResults({
      mode: "whoami",
      title: "Усі ролі відкрито",
      subtitle: `Вгадано ролей: ${guessed}.`,
      entries,
      isTie: true,
      container: whoAmIFinalBoard,
      titleElement: whoAmIFinalTitle,
      subtitleElement: whoAmIFinalSubtitle,
    });
    window.setTimeout(() => {
      playGameCompleteSound("win");
    }, 240);
  } else {
    const allGuessed = whoAmIAssignments.length > 0 && whoAmIAssignments.every((assignment) => assignment.guessed);
    const ordered = whoAmIAssignments.slice().sort((a, b) => {
      if (a.guessed && !b.guessed) {
        return -1;
      }
      if (!a.guessed && b.guessed) {
        return 1;
      }
      if ((a.guessedRound || 999) !== (b.guessedRound || 999)) {
        return (a.guessedRound || 999) - (b.guessedRound || 999);
      }
      return (a.turns || 0) - (b.turns || 0);
    });

    const entries = ordered.map((assignment, index) => {
      const guessedDetail = assignment.guessed
        ? `відгадав у колі ${assignment.guessedRound || whoAmIRound}`
        : assignment.skipped ? "вибув" : "роль не відгадано";
      return {
        place: allGuessed ? 0 : index + 1,
        kicker: allGuessed ? "роль відкрита" : "",
        name: assignment.player,
        role: assignment.role,
        category: assignment.category,
        detail: guessedDetail,
      };
    });
    renderGameFinalResults({
      mode: "whoami",
      title: allGuessed ? "Усі ролі відкрито" : "Гру завершено",
      subtitle: allGuessed ? "Учасники рівнозначно відкрили свої ролі." : "Підсумок ролей і ходів.",
      entries,
      isTie: allGuessed,
      container: whoAmIFinalBoard,
      titleElement: whoAmIFinalTitle,
      subtitleElement: whoAmIFinalSubtitle,
    });
    window.setTimeout(() => {
      playGameCompleteSound("win");
    }, 240);
  }

  showScreen("whoAmIFinal");
}

function openWhoAmIRules() {
  if (!whoAmIRulesModal) {
    return;
  }
  whoAmIRulesModal.hidden = false;
  document.body.classList.add("modal-open");
  pauseWhoAmITimer("rules");
  playGameSound("uiOpen");
}

function closeWhoAmIRules(options) {
  const settings = options || {};
  if (!whoAmIRulesModal) {
    return;
  }
  whoAmIRulesModal.hidden = true;
  document.body.classList.remove("modal-open");
  playGameSound("uiClose");
  if (settings.resumeTimer !== false) {
    resumeWhoAmITimer("rules");
  }
}

function openWhoAmIParticipants() {
  if (!whoAmIParticipantsModal || !whoAmIParticipantsList) {
    return;
  }

  renderWhoAmIParticipantsList();
  whoAmIParticipantsModal.hidden = false;
  document.body.classList.add("modal-open");
  pauseWhoAmITimer("participants");
  playGameSound("uiOpen");
}

function closeWhoAmIParticipants(options) {
  const settings = options || {};
  hideWhoAmISpoiler();
  if (!whoAmIParticipantsModal) {
    return;
  }
  whoAmIParticipantsModal.hidden = true;
  document.body.classList.remove("modal-open");
  playGameSound("uiClose");
  if (settings.resumeTimer !== false) {
    resumeWhoAmITimer("participants");
  }
}

function renderWhoAmIParticipantsList() {
  whoAmIParticipantsList.innerHTML = "";

  whoAmIAssignments.forEach((assignment, index) => {
    if (!assignment) {
      return;
    }

    const row = document.createElement("div");
    const roleId = `whoamiParticipantRole${index}`;
    const isCurrent = index === whoAmICurrentIndex && whoAmIPartyMode !== "timed";
    const isRevealed = assignment.guessed;
    const status = isCurrent ? "активний гравець" : assignment.guessed ? "відгадав" : assignment.skipped ? "вибув" : "у грі";
    row.className = "whoami-participant-row";
    row.classList.toggle("is-current", isCurrent);
    row.classList.toggle("is-done", assignment.guessed);
    const playerDetails = document.createElement("div");
    appendTextElement(playerDetails, "strong", "", assignment.player);
    appendTextElement(playerDetails, "span", "", status);
    row.appendChild(playerDetails);
    const roleDetails = document.createElement("div");
    roleDetails.className = "whoami-participant-role";
    if (isRevealed) {
      appendTextElement(roleDetails, "strong", "whoami-open-role", assignment.role);
      appendTextElement(roleDetails, "small", "", assignment.category);
    } else {
      const spoilerButton = appendTextElement(roleDetails, "button", "whoami-spoiler-btn compact", "Утримуйте роль");
      spoilerButton.type = "button";
      spoilerButton.setAttribute("aria-controls", roleId);
      const spoilerValue = document.createElement("span");
      spoilerValue.id = roleId;
      spoilerValue.className = "whoami-spoiler-value compact";
      spoilerValue.hidden = true;
      appendTextElement(spoilerValue, "strong", "", assignment.role);
      appendTextElement(spoilerValue, "small", "", assignment.category);
      roleDetails.appendChild(spoilerValue);
      bindWhoAmISpoilerButton(spoilerButton);
    }
    row.appendChild(roleDetails);
    whoAmIParticipantsList.appendChild(row);
  });
}

function exitWhoAmIToMenu() {
  requestAppBack({ source: "control", destination: "menu" });
}

function getCurrentAppScreenName() {
  return document.body.dataset.screen || "menu";
}

function isAppStandalone() {
  return Boolean(
    (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches)
    || window.navigator.standalone === true
  );
}

function getAppNavigationLevel(screenName) {
  if (screenName === "menu") {
    return "menu";
  }

  if (screenName === "settings" || screenName === "wordGuessSettings" || screenName === "whoAmISettings") {
    return "setup";
  }

  if (screenName === "winner" || screenName === "result" || screenName === "whoAmIFinal") {
    return "result";
  }

  if (screenName === "wordGuessGame" && wordGuessResult && !wordGuessResult.hidden) {
    return "result";
  }

  return "active";
}

function syncAppHistory(screenName, historyMode, forcedLevel) {
  if (!window.history || !window.history.replaceState) {
    return;
  }

  const mode = historyMode || "push";
  if (mode === "none") {
    return;
  }

  const level = forcedLevel || getAppNavigationLevel(screenName);
  const state = {
    movohray: true,
    screen: screenName,
    level: level,
  };
  const currentState = window.history.state;
  const sameLevel = Boolean(currentState && currentState.movohray && currentState.level === level);

  if (mode === "force-push") {
    window.history.pushState(state, document.title, window.location.href);
  } else if (!appHistoryInitialized || mode === "replace" || sameLevel) {
    window.history.replaceState(state, document.title, window.location.href);
  } else {
    window.history.pushState(state, document.title, window.location.href);
  }

  appHistoryInitialized = true;
}

function initializeAppHistory() {
  syncAppHistory(getCurrentAppScreenName(), "replace");
  window.addEventListener("popstate", function () {
    if (isHandlingPopState) {
      return;
    }

    isHandlingPopState = true;
    requestAppBack({ source: "popstate" });
    isHandlingPopState = false;
  });
}

function restoreCurrentHistoryEntry() {
  syncAppHistory(getCurrentAppScreenName(), "force-push");
}

function hasOpenAppOverlay() {
  return Boolean(
    (exitMenuModal && !exitMenuModal.hidden)
    || (whoAmIConfirmModal && !whoAmIConfirmModal.hidden)
    || (whoAmIParticipantsModal && !whoAmIParticipantsModal.hidden)
    || (whoAmIRulesModal && !whoAmIRulesModal.hidden)
    || (whoAmICategoriesModal && !whoAmICategoriesModal.hidden)
    || (whoAmIPlayersModal && !whoAmIPlayersModal.hidden)
    || (setupRulesModal && !setupRulesModal.hidden)
    || (wordGuessInfoModal && !wordGuessInfoModal.hidden)
    || (achievementsModal && !achievementsModal.hidden)
    || (appSettingsModal && !appSettingsModal.hidden)
    || whoAmIActiveSpoilerButton
    || isThemesPopoverOpen
    || isWordGuessHistoryOpen
    || document.querySelector("details[open]")
  );
}

function closeTopAppOverlay() {
  if (exitMenuModal && !exitMenuModal.hidden) {
    closeExitMenuModal();
    return true;
  }

  if (whoAmIConfirmModal && !whoAmIConfirmModal.hidden) {
    closeWhoAmIConfirmModal();
    return true;
  }

  if (whoAmIParticipantsModal && !whoAmIParticipantsModal.hidden) {
    closeWhoAmIParticipants();
    return true;
  }

  if (whoAmIRulesModal && !whoAmIRulesModal.hidden) {
    closeWhoAmIRules();
    return true;
  }

  if (whoAmICategoriesModal && !whoAmICategoriesModal.hidden) {
    closeWhoAmICategoriesModal();
    return true;
  }

  if (whoAmIPlayersModal && !whoAmIPlayersModal.hidden) {
    closeWhoAmIPlayersModal();
    return true;
  }

  if (setupRulesModal && !setupRulesModal.hidden) {
    closeSetupRules();
    return true;
  }

  if (wordGuessInfoModal && !wordGuessInfoModal.hidden) {
    closeWordGuessInfoModal();
    return true;
  }

  if (achievementsModal && !achievementsModal.hidden) {
    closeWordGuessAchievementsModal();
    return true;
  }

  if (appSettingsModal && !appSettingsModal.hidden) {
    closeAppSettings();
    return true;
  }

  if (whoAmIActiveSpoilerButton) {
    hideWhoAmISpoiler();
    return true;
  }

  if (isThemesPopoverOpen) {
    closeThemesPopover();
    return true;
  }

  if (isWordGuessHistoryOpen) {
    closeWordGuessHistory();
    return true;
  }

  const openDetails = Array.from(document.querySelectorAll("details[open]"));
  if (openDetails.length > 0) {
    openDetails[openDetails.length - 1].removeAttribute("open");
    return true;
  }

  return false;
}

function cancelPendingWordGuessStart() {
  wordGuessStartRequestId += 1;
  if (wordGuessStartBtn) {
    wordGuessStartBtn.disabled = false;
  }
  if (wordGuessSettingsMessage && wordGuessSettingsMessage.textContent === getWordGuessText("loading")) {
    wordGuessSettingsMessage.textContent = "";
  }
}

function leaveWordGuessGame() {
  cancelPendingWordGuessStart();
  clearWordGuessHintNudgeTimers();
  clearWordGuessHintNudgeVisual();
  cancelWordGuessReveal();
  clearWordGuessInvalidClearTimer();
  if (wordGuessMessageTimeoutId) {
    clearTimeout(wordGuessMessageTimeoutId);
    wordGuessMessageTimeoutId = null;
  }
  setWordGuessBackgroundLocked(false);
  clearWordGuessFinaleEffect();
  closeWordGuessHistory();
  if (wordGuessResult) {
    wordGuessResult.hidden = true;
  }
  wordGuessFinished = false;
}

function navigateAfterAppBack(destination, historyMode) {
  if (destination === "wordGuessSettings") {
    leaveWordGuessGame();
    showScreen("wordGuessSettings", { historyMode: historyMode });
    return;
  }

  if (destination === "settings") {
    resetActiveGameState();
    showScreen("settings", { historyMode: historyMode });
    return;
  }

  if (destination === "whoAmISettings") {
    clearWhoAmITimer();
    hideWhoAmISpoiler();
    closeWhoAmIParticipants({ resumeTimer: false });
    closeWhoAmIConfirmModal({ resumeTimer: false });
    showScreen("whoAmISettings", { historyMode: historyMode });
    return;
  }

  if (destination === "menu") {
    if (isWordGuess()) {
      leaveWordGuessGame();
    } else {
      resetActiveGameState();
    }
    if (isWhoAmI()) {
      clearWhoAmITimer();
      hideWhoAmISpoiler();
      closeWhoAmIParticipants({ resumeTimer: false });
      closeWhoAmIConfirmModal({ resumeTimer: false });
    }
    showScreen("menu", { historyMode: historyMode });
  }
}

function requestAppBack(options) {
  const settings = options || {};
  const source = settings.source || "control";
  const screenName = getCurrentAppScreenName();
  const historyMode = "replace";

  if (document.body.classList.contains("required-update-open")) {
    return false;
  }

  const wasExitModalOpen = Boolean(exitMenuModal && !exitMenuModal.hidden);
  if (closeTopAppOverlay()) {
    if (source === "popstate" && !wasExitModalOpen) {
      restoreCurrentHistoryEntry();
    }
    return true;
  }

  if (screenName === "menu") {
    return false;
  }

  if (settings.destination === "menu") {
    if (screenName === "wordGuessGame" && wordGuessResult && !wordGuessResult.hidden) {
      navigateAfterAppBack("menu", historyMode);
      return true;
    }

    if (screenName === "winner" || screenName === "result") {
      navigateAfterAppBack("menu", historyMode);
      return true;
    }
  }

  if (screenName === "settings" || screenName === "wordGuessSettings" || screenName === "whoAmISettings") {
    navigateAfterAppBack("menu", historyMode);
    return true;
  }

  if (screenName === "wordGuessGame") {
    if (wordGuessResult && !wordGuessResult.hidden) {
      navigateAfterAppBack("wordGuessSettings", historyMode);
      return true;
    }

    openExitMenuModal(settings.destination === "menu" ? "menu" : "wordGuessSettings", source === "popstate");
    return true;
  }

  if (screenName === "winner") {
    navigateAfterAppBack(settings.destination === "menu" ? "menu" : "settings", historyMode);
    return true;
  }

  if (screenName === "whoAmIFinal") {
    navigateAfterAppBack(settings.destination === "menu" ? "menu" : "whoAmISettings", historyMode);
    return true;
  }

  if (screenName === "whoAmIReveal" || screenName === "whoAmIGame" || screenName === "whoAmIRound") {
    openExitMenuModal(settings.destination === "menu" ? "menu" : "whoAmISettings", source === "popstate");
    return true;
  }

  if (screenName === "teamReady" || screenName === "game" || screenName === "roundReview" || screenName === "result") {
    openExitMenuModal(settings.destination === "menu" ? "menu" : "settings", source === "popstate");
    return true;
  }

  navigateAfterAppBack("menu", historyMode);
  return true;
}

function getEdgeSwipeTouch(touchList, identifier) {
  for (let index = 0; index < touchList.length; index++) {
    if (touchList[index].identifier === identifier) {
      return touchList[index];
    }
  }
  return null;
}

function isEdgeSwipeIgnoredTarget(target) {
  if (!target || !target.closest) {
    return false;
  }

  if (target.closest("input, textarea, select, button, [contenteditable], [data-swipe-back-ignore], input[type=range]")) {
    return true;
  }

  let current = target;
  while (current && current !== document.body) {
    if (current.scrollWidth > current.clientWidth + 2) {
      return true;
    }
    current = current.parentElement;
  }

  return false;
}

function getEdgeSwipeVisualTarget() {
  if (exitMenuModal && !exitMenuModal.hidden) {
    return exitMenuModal;
  }
  if (whoAmIConfirmModal && !whoAmIConfirmModal.hidden) {
    return whoAmIConfirmModal;
  }
  if (whoAmIParticipantsModal && !whoAmIParticipantsModal.hidden) {
    return whoAmIParticipantsModal;
  }
  if (whoAmIRulesModal && !whoAmIRulesModal.hidden) {
    return whoAmIRulesModal;
  }
  if (whoAmICategoriesModal && !whoAmICategoriesModal.hidden) {
    return whoAmICategoriesModal;
  }
  if (whoAmIPlayersModal && !whoAmIPlayersModal.hidden) {
    return whoAmIPlayersModal;
  }
  if (setupRulesModal && !setupRulesModal.hidden) {
    return setupRulesModal;
  }
  if (wordGuessInfoModal && !wordGuessInfoModal.hidden) {
    return wordGuessInfoModal;
  }
  if (achievementsModal && !achievementsModal.hidden) {
    return achievementsModal;
  }
  if (appSettingsModal && !appSettingsModal.hidden) {
    return appSettingsModal;
  }
  if (wordGuessResult && !wordGuessResult.hidden) {
    return wordGuessResult;
  }
  return document.querySelector(".screen.active");
}

function canStartEdgeSwipe() {
  if (document.body.classList.contains("required-update-open")) {
    return false;
  }
  return hasOpenAppOverlay() || getCurrentAppScreenName() !== "menu";
}

function renderEdgeSwipeOffset() {
  edgeSwipeFrameId = null;
  if (!edgeSwipeState || !edgeSwipeState.target) {
    return;
  }
  edgeSwipeState.target.style.setProperty("--edge-swipe-x", edgeSwipeState.offset + "px");
}

function scheduleEdgeSwipeOffset(offset) {
  if (!edgeSwipeState) {
    return;
  }
  edgeSwipeState.offset = offset;
  if (!edgeSwipeFrameId) {
    edgeSwipeFrameId = window.requestAnimationFrame(renderEdgeSwipeOffset);
  }
}

function clearEdgeSwipeVisuals() {
  if (edgeSwipeFrameId) {
    window.cancelAnimationFrame(edgeSwipeFrameId);
    edgeSwipeFrameId = null;
  }
  if (edgeSwipeState && edgeSwipeState.target) {
    edgeSwipeState.target.classList.remove("is-edge-swipe-target", "is-edge-swiping", "is-edge-swipe-completing", "is-edge-swipe-cancelling");
    edgeSwipeState.target.style.removeProperty("--edge-swipe-x");
  }
  document.body.classList.remove("is-edge-swiping");
  edgeSwipeState = null;
  edgeSwipeHapticFired = false;
}

function cancelEdgeSwipe() {
  if (!edgeSwipeState || !edgeSwipeState.target) {
    clearEdgeSwipeVisuals();
    return;
  }
  edgeSwipeState.target.classList.remove("is-edge-swiping");
  edgeSwipeState.target.classList.add("is-edge-swipe-cancelling");
  scheduleEdgeSwipeOffset(0);
  const reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.setTimeout(clearEdgeSwipeVisuals, reducedMotion ? 90 : 170);
}

function completeEdgeSwipe() {
  if (!edgeSwipeState || !edgeSwipeState.target) {
    clearEdgeSwipeVisuals();
    return;
  }
  if (!edgeSwipeHapticFired) {
    edgeSwipeHapticFired = true;
    playHapticFeedback("tap");
  }
  edgeSwipeState.target.classList.remove("is-edge-swiping");
  edgeSwipeState.target.classList.add("is-edge-swipe-completing");
  scheduleEdgeSwipeOffset(Math.ceil(edgeSwipeState.width * 1.04));
  const reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.setTimeout(function () {
    clearEdgeSwipeVisuals();
    requestAppBack({ source: "swipe" });
  }, reducedMotion ? 90 : 210);
}

function setupEdgeSwipeNavigation() {
  document.addEventListener("touchstart", function (event) {
    if (!isAppStandalone() || event.touches.length !== 1 || isSwipeLocked || !canStartEdgeSwipe()) {
      return;
    }

    const touch = event.touches[0];
    const landscape = window.innerWidth > window.innerHeight;
    const edgeWidth = landscape ? 52 : 28;
    if (touch.clientX > edgeWidth || isEdgeSwipeIgnoredTarget(event.target)) {
      return;
    }

    const visualTarget = getEdgeSwipeVisualTarget();
    if (!visualTarget) {
      return;
    }

    edgeSwipeState = {
      identifier: touch.identifier,
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
      offset: 0,
      intent: "pending",
      target: visualTarget,
      width: Math.max(1, window.innerWidth || document.documentElement.clientWidth || 360),
    };
    edgeSwipeHapticFired = false;
  }, { passive: true });

  document.addEventListener("touchmove", function (event) {
    if (!edgeSwipeState) {
      return;
    }
    const touch = getEdgeSwipeTouch(event.touches, edgeSwipeState.identifier);
    if (!touch) {
      return;
    }

    const deltaX = touch.clientX - edgeSwipeState.startX;
    const deltaY = touch.clientY - edgeSwipeState.startY;
    if (edgeSwipeState.intent === "pending") {
      if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
        return;
      }
      if (deltaX <= 0 || Math.abs(deltaX) <= Math.abs(deltaY) * 1.25) {
        edgeSwipeState = null;
        return;
      }
      edgeSwipeState.intent = "horizontal";
      edgeSwipeState.target.classList.add("is-edge-swipe-target", "is-edge-swiping");
      document.body.classList.add("is-edge-swiping");
    }

    event.preventDefault();
    const offset = Math.min(edgeSwipeState.width * 0.92, Math.max(0, deltaX));
    scheduleEdgeSwipeOffset(offset);

    if (!edgeSwipeHapticFired && offset >= edgeSwipeState.width * 0.28) {
      edgeSwipeHapticFired = true;
      playHapticFeedback("tap");
    }
  }, { passive: false });

  document.addEventListener("touchend", function (event) {
    if (!edgeSwipeState) {
      return;
    }
    const touch = getEdgeSwipeTouch(event.changedTouches, edgeSwipeState.identifier);
    if (!touch || edgeSwipeState.intent !== "horizontal") {
      clearEdgeSwipeVisuals();
      return;
    }

    const deltaX = Math.max(0, touch.clientX - edgeSwipeState.startX);
    const elapsed = Math.max(1, Date.now() - edgeSwipeState.startTime);
    const velocity = deltaX / elapsed;
    const shouldComplete = deltaX >= edgeSwipeState.width * 0.28
      || (deltaX >= 90 && velocity >= 0.35)
      || (deltaX >= 45 && velocity >= 0.42);

    if (shouldComplete) {
      completeEdgeSwipe();
    } else {
      cancelEdgeSwipe();
    }
  }, { passive: true });

  document.addEventListener("touchcancel", function () {
    if (edgeSwipeState) {
      cancelEdgeSwipe();
    }
  }, { passive: true });
}

function syncAppViewportHeight() {
  const visualHeight = window.visualViewport ? window.visualViewport.height : 0;
  const viewportHeight = visualHeight || window.innerHeight || document.documentElement.clientHeight || 0;
  if (viewportHeight > 0) {
    document.documentElement.style.setProperty("--app-viewport-height", Math.round(viewportHeight) + "px");
  }
}


function setupEvents() {
  window.addEventListener("resize", updateWordCardMotionWidth);
  renderModes();
  setupGameAudioUnlockEvents();
  syncAppViewportHeight();

  window.addEventListener("resize", function () {
    syncAppViewportHeight();
    scheduleWordGuessViewportFit();
    if (edgeSwipeState) {
      clearEdgeSwipeVisuals();
    }
  });
  window.addEventListener("orientationchange", () => {
    if (edgeSwipeState) {
      clearEdgeSwipeVisuals();
    }
    window.setTimeout(syncAppViewportHeight, 160);
    window.setTimeout(scheduleWordGuessViewportFit, 160);
  });

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      if (edgeSwipeState) {
        clearEdgeSwipeVisuals();
      }
      pauseRoundTimer("visibility");
      pauseWhoAmITimer("visibility");
    } else {
      resumeRoundTimer("visibility");
      resumeWhoAmITimer("visibility");
    }
  });

  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", syncAppViewportHeight);
    window.visualViewport.addEventListener("resize", scheduleWordGuessViewportFit);
    window.visualViewport.addEventListener("scroll", scheduleWordGuessViewportFit);
  }

  const menuSecretLogo = document.querySelector("#menuScreen .logo");
  if (menuSecretLogo) {
    menuSecretLogo.style.touchAction = "manipulation";
    menuSecretLogo.addEventListener("click", function () {
      wordGuessAchievementsState.logoTaps = (Number(wordGuessAchievementsState.logoTaps) || 0) + 1;
      persistWordGuessAchievementsState();
      evaluateWordGuessMetaAchievements();
    });
  }

  if (menuAchievementsBtn) {
    menuAchievementsBtn.addEventListener("click", function () {
      wordGuessAchievementsState.achievementButtonTaps = (Number(wordGuessAchievementsState.achievementButtonTaps) || 0) + 1;
      persistWordGuessAchievementsState();
      evaluateWordGuessMetaAchievements();
      openWordGuessAchievementsModal();
    });
  }
  if (appLabsAchievementsOpenBtn) {
    appLabsAchievementsOpenBtn.addEventListener("click", function () { openWordGuessAchievementsModal(); });
  }
  if (achievementsModalCloseBtn) {
    achievementsModalCloseBtn.addEventListener("click", closeWordGuessAchievementsModal);
  }
  if (achievementsModal) {
    achievementsModal.addEventListener("click", function (event) {
      if (event.target.matches("[data-achievements-close]")) closeWordGuessAchievementsModal();
    });
  }

  if (appSettingsBtn) {
    appSettingsBtn.addEventListener("click", function () {
      wordGuessAchievementsState.settingsButtonTaps = (Number(wordGuessAchievementsState.settingsButtonTaps) || 0) + 1;
      persistWordGuessAchievementsState();
      evaluateWordGuessMetaAchievements();
      openAppSettings();
    });
  }

  document.querySelectorAll(".mode-settings-button").forEach((button) => {
    button.addEventListener("click", openAppSettings);
  });

  if (appSettingsCloseBtn) {
    appSettingsCloseBtn.addEventListener("click", closeAppSettings);
  }

  if (appSettingsModal) {
    appSettingsModal.addEventListener("click", (event) => {
      if (event.target.matches("[data-app-settings-close]")) {
        closeAppSettings();
      }
    });
  }

  if (settingsDeveloperReportBtn) settingsDeveloperReportBtn.addEventListener("click", function () { openDeveloperFeedbackModal("bug"); });
  if (settingsResetAllBtn) settingsResetAllBtn.addEventListener("click", resetMovohrayProgressAndSettings);
  if (wordGuessReportBtn) wordGuessReportBtn.addEventListener("click", function () { openDeveloperFeedbackModal("word"); });
  if (developerFeedbackCloseBtn) developerFeedbackCloseBtn.addEventListener("click", closeDeveloperFeedbackModal);
  if (developerFeedbackSaveBtn) developerFeedbackSaveBtn.addEventListener("click", saveDeveloperFeedbackReport);
  if (developerFeedbackModal) developerFeedbackModal.addEventListener("click", function (event) { if (event.target.matches("[data-developer-feedback-close]")) closeDeveloperFeedbackModal(); });

  if (settingsThemeToggleBtn) {
    settingsThemeToggleBtn.addEventListener("click", toggleTheme);
  }

  if (settingsSoundToggleBtn) {
    settingsSoundToggleBtn.addEventListener("click", toggleSoundSetting);
  }

  if (settingsHapticToggleBtn) {
    settingsHapticToggleBtn.addEventListener("click", toggleHapticSetting);
  }

  if (appSettingsVersion) {
    appSettingsVersion.addEventListener("click", handleWordGuessLabsVersionTap);
    appSettingsVersion.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleWordGuessLabsVersionTap();
      }
    });
  }

  wordGuessLanguageButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectWordGuessLanguage(button.dataset.wordGuessLanguage);
    });
  });

  if (wordCardUseAllShapesToggle) {
    wordCardUseAllShapesToggle.addEventListener("change", (event) => {
      updateWordCardUseAllShapes(event.currentTarget.checked);
    });
  }

  if (wordCardRandomColorsToggle) {
    wordCardRandomColorsToggle.addEventListener("change", (event) => {
      updateWordCardRandomColors(event.currentTarget.checked);
    });
  }

  wordCardShapeCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", (event) => {
      updateWordCardShapeSelection(event.currentTarget.dataset.wordCardShape, event.currentTarget.checked);
    });
  });

  wordCardOutlineModeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      updateWordCardOutlineMode(button.dataset.outlineTheme, button.dataset.outlineMode);
    });
  });

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", toggleTheme);
  }

  wordGuessModeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectWordGuessMode(button.dataset.wordGuessMode);
    });
  });

  wordGuessLengthButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectWordGuessLength(button.dataset.wordGuessLength);
    });
  });

  wordGuessAttemptButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectWordGuessAttempts(button.dataset.wordGuessAttempts);
    });
  });

  wordGuessRepeatButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectWordGuessRepeats(button.dataset.wordGuessRepeats);
    });
  });

  bindWordGuessStartPickerEvents();

  if (wordGuessStartBtn) {
    wordGuessStartBtn.addEventListener("click", () => {
      startWordGuessGame();
    });
  }

  if (wordGuessBackBtn) {
    wordGuessBackBtn.addEventListener("click", () => {
      requestAppBack({ source: "control" });
    });
  }

  if (wordGuessTopMenuBtn) {
    wordGuessTopMenuBtn.addEventListener("click", () => {
      requestAppBack({ source: "control", destination: "menu" });
    });
  }

  if (wordGuessHintFirstBtn) {
    wordGuessHintFirstBtn.addEventListener("click", showWordGuessFirstHint);
  }

  if (wordGuessHintSecondBtn) {
    wordGuessHintSecondBtn.addEventListener("click", showWordGuessSecondHint);
  }

  if (wordGuessHintThirdBtn) {
    wordGuessHintThirdBtn.addEventListener("click", showWordGuessThirdHint);
  }

  if (wordGuessRulesBtn) {
    wordGuessRulesBtn.addEventListener("click", showWordGuessRules);
  }

  if (settingsRulesBtn) {
    settingsRulesBtn.addEventListener("click", () => {
      openSetupRules(selectedMode);
    });
  }

  if (wordGuessSettingsRulesBtn) {
    wordGuessSettingsRulesBtn.addEventListener("click", () => {
      openSetupRules("wordguess");
    });
  }

  if (whoAmISettingsRulesBtn) {
    whoAmISettingsRulesBtn.addEventListener("click", () => {
      openSetupRules("whoami");
    });
  }

  if (setupRulesCloseBtn) {
    setupRulesCloseBtn.addEventListener("click", closeSetupRules);
  }

  if (setupRulesModal) {
    setupRulesModal.addEventListener("click", (event) => {
      if (event.target.matches("[data-setup-rules-close]")) {
        closeSetupRules();
      }
    });
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

  if (wordGuessShareBtn) {
    wordGuessShareBtn.addEventListener("click", shareWordGuessResult);
  }

  if (wordGuessNewBtn) {
    wordGuessNewBtn.addEventListener("click", () => {
      startWordGuessGame();
    });
  }

  if (wordGuessMenuBtn) {
    wordGuessMenuBtn.addEventListener("click", () => {
      requestAppBack({ source: "control", destination: "menu" });
    });
  }

  whoAmIShowModeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      whoAmIShowMode = button.dataset.whoamiShowMode || "forehead";
      syncWhoAmIButtons();
    });
  });

  whoAmIPartyModeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      whoAmIPartyMode = button.dataset.whoamiPartyMode || "turns";
      updateWhoAmISettingsVisibility();
      syncWhoAmIButtons();
    });
  });

  whoAmIPlayerCountButtons.forEach((button) => {
    button.addEventListener("click", () => {
      whoAmIPlayerCount = Number(button.dataset.whoamiPlayers) || WHOAMI_DEFAULT_PLAYER_COUNT;
      closeWhoAmISetupDropdowns();
      renderWhoAmIPlayerFields();
      syncWhoAmIButtons();
    });
  });

  whoAmIDifficultyButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const difficulty = button.dataset.whoamiDifficulty || "";
      if (whoAmISelectedDifficulties.indexOf(difficulty) >= 0) {
        whoAmISelectedDifficulties = whoAmISelectedDifficulties.filter((item) => item !== difficulty);
      } else {
        whoAmISelectedDifficulties = whoAmISelectedDifficulties.concat(difficulty);
      }
      syncWhoAmIButtons();
      renderWhoAmICategories();
    });
  });

  whoAmIDurationButtons.forEach((button) => {
    button.addEventListener("click", () => {
      whoAmIDuration = Number(button.dataset.whoamiSeconds) || 60;
      syncWhoAmIButtons();
    });
  });

  whoAmITeamCountButtons.forEach((button) => {
    button.addEventListener("click", () => {
      whoAmITeamCount = Number(button.dataset.whoamiTeams) || 0;
      renderWhoAmITeamFields();
      syncWhoAmIButtons();
    });
  });

  if (whoAmIPlayerCountPicker) {
    whoAmIPlayerCountPicker.addEventListener("toggle", () => {
      if (whoAmIPlayerCountPicker.open) {
        closeWhoAmIPlayersModal();
        closeWhoAmICategoriesModal();
      }
    });
  }

  if (whoAmIEditPlayersBtn) {
    whoAmIEditPlayersBtn.addEventListener("click", openWhoAmIPlayersModal);
  }

  if (whoAmIPlayersCloseBtn) {
    whoAmIPlayersCloseBtn.addEventListener("click", closeWhoAmIPlayersModal);
  }

  if (whoAmIPlayersDoneBtn) {
    whoAmIPlayersDoneBtn.addEventListener("click", closeWhoAmIPlayersModal);
  }

  if (whoAmIPlayersModal) {
    whoAmIPlayersModal.addEventListener("click", (event) => {
      if (event.target.matches("[data-whoami-players-close]")) {
        closeWhoAmIPlayersModal();
      }
    });
  }

  if (whoAmICategoriesCloseBtn) {
    whoAmICategoriesCloseBtn.addEventListener("click", closeWhoAmICategoriesModal);
  }

  if (whoAmICategoriesDoneBtn) {
    whoAmICategoriesDoneBtn.addEventListener("click", closeWhoAmICategoriesModal);
  }

  if (whoAmICategoriesModal) {
    whoAmICategoriesModal.addEventListener("click", (event) => {
      if (event.target.matches("[data-whoami-categories-close]")) {
        closeWhoAmICategoriesModal();
      }
    });
  }

  if (whoAmIStartBtn) {
    whoAmIStartBtn.addEventListener("click", startWhoAmIGame);
  }

  if (whoAmIBackBtn) {
    whoAmIBackBtn.addEventListener("click", exitWhoAmIToMenu);
  }

  if (whoAmIRevealPrimaryBtn) {
    whoAmIRevealPrimaryBtn.addEventListener("click", handleWhoAmIRevealPrimary);
  }

  if (whoAmIRevealChangeRoleBtn) {
    whoAmIRevealChangeRoleBtn.addEventListener("click", changeWhoAmIRevealRole);
  }

  if (whoAmIRevealMenuBtn) {
    whoAmIRevealMenuBtn.addEventListener("click", exitWhoAmIToMenu);
  }

  if (whoAmIYesBtn) {
    whoAmIYesBtn.addEventListener("click", () => handleWhoAmIAnswer("yes"));
  }

  if (whoAmINoBtn) {
    whoAmINoBtn.addEventListener("click", () => handleWhoAmIAnswer("no"));
  }

  if (whoAmIGuessedBtn) {
    whoAmIGuessedBtn.addEventListener("click", markWhoAmIGuessed);
  }

  if (whoAmIGameChangeRoleBtn) {
    whoAmIGameChangeRoleBtn.addEventListener("click", changeWhoAmICurrentRole);
  }

  if (whoAmISkipRoleBtn) {
    whoAmISkipRoleBtn.addEventListener("click", skipWhoAmIRole);
  }

  bindWhoAmISpoilerButton(whoAmICurrentSpoilerBtn);

  if (whoAmIParticipantsBtn) {
    whoAmIParticipantsBtn.addEventListener("click", openWhoAmIParticipants);
  }

  if (whoAmIRulesBtn) {
    whoAmIRulesBtn.addEventListener("click", openWhoAmIRules);
  }

  if (whoAmIEndRoundBtn) {
    whoAmIEndRoundBtn.addEventListener("click", () => {
      if (whoAmIPartyMode === "timed") {
        finishWhoAmITimedRound();
      } else {
        showWhoAmIFinal();
      }
    });
  }

  if (whoAmIGameMenuBtn) {
    whoAmIGameMenuBtn.addEventListener("click", exitWhoAmIToMenu);
  }

  if (whoAmIRoundNextBtn) {
    whoAmIRoundNextBtn.addEventListener("click", continueAfterWhoAmIRound);
  }

  if (whoAmIRoundMenuBtn) {
    whoAmIRoundMenuBtn.addEventListener("click", exitWhoAmIToMenu);
  }

  if (whoAmINewBtn) {
    whoAmINewBtn.addEventListener("click", () => {
      showScreen("whoAmISettings");
    });
  }

  if (whoAmIFinalMenuBtn) {
    whoAmIFinalMenuBtn.addEventListener("click", exitWhoAmIToMenu);
  }

  if (whoAmIRulesCloseBtn) {
    whoAmIRulesCloseBtn.addEventListener("click", closeWhoAmIRules);
  }

  if (whoAmIRulesModal) {
    whoAmIRulesModal.addEventListener("click", (event) => {
      if (event.target.matches("[data-whoami-rules-close]")) {
        closeWhoAmIRules();
      }
    });
  }

  if (whoAmIParticipantsCloseBtn) {
    whoAmIParticipantsCloseBtn.addEventListener("click", closeWhoAmIParticipants);
  }

  if (whoAmIParticipantsModal) {
    whoAmIParticipantsModal.addEventListener("click", (event) => {
      if (event.target.matches("[data-whoami-participants-close]")) {
        closeWhoAmIParticipants();
      }
    });
  }

  if (whoAmIConfirmYesBtn) {
    whoAmIConfirmYesBtn.addEventListener("click", confirmWhoAmIGuessed);
  }

  if (whoAmIConfirmNoBtn) {
    whoAmIConfirmNoBtn.addEventListener("click", closeWhoAmIConfirmModal);
  }

  if (whoAmIConfirmModal) {
    whoAmIConfirmModal.addEventListener("click", (event) => {
      if (event.target.matches("[data-whoami-confirm-close]")) {
        closeWhoAmIConfirmModal();
      }
    });
  }

  window.addEventListener("blur", hideWhoAmISpoiler);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      hideWhoAmISpoiler();
    }
  });

  backToMenuBtn.addEventListener("click", () => {
    requestAppBack({ source: "control" });
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
    if (event.key === "Escape") {
      requestAppBack({ source: "escape" });
      return;
    }

    if (isScreenActive(wordGuessGameScreen)) {
      handleWordGuessPhysicalKey(event);
    }
  });

  document.addEventListener("click", (event) => {
    if (event.target && event.target.closest && event.target.closest(".word-guess-select")) {
      return;
    }
    closeWordGuessStartPickers();
    if (whoAmIPlayerCountPicker && event.target && event.target.closest && !event.target.closest(".whoami-setup-dropdown")) {
      closeWhoAmISetupDropdowns();
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
      && !(wordGuessHistoryBtn && wordGuessHistoryBtn.contains(event.target))
      && !(wordGuessHistoryPanel && wordGuessHistoryPanel.contains(event.target))) {
      closeWordGuessHistory();
    }

    if (!isThemesPopoverOpen) {
      return;
    }

    if ((gameCategoryName && gameCategoryName.contains(event.target)) || (gameThemesPopover && gameThemesPopover.contains(event.target))) {
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
    wordCardMotion.classList.remove("fly-up", "fly-down");
    wordCardMotion.style.transition = "transform 0.16s ease";
    wordCardMotion.style.transform = "";

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

    const springFactor = 0.95;
    const easedOffset = dragOffsetY * springFactor;
    wordCardMotion.style.transform = `translateY(${easedOffset}px)`;
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
      wordCardMotion.style.transition = "transform 0.16s ease";
      wordCardMotion.style.transform = "";

      setTimeout(() => {
        wordCardMotion.style.transition = "opacity 0.22s ease, transform 0.22s ease";
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

  if (!window.PointerEvent) {
    wordCard.addEventListener("touchstart", function (event) {
      if (event.touches.length !== 1 || isSwipeLocked || isRoundPaused) {
        return;
      }
      const touch = event.touches[0];
      activePointerId = touch.identifier;
      pointerStartY = touch.clientY;
      dragOffsetY = 0;
      dragVelocityY = 0;
      wordCardMotion.classList.remove("fly-up", "fly-down");
      wordCardMotion.style.transition = "transform 0.16s ease";
      wordCardMotion.style.transform = "";
    }, { passive: true });

    wordCard.addEventListener("touchmove", function (event) {
      const touch = getEdgeSwipeTouch(event.touches, activePointerId);
      if (!touch || isSwipeLocked || isRoundPaused) {
        return;
      }
      event.preventDefault();
      const deltaY = touch.clientY - pointerStartY;
      dragVelocityY = deltaY - dragOffsetY;
      dragOffsetY = deltaY;
      wordCardMotion.style.transform = "translateY(" + (dragOffsetY * 0.95) + "px)";
    }, { passive: false });

    wordCard.addEventListener("touchend", function (event) {
      const touch = getEdgeSwipeTouch(event.changedTouches, activePointerId);
      if (!touch) {
        return;
      }
      const dragDistance = pointerStartY - touch.clientY;
      activePointerId = null;
      if (!handleSwipe(dragDistance)) {
        resetWordCardPosition();
      }
    }, { passive: true });

    wordCard.addEventListener("touchcancel", function () {
      activePointerId = null;
      resetWordCardPosition();
    }, { passive: true });
  }

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
      requestAppBack({ source: "control" });
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
    requestAppBack({ source: "control", destination: "menu" });
  });

  if (winnerToMenuBtn) {
    winnerToMenuBtn.addEventListener("click", () => {
      requestAppBack({ source: "control", destination: "menu" });
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
    button.type = "button";

    const modeIcons = {
      explain: "assets/game-icons/alias.png",
      charades: "assets/game-icons/charades.png",
      wordguess: "assets/game-icons/wordguess.png",
      whoami: "assets/game-icons/whoami.png",
    };
    const iconWrap = document.createElement("span");
    iconWrap.className = "mode-card-icon";
    iconWrap.setAttribute("aria-hidden", "true");
    const iconFallback = appendTextElement(iconWrap, "span", "mode-card-icon-fallback", "?");
    if (modeIcons[mode.id]) {
      const icon = document.createElement("img");
      icon.src = getRevisionedAssetUrl(modeIcons[mode.id]);
      icon.alt = "";
      icon.decoding = "async";
      iconFallback.hidden = true;
      icon.addEventListener("error", () => {
        icon.hidden = true;
        iconFallback.hidden = false;
      });
      iconWrap.insertBefore(icon, iconFallback);
    }
    button.appendChild(iconWrap);
    const renderedTitle = mode.id === "wordguess" ? getWordGuessText("title") : mode.title;
    const renderedDescription = mode.id === "wordguess" ? getWordGuessText("menuDescription") : mode.description;
    appendTextElement(button, "strong", "", renderedTitle);
    appendTextElement(button, "span", "mode-card-description", renderedDescription);

    button.addEventListener("click", async () => {
      const selectionRequestId = ++modeSelectionRequestId;
      selectedMode = mode.id;
      selectedCategories = [];
      selectedCategory = null;
      areCategoriesExpanded = false;

      if (isWordGuess()) {
        resetActiveGameState();
        document.body.dataset.mode = mode.id;
        document.body.classList.remove("single-card-mode");
        await loadWordGuessDictionary();
        if (selectionRequestId !== modeSelectionRequestId || selectedMode !== mode.id) {
          return;
        }
        showScreen("wordGuessSettings");
        return;
      }

      if (isWhoAmI()) {
        resetActiveGameState();
        clearWhoAmITimer();
        document.body.dataset.mode = mode.id;
        document.body.classList.remove("single-card-mode");
        await loadWhoAmIData();
        if (selectionRequestId !== modeSelectionRequestId || selectedMode !== mode.id) {
          return;
        }
        renderWhoAmISettings();
        showScreen("whoAmISettings");
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
      if (selectionRequestId !== modeSelectionRequestId || selectedMode !== mode.id) {
        return;
      }
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
    const upcomingCopy = document.createElement("div");
    upcomingCopy.className = "upcoming-modes-copy";
    appendTextElement(upcomingCopy, "strong", "", "Незабаром");
    appendTextElement(upcomingCopy, "span", "", "Готуємо нові режими для компанії.");
    upcomingBox.appendChild(upcomingCopy);
    const upcomingChips = document.createElement("div");
    upcomingChips.className = "upcoming-mode-chips";
    upcomingModes.forEach((mode) => {
      appendTextElement(upcomingChips, "span", "upcoming-mode-chip", mode.title.replace(/\s*\([^)]*\)/g, ""));
    });
    upcomingBox.appendChild(upcomingChips);
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

  const phrasesEnabled = !excludePhrases;
  phraseFilterBtn.classList.toggle("selected", phrasesEnabled);
  phraseFilterBtn.setAttribute("aria-pressed", String(phrasesEnabled));
  phraseFilterBtn.textContent = phrasesEnabled ? "Словосполучення: так" : "Словосполучення: ні";
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
    const normalizedWords = [];
    difficulties.forEach((difficultyId) => {
      const words = Array.isArray(category.levels[difficultyId]) ? category.levels[difficultyId] : [];
      normalizeEntries(words, difficultyId).forEach((entry) => normalizedWords.push(entry));
    });
    return normalizedWords;
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
  if (!wordCardMotion) {
    return;
  }
  wordCardMotion.classList.remove("fly-up", "fly-down", "correct-swipe", "skip-swipe");
  wordCardMotion.style.transition = "opacity 0.22s ease, transform 0.22s ease";
  wordCardMotion.style.transform = "";
  wordCardMotion.style.opacity = "";
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
  destroyRoundTimer();
  setRoundPaused(false, { resumeTimer: false });
  wasTimerRunningBeforeExitModal = false;
  resetSwipeState();
  score = 0;
  skipped = 0;
  timeLeft = selectedDuration;
  roundTimerRemainingMs = selectedDuration * 1000;
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
  requestAppBack({ source: "control", destination: "menu" });
}

function openExitMenuModal(destination, fromPopState) {
  pendingExitDestination = destination || "menu";
  pendingExitFromPopState = Boolean(fromPopState);
  if (!exitMenuModal) {
    confirmExitToMenu();
    return;
  }

  wasTimerRunningBeforeExitModal = Boolean(roundTimerIsActive && isScreenActive(gameScreen) && !isSingleCardMode());
  if (wasTimerRunningBeforeExitModal) {
    pauseRoundTimer("exit");
  }

  wasWhoAmITimerRunningBeforeExitModal = Boolean(whoAmITimerIsActive && isWhoAmITimedStageActive());
  if (wasWhoAmITimerRunningBeforeExitModal) {
    pauseWhoAmITimer("exit");
  }

  exitMenuModal.hidden = false;
  document.body.classList.add("modal-open");

  if (exitModalTitle) {
    exitModalTitle.textContent = "Завершити поточну гру?";
  }
  if (exitModalDescription) {
    exitModalDescription.textContent = "Результат буде втрачено.";
  }

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

  if (wasTimerRunningBeforeExitModal) {
    resumeRoundTimer("exit");
  }

  if (wasWhoAmITimerRunningBeforeExitModal) {
    resumeWhoAmITimer("exit");
  }

  wasTimerRunningBeforeExitModal = false;
  wasWhoAmITimerRunningBeforeExitModal = false;
  if (pendingExitFromPopState) {
    pendingExitFromPopState = false;
    restoreCurrentHistoryEntry();
  }
}

function confirmExitToMenu() {
  if (exitMenuModal) {
    exitMenuModal.hidden = true;
  }
  document.body.classList.remove("modal-open");
  const historyMode = pendingExitFromPopState ? "none" : "replace";
  const destination = pendingExitDestination || "menu";
  pendingExitFromPopState = false;
  wasTimerRunningBeforeExitModal = false;
  wasWhoAmITimerRunningBeforeExitModal = false;
  destroyRoundTimer();
  clearWhoAmITimer();
  navigateAfterAppBack(destination, historyMode);
}

function startRound() {
  resetSwipeState();
  destroyRoundTimer();
  setRoundPaused(false, { resumeTimer: false });
  score = 0;
  skipped = 0;
  timeLeft = selectedDuration;
  roundTimerRemainingMs = selectedDuration * 1000;
  roundTimerLastCountdownSecond = null;
  roundTimerPauseReasons = {};
  roundTimerIsActive = false;
  roundTimerFinishStarted = false;
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
  playGameSound("roundStart");
  roundTimerIsActive = true;
  startTimer();
}

function startTimer() {
  clearRoundTimerHandle();

  if (!roundTimerIsActive || hasTimerPauseReasons(roundTimerPauseReasons) || isRoundPaused || roundTimerRemainingMs <= 0) {
    return;
  }
  roundTimerDeadlineMs = Date.now() + roundTimerRemainingMs;
  updateRoundTimerFromDeadline();
  startRoundTimerInterval();
}

function clearRoundTimerHandle() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
}

function updateRoundTimerFromDeadline(now) {
  if (!roundTimerIsActive || !roundTimerDeadlineMs || roundTimerFinishStarted) {
    return;
  }
  roundTimerRemainingMs = Math.max(0, roundTimerDeadlineMs - (typeof now === "number" ? now : Date.now()));
  const nextSeconds = Math.max(0, Math.ceil(roundTimerRemainingMs / 1000));
  timeLeft = nextSeconds;
  updateGameInfo();
  if (nextSeconds > 0 && nextSeconds <= 3 && nextSeconds !== roundTimerLastCountdownSecond) {
    roundTimerLastCountdownSecond = nextSeconds;
    playGameSound("countdown");
  }
  if (roundTimerRemainingMs <= 0) {
    roundTimerFinishStarted = true;
    finishRound("time");
  }
}

function startRoundTimerInterval() {
  if (timerId || !roundTimerIsActive || hasTimerPauseReasons(roundTimerPauseReasons) || roundTimerRemainingMs <= 0) {
    return;
  }
  timerId = setInterval(updateRoundTimerFromDeadline, 250);
}

function pauseRoundTimer(reason) {
  if (!reason || !roundTimerIsActive) {
    return false;
  }
  if (!roundTimerPauseReasons[reason]) {
    if (timerId && roundTimerDeadlineMs) {
      roundTimerRemainingMs = Math.max(0, roundTimerDeadlineMs - Date.now());
      timeLeft = Math.max(0, Math.ceil(roundTimerRemainingMs / 1000));
    }
    roundTimerPauseReasons[reason] = true;
  }
  roundTimerDeadlineMs = 0;
  clearRoundTimerHandle();
  updateGameInfo();
  return true;
}

function resumeRoundTimer(reason) {
  if (reason) {
    delete roundTimerPauseReasons[reason];
  }
  if (!roundTimerIsActive || hasTimerPauseReasons(roundTimerPauseReasons) || !isScreenActive(gameScreen) || isRoundPaused || isAwaitingLastWordResult) {
    return;
  }
  if (timerId) {
    return;
  }
  if (roundTimerRemainingMs <= 0) {
    if (!roundTimerFinishStarted) {
      roundTimerFinishStarted = true;
      finishRound("time");
    }
    return;
  }
  startTimer();
}

function destroyRoundTimer() {
  clearRoundTimerHandle();
  roundTimerDeadlineMs = 0;
  roundTimerRemainingMs = 0;
  roundTimerIsActive = false;
  roundTimerPauseReasons = {};
  roundTimerFinishStarted = false;
}

function getCurrentWordPool() {
  const wordPool = [];
  getEffectiveSelectedCategories().forEach((category) => {
    getCategoryWordsByDifficulty(category).forEach((entry) => wordPool.push(entry));
  });
  return wordPool;
}

function startSingleCardGame() {
  destroyRoundTimer();
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

function applyRandomWordCardShape() {
  applyConfiguredWordCardAppearance();
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
  applyRandomWordCardShape();
  updateWordCardMotionWidth();
  window.requestAnimationFrame(updateWordCardMotionWidth);
  renderWordMeta(nextEntry);

  if (wordModeHint) {
    wordModeHint.textContent = mode.cardHint || "";
    wordModeHint.hidden = !mode.cardHint;
  }
}

function showSingleNextCard(animationClass = "fly-up") {
  if (!isSingleCardMode() || isSwipeLocked) {
    return;
  }

  const exitAnimationClass = animationClass === "fly-down" ? "fly-down" : "fly-up";
  isSwipeLocked = true;
  animateWordCard(exitAnimationClass);
  playGameSound("turnChange");

  clearWordActionTimeout();
  wordActionTimeoutId = setTimeout(() => {
    showNextWord();
    isSwipeLocked = false;
    wordActionTimeoutId = null;
    resetWordCardPosition();
  }, WORD_CARD_FLIGHT_DURATION_MS);
}

function setRoundPaused(paused, options = {}) {
  const resumeTimer = options && options.resumeTimer !== undefined ? options.resumeTimer : true;
  const wasManuallyPaused = Boolean(roundTimerPauseReasons.manual);
  const nextPausedState = Boolean(paused) && timeLeft > 0 && !isSingleCardMode() && isScreenActive(gameScreen) && !isAwaitingLastWordResult;
  isRoundPaused = nextPausedState;

  if (isRoundPaused) {
    pauseRoundTimer("manual");
  } else if (resumeTimer || wasManuallyPaused) {
    delete roundTimerPauseReasons.manual;
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

  if (!isRoundPaused && resumeTimer && wasManuallyPaused && isScreenActive(gameScreen) && timeLeft > 0 && !isAwaitingLastWordResult && !isSingleCardMode()) {
    resumeRoundTimer("manual");
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
    appendTextElement(row, "strong", "", getTeamName(index));
    appendTextElement(row, "span", "", `${visibleScore}/${selectedTargetScore}`);

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
    appendTextElement(row, "strong", "", getTeamName(index));
    appendTextElement(row, "span", "", String(scoreValue));

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
  if (isAwaitingLastWordResult) {
    return;
  }
  clearRoundTimerHandle();
  roundTimerDeadlineMs = 0;
  roundTimerPauseReasons = {};
  setRoundPaused(false, { resumeTimer: false });

  if (reason === "time" && currentEntry) {
    if (shouldGuessLastWordAfterTime()) {
      roundTimerIsActive = false;
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

  roundTimerIsActive = false;
  showRoundReview();
}

function showRoundReview() {
  destroyRoundTimer();
  resetSwipeState();
  isRoundReviewWordsExpanded = false;
  recalculateRoundCounters();
  playRoundCompleteSound();
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

  const heading = document.querySelector(".round-review-heading");
  if (heading) {
    heading.textContent = `Слова раунду · ${roundWords.length}`;
  }

  const collapsedLimit = getRoundReviewCollapsedLimit();
  const shouldCollapse = roundWords.length > collapsedLimit;
  const visibleWords = shouldCollapse && !isRoundReviewWordsExpanded
    ? roundWords.slice(0, collapsedLimit)
    : roundWords;

  roundReviewList.classList.toggle("is-collapsed", shouldCollapse && !isRoundReviewWordsExpanded);
  roundReviewList.classList.toggle("is-expanded", shouldCollapse && isRoundReviewWordsExpanded);

  visibleWords.forEach((item, index) => {
    const row = document.createElement("button");
    row.type = "button";
    row.className = `round-word-row ${item.result === "guessed" ? "is-guessed" : "is-skipped"}`;
    row.setAttribute("aria-label", `Змінити статус слова ${item.word}`);

    const main = document.createElement("span");
    main.className = "round-word-main";

    const number = document.createElement("span");
    number.className = "round-word-number";
    number.textContent = `${index + 1}.`;

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
    separator.textContent = " · ";

    const difficulty = document.createElement("em");
    difficulty.className = "round-word-difficulty";
    difficulty.textContent = formatReviewMetaText(item.difficultyName);

    meta.appendChild(category);
    meta.appendChild(separator);
    meta.appendChild(difficulty);

    const status = document.createElement("span");
    status.className = `round-word-status ${item.result === "guessed" ? "is-guessed" : "is-skipped"}`;
    status.textContent = item.result === "guessed" ? "✓" : "–";
    status.title = item.result === "guessed" ? "Вгадано" : "Не вгадано";

    row.addEventListener("click", () => {
      item.result = item.result === "guessed" ? "skipped" : "guessed";
      recalculateRoundCounters();
      renderRoundReview();
    });

    main.appendChild(number);
    main.appendChild(word);
    main.appendChild(meta);
    row.appendChild(main);
    row.appendChild(status);
    roundReviewList.appendChild(row);
  });

  if (shouldCollapse) {
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "round-review-toggle";
    toggle.textContent = isRoundReviewWordsExpanded
      ? "Згорнути слова"
      : `Показати всі слова · ${roundWords.length}`;

    toggle.addEventListener("click", () => {
      isRoundReviewWordsExpanded = !isRoundReviewWordsExpanded;
      renderRoundReview();
    });

    roundReviewList.appendChild(toggle);
  }
}

function getRoundReviewCollapsedLimit() {
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 640;
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 360;

  if (viewportHeight <= 520 && viewportWidth >= 560) {
    return 8;
  }

  if (viewportHeight <= 700 || viewportWidth <= 420) {
    return 8;
  }

  return 10;
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
  const highestScore = Math.max.apply(null, teamScores);
  const tiedIndices = teamScores.reduce((accumulator, scoreValue, index) => {
    if (scoreValue === highestScore) {
      accumulator.push(index);
    }
    return accumulator;
  }, []);
  const entries = getRankedTeamResultEntries(teamScores, getTeamName, "очок", (index) => roundsPlayedByTeam[index] || 0);
  const tiedNames = tiedIndices.map((index) => getTeamName(index));
  const isTie = tiedIndices.length > 1;

  entries.forEach((entry) => {
    entry.isTied = isTie && entry.score === highestScore;
  });

  renderGameFinalResults({
    mode: isCharades() ? "charades" : "alias",
    title: isTie ? "Нічия" : "Гру завершено",
    subtitle: isTie
      ? `Команди ${tiedNames.join(", ")} набрали однакову кількість очок.`
      : `Перемогла ${getTeamName(tiedIndices[0])}.`,
    entries,
    isTie,
    container: winnerScoreBoard,
    titleElement: winnerTitle,
    subtitleElement: winnerSubtitle,
  });

  if (winnerHero) {
    winnerHero.hidden = true;
    winnerHero.innerHTML = "";
  }

  if (winnerTeamsList) {
    winnerTeamsList.textContent = isTie ? `Найвищий рахунок: ${highestScore}` : `Фінальний рахунок: ${highestScore}`;
  }

  if (isTie) {
    playAgainBtn.textContent = "Додатковий раунд";
  } else {
    playAgainBtn.textContent = "Нова гра";
  }

  window.setTimeout(() => {
    playGameCompleteSound(isTie ? "tie" : "win");
  }, 240);
  showScreen("winner");
}

function showScreen(screenName, options) {
  const navigationOptions = options || {};
  const previousScreenName = getCurrentAppScreenName();
  closeThemesPopover();
  if (screenName !== "wordGuessSettings") {
    closeWordGuessStartPickers();
  }
  if (screenName !== "whoAmISettings") {
    closeWhoAmISetupDropdowns();
    closeWhoAmIPlayersModal();
    closeWhoAmICategoriesModal();
  }
  if (screenName !== "wordGuessGame") {
    setWordGuessBackgroundLocked(false);
    clearWordGuessFinaleEffect();
  }
  document.body.dataset.screen = screenName;

  menuScreen.classList.remove("active");
  settingsScreen.classList.remove("active");
  wordGuessSettingsScreen && wordGuessSettingsScreen.classList.remove("active");
  wordGuessGameScreen && wordGuessGameScreen.classList.remove("active");
  whoAmISettingsScreen && whoAmISettingsScreen.classList.remove("active");
  whoAmIRevealScreen && whoAmIRevealScreen.classList.remove("active");
  whoAmIGameScreen && whoAmIGameScreen.classList.remove("active");
  whoAmIRoundScreen && whoAmIRoundScreen.classList.remove("active");
  whoAmIFinalScreen && whoAmIFinalScreen.classList.remove("active");
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
    wordGuessSettingsScreen && wordGuessSettingsScreen.classList.add("active");
  }

  if (screenName === "wordGuessGame") {
    wordGuessGameScreen && wordGuessGameScreen.classList.add("active");
    scheduleWordGuessViewportFit({ settle: true });
  }

  if (screenName === "whoAmISettings") {
    whoAmISettingsScreen && whoAmISettingsScreen.classList.add("active");
  }

  if (screenName === "whoAmIReveal") {
    whoAmIRevealScreen && whoAmIRevealScreen.classList.add("active");
  }

  if (screenName === "whoAmIGame") {
    whoAmIGameScreen && whoAmIGameScreen.classList.add("active");
  }

  if (screenName === "whoAmIRound") {
    whoAmIRoundScreen && whoAmIRoundScreen.classList.add("active");
  }

  if (screenName === "whoAmIFinal") {
    whoAmIFinalScreen && whoAmIFinalScreen.classList.add("active");
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

  if (previousScreenName !== screenName) {
    window.scrollTo(0, 0);
  }

  syncAppHistory(screenName, navigationOptions.historyMode || "push", navigationOptions.historyLevel || "");
}

function handleSwipe(swipeDistance) {
  if (isSwipeLocked || isRoundPaused) {
    return false;
  }

  const minimumSwipeDistance = 60;

  if (swipeDistance > minimumSwipeDistance) {
    if (isSingleCardMode()) {
      showSingleNextCard("fly-up");
      return true;
    }

    markCorrect();
    return true;
  } else if (swipeDistance < -minimumSwipeDistance) {
    if (isSingleCardMode()) {
      showSingleNextCard("fly-down");
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
  }, WORD_CARD_FLIGHT_DURATION_MS);
}

function animateWordCard(className) {
  if (!wordCardMotion) {
    return;
  }

  const currentTransform = wordCardMotion.style.transform || "translateY(0px)";
  const currentOpacity = wordCardMotion.style.opacity || "1";

  wordCardMotion.classList.remove("fly-up", "fly-down", "correct-swipe", "skip-swipe");
  wordCardMotion.style.transition = "none";
  wordCardMotion.style.transform = currentTransform;
  wordCardMotion.style.opacity = currentOpacity;
  void wordCardMotion.offsetWidth;

  wordCardMotion.classList.add(className);
  void wordCardMotion.offsetWidth;
  wordCardMotion.style.transition = `transform ${WORD_CARD_FLIGHT_DURATION_MS}ms cubic-bezier(0.16, 0.72, 0.20, 1), opacity 120ms ease ${WORD_CARD_FLIGHT_DURATION_MS - 120}ms`;
  wordCardMotion.style.transform = "";
  wordCardMotion.style.opacity = "";
}

function setupGameAudioUnlockEvents() {
  const unlockEvents = ["pointerdown", "touchstart", "keydown"];

  unlockEvents.forEach((eventName) => {
    document.addEventListener(eventName, unlockGameAudio, { once: true, passive: true });
  });
}

function getGameAudioContext() {
  if (gameAudioContext) {
    return gameAudioContext;
  }

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    return null;
  }

  gameAudioContext = new AudioContextClass();
  return gameAudioContext;
}

function unlockGameAudio() {
  const context = getGameAudioContext();
  if (!context) {
    return;
  }

  if (context.state === "suspended") {
    context.resume().catch(() => {});
  }

  if (isGameAudioUnlocked) {
    return;
  }

  try {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const startTime = context.currentTime;

    gain.gain.setValueAtTime(0.0001, startTime);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(startTime);
    oscillator.stop(startTime + 0.02);
    isGameAudioUnlocked = true;
    preloadGameSoundBuffers();
  } catch (error) {
    // Sound is optional; the game must keep working if audio is blocked.
  }
}

function decodeGameAudioData(context, arrayBuffer) {
  return new Promise((resolve, reject) => {
    let isSettled = false;
    const finishResolve = (buffer) => {
      if (isSettled) {
        return;
      }
      isSettled = true;
      resolve(buffer);
    };
    const finishReject = (error) => {
      if (isSettled) {
        return;
      }
      isSettled = true;
      reject(error);
    };

    try {
      const decodeResult = context.decodeAudioData(arrayBuffer, finishResolve, finishReject);
      if (decodeResult && typeof decodeResult.then === "function") {
        decodeResult.then(finishResolve).catch(finishReject);
      }
    } catch (error) {
      finishReject(error);
    }
  });
}

function loadGameSoundBuffer(eventName) {
  const soundPath = GAME_SOUND_FILE_MAP[eventName];
  if (!soundPath || gameSoundBufferFailures[eventName]) {
    return null;
  }
  if (gameSoundBufferCache[eventName]) {
    return Promise.resolve(gameSoundBufferCache[eventName]);
  }
  if (gameSoundBufferPromises[eventName]) {
    return gameSoundBufferPromises[eventName];
  }

  const context = getGameAudioContext();
  if (!context || typeof fetch !== "function") {
    return null;
  }

  gameSoundBufferPromises[eventName] = fetch(soundPath)
    .then((response) => {
      if (!response || !response.ok) {
        throw new Error("Sound request failed");
      }
      return response.arrayBuffer();
    })
    .then((arrayBuffer) => decodeGameAudioData(context, arrayBuffer))
    .then((buffer) => {
      gameSoundBufferCache[eventName] = buffer;
      return buffer;
    })
    .catch((error) => {
      gameSoundBufferFailures[eventName] = true;
      return null;
    });

  return gameSoundBufferPromises[eventName];
}

function preloadGameSoundBuffers() {
  if (!isGameSoundEnabled) {
    return;
  }

  Object.keys(GAME_SOUND_FILE_MAP).forEach((eventName) => {
    loadGameSoundBuffer(eventName);
  });
}

function playBufferedGameSound(eventName) {
  const buffer = gameSoundBufferCache[eventName];
  if (!buffer) {
    loadGameSoundBuffer(eventName);
    return false;
  }

  const context = getGameAudioContext();
  if (!context) {
    return false;
  }

  try {
    const source = context.createBufferSource();
    const gain = context.createGain();
    const levelName = eventName === "gameComplete" || eventName === "gameWin" || eventName === "gameLoss" || eventName === "tie" || eventName === "gameTie"
      ? "finale"
      : eventName === "roundComplete" || eventName === "roundStart" ? "round" : eventName === "turnChange" ? "transition" : "feedback";
    const levelVolume = getSoundLevelVolume(levelName);
    const startTime = context.currentTime + 0.004;
    const volume = Math.max(0.0001, GAME_SOUND_MASTER_VOLUME * levelVolume);

    source.buffer = buffer;
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.018);
    gain.gain.setValueAtTime(volume, startTime + Math.max(0.02, buffer.duration - 0.05));
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + buffer.duration);
    source.connect(gain);
    gain.connect(context.destination);
    source.start(startTime);
    source.stop(startTime + buffer.duration + 0.02);
    return true;
  } catch (error) {
    return false;
  }
}

function getSoundLevelVolume(levelName) {
  return GAME_SOUND_LEVELS[levelName] || GAME_SOUND_LEVELS.feedback;
}

function scheduleEnvelope(gain, startTime, duration, volume, note) {
  const attack = Math.min(note.attack || 0.014, duration / 3);
  const release = Math.min(note.release || 0.16, Math.max(0.04, duration - attack));
  const sustainUntil = Math.max(startTime + attack + 0.01, startTime + duration - release);
  const endTime = startTime + duration;

  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + attack);
  gain.gain.setValueAtTime(volume, sustainUntil);
  gain.gain.exponentialRampToValueAtTime(0.0001, endTime);
}

function playToneLayer(context, baseTime, note) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const startTime = baseTime + (note.start || 0);
  const duration = Math.max(0.05, note.duration || 0.18);
  const levelVolume = getSoundLevelVolume(note.level || "feedback");
  const noteVolume = Math.max(0.0001, (note.volume || 0.2) * levelVolume * GAME_SOUND_MASTER_VOLUME);

  oscillator.type = note.type || "sine";
  oscillator.frequency.setValueAtTime(note.frequency || 440, startTime);
  if (note.glideTo) {
    oscillator.frequency.linearRampToValueAtTime(note.glideTo, startTime + duration * 0.78);
  }

  scheduleEnvelope(gain, startTime, duration, noteVolume, note);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.04);
}

function playToneSequence(sequence = []) {
  if (!isGameSoundEnabled) {
    return;
  }

  const context = getGameAudioContext();
  if (!context || sequence.length === 0) {
    return;
  }

  if (context.state === "suspended") {
    context.resume().catch(() => {});
  }

  const baseTime = context.currentTime + 0.012;

  sequence.forEach((note) => {
    try {
      playToneLayer(context, baseTime, note);
    } catch (error) {
      // Ignore individual failed notes; audio feedback is non-critical.
    }
  });
}

function playGameSound(eventName = "uiClick") {
  if (!isGameSoundEnabled) {
    return;
  }

  if (playBufferedGameSound(eventName)) {
    return;
  }

  const sequence = GAME_SOUND_PATTERNS[eventName] || GAME_SOUND_PATTERNS.uiClick;
  playToneSequence(sequence);
}

function playHapticFeedback(type = "tap") {
  if (!isHapticFeedbackEnabled || typeof navigator === "undefined" || typeof navigator.vibrate !== "function") {
    return;
  }

  const patterns = {
    correct: [18],
    skipped: [32],
    roundComplete: [18, 42, 18],
    gameComplete: [24, 44, 38],
    gameLoss: [58],
    tie: [24, 36, 24],
    achievement: [18, 45, 22],
    tap: [12],
  };

  try {
    navigator.vibrate(patterns[type] || patterns.tap);
  } catch (error) {
    // Haptic feedback is optional and not supported on every device.
  }
}

function playCorrectSound() {
  playGameSound("correct");
  playHapticFeedback("correct");
}

function playSkipSound() {
  playGameSound("skipped");
  playHapticFeedback("skipped");
}

function playRoundCompleteSound() {
  playGameSound("roundComplete");
  playHapticFeedback("roundComplete");
}

function playGameCompleteSound(result = "win") {
  if (result === "loss") {
    playGameSound("gameLoss");
    playHapticFeedback("gameLoss");
    return;
  }

  if (result === "tie") {
    playGameSound("tie");
    playHapticFeedback("tie");
    return;
  }

  playGameSound("gameComplete");
  playHapticFeedback("gameComplete");
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
