# Sound Design

The production sound set in Movohray 0.6.6 is original procedural audio created specifically for Movohray.

No third-party samples are used in the current production files. The previous Kenney CC0 OGG set has been removed from the production package.

## Current production files

- `ui-click.mp3` — very short muted wooden touch
- `ui-open.mp3` — soft upward air/mallet cue
- `ui-close.mp3` — softer downward counterpart
- `positive-tick.mp3` — compact tactile positive tick
- `correct.mp3` — warm ascending mallet / kalimba-style confirmation
- `skipped.mp3` — soft card-swipe with a muted wooden acknowledgement
- `wrong.mp3` — restrained low wooden knock, intentionally non-punitive
- `turn-change.mp3` — two-note handoff cue
- `round-start.mp3` — airy rise with a warm mallet triad
- `countdown.mp3` — short dry wooden tick
- `round-complete.mp3` — resolved warm chord with subtle shimmer
- `reveal.mp3` — card-flip air movement with a light glass accent
- `game-win.mp3` — compact celebratory acoustic motif
- `game-loss.mp3` — gentle descending wooden cadence
- `game-tie.mp3` — neutral suspended chord
- `medal.mp3` — ceramic / glass-like sparkle

## Compatibility

Production playback now uses MP3 instead of OGG for broader Safari / legacy iOS compatibility. The existing Web Audio synthesis remains only as a fallback if a file cannot be fetched or decoded. While a production sample is still loading, the app now prefers one silent interaction instead of briefly playing the old oscillator-style fallback.
