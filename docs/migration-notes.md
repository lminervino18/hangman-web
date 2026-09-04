# Migration notes

How the original Python/Pygame Hangman game became this TypeScript/React browser
game, and why specific decisions were made.

## Original architecture

The source was a single Pygame application (`Hangman Game/`):

- `main.py` — the game loop (`while run: ...`), music playback, restart-on-game-over.
- `game.py` — a single `Game` class that owned **all** state, rules, and rendering
  (`WIN.blit(...)` calls interleaved directly with game logic). Screens were a
  hand-rolled state machine over string constants (`'iw'`, `'isw'`, `'bw'`, `'ew'`).
- `player.py` — a small `Player` class (name, lives, points, in-progress guess).
- `aux_functions.py` — free functions for word selection, guess validation, and
  win detection.
- `constants.py` — window size, colors, lives per round, points to win.

The game itself is a **2-player local "battle" hangman**, not the classic
single-guesser version: players alternate turns guessing one letter at a time,
or risk a one-shot guess at the whole word. A correct whole-word guess wins the
round instantly; a *wrong* one instantly hands the round to the opponent. Lives
reset every round; the match is decided by whoever reaches 3 round wins first.

## Mapping: Pygame systems → web systems

| Original | Web equivalent |
|---|---|
| `Game` (state + rules + rendering in one class) | `src/domain/gameEngine.ts` (pure reducer, no rendering) + React components (rendering only) |
| String-based window state (`'iw'`/`'isw'`/`'bw'`/`'ew'`) | `GameState.screen: 'intro' \| 'nameEntry' \| 'battle' \| 'end'` |
| `aux_functions.py` | `src/domain/{guess,round,playerName,normalize}.ts` |
| `Player` class | `PlayerState` (plain data) in `src/domain/types.ts` |
| Manual `pygame.event.get()` loop | React event handlers + controlled inputs |
| `pygame.mixer` | `src/audio/audioManager.ts` (Howler.js) |
| Fixed 975×609 `pygame.display` window | Responsive CSS layout (flexbox/grid + `clamp()`), no fixed canvas |
| `assets/words.csv` parsed line-by-line at runtime | `data/words.csv` → `scripts/generate-words.ts` → `src/data/words.ts` (generated once, imported as a plain array) |

The domain layer (`src/domain/`) has zero dependency on React or the DOM — it's a
pure `applyAction(state, action, deps) => { state, events }` reducer, which is
what makes the 53 unit tests possible without rendering anything.

## Behavioral differences from the original

**Fixed — off-by-one word selection bug.** `aux_functions.random_word` drew
`choice(range(56329))` against a 56,328-line file. On the roughly 1-in-56,329
draws of the last index, the line-scanning loop never matched and the function
returned an empty word list — a silent, hard-to-notice failure mode. The web
version indexes directly into a proper array (`WORDS[Math.floor(Math.random() *
WORDS.length)]`), so this can't happen.

**Fixed — inconsistent turn alternation after losing a round.** Tracing
`_eval_battle_window` closely: every round-ending path calls `next_player()`
exactly once (inside `restart_game`), so the starting player alternates each
round — except the "ran out of lives" path, which *also* called
`next_player()` once just before the lives check fired, then called
`restart_game` (which flips again). Two flips cancel out, so that one path
silently let the same player start the next round instead of alternating like
every other outcome. This looked like an emergent side effect of the
imperative control flow, not an intentional exception, so the web version
makes every round transition flip exactly once.

**Restored — the hangman gallows artwork.** `assets/hangman/left_*` and
`right_*` (14 images, a full progressive "hanging" illustration in two mirrored
series) were bundled with the original game but **never referenced by any
`.py` file** — lives were only ever shown as a row of heart icons. The web
version restores the gallows as the primary lives indicator (see "Assets" below)
alongside the heart icons, which keeps the precise numeric read the hearts gave
you. This was a judgment call, made with a review criterion given by the
project owner (use it only if the artwork actually looks clean at full
resolution) rather than assumed silently.

**Restored — the `next_word.wav` sound effect.** Present in the original
assets but never wired to any event in the source. Its name strongly suggests
it was meant to play when a new round/word starts, so the web version plays it
on every round transition. Also a disclosed judgment call, not assumed.

**Added — an on-screen keyboard.** The original was keyboard-only, capturing
raw `pygame.key.name(event.key)` presses. That's a problem for two of the
game's own letters: the word list contains **Ñ** (1,105 occurrences) and
**Ü** (83, e.g. "PINGÜINO"), neither of which sits on a standard US keyboard
layout, and a Pygame key-name capture has no built-in way to prompt for them
either. The web version adds a clickable Spanish keyboard (A-Z, Ñ, Ü) as a
second input path alongside typing directly into the guess field, which also
makes the game usable on touch devices. This is a disclosed addition, not
present in the original.

**Added — a mute toggle.** The original had no in-game volume control besides
the escalating auto-volume. A small mute button was added for player comfort;
it doesn't change gameplay.

**Preserved as-is — the auto-volume ramp.** The original increases music
volume by a fixed step whenever a round ends by a *completed word* (via
letters or a correct full-word guess) or by a *wrong* full-word guess, but
**not** when a round ends by a player running out of lives. That's an
inconsistency in the original, but not a bug that breaks anything — reasoned
as "an intentional match-tension mechanic" is at least as plausible as
"an oversight," so it was left exactly as observed rather than guessed at.

**Preserved as-is — the full dictionary.** `words.csv` is a broad RAE-style
Spanish word list (56,328 entries) including some obscure and inflected forms
(e.g. imperative + enclitic pronoun combinations like `ABANDÓNALO`). It's
carried over unfiltered/uncurated, since curating "real" vs. "obscure" words is
a content judgment call outside the scope of a technical migration.

**Preserved as-is — accent handling.** `replace_accents` in the original strips
accents from vowels only (Á/É/Í/Ó/Ú → A/E/I/O/U) after uppercasing, leaving Ñ
and Ü untouched — so the actual guessable word is never shown with its true
accented spelling, even at the end. `src/domain/normalize.ts` reproduces this
exactly.

**Not carried over — the "right" hangman art series.** Close inspection found
a handful of frames in `assets/hangman/right_*.jpeg` with a faint leftover
digit baked into a corner (an artifact from having been exported as GIF
frames at some point). The `left_*` series was clean, so it became the single
source of truth for the gallows, mirrored via CSS (`transform: scaleX(-1)`)
for player 2's panel instead of shipping a second, slightly inconsistent hand
of artwork.

## Assets

**Migrated as-is:** `background.png`, `intro_person.png`, `heart.png`,
`trophy.png`, `you_win_img.png` → `public/assets/images/` (renamed to
kebab-case).

**Migrated with processing:**

- `assets/hangman/left_2.jpeg` … `left_7.jpeg` → `public/assets/images/gallows/gallows-0.png`
  … `gallows-5.png`. Background made transparent, a small stray watermark in
  the bottom-left corner patched out (composited over with the identical,
  clean gallows-base pixels from an unaffected frame — the wooden gallows
  structure is pixel-identical across frames; only the hanging figure
  changes), and all 6 frames padded to one common canvas so the artwork
  doesn't jump between stages. `left_1.png` (an extra, more detailed pose)
  was not mapped — `LIVES_PER_ROUND` (5) only needs 6 states (0-5 wrong
  guesses), and 6 frames were already available without it.
- All `.wav` sound effects → `.mp3`. Several were absurdly over-specified for
  a fraction-of-a-second UI blip (96–192kHz, 24-bit), which is inaudible but
  not free: total audio payload dropped from ~8.8MB to ~5.3MB with no
  perceptible quality loss.
- `words.csv` (a line-per-word dump, not real CSV) → generated
  `src/data/words.ts` via `scripts/generate-words.ts` (`pnpm generate:words`).

**Not migrated (documented, not silently dropped):**

- `assets/hangman/right_*.jpeg` (7 files) — superseded by mirroring the `left_*`
  series via CSS; see above.
- `assets/hangman/left_1.png` — unused stage; see above.
- `assets/next_word.wav` — restored, see "Behavioral differences."
- `assets/wrong_sound.wav` — dead in the original (never referenced by any
  `.py` file) and has no obvious intended event to attach it to, unlike
  `next_word.wav`. Left unused.
- `assets/photothumb.db` (both copies) — Windows thumbnail-cache database
  files, not real assets. Discarded.
- The original `HangmanGame-main.zip` and its extracted source are not part of
  this repository (kept locally only, `.gitignore`d) — the ported code and
  `docs/migration-notes.md` are the record of what it contained.

## Known limitations

- The original Pygame game could not be run in this environment (no `pygame`
  package installed, and no display server available for a GUI app), so the
  source code and assets were the reference for behavior, as agreed before
  starting the migration.
- The word list ships as a single ~184KB gzipped chunk in the main JS bundle.
  It's small enough not to matter for a static site, but code-splitting it
  behind a dynamic `import()` (loaded once the player reaches the battle
  screen) would trim initial load size further if that ever becomes a
  priority.
