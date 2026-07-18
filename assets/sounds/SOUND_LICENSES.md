# Sound Licenses

Production sound effects currently use selected files from:

- Set: Kenney Interface Sounds
- Author: Kenney
- Source: https://kenney.nl/assets/interface-sounds
- Mirror used for download: https://opengameart.org/content/interface-sounds
- License: Creative Commons CC0
- Attribution required: no

The game does not need to show attribution in the UI.

## Production Files

- `correct.ogg` from `confirmation_001.ogg`
- `skipped.ogg` from `question_001.ogg`
- `wrong.ogg` from `error_001.ogg`
- `turn-change.ogg` from `switch_002.ogg`
- `round-start.ogg` from `error_004.ogg`
- `countdown.ogg` from `tick_001.ogg`
- `round-complete.ogg` from `confirmation_004.ogg`
- `reveal.ogg` from `drop_001.ogg`
- `game-win.ogg` from `confirmation_004.ogg`
- `game-loss.ogg` from `error_003.ogg`
- `game-tie.ogg` from `switch_004.ogg`
- `medal.ogg` from `glass_001.ogg`

## Compatibility Note

The selected production files are OGG because MP3 conversion tools were not available in this local environment. Before final iOS 12-focused release hardening, convert the selected files to MP3 and keep the existing Web Audio synthesis fallback for unsupported formats or failed decoding.
