# Movohray 0.6.7-c3 — native Lightplay / Світлограй

Build: 2026-09-08. Revision: `0.6.7-20260908-c3`. Required update: true.
Cache: `movohray-cache-v0.6.7-b20260908-c3`.
Public beta candidate only; no production tag or GitHub Release.

## Source and scope

Source: https://github.com/i-sirius/tap_tiling, main commit
`f20c9039c67e8fdf00cc424b0affc42fb570e611`.
Read app.js, index.html, style.css and sw.js before implementation.

Preserved: orthogonal cross toggle including the selected cell; either uniform
state wins; 3 rows × 4 columns (default), 4×4 and 5×5; generation through legal
moves from a uniform board; customizable colors; moves/time and replay.

Intentionally omitted: canvas UI, reverse-shuffle hints and automatic hint moves,
global keyboard shortcuts, global colorOn/colorOff storage keys, original CSS,
manifest, icons, installation prompts and service worker. No iframe, runtime
GitHub dependency, backend, new audio assets or separate PWA registration.

Native entry: Settings → Bonus games → Світлограй / Светлоигра / Lightplay.
HOME retains five main game cards. The now-empty Coming soon section is hidden.
The adapter uses shared navigation, theme and production audio events.

## Engine and gameplay

`svitlohray-engine.js` has no DOM/storage/audio dependencies. Toggle is immutable.
JSON serialization validates dimensions, cell count and bits.
Generation applies rows × columns legal random moves to all-ON. Uniform results
are regenerated; after 16 degenerate retries a single legal move guarantees a
non-winning solvable position. No random filling of cells.

The solver builds A·x = board XOR target over GF(2), for both target=0 and target=1.
Gauss-Jordan elimination detects inconsistent targets, sets free variables to zero
and returns the shorter of the two resulting valid solutions. Complexity O(n³),
n ≤ 25. It does not enumerate 2²⁵ positions or promise globally minimum moves.
Every hint recomputes from the current state and marks one tile until the next
move/new game. It never makes a move for the player.

Difficulty labels describe dimensions rather than guaranteed minimum move counts.
3×4 is Easy, 4×4 Normal, 5×5 Hard. Cells remain square; the 3×4 board is rectangular.
One native button click handles mouse, touch and keyboard without duplicate
pointer/touch listeners. State and coordinates have accessible labels.

Time starts on the first move, pauses on hidden visibility/settings/update overlay,
and stops at victory or exit. No active-game persistence across reloads.
Colors and independent best moves/time per size use `movohray-svitlohray-*` keys.
Corrupt/unavailable storage falls back to in-memory/default data. Personal bests
exclude games where Hint was used. Color pairs require luminance contrast ≥ 3:1;
random palettes are distinct curated pairs, and all palette changes persist.

## Validation

- Node tests: center/edge/corner, immutability, double-toggle identity, both wins,
  input validation, serialization, all sizes and degenerate RNG termination.
- 3,000 seeded generated boards; solve before and after 0–30 arbitrary player moves.
- Independent reachable-state enumeration versus solver on all 4,096 3×4 states.
- Existing Slovesnyi engine tests: phases, scoring, draws, pauses, serialization,
  fair pair rotation, position balance and topic exposure. 180 topics unchanged.
- Browser automation uses installed Edge (Chromium) via Python Playwright.
- Native UI matrix: 3 languages × 3 sizes × 5 viewports × 2 themes = 90 cases.
  Viewports: 360×800, 390×844, 430×932, 768×1024, 1600×900.
- Regression: Slovesnyi full rounds/final, eight players, long names/topics,
  automatic timers, missing storage, retry; existing mode setup/back, Settings,
  Labs, Achievements, language/theme and Who Am I fullscreen final.
- Single SW precaches all new JS/CSS as critical revisioned assets. Local upgrade
  checks cover v0.6.6a and c2, activation, old-cache removal and offline play.

Commands (Node and Python may need their local installed paths):

```
node --test tests/slovesnyi-engine.test.cjs tests/svitlohray-engine.test.cjs
python tests/slovesnyi-browser.py
python tests/slovesnyi-browser.py --extras
python tests/svitlohray-browser.py
python tests/svitlohray-extras.py
# Set MOVOHRAY_BASELINE=03d572e for the c2 upgrade test:
python tests/slovesnyi-browser.py --pwa
# Set MOVOHRAY_TEST_URL=https://i-sirius.github.io/movohray/ for live smoke:
python tests/svitlohray-browser.py
```

Screenshots: system TEMP/movohray-c3-checks/svitlohray-360-{light,dark}.png and
svitlohray-1600-{light,dark}.png; win screenshots cover each language/size.

## Release history and human testing

Preserved c1 `2299bc2` and c2 `03d572e` unchanged. Pre-integration origin/main was
`ed04cf321d20f793548f5d141bcdfb61f7549931` (0.6.6a). c3 is an additive candidate
commit on the same local main. Push must be ordinary fast-forward only.

Human beta testing should include real iOS Safari/installed PWA, Android Chrome,
native OS color picker, background/resume, audio on device, and puzzle difficulty.
Browser automation covers Chromium, not physical devices. Short screens may
scroll vertically, including expanded color controls; horizontal overflow and
clipped tiles are disallowed. Solver hints are correct, not guaranteed optimal.
Final push SHAs and live deployment results are reported in the delivery message.

All local engine, 90-case native browser, Slovesnyi regression and PWA upgrade
checks passed. Online smoke has no console/runtime errors. Offline Chromium logs
the expected network-only `version.json` failure; all game assets and gameplay
remain available. This existing update-check behavior is narrowly allowed in the
offline test, not treated as an uncached game asset.
