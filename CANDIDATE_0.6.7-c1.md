# Словесний — candidate 0.6.7-c1

Baseline: `ed04cf3`, production tag `v0.6.6a`. Before implementation: fetch, clean status, five-commit log and `pull --ff-only origin main`; baseline was already current.

Metadata: version `0.6.7`, build `2026-09-07`, candidate `c1`, revision `0.6.7-20260907-c1`, cache `movohray-cache-v0.6.7-b20260907-c1`, required `true`. The existing internal numeric candidate is `1`; metadata parsing accepts both `1` and `c1`.

## Implemented

The fifth home card opens a complete local game for 2–8 players. «Світлограй» remains in Coming soon. All new UI and topics support Ukrainian, Russian and English. Setup has its own language selector, initially following the existing app/Labs language; it does not change other games' language preferences.

Setup: editable names (32 characters; blank names get localized defaults; duplicate names are rejected), target 3/5/7 (default 5), preparation 10/20/30 (20), speeches 30/40/60 (40), rebuttals off/10/15/20 (15), multi-select easy/normal/crazy (all selected). At least one level is required.

Flow: intro → preparation → speech A → speech B → optional rebuttal A/B → voting → result → next intro or fullscreen final. Intro has a short, reduced-motion-aware transition and an explicit ready button. Timed phases advance automatically or finish early. Manual pause, app overlays and background visibility pause the clock. Back supports cancel/confirm exit. The selected winner receives exactly one point, a draw receives none, and reaching the target ends the party. Final results sort by wins and show all players' wins, battles, FOR and AGAINST counts. New game preserves setup choices; party scores reset.

The new mode uses existing `roundStart`, `turnChange`, `countdown`, `correct`, `tie` and game-complete audio. No new audio assets or synthetic sound implementation were added. The small SVG home icon is the only new visual asset.

## State and balancing

`slovesnyi-engine.js` has no DOM, storage, network or audio dependency. Its input/output is plain JSON-compatible state: schema version, session ID, players and scores, current match and topic, positions, phase, phase start and pause timestamps, round index, pair history, topic history, settings and winner. UI, storage and side effects live in `slovesnyi.js`. A serialized state can be parsed and passed back to engine operations; this round trip is tested. There is no resume UI or automatic party persistence in c1.

Pair selection ranks the lower and then higher player appearance counts first, with absolute priority. For even groups in the lowest exposure tier, a small matching lookahead minimizes repeated pair exposure across the remaining group, preventing the same two players from repeatedly being stranded at the end. Pair counts, pair recency and player recency break remaining ties. Equal candidates are randomized. At most eight players are involved; this is a bounded local calculation, not a scheduling framework. A three-player game necessarily has a player participating in consecutive battles.

Position assignment evaluates both orientations and minimizes the sum of squared post-assignment FOR/AGAINST differences. Equal orientations are random. Player A is the randomly assigned FOR player; B is AGAINST. Players cannot select their own position. Counts are recorded when a match is shown, including matches subsequently abandoned.

Topics use absolute exposure tiers (zero before one before two, etc.), then the smallest last-shown sequence. Only exact ties are randomized. The selected-level pool exhausts before repetition. Stable IDs and lightweight `movohray-debates-exposure-v1` local storage preserve exposure across parties; unavailable storage falls back to in-memory history. No global statistics database was added.

## Topic inventory

180 original topic records, each translated into UA/RU/EN. All 12 categories contain 15 topics: 5 easy, 5 normal, 5 crazy. Total distribution: 60/60/60.

Categories: household, food, technology, school, work, friendship, travel, entertainment, fantasy, absurd, choices, everyday. Category identifiers are internal; the user selects difficulty levels. The topics focus on light, everyday and playful arguments rather than political, religious or traumatic conflicts.

## Achievements

No new achievements in c1. The existing achievement implementation is tightly coupled to other games and their persistent counters. Instead, `document` emits `movohray:slovesnyi` CustomEvents with `{ type, state }` snapshots for `match-start`, `phase-change`, `match-result` and `game-complete`. Future adapters can award first-win, against-win, crazy-win and streak achievements without modifying engine rules. Per-party streaks are already recorded.

## Verification

- Node syntax check: all root JavaScript files pass. New runtime modules use traditional functions/variables and do not introduce optional chaining, nullish coalescing, modules or other newer syntax requirements.
- JSON: all root JSON files and the web manifest parse. Topic IDs and each language's topic text are unique. New locale key sets match across all three languages.
- CSS: both existing and new stylesheets parse with tinycss2, including nested media/supports/keyframe rules. Static and runtime HTML ID uniqueness pass. Referenced local HTML and SW assets exist. `git diff --check` passes.
- Engine: 720 matches for each player count 2–8 (5,040 total). Largest appearance gap is 1; final pair-count spreads are 0 or 1; maximum final per-player position imbalance is 2. Tests also cover scoring idempotence, draws, disabled rebuttals, phase transitions, pause/resume, JSON state round trip, topic exhaustion, history reuse and target wins.
- Headless Edge: HOME → setup with four named players → intro → preparation → speeches → both rebuttals → voting → draw/score → next matches → target wins → final → new game → home. Automatic timer transitions are exercised by changing runtime timestamps; production timer defaults remain unchanged. Browser Back/cancel/confirm, settings pause, Labs language switching and existing achievements UI pass.
- Existing mode checks: Alias, Crocodile, Word Guess and Who Am I setup/home navigation; Who Am I desktop final still spans 1600 px. These are integration smoke checks, not exhaustive playthroughs of every existing mode.
- Viewports: 360×800, 390×844, 430×932, 768×1024 and 1600×900. No horizontal page overflow; preparation topic, countdown and controls fit. Eight-player finals cover the full viewport, remain centered and keep a maximum card width of 720 px. Long finals scroll inside the card; New game is reachable. Screenshots are written to the system temporary directory under `movohray-c1-checks`.
- Additional touch/mobile checks cover UA/RU/EN, dark theme, long names, input validation, missing-data retry and unavailable topic-history storage. Runtime/console JavaScript errors: zero in the game checks. Offline network-only version/SW update probes may report expected network failures.
- PWA upgrade test serves the actual `v0.6.6a` baseline, installs its worker, switches to candidate assets, installs/activates c1 and waits for its controller. The old cache is removed; every candidate cached asset has the correct revision. Offline reload launches the candidate and starts a game with a cached topic. The test explicitly waits for async worker conditions to resolve before taking the browser offline.

Run from the repository root:

```sh
node tests/slovesnyi-engine.test.cjs
pip install playwright tinycss2
python tests/slovesnyi-browser.py
python tests/slovesnyi-browser.py --extras
```

The browser test uses installed Edge on Windows. Elsewhere, install Playwright Chromium first. `--smoke` and `--pwa` run the corresponding subsets. Browser/test dependencies are development tools only; the PWA has no new external runtime dependency.

## Follow-ups and limits

Physical iOS/Safari safe areas, installation and audio playback still need device testing; Chromium viewport checks do not certify old Safari rendering. Live party restoration, persistent global statistics and achievement awards are deferred. The state is ready for future adapters, but no server, room codes, remote voting or networking layer is implemented. Human party testing can refine topic tone and timer pacing before a later candidate.

This candidate is local only. No production release, `v0.6.7` tag or push is authorized by this implementation step.
