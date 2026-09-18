# Candidate 0.6.7-c10 — Daily Word

Base: `df861c893b5deb6ee8212d7bf29ec3daf75e2b69` (c9).

- Version: `0.6.7`; build: `2026-09-18`; candidate: `c10`; required: `true`.
- Revision: `0.6.7-20260918-c10`.
- Cache: `movohray-cache-v0.6.7-b20260918-c10`.
- No production tag. Hero/image expansion and the Ukrainian character pack are untouched.

## Play and presentation

The compact **Слово дня / Слово дня / Word of the Day** card sits below the main mode grid. It shows a start button, language, and current streak when present. Completed days display a disabled **Виконано сьогодні ✓** button. The menu refreshes on focus, visibility, storage changes and every 30 seconds, so a menu left open overnight becomes available again.

Daily play uses the existing Word Guess board, physical/on-screen keyboard, validation, six-row reveal animation, hints, sounds, dictionary links, sharing, feedback and result screen. Daily rules are fixed at **five letters, six guesses, repeated letters allowed**. Normal preferences are never rewritten. A loss permits another attempt at the same word. A win shows the daily streak, best streak and total, with Menu and Play more; Play more starts normal Word Guess. Back/exit from daily play leads to the menu.

The collection's existing description area also shows all three daily statistics for the selected language. All new copy, including five achievement names/descriptions, uses the existing Ukrainian, Russian and English translation dictionaries. Existing Labs access to Russian/English is preserved. Language is locked during a daily session; Kids mode, age and illustrations do not affect daily selection.

## Frozen selection

`daily-words.json` contains **365 entries per language**, manually shortlisted from the corresponding existing five-letter **answer** dictionaries. These are common, family-safe words, not machine-translated copies of another language. All normalized entries are unique within each language. The three languages have real existing content, so no language fallback is necessary.

The v1 arrays and order are permanent. They were mixed once during authoring; there is no runtime shuffling or random selection. Selection is the positive modulo of whole calendar days since **2026-01-01** by the language pool's length. The repeat cycle is 365 days.

`DailyWord.localDate()` builds `YYYY-MM-DD` with `getFullYear()`, `getMonth()` and `getDate()`. UTC is used **only** to convert an already-chosen calendar label into an integer day ordinal; elapsed local milliseconds and UTC "today" are never used. This handles month/year/leap/DST boundaries. A session keeps its starting date/word even across midnight. A newly started session uses the then-current local date.

Normalized-LF SHA-256 of the frozen JSON (enforced by the test runner):
`aa9d6bf44d159264065f219c0b2a793ee5c53e0019cce18b0ccb076ce55dd7d9`.

## Persistence and achievements

Key: **`movohray-daily-word-v1`**.

```json
{
  "version": 1,
  "languages": {
    "uk": {
      "lastCompletedDate": "2026-09-18",
      "currentStreak": 4,
      "bestStreak": 7,
      "totalCompleted": 18,
      "days": { "2026-09-18": { "completed": true, "attempts": 2 } }
    },
    "ru": {},
    "en": {}
  }
}
```

Each language uses the same progress shape. Identity is **date + language**, with separate streaks and totals because answers differ. `attempts` counts started sessions, not individual guesses. Only a genuine accepted winning guess credits completion. Daily sessions use separate completion statistics; normal Word Guess wins/games/streaks remain separate. Existing live interaction achievements still use their existing idempotent unlock path.

History is capped at **62 dates per language**, attempts at 9,999. Aggregates survive pruning. Missing/malformed data is normalized safely; unavailable storage keeps progress for the current tab session. Daily data participates in the app's existing explicit user-data reset. Existing achievement storage/schema is retained.

First completion starts streak 1; yesterday-to-today increments it; a gap starts again at 1. A streak remains visible if the last completion was yesterday or today, otherwise it displays 0. Repeated completion cannot increment counters. The last-completed date is a high-water mark: clock rollback/older dates cannot earn an additional completion, including dates already pruned from history. This conservative rule avoids duplicate credit after timezone or manual clock changes. Returning to the current date resumes normal progression. Mutations re-read storage so another tab's completion is respected.

Five stable definitions are appended to the Word Guess achievement group; all **434** c9 definitions and their order are preserved, for **439 total**. Counts continue to be derived from the definitions. New IDs:

| ID | Condition |
| --- | --- |
| `daily-word-first` | First daily completion |
| `daily-word-streak-3` | Best streak reaches 3 in one language |
| `daily-word-streak-7` | Best streak reaches 7 in one language |
| `daily-word-streak-30` | Best streak reaches 30 in one language |
| `daily-word-total-50` | 50 completions across all languages |

## Files and offline behavior

- `daily-word.js`: pure local-date, deterministic selection and versioned progress API.
- `daily-word-ui.js`: menu/context/statistics/achievement adapter.
- `daily-words.json`: frozen multilingual v1 data.
- `app.js`: small Word Guess start/load/finish/navigation hooks, localized copy, appended awards, c10 metadata.
- `index.html`, `styles.css`: compact card, date context and stats integrated with existing layouts; revisioned scripts/styles.
- `service-worker.js`, `version.json`: matching c10 revision/cache; the three daily assets are critical precache entries.
- `tests/daily-word.test.js`, `tests/daily-word-browser.py`: calendar/storage and actual-browser checks.
- `tests/new-mode-achievements.test.cjs`: current total expectation updated to 439.
- `WORDLIST_LICENSES.md`: records the daily pools' existing dictionary provenance.

The worker's GET_REVISION handshake, mandatory update gate, bounded recovery and cache lifecycle are unchanged. No backend, account, clock override or visible testing controls are added.

## Validation

Run with an installed Edge/Chromium browser and Python (standard library only):

```powershell
python -X utf8 tests/daily-word-browser.py
git diff --check
```

`MOVOHRAY_BROWSER` can point to another installed Chromium executable. The runner uses localhost, an isolated temporary browser profile and temporary screenshot files; it does not touch the normal browser profile. It serves the exact c9 baseline from Git for update tests.

Coverage includes JS/CJS syntax parsing in Chromium, all JSON, frozen pool/source membership/normalization, deterministic selection/reload, empty/corrupt/unavailable storage, first/duplicate/consecutive/skipped completions, month/year/leap/DST boundaries, three real timezone contexts, bounded history, separate languages, exact achievement thresholds, all legacy definitions, real loss/retry/keyboard-win, normal Word Guess completion isolation, Kids independence, narrow/landscape overflow, offline reload/play/win, real c9-to-c10 required updates in two tabs, worker revision/cache handshake, old progress preservation and same-day duplicate completion across tabs.

Browser checks also cover all six existing mode entry points, dark daily text, and reaching achievement cards after the new stats on 320×568 and 667×375 screens. A small scrolling adjustment on short phones keeps the collection reachable below its filters.

Node is not installed, and was not installed for this task. Node-based suites are not executed; the runner parses their scripts in the browser. Actual older Safari/iOS, touch gestures, installed iOS PWA chrome, audible sound/haptics and native share sheets need device acceptance. Added production JS contains neither optional chaining nor nullish coalescing.

## Manual acceptance

- **Desktop:** find the daily card below the mode grid; start; confirm localized name/date without an answer; lose and retry; win; check the completed card, streak and collection stats; Play more must open normal Word Guess with your saved options.
- **Narrow phone / landscape:** check daily card wrapping, scroll to reach all keyboard controls, try hints and Menu, finish a game and check result buttons/scrolling; verify no horizontal overflow. Try light/dark themes and all available UI languages.
- **Kids:** note today's word, leave, toggle Kids/age, reopen before completion; the answer and six-guess daily rules must stay the same.
- **Offline:** load c10 online and allow caching; disconnect; reopen; start today's uncompleted daily and complete it. Reopen to verify the saved completed state.
- **Next day without changing the system clock:** run the automated checks above, or use the read-only selection and in-memory progress example below. No production localStorage is written.

```js
loadDailyWordPool().then(function (pool) {
  console.table([
    DailyWord.select(pool, "2026-12-31", "uk"),
    DailyWord.select(pool, "2027-01-01", "uk")
  ]);
  var saved = {};
  var demo = DailyWord.createStore({
    getItem: function (key) { return saved[key] || null; },
    setItem: function (key, value) { saved[key] = value; }
  });
  demo.complete("uk", "2026-12-31");
  demo.complete("uk", "2027-01-01");
  console.log(demo.status("uk", "2027-01-01")); // streak 2, total 2
});
```
