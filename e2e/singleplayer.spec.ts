import { expect, test } from '@playwright/test'
import { guessLetter, setupDeterministicGame } from './helpers'

async function startSingleplayer(page: import('@playwright/test').Page) {
  await page.goto('/')
  await page.getByRole('button', { name: 'Un jugador' }).click()
  await page.getByTestId('masked-word').waitFor()
}

/** Waits out the round transition after a completed word. */
async function waitForNextRound(page: import('@playwright/test').Page) {
  await page.waitForTimeout(2000)
}

test.describe('singleplayer mode', () => {
  test('appears on the main menu and can be started with streak 0', async ({ page }) => {
    await setupDeterministicGame(page, { words: ['GATO'] })
    await page.goto('/')
    await expect(page.getByRole('button', { name: 'Un jugador' })).toBeVisible()

    await startSingleplayer(page)
    await expect(page.getByTestId('streak')).toHaveText('Racha: 0')
    await expect(page.getByTestId('best-streak')).toContainText('Mejor racha')
  })

  test('winning a word increments the streak and starts a new round with hangman reset', async ({
    page,
  }) => {
    await setupDeterministicGame(page, { words: ['AB', 'CD'], random: 0 })
    await startSingleplayer(page)

    await expect(page.getByTestId('masked-word')).toHaveText('A _')
    await guessLetter(page, 'B')
    await expect(page.getByTestId('streak')).toHaveText('Racha: 1')
    await expect(page.getByTestId('confirmed-word')).toContainText('AB')

    await waitForNextRound(page)
    await expect(page.getByTestId('masked-word')).toHaveText('C _')
    await expect(page.getByTestId('wrong-entries')).toHaveText('')
  })

  test('the streak persists across multiple consecutive words', async ({ page }) => {
    await setupDeterministicGame(page, { words: ['AB', 'CD', 'EF'], random: 0 })
    await startSingleplayer(page)

    await guessLetter(page, 'B')
    await waitForNextRound(page)
    await guessLetter(page, 'D')
    await expect(page.getByTestId('streak')).toHaveText('Racha: 2')
  })

  test('reaching a milestone streak shows special feedback', async ({ page }) => {
    await setupDeterministicGame(page, {
      words: ['AB', 'CD', 'EF', 'GH', 'IJ'],
      random: 0,
    })
    await startSingleplayer(page)

    for (const secondLetter of ['B', 'D', 'F', 'H']) {
      await guessLetter(page, secondLetter)
      await waitForNextRound(page)
    }
    await guessLetter(page, 'J')
    await expect(page.getByTestId('streak')).toHaveText('Racha: 5')
    await expect(page.getByTestId('milestone-banner')).toContainText('Racha de 5')
  })

  test('losing a word ends the run and shows the final result', async ({ page }) => {
    await setupDeterministicGame(page, { words: ['AB', 'ZXCVBN'], random: 0 })
    await startSingleplayer(page)

    await guessLetter(page, 'B')
    await waitForNextRound(page)

    for (const letter of ['Q', 'R', 'S', 'T', 'U']) {
      await guessLetter(page, letter)
    }

    await expect(page.getByTestId('final-streak')).toContainText('1 palabra seguidas')
    await expect(page.getByTestId('new-record-banner')).toBeVisible()
    await expect(page.getByTestId('last-word')).toContainText('La palabra era: ZXCVBN')
  })

  test('the journey distinguishes successful words from the failing one', async ({
    page,
  }) => {
    await setupDeterministicGame(page, { words: ['AB', 'CD', 'ZXCVBN'], random: 0 })
    await startSingleplayer(page)

    await guessLetter(page, 'B')
    await waitForNextRound(page)
    await guessLetter(page, 'D')
    await waitForNextRound(page)
    for (const letter of ['Q', 'R', 'S', 'T', 'U']) {
      await guessLetter(page, letter)
    }

    const journey = page.locator('text=Tu recorrido').locator('..')
    await expect(journey.getByRole('link', { name: /AB/ })).toBeVisible()
    await expect(journey.getByRole('link', { name: /CD/ })).toBeVisible()
    await expect(journey.getByRole('link', { name: /ZXCVBN/ })).toBeVisible()
  })

  test('a journey word links to its RAE dictionary entry', async ({ page }) => {
    await setupDeterministicGame(page, { words: ['GATO', 'ZXCVBN'], random: 0 })
    await startSingleplayer(page)
    await page.getByRole('textbox').fill('GATO')
    await page.getByRole('button', { name: 'Adivinar' }).click()
    await waitForNextRound(page)
    for (const letter of ['Q', 'W', 'E', 'R', 'T']) {
      await guessLetter(page, letter)
    }

    const link = page.getByRole('link', { name: /Buscar definición de GATO/i })
    await expect(link).toHaveAttribute('href', 'https://dle.rae.es/gato')
    await expect(link).toHaveAttribute('target', '_blank')
  })

  test('starting a new run resets the streak to 0', async ({ page }) => {
    await setupDeterministicGame(page, { words: ['AB', 'ZXCVBN', 'CD'], random: 0 })
    await startSingleplayer(page)
    await guessLetter(page, 'B')
    await waitForNextRound(page)
    for (const letter of ['Q', 'R', 'S', 'T', 'U']) {
      await guessLetter(page, letter)
    }
    await expect(page.getByTestId('final-streak')).toBeVisible()

    await page.getByRole('button', { name: 'Jugar de nuevo' }).click()
    await expect(page.getByTestId('streak')).toHaveText('Racha: 0')
  })

  test('the share preview can be opened and shows a generated image', async ({
    page,
  }) => {
    await setupDeterministicGame(page, { words: ['ZXCVBN'], random: 0 })
    await startSingleplayer(page)
    for (const letter of ['Q', 'R', 'S', 'T', 'U']) {
      await guessLetter(page, letter)
    }
    await expect(page.getByTestId('final-streak')).toBeVisible()

    await page.getByRole('button', { name: 'Compartir resultado' }).click()
    await page
      .locator('img[alt="Vista previa del resultado"]')
      .waitFor({ state: 'visible', timeout: 10000 })
    await expect(page.getByRole('button', { name: 'Cerrar' })).toBeVisible()
  })
})

test.describe('singleplayer: leaving the run', () => {
  test('leaving mid-run asks for confirmation and canceling preserves the streak', async ({
    page,
  }) => {
    await setupDeterministicGame(page, { words: ['AB', 'CD'], random: 0 })
    await startSingleplayer(page)
    await guessLetter(page, 'B')

    await page.getByRole('button', { name: 'Menú principal' }).click()
    const dialog = page.getByRole('alertdialog')
    await expect(dialog).toContainText('racha')

    await dialog.getByRole('button', { name: 'Seguir jugando' }).click()
    await expect(page.getByTestId('streak')).toHaveText('Racha: 1')
  })

  test('confirming leave discards the run and returns to the main menu', async ({
    page,
  }) => {
    await setupDeterministicGame(page, { words: ['AB', 'CD'], random: 0 })
    await startSingleplayer(page)

    await page.getByRole('button', { name: 'Menú principal' }).click()
    await page
      .getByRole('alertdialog')
      .getByRole('button', { name: 'Salir al menú' })
      .click()

    await expect(page.getByRole('button', { name: 'Un jugador' })).toBeVisible()
  })

  test('leaving from the result screen does not ask for confirmation', async ({
    page,
  }) => {
    await setupDeterministicGame(page, { words: ['ZXCVBN'], random: 0 })
    await startSingleplayer(page)
    for (const letter of ['Q', 'R', 'S', 'T', 'U']) {
      await guessLetter(page, letter)
    }
    await expect(page.getByTestId('final-streak')).toBeVisible()

    await page.getByRole('button', { name: 'Menú principal' }).click()
    await expect(page.getByRole('alertdialog')).toBeHidden()
    await expect(page.getByRole('button', { name: 'Un jugador' })).toBeVisible()
  })
})

test.describe('singleplayer: keyboard shortcuts', () => {
  test('Escape requests the leave-menu confirmation while playing', async ({ page }) => {
    await setupDeterministicGame(page, { words: ['AB'], random: 0 })
    await startSingleplayer(page)
    await page.keyboard.press('Escape')
    await expect(page.getByRole('alertdialog')).toBeVisible()
  })

  test('R starts a new run from the result screen', async ({ page }) => {
    await setupDeterministicGame(page, { words: ['ZXCVBN', 'AB'], random: 0 })
    await startSingleplayer(page)
    for (const letter of ['Q', 'R', 'S', 'T', 'U']) {
      await guessLetter(page, letter)
    }
    await expect(page.getByTestId('final-streak')).toBeVisible()
    await page.keyboard.press('r')
    await expect(page.getByTestId('streak')).toHaveText('Racha: 0')
  })

  test('M toggles mute globally, including on the main menu', async ({ page }) => {
    await setupDeterministicGame(page, { words: ['AB'] })
    await page.goto('/')
    const muteButton = page.getByRole('button', { name: /sonido/i })
    await expect(muteButton).toHaveAttribute('aria-pressed', 'false')
    await page.keyboard.press('m')
    await expect(muteButton).toHaveAttribute('aria-pressed', 'true')
  })
})
