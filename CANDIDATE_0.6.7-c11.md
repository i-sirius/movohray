# Candidate 0.6.7-c11 — Word Guess modes

Base: `f99758ce94f111cd88002ae84d617b4ad9ed650d` (c10).

## UX and navigation

Daily Word previously appeared as an independent game. The hierarchy is now **Movohray → Word Guess → Normal / Daily Word**.

- The standalone Daily menu card is removed. The original five primary cards remain. Word Guess contains only a small informational daily status: new or completed, with a symbol and text. There are no nested interactive controls.
- Opening Word Guess from the menu always selects Normal. Its existing settings remain in the same setup shell, below a compact two-tab selector.
- Daily uses that same shell and action bar, showing the date, completion/subtitle and current streak. Irrelevant length, attempts, repeats and Kids controls are hidden. Tabs support arrows, Home/End, roving keyboard focus and `aria-selected`.
- Daily gameplay and results retain Word Guess as the parent title, with Daily/date as secondary context. Gameplay still uses the existing board, keyboard, hints, sounds and result engine.
- A failed Daily offers retry. A successful Daily offers explicitly labelled **Normal game**, returning to normal setup, and Menu. Back from Daily gameplay/results returns to Word Guess setup; explicit Menu returns home.
- A completed Daily panel shows its completion and streak and offers Normal game. This preserves c10's completed-day behavior without adding replay or duplicate rewards.
- Menu, setup and result status update without reloading; existing focus, visibility, storage and midnight refresh handling remains. Ukrainian, Russian and English copy is localized.

## Preserved mechanics and data

`daily-word.js` is unchanged from c10. The frozen pools remain exactly 365 words per language, in the same order; selection still uses local calendar dates and the 2026-01-01 epoch. Kids mode and normal settings cannot alter Daily selection.

The storage key remains `movohray-daily-word-v1`, schema version 1, with separate language progress, attempts, current/best streak, total completions and 62 retained dates. There is no migration or reset. Retries, duplicate protection, date boundaries and offline play remain intact. All **439 achievement definitions**, IDs, order and five Daily thresholds are unchanged. Existing statistics, achievements and Alias learning survive the update.

Normal settings are retained; leaving Daily clears its runtime dictionary/target state before normal play. No hero, illustration, character-pack or dictionary changes are included.

## Files

- `app.js`: normal-default navigation, informational menu badge, localized labels, parent game identity and explicit result action.
- `daily-word-ui.js`: shared setup tab state/rendering, accessible selection and synchronized Daily status.
- `index.html`: remove standalone card; add tabs/panels within existing setup and secondary result context.
- `styles.css`: restrained badge, segmented selector and responsive panels; remove obsolete standalone-card styles.
- `service-worker.js`, `version.json`: synchronized candidate metadata; existing precache and update behavior retained.
- `tests/daily-word-browser.py`: c11 navigation/layout coverage and actual c10-to-c11 upgrade/persistence checks.
- `CANDIDATE_0.6.7-c11.md`: this report; the c10 report is retained.

## Candidate metadata

- Version: `0.6.7`; build: `2026-09-20`; candidate: `c11`; required: `true`.
- Revision: `0.6.7-20260920-c11`.
- Cache: `movohray-cache-v0.6.7-b20260920-c11`.
- HTML asset revisions and displayed candidate labels match. No production tag is created.

## Validation

Passed `python -X utf8 tests/daily-word-browser.py` using installed Edge with an isolated temporary profile and Python standard-library CDP harness:

- All repository JS/CJS parses in Chromium; all JSON parses; unique DOM IDs; translation coverage.
- Frozen pool checksum/source membership; daily core exact c10 comparison; all 439 definitions unchanged.
- Existing daily unit checks: deterministic selection, empty/corrupt/unavailable storage, duplicate/consecutive/skipped completions, month/year/leap/DST boundaries, time zones, bounded history and language isolation.
- Five primary cards, informational badge, default Normal, keyboard tab navigation without route changes, hidden irrelevant settings.
- Both setup panels in all three languages at 1280×900, 320×568 and 667×375; gameplay/results and achievement collection overflow/reachability checks. Desktop and mobile screenshots reviewed.
- Real loss/retry/keyboard win; synchronized completion; explicit normal-setup return; normal win does not award Daily credit; completed state persists after reload.
- Kids independence, active-session language locking, offline reload/play/win and share context.
- Daily achievement thresholds; actual c10-to-c11 required update in two tabs; GET_REVISION/cache handshake; byte-for-byte Daily storage preservation, streaks/totals/62-day history and legacy progress preservation; duplicate protection across tabs.
- Alias, Crocodile, Who Am I, Slovesnyi, normal Word Guess and Svitlohray launch; no uncaught browser errors.

`git diff --check` passed. No optional chaining or nullish coalescing was introduced in production code.

Node is unavailable and was not installed. Node-based suites were syntax-parsed but not executed. Historical Playwright Python runners require an unavailable Playwright installation; the existing standard-library Daily browser runner provides the automated coverage above. Chromium emulation does not replace physical older Safari/iOS, touch, installed-PWA, sound/haptics or native share-sheet testing.

## Manual acceptance

- **Desktop:** find only the small status inside Word Guess; open it into Normal; switch to Daily; play, retry and complete; verify synchronized status/streak; choose Normal game, start a normal game and return to Menu.
- **Narrow portrait / landscape:** inspect both tabs, date/status wrapping, reachable actions, gameplay keyboard and results. Try available languages and light/dark themes; verify no overlap or horizontal scrolling.
- **Offline:** cache c11 online, disconnect and reopen an unfinished Daily; complete it and confirm persistence after reopening.
- **Physical iOS/Safari:** check tab focus/touch, scrolling, installed-PWA navigation, sound/haptics and native sharing.
- **Next day without changing the clock:** use the c10 report's read-only `DailyWord.select` and in-memory `DailyWord.createStore` console example, or rerun the browser suite's simulated-date tests. No visible date override or production-storage cheat is shipped.
