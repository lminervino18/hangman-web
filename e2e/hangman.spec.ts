import { expect, test } from '@playwright/test'
import {
  FILLER_LETTERS,
  goToIntro,
  guessLetter,
  guessWord,
  setupDeterministicGame,
  startMatch,
} from './helpers'

test.describe('intro and menu', () => {
  test('the app starts on the intro screen and the game can be started', async ({
    page,
  }) => {
    await setupDeterministicGame(page, { words: ['GATO'] })
    await goToIntro(page)

    await expect(page.getByRole('heading', { name: 'The Hangman Game' })).toBeVisible()

    await page.getByRole('button', { name: 'Comenzar' }).click()
    await expect(page.getByRole('heading', { name: /Jugador 1/ })).toBeVisible()
  })

  test('pressing Enter on the intro screen also starts the game', async ({ page }) => {
    await setupDeterministicGame(page, { words: ['GATO'] })
    await goToIntro(page)
    await page.keyboard.press('Enter')
    await expect(page.getByRole('heading', { name: /Jugador 1/ })).toBeVisible()
  })
})

test.describe('name entry', () => {
  test('rejects a too-short name and accepts a valid one', async ({ page }) => {
    await setupDeterministicGame(page, { words: ['GATO'] })
    await goToIntro(page)
    await page.getByRole('button', { name: 'Comenzar' }).click()

    const continueButton = page.getByRole('button', { name: 'Continuar' })
    await page.getByRole('textbox').fill('A')
    await expect(continueButton).toBeDisabled()

    await page.getByRole('textbox').fill('Ana')
    await expect(continueButton).toBeEnabled()
  })

  test('collects both player names in order before starting the battle', async ({
    page,
  }) => {
    await setupDeterministicGame(page, {
      words: ['GATO'],
      random: 0,
      startingPlayer: 'player1',
    })
    await goToIntro(page)
    await startMatch(page, 'Ana', 'Beto')

    await expect(page.getByTestId('player-panel-player1')).toContainText('Ana')
    await expect(page.getByTestId('player-panel-player2')).toContainText('Beto')
    await expect(page.getByTestId('turn-indicator')).toContainText('Ana')
  })
})

test.describe('gameplay: single letter guesses', () => {
  test('a correct letter reveals it in the masked word and disables its key', async ({
    page,
  }) => {
    // random: 0 reveals the word's first letter ('G'); 'A' is the next
    // guaranteed-correct, not-yet-revealed letter in "GATO".
    await setupDeterministicGame(page, {
      words: ['GATO'],
      random: 0,
      startingPlayer: 'player1',
    })
    await goToIntro(page)
    await startMatch(page)

    await expect(page.getByTestId('masked-word')).toHaveText('G _ _ _')
    await guessLetter(page, 'A')
    await expect(page.getByTestId('masked-word')).toHaveText('G A _ _')
    await expect(page.getByRole('button', { name: 'A', exact: true })).toBeDisabled()
  })

  test('a wrong letter costs a life and updates the hangman artwork', async ({
    page,
  }) => {
    await setupDeterministicGame(page, {
      words: ['GATO'],
      random: 0,
      startingPlayer: 'player1',
    })
    await goToIntro(page)
    await startMatch(page)

    const player1Panel = page.getByTestId('player-panel-player1')
    await expect(player1Panel.locator('img[src$="heart.png"]')).toHaveCount(5)
    await expect(player1Panel.locator('img[src$="gallows-0.png"]')).toBeVisible()

    // 'Z' never appears in the Spanish word list used here.
    await guessLetter(page, 'Z')

    await expect(player1Panel.locator('img[src$="heart.png"]')).toHaveCount(4)
    await expect(player1Panel.locator('img[src$="gallows-1.png"]')).toBeVisible()
    await expect(page.getByTestId('wrong-entries')).toContainText('Z')
    await expect(page.getByRole('button', { name: 'Z', exact: true })).toBeDisabled()
  })

  test('completing a word starts a new round with lives reset for both players', async ({
    page,
  }) => {
    await setupDeterministicGame(page, {
      words: ['GATO', 'PERRO'],
      random: 0,
      startingPlayer: 'player1',
    })
    await goToIntro(page)
    await startMatch(page)

    // 'G' is already revealed; guess the rest of "GATO" letter by letter.
    for (const letter of ['A', 'T', 'O']) {
      await guessLetter(page, letter)
    }

    await expect(page.getByTestId('last-word')).toContainText('Última palabra: GATO')
    await expect(page.getByTestId('masked-word')).toHaveText('P _ _ _ _')
    await expect(
      page.getByTestId('player-panel-player1').locator('img[src$="heart.png"]'),
    ).toHaveCount(5)
    await expect(
      page.getByTestId('player-panel-player2').locator('img[src$="heart.png"]'),
    ).toHaveCount(5)
  })
})

test.describe('gameplay: losing a round', () => {
  test('running out of lives awards the round to the opponent without ending the match', async ({
    page,
  }) => {
    // "BQWXZ" starts with 'B' revealed (random: 0); none of the filler
    // letters below collide with B, Q, W, X or Z, so every guess using them
    // is a guaranteed miss.
    await setupDeterministicGame(page, {
      words: ['BQWXZ', 'CASA'],
      random: 0,
      startingPlayer: 'player1',
    })
    await goToIntro(page)
    await startMatch(page)

    // Misses alternate turns, so the round's starter (player1) takes 5 of
    // the 9 misses and runs out of lives first.
    for (const letter of FILLER_LETTERS) {
      await guessLetter(page, letter)
    }

    await expect(
      page.getByTestId('player-panel-player2').locator('img[src$="trophy.png"]'),
    ).toHaveCount(1)
    await expect(
      page.getByTestId('player-panel-player1').locator('img[src$="trophy.png"]'),
    ).toHaveCount(0)
    await expect(page.getByTestId('masked-word')).toHaveText('C _ _ _')
    await expect(
      page.getByTestId('player-panel-player1').locator('img[src$="heart.png"]'),
    ).toHaveCount(5)
  })
})

test.describe('gameplay: full-word guesses', () => {
  test('a correct full-word guess wins the round instantly', async ({ page }) => {
    await setupDeterministicGame(page, {
      words: ['GATO', 'PERRO'],
      random: 0,
      startingPlayer: 'player1',
    })
    await goToIntro(page)
    await startMatch(page)

    await guessWord(page, 'GATO')

    await expect(page.getByTestId('last-word')).toContainText('Última palabra: GATO')
    await expect(
      page.getByTestId('player-panel-player1').locator('img[src$="trophy.png"]'),
    ).toHaveCount(1)
    await expect(page.getByTestId('masked-word')).toHaveText('P _ _ _ _')
  })

  test('a wrong full-word guess (the "1 shot") hands the point to the opponent', async ({
    page,
  }) => {
    await setupDeterministicGame(page, {
      words: ['GATO', 'PERRO'],
      random: 0,
      startingPlayer: 'player1',
    })
    await goToIntro(page)
    await startMatch(page)

    // 'G' is revealed; "GXXX" stays consistent with it but is wrong.
    await guessWord(page, 'GXXX')

    await expect(
      page.getByTestId('player-panel-player2').locator('img[src$="trophy.png"]'),
    ).toHaveCount(1)
    await expect(
      page.getByTestId('player-panel-player1').locator('img[src$="trophy.png"]'),
    ).toHaveCount(0)
  })
})

test.describe('match completion', () => {
  test('winning 3 rounds ends the match and restart returns to the intro screen', async ({
    page,
  }) => {
    await setupDeterministicGame(page, {
      words: ['AB', 'CD', 'EF'],
      random: 0,
      startingPlayer: 'player1',
    })
    await goToIntro(page)
    await startMatch(page)

    // Round 1: player1 is active, guess the word correctly.
    await guessWord(page, 'AB')
    // Round 2: player2 is now active; a valid-but-wrong guess hands the
    // point back to player1 (first letter kept consistent with the reveal).
    await guessWord(page, 'CZ')
    // Round 3: player1 active again, guess correctly for the match win.
    await guessWord(page, 'EF')

    await expect(page.getByTestId('winner-name')).toContainText('Ana')
    await expect(page.getByRole('button', { name: 'Jugar de nuevo' })).toBeVisible()

    await page.getByRole('button', { name: 'Jugar de nuevo' }).click()
    await expect(page.getByRole('heading', { name: 'The Hangman Game' })).toBeVisible()
  })
})

test.describe('returning to the main menu', () => {
  test('leaving mid-game asks for confirmation, and canceling keeps the game intact', async ({
    page,
  }) => {
    await setupDeterministicGame(page, {
      words: ['GATO'],
      random: 0,
      startingPlayer: 'player1',
    })
    await goToIntro(page)
    await startMatch(page)
    await guessLetter(page, 'A')

    await page.getByRole('button', { name: 'Menú principal' }).click()
    const dialog = page.getByRole('alertdialog')
    await expect(dialog).toBeVisible()

    await dialog.getByRole('button', { name: 'Seguir jugando' }).click()
    await expect(dialog).toBeHidden()
    // The in-progress round survived: 'A' is still revealed.
    await expect(page.getByTestId('masked-word')).toHaveText('G A _ _')
  })

  test('confirming leave discards the game and returns to the intro screen', async ({
    page,
  }) => {
    await setupDeterministicGame(page, {
      words: ['GATO'],
      random: 0,
      startingPlayer: 'player1',
    })
    await goToIntro(page)
    await startMatch(page)

    await page.getByRole('button', { name: 'Menú principal' }).click()
    await page
      .getByRole('alertdialog')
      .getByRole('button', { name: 'Salir al menú' })
      .click()

    await expect(page.getByRole('heading', { name: 'The Hangman Game' })).toBeVisible()
  })

  test('pressing Escape cancels the leave-game confirmation', async ({ page }) => {
    await setupDeterministicGame(page, {
      words: ['GATO'],
      random: 0,
      startingPlayer: 'player1',
    })
    await goToIntro(page)
    await startMatch(page)

    await page.getByRole('button', { name: 'Menú principal' }).click()
    await expect(page.getByRole('alertdialog')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('alertdialog')).toBeHidden()
  })
})

test.describe('last word dictionary lookup', () => {
  test('links to the RAE dictionary for the completed word, opened safely in a new tab', async ({
    page,
  }) => {
    await setupDeterministicGame(page, {
      words: ['GATO', 'PERRO'],
      random: 0,
      startingPlayer: 'player1',
    })
    await goToIntro(page)
    await startMatch(page)
    await guessWord(page, 'GATO')

    const link = page.getByRole('link', { name: /Buscar definición de GATO/i })
    await expect(link).toHaveAttribute('href', 'https://dle.rae.es/gato')
    await expect(link).toHaveAttribute('target', '_blank')
    await expect(link).toHaveAttribute('rel', /noopener/)
    await expect(link).toHaveAttribute('rel', /noreferrer/)
  })
})

test.describe('UI controls', () => {
  test('the on-screen keyboard fills the guess input', async ({ page }) => {
    await setupDeterministicGame(page, { words: ['GATO'], random: 0 })
    await goToIntro(page)
    await startMatch(page)

    await page.getByRole('button', { name: 'A', exact: true }).click()
    await expect(page.getByTestId('guess-input')).toHaveValue('A')
  })

  test('the mute button toggles its pressed state', async ({ page }) => {
    await setupDeterministicGame(page, { words: ['GATO'] })
    await goToIntro(page)

    const muteButton = page.getByRole('button', { name: /sonido/i })
    await expect(muteButton).toHaveAttribute('aria-pressed', 'false')
    await muteButton.click()
    await expect(muteButton).toHaveAttribute('aria-pressed', 'true')
    await muteButton.click()
    await expect(muteButton).toHaveAttribute('aria-pressed', 'false')
  })
})
