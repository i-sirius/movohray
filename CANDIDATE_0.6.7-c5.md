# Candidate 0.6.7-c5 — achievements for the new modes

Baseline: public beta c4, `095a8d906875a62e20ec2646aae37d16e2606332`.
Version `0.6.7`, build `2026-09-08`, candidate `c5`, required `true`.
Revision `0.6.7-20260908-c5`; cache `movohray-cache-v0.6.7-b20260908-c5`.
No production tag or GitHub Release. Public beta only.

## Existing infrastructure and integration

Definitions: `WORD_GUESS_ACHIEVEMENTS` in app.js. Copy: `WORD_GUESS_TEXT.uk/ru/en`.
Game groups: `WORD_GUESS_ACHIEVEMENT_GAMES`, with existing theme/category filters.
The two added groups are Світлограй / Цветоигра / Lightplay and
Словесний / Словесный / Word Duel. They use the existing achievement screen.

Storage remains `movohray-wordguess-achievements-v2`, through
`readWordGuessAchievementsState` / `persistWordGuessAchievementsState`.
The existing reset list already includes this key. Existing schema handling and
old unread migration are unchanged; missing new stats receive zero/false defaults.
No new storage framework, migration, or player profile is introduced.

`new-mode-achievements.js` is a small adapter to the existing store and
`unlockAchievementConditions` / `unlockWordGuessAchievement`. It reads completed
Svitlohray snapshots and listens to existing `movohray:slovesnyi` events.
Both engines, balancing, generation, solver, game timers, CSS/layout, dictionaries,
debates.json and c4 copy remain unchanged.

Awards use the original idempotent function: an existing unlock returns without
changing its original `unlockedAt`, queuing another toast or adding another unread
item. Multiple matches in one result use the existing toast batch/queue.
`viewedAchievements`, `revealedHints`, New inbox, counts, sorting and timestamps
remain part of the same infrastructure.

## Counts

| Group | c4 | c5 |
|---|---:|---:|
| Word Guess | 148 | 148 |
| Alias | 93 | 93 |
| Crocodile | 76 | 76 |
| Who Am I | 83 | 83 |
| Movohray | 17 | 17 |
| Svitlohray | 0 | 10 |
| Slovesnyi | 0 | 6 |
| **Total** | **417** | **433** |

All 417 old definitions, title/description/hint translations and old award,
sorting, rendering, timestamp, unread and reveal functions are regression-checked
against the c4 Git baseline. Exact new UA/RU/EN copy is checked against
`tests/new-mode-achievements-copy.json` (the supplied specification).

## New achievements

| ID | UA title | Icon | Condition |
|---|---|---|---|
| svitlohray-first-win | Хай буде світло! | 💡 | First completed board; hints allowed |
| svitlohray-no-hint | Сам розібрався | 🧩 | Completed without hints |
| svitlohray-big-picture | Велика картина | 🔲 | Completed 5×5; hints allowed |
| svitlohray-all-sizes | Три розміри | ▦ | Completed all three sizes |
| svitlohray-ten-wins | Світлова звичка | ✨ | 10 completions |
| svitlohray-twenty-five-wins | Не вимикай | 🔆 | 25 completions |
| svitlohray-colorist | Колорист | 🎨 | Accepted manual color change in this board, then win |
| svitlohray-new-mood | Новий настрій | 🌈 | Random palette in this board, then win |
| svitlohray-no-help | Без допомоги | 🧠 | Five completed boards in a row without hints |
| svitlohray-patience | Світло любить терплячих | 🐢 | **Secret:** 5×5 completed in at least 75 moves |
| slovesnyi-first-duel | Є аргумент | 🗣️ | Non-draw match result |
| slovesnyi-first-game | Переконав | 🏆 | Game complete with a winner |
| slovesnyi-devils-advocate | Адвокат диявола | 😈 | Actual winner assigned `con` |
| slovesnyi-crazy-win | І це я відстояв | 🤪 | Winner on `currentTopic.level === crazy` |
| slovesnyi-three-streak | Серія доказів | 🔥 | Winner's existing engine `streak >= 3` |
| slovesnyi-both-sides | Універсальний оратор | ⚖️ | Same player wins pro and con in the same party |

## State and event semantics

New persistent `wordGuessAchievementsState.svitlohray` fields:
`completed`, `won3x4`, `won4x4`, `won5x5`, `noHintWinStreak`, and
`lastCompletedGameId` to reject repeated delivery of the most recent result.
Corrupt values fall back to zero/false. Unavailable storage follows the existing
in-memory fallback.

Svitlohray adds per-board `gameId`, `manualPaletteChanged`, `randomPaletteUsed`.
Flags reset on a new board/replay/size change. An unchanged or rejected input does
not count. Reset colors is neither a manual nor random palette action. An accepted
manual change and random palette may both qualify in the same board.
`moves`, `board` and `assisted` come directly from existing UI state, not duplicate
achievement counters. Hint-assisted wins reset the persistent no-hint streak;
abandoning a board does not.

Slovesnyi uses the existing `sessionId`, `roundIndex`, `currentMatch.winnerId`,
`positions`, `currentTopic.level` and player `streak`. No added engine fields.
Only wins-by-side flags per player and the last processed round are tracked in
the adapter for the current session. A different session clears that tracker.
Draws/defeats follow the engine's current streak rules (participants reset; players
sitting out retain their streak). No player names or cross-party side records persist.

## Secret behavior

The existing system's `mystery` behavior shows titles/descriptions while hiding
the extra “How to” condition until discovery. It does **not** hide all copy until
unlock. SV-10 uses that same behavior, with the requested exact description as its
hint. Three taps reveal the condition without awarding it. Unlock marks it revealed,
adds timestamp/unread and persists through the normal path. No old secret changes.

## Verification and beta handoff

- New integration tests cover all 16 conditions, negative cases, 10/25/75 boundaries,
  mixed palettes, draw/loss/session streak semantics, duplicate results, old state,
  corrupt/unavailable storage, timestamps and unread persistence.
- Existing Slovesnyi and Svitlohray engine simulations and solver audit are repeated.
- Browser flow uses near-win generation only inside the test runtime. Production
  generation and timing defaults are untouched. Both real game result paths award
  achievements and render them in the common screen.
- UI checks: 360×800, 390×844, 768×1024, 1600×900; UA/RU/EN, light/dark,
  both new groups, exact copy, no horizontal overflow, card scrolling and secret.
- Existing Alias/Crocodile, Word Guess and Who Am I award handlers, old mystery
  reveal, unread state, sorting and persistence are exercised.
- Static audit covers syntax, JSON/CSS, duplicate IDs, assets, revisioned SW refs,
  and absence of optional chaining/nullish coalescing in the new integration.
- Local c4→c5 PWA test activates the new worker, removes the old cache and plays
  offline. The new integration JS is a critical precached asset of the single SW.
- A real c4 browser profile is prepared before push, with old progress, timestamps
  and read-state, for live upgrade verification. Fresh/live achievement flows and
  reload persistence run after deployment.

Commands: `node --test tests/new-mode-achievements.test.cjs`, existing engine tests,
`python tests/new-mode-achievements-browser.py`, existing game browser smokes.
For local upgrade set `MOVOHRAY_BASELINE=095a8d9` and run
`python tests/slovesnyi-browser.py --pwa`.
Live checks: `--prepare-live` before push, `--live` and `--upgrade` after deployment.
Screenshots are in system TEMP/movohray-c5-checks.

Known testing limits: Chromium/Edge automation, not physical Safari/iOS or Android.
An offline `version.json` network failure is expected from the existing network-only
update check; missing game resources and runtime exceptions are not ignored.
Commit/push SHAs and final live results are provided in the delivery message.

Local final result: 14 achievement tests + 6 engine tests passed. Browser flows A/B,
48 achievement layouts, both existing mode smokes and extras, c4-to-c5 PWA update,
fresh/offline play, exact copy and unchanged core-file audit all passed.
Online console/runtime errors: zero.
