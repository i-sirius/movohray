# Slovokolo dictionary sources

The dictionary-derived word data are modified, filtered derivatives of the following
Hunspell dictionaries, pinned at wooorm/dictionaries revision
`8cfea406b505e4d7df52d5a19bce525df98c54ab`.

| Data | Upstream | License and full notice | Corresponding source |
|---|---|---|---|
| Ukrainian | brown-uk/dict_uk via wooorm/dictionaries | [GPL-3.0](licenses/uk.txt) | [original .dic/.aff/README/license](sources/uk-hunspell.zip) |
| Russian | Alexander I. Lebedev et al. via wooorm/dictionaries | [BSD-3-Clause](licenses/ru.txt) | [original .dic/.aff/README/license](sources/ru-hunspell.zip) |
| English | SCOWL / en_US contributors via wooorm/dictionaries | [MIT/BSD notices](licenses/en.txt) | [original .dic/.aff/README/license](sources/en-hunspell.zip) |

Source: https://github.com/wooorm/dictionaries/tree/8cfea406b505e4d7df52d5a19bce525df98c54ab/dictionaries

The licenses above apply to dictionary data and their derived portions in `levels.js`
and `lexicon-*.json`. Original copyright and complete license texts accompany the sources.
This import does not relicense unrelated application code.

Modifications: lowercase alphabetic entries only, 3–7 letters, removal of proper-case-only
entries, forbidden/no-suggest/compound-only stems, explicit inappropriate-word exclusions,
affix expansion and spellchecker validation; extraction of words constructible from each
physical wheel. Main answer candidates additionally use the application's existing
editorial answer pools and the reviewed starter/short-word list. Existing source notices
in ../WORDLIST_LICENSES.md also apply to those pools.

`dictionary-manifest.json` records original-file SHA-256 hashes, source revision,
word/level counts and starter entries rejected by the dictionary audit.
`seed-levels.json` preserves the user-supplied V5 input for review and reproducibility;
it is not the runtime authority.

## Rebuild

Use Python with the build-only dependency `spylls==0.1.7`:

```sh
python -m pip install spylls==0.1.7
python tools/build-word-circle.py
python tests/verify_word_circle_dictionary.py
node tests/verify_levels.js
```

The app itself has no new runtime dependencies and makes no dictionary API calls.
The original pinned sources are bundled, so rebuilding needs no dictionary download.
Use a fresh `--cache-dir` to force revalidation rather than reusing an expanded build cache.

The independent permutation test exhaustively enumerates every distinct 3–7 letter
sequence that can be formed with the tiles of every released level and compares accepted
words with the shipped finite lexicon. This establishes completeness against that lexicon;
it does not claim to include every word or regional variant of a living language.

## Familiarity ranking

Main-answer ordering additionally uses Hermit Dave's FrequencyWords 2018
OpenSubtitles-derived lists for uk/ru/en. Data: CC BY-SA 4.0 (code is MIT).
https://github.com/hermitdave/FrequencyWords
Full content license: [licenses/frequency.txt](licenses/frequency.txt).
Pinned raw lists, upstream attribution/readme and revision: [sources/frequency.zip](sources/frequency.zip).
The ranking only selects and orders already dictionary-verified editorial candidates;
it is never evidence that an unknown subtitle token is a valid word.
Changes: per-language frequency thresholds, exclusion filters and level selection.
The generated level-selection arrangement is shared under CC BY-SA 4.0 in addition
to the underlying word-data notices above. The exact revision and file hashes
are recorded in dictionary-manifest.json.

## Individually verified supplements

`verified-supplement.json` records a small editorial supplement of individual lexical
facts and named reference URLs. No definitions or dictionary pages are reproduced.
These uncommon/specialist forms are bonus-only. This restores valid V5 entries such
as English *rumen* (including the explicitly attested plurals *rumens*, *rumina*)
and Russian *бан*, which the pinned general-purpose spelling dictionaries omit.
Russian noun forms follow the regular declension of the attested lemma.
