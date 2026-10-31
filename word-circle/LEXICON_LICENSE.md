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


## Exact headword gate (0.6.12)

Only initial forms are playable. Ukrainian and Russian candidates are checked by
pymorphy3 2.0.6 with DictionaryAnalyzer only (no prediction and no character
substitutions), requiring a known analysis whose normal form equals the exact
candidate and excluding proper-name/abbreviation analyses.

Bundled sources and complete package notices:

- `sources/lemmas-uk.whl`: pymorphy2-dicts-uk 2.4.1.1.1460299261, dictionary data
  CC BY-SA 3.0; package code MIT; see `licenses/lemmas-uk.txt`.
- `sources/lemmas-ru.whl`: pymorphy3-dicts-ru 2.4.417150.4580142, OpenCorpora data
  CC BY-SA 3.0; package code MIT; see `licenses/lemmas-ru.txt`.
- `sources/wordnet-3.0.zip`: Princeton WordNet 3.0 via NLTK data; see
  `licenses/wordnet.txt`. English allows exact WordNet index headwords and an
  explicit editorial list of function words. No substring or fuzzy matching.

The generated `headwords-*.json` lists and headword-filtered portions of
`levels.js` are modified derivatives under the corresponding data licenses.
Source archive SHA-256 values are recorded in dictionary-manifest.json.
The archives are build sources; the game does not download them.

## Definition provenance

`definition-data.js` contains short attributed excerpts (at most 20 words per
article) from exact SLOVNYK.ua entries. Each retains its exact headword and direct
source URL. These excerpts are not relicensed as Wiktionary material; the source
and its underlying dictionary retain their rights. The full articles, examples,
inflection tables and HTML are not redistributed. Snapshot:
`sources/definitions-uk-slovnyk.json`; builder: `tools/cache-word-circle-definitions.py`.

Other definitions come from exact Wiktionary pages under their CC BY-SA terms or
from the application's own brief explanations. Runtime redirects to another
headword are rejected. Old unverified browser definition caches are ignored.
