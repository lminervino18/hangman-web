# The Hangman Game

A browser-based Hangman game, ported from a Python/Pygame original. Play a local
2-player battle, or go solo in the streak mode: how many words in a row can you guess?
Installable as a PWA, playable offline.

## Preview

![Gameplay screenshot](docs/screenshot.png)

## Stack

- TypeScript
- React
- Vite
- Howler.js
- Vitest
- Playwright
- PWA (`vite-plugin-pwa`)

## Run locally

```bash
pnpm install
pnpm dev
```

## Tests

```bash
pnpm test        # unit tests
pnpm test:e2e     # end-to-end tests (desktop + mobile)
```

See [`docs/migration-notes.md`](docs/migration-notes.md) for the story behind the port.
