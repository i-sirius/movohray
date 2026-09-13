# Candidate 0.6.7-c6 — Alias onboarding and achievement presentation

Public beta only. No production tag or GitHub Release.
Baseline: `2d5ce605483d9c967500f8162135e0af6b457e6f` (c5), clean main after fetch and fast-forward pull.
Version `0.6.7`; build `2026-09-13`; candidate `c6`; required `true`.
Revision `0.6.7-20260913-c6`; cache `movohray-cache-v0.6.7-b20260913-c6`.

## A. Human-feedback UX changes

Alias stores optional local learning in `movohray-alias-swipe-learning-v1`:
`totalSwipeGestures`, `usedSwipeUp`, `usedSwipeDown`, `completedAliasRounds`.
Large instructions remain until **rounds >= 2 AND swipes >= 6 AND up AND down**.
Only accepted up/down gestures from Alias's real pointer handler count; buttons,
short drags, paused/locked gestures, other modes and inactive rounds do not count.
A started Alias round counts once when it reaches review, including a manually
finished round. Abandoning a round does not count. No migration or analytics.

Malformed/unavailable storage defaults safely; failed writes retain progress in
memory until reload. Global progress/settings reset includes the new key.
UA/RU/EN use the existing WORD_GUESS_TEXT localization and language preference.
Large instructions use static arrows and 18px text on ordinary portrait phones;
the learned state retains localized compact instructions. The existing gesture
area accommodates the hint without adding layout rows or pushing buttons down.
Short viewports reduce spacing/type; short landscape uses one compact line.

Achievement unlock, timestamp, unread/reveal and persistence are unchanged.
`isFocusedTimedGameplay()` selects compact presentation for Alias and timed
Crocodile rounds (including last-word resolution), timed Who Am I, and Slovesnyi
preparation/speechA/speechB/rebuttalA/rebuttalB. Paused timed rounds also retain
compact presentation, avoiding a rich card when play resumes. Word Guess,
single-card Crocodile, menus/setup/review/voting/results and solved Svitlohray
retain the existing rich behavior.

Compact presentation shows only trophy/title, or the localized count when more
awards arrive. A fixed **2200ms** window aggregates unique IDs without extending
the deadline or building a queue. It does not play achievement audio/haptics,
take focus, accept pointer input or alter game timers. It consumes presentation
entries immediately; nothing replays as rich after the round. Existing rich and
pending notifications are converted when entering a focus phase. The rich
presentation still uses its existing sounds and controls outside those phases.

Toast positioning uses real header geometry and `env(safe-area-inset-top, 0px)`.
Slovesnyi/Who Am I reserve a small gap throughout the focus phase so an unlock
does not shift content. Light/dark styles are explicit. New UI is static and
does not require animations or new browser APIs beyond those already in use.

## B. Previous technical audit

No separate completed read-only audit report was supplied in this context or
found in the repository. Baseline had no uncommitted audit changes. No unrelated
technical fix, SW/storage architecture change or engine refactor is included.
SW changes are only the requested revision/cache metadata.

## Local verification

- 24 Node tests: 4 new onboarding/core invariance tests + existing 20 achievement
  and engine tests. Tests compare unlock/read/write/unread/view/reveal functions
  directly with c5. All 433 definitions remain, including c5's 10 Svitlohray and
  6 Slovesnyi achievements. Engines, adapter, conditions and word/topic data unchanged.
- `tests/c6-browser.py`: actual pointer swipes/button taps, two completed rounds,
  learned reload, reset, storage failures, timer deadline/focus, five-award
  aggregation, auto-dismiss, unread/timestamps, no replay, rich-to-compact
  transition, pause/resume, 54 language/theme/layout combinations and offline play.
- `tests/c6-contexts.py`: real timed/untimed phases in Crocodile, Who Am I and
  Slovesnyi; preparation, both speeches/rebuttals, intro/voting; Word Guess game
  completion; solved Svitlohray rich presentation; zero runtime errors.
- Existing achievement browser flows: all 16 c5 achievements, reveal/unread,
  persistence and 48 layouts; offline achievement screen.
- Slovesnyi smoke and extras: game completion, Back, setup, settings, Labs,
  languages, dark theme, timer/visibility/overlay behavior and existing mode entry.
- Svitlohray: 90 layouts, real solver-driven completion, keyboard, reduced motion,
  palette/storage/timer checks, Bonus entry from every mode, Back and offline.
- Static: all JS parses; JSON/manifest/CSS parses; no duplicate static IDs;
  local assets and revisioned SW references resolve; version/cache agree;
  no optional chaining/nullish coalescing added; git diff whitespace check.
- Local PWA installs the actual c5 Git baseline, activates c6, removes the old
  cache, checks revisioned assets and reloads/plays offline. A real live c5
  browser profile was prepared before push with an existing read achievement,
  original timestamp and Alias progress for post-deployment upgrade verification.

| Alias viewport | Large hint / buttons / horizontal overflow |
|---|---|
| 360×800 | Pass / visible / none |
| 375×812 | Pass / visible / none |
| 390×844 | Pass / visible / none |
| 393×852 | Pass / visible / none |
| 430×932 | Pass / visible / none |
| 768×1024 | Pass / visible / none |
| 1600×900 | Pass / visible / none |
| 844×390 | Short landscape fallback; side action column unobstructed |
| 360×640 | Smaller type/spacing; word and actions unobstructed |

Artifacts: `%TEMP%/movohray-c6-checks/`, including `alias-fresh-390.png`,
`alias-learned-390.png`, `alias-compact-390.png`, all viewport screenshots,
`slovesnyi-compact.png` and measured `alias-layouts.json`.

Commands (Node and Python/Playwright are available in the pre-existing TEMP venv):

```
node --test tests/alias-swipe-learning.test.cjs tests/new-mode-achievements.test.cjs tests/slovesnyi-engine.test.cjs tests/svitlohray-engine.test.cjs
python tests/c6-browser.py
python tests/c6-contexts.py
python tests/new-mode-achievements-browser.py
python tests/slovesnyi-browser.py
python tests/slovesnyi-browser.py --extras
python tests/svitlohray-browser.py
python tests/svitlohray-extras.py
# Set MOVOHRAY_BASELINE=2d5ce60 for the c5-to-c6 PWA test.
python tests/slovesnyi-browser.py --pwa
```

Post-deployment: `tests/c6-browser.py --live`, `tests/c6-contexts.py --live`,
and `tests/new-mode-achievements-browser.py --upgrade`. Final delivery records
commit/origin SHA, actual live revision/cache and their results.

## Files and limits

Production: `app.js`, `styles.css`, `index.html`, `service-worker.js`, `version.json`.
New acceptance tests: `tests/alias-swipe-learning.test.cjs`, `tests/c6-browser.py`,
`tests/c6-contexts.py`. Existing browser scripts updated for c6 metadata/baseline:
`tests/slovesnyi-browser.py`, `tests/svitlohray-browser.py`,
`tests/new-mode-achievements-browser.py`. This candidate report is the final file.

Automated browser evidence is Chromium/Edge, not physical iOS/Safari certification.
CSS/API compatibility was reviewed; physical notch/Dynamic Island and Safari
gesture behavior still need human beta confirmation. The existing network-only
offline version.json check can log a failed request; cached game resources work.
