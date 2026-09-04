import { expect, test } from '@playwright/test'
import { FILLER_LETTERS, goToIntro, setupDeterministicGame } from './helpers'

async function hasHorizontalOverflow(page: import('@playwright/test').Page) {
  return page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  )
}

async function startMatchByTap(
  page: import('@playwright/test').Page,
  name1: string,
  name2: string,
) {
  await page.getByRole('button', { name: 'Dos jugadores' }).tap()
  await page.getByRole('textbox').fill(name1)
  await page.getByRole('button', { name: 'Continuar' }).tap()
  await page.getByRole('textbox').fill(name2)
  await page.getByRole('button', { name: 'Continuar' }).tap()
  await page.getByTestId('masked-word').waitFor()
}

test.describe('mobile gameplay', () => {
  test('the intro screen fits without horizontal overflow', async ({ page }) => {
    await setupDeterministicGame(page, { words: ['GATO'] })
    await goToIntro(page)
    expect(await hasHorizontalOverflow(page)).toBe(false)
  })

  test('a game can be started and played entirely by tapping', async ({ page }) => {
    await setupDeterministicGame(page, {
      words: ['GATO'],
      random: 0,
      startingPlayer: 'player1',
    })
    await goToIntro(page)
    await startMatchByTap(page, 'Ana', 'Beto')

    expect(await hasHorizontalOverflow(page)).toBe(false)

    await page.getByRole('button', { name: 'A', exact: true }).tap()
    await page.getByRole('button', { name: 'Adivinar' }).tap()
    await expect(page.getByTestId('masked-word')).toHaveText('G A _ _')
  })

  test('the guess input is not auto-focused, so the on-screen keyboard is the primary input', async ({
    page,
  }) => {
    await setupDeterministicGame(page, {
      words: ['GATO'],
      random: 0,
      startingPlayer: 'player1',
    })
    await goToIntro(page)
    await startMatchByTap(page, 'Ana', 'Beto')

    const activeTestId = await page.evaluate(() =>
      document.activeElement?.getAttribute('data-testid'),
    )
    expect(activeTestId).not.toBe('guess-input')
  })

  test('a long word does not overflow the viewport horizontally', async ({ page }) => {
    await setupDeterministicGame(page, {
      words: ['ELECTROENCEFALOGRAFICO'],
      random: 0,
      startingPlayer: 'player1',
    })
    await goToIntro(page)
    await startMatchByTap(page, 'Ana', 'Beto')

    expect(await hasHorizontalOverflow(page)).toBe(false)
    await expect(page.getByTestId('masked-word')).toBeVisible()
  })

  test('running out of lives still fits on screen without overflow', async ({ page }) => {
    await setupDeterministicGame(page, {
      words: ['BQWXZ', 'CASA'],
      random: 0,
      startingPlayer: 'player1',
    })
    await goToIntro(page)
    await startMatchByTap(page, 'Ana', 'Beto')

    for (const letter of FILLER_LETTERS) {
      await page.getByRole('button', { name: letter, exact: true }).tap()
      await page.getByRole('button', { name: 'Adivinar' }).tap()
    }

    expect(await hasHorizontalOverflow(page)).toBe(false)
  })

  test('the leave-game confirmation dialog fits the viewport and its actions are tappable', async ({
    page,
  }) => {
    await setupDeterministicGame(page, {
      words: ['GATO'],
      random: 0,
      startingPlayer: 'player1',
    })
    await goToIntro(page)
    await startMatchByTap(page, 'Ana', 'Beto')

    await page.getByRole('button', { name: 'Menú principal' }).tap()
    const dialog = page.getByRole('alertdialog')
    await expect(dialog).toBeVisible()
    expect(await hasHorizontalOverflow(page)).toBe(false)

    const dialogBox = await dialog.boundingBox()
    const viewport = page.viewportSize()
    expect(dialogBox).not.toBeNull()
    expect(viewport).not.toBeNull()
    if (dialogBox && viewport) {
      expect(dialogBox.x).toBeGreaterThanOrEqual(0)
      expect(dialogBox.x + dialogBox.width).toBeLessThanOrEqual(viewport.width + 1)
    }

    await dialog.getByRole('button', { name: 'Salir al menú' }).tap()
    await expect(page.getByRole('heading', { name: 'The Hangman Game' })).toBeVisible()
  })

  test('important touch targets are comfortably tappable', async ({ page }) => {
    await setupDeterministicGame(page, {
      words: ['GATO'],
      random: 0,
      startingPlayer: 'player1',
    })
    await goToIntro(page)
    await startMatchByTap(page, 'Ana', 'Beto')

    const guessButton = await page.getByRole('button', { name: 'Adivinar' }).boundingBox()
    const menuButton = await page
      .getByRole('button', { name: 'Menú principal' })
      .boundingBox()
    const muteButton = await page.getByRole('button', { name: /sonido/i }).boundingBox()

    for (const box of [guessButton, menuButton, muteButton]) {
      expect(box).not.toBeNull()
      if (box) expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(40)
    }

    // The 28-key on-screen alphabet can't hit the full 44px target without
    // pushing the game off screen; it still gets a documented, deliberate
    // floor well above the ~25px it would default to.
    const letterButton = await page
      .getByRole('button', { name: 'A', exact: true })
      .boundingBox()
    expect(letterButton).not.toBeNull()
    if (letterButton)
      expect(Math.min(letterButton.width, letterButton.height)).toBeGreaterThanOrEqual(32)
  })

  test('winning a match works end to end on a touch device', async ({ page }) => {
    await setupDeterministicGame(page, {
      words: ['AB', 'CD', 'EF'],
      random: 0,
      startingPlayer: 'player1',
    })
    await goToIntro(page)
    await startMatchByTap(page, 'Ana', 'Beto')

    async function guessWordByTap(word: string) {
      await page.getByRole('textbox').fill(word)
      await page.getByRole('button', { name: 'Adivinar' }).tap()
    }

    await guessWordByTap('AB')
    await guessWordByTap('CZ')
    await guessWordByTap('EF')

    await expect(page.getByTestId('winner-name')).toContainText('Ana')
    expect(await hasHorizontalOverflow(page)).toBe(false)
  })
})

test.describe('singleplayer mobile gameplay', () => {
  async function startSingleplayerByTap(page: import('@playwright/test').Page) {
    await page.goto('/')
    await page.getByRole('button', { name: 'Un jugador' }).tap()
    await page.getByTestId('masked-word').waitFor()
  }

  test('a run can be started and played entirely by tapping', async ({ page }) => {
    await setupDeterministicGame(page, { words: ['GATO'], random: 0 })
    await startSingleplayerByTap(page)

    expect(await hasHorizontalOverflow(page)).toBe(false)
    await page.getByRole('button', { name: 'A', exact: true }).tap()
    await page.getByRole('button', { name: 'Adivinar' }).tap()
    await expect(page.getByTestId('masked-word')).toHaveText('G A _ _')
  })

  test('a long word does not overflow the viewport horizontally', async ({ page }) => {
    await setupDeterministicGame(page, { words: ['ELECTROENCEFALOGRAFICO'], random: 0 })
    await startSingleplayerByTap(page)

    expect(await hasHorizontalOverflow(page)).toBe(false)
    await expect(page.getByTestId('masked-word')).toBeVisible()
  })

  test('losing a run shows the result screen and fits without overflow', async ({
    page,
  }) => {
    await setupDeterministicGame(page, { words: ['ZXCVBN'], random: 0 })
    await startSingleplayerByTap(page)

    for (const letter of ['Q', 'R', 'S', 'T', 'U']) {
      await page.getByRole('button', { name: letter, exact: true }).tap()
      await page.getByRole('button', { name: 'Adivinar' }).tap()
    }

    await expect(page.getByTestId('final-streak')).toBeVisible()
    expect(await hasHorizontalOverflow(page)).toBe(false)
  })

  test('the leave-run confirmation dialog fits the viewport and its actions are tappable', async ({
    page,
  }) => {
    await setupDeterministicGame(page, { words: ['GATO', 'PERRO'], random: 0 })
    await startSingleplayerByTap(page)
    await page.getByRole('button', { name: 'A', exact: true }).tap()
    await page.getByRole('button', { name: 'Adivinar' }).tap()

    await page.getByRole('button', { name: 'Menú principal' }).tap()
    const dialog = page.getByRole('alertdialog')
    await expect(dialog).toBeVisible()
    expect(await hasHorizontalOverflow(page)).toBe(false)

    await dialog.getByRole('button', { name: 'Salir al menú' }).tap()
    await expect(page.getByRole('button', { name: 'Un jugador' })).toBeVisible()
  })

  test('the share preview fits the viewport and its close action is tappable', async ({
    page,
  }) => {
    await setupDeterministicGame(page, { words: ['ZXCVBN'], random: 0 })
    await startSingleplayerByTap(page)
    for (const letter of ['Q', 'R', 'S', 'T', 'U']) {
      await page.getByRole('button', { name: letter, exact: true }).tap()
      await page.getByRole('button', { name: 'Adivinar' }).tap()
    }
    await expect(page.getByTestId('final-streak')).toBeVisible()

    await page.getByRole('button', { name: 'Compartir resultado' }).tap()
    await page
      .locator('img[alt="Vista previa del resultado"]')
      .waitFor({ state: 'visible', timeout: 10000 })
    expect(await hasHorizontalOverflow(page)).toBe(false)
    await page.getByRole('button', { name: 'Cerrar' }).tap()
  })
})

test.describe('small phone viewport (320x568)', () => {
  test.use({ viewport: { width: 320, height: 568 } })

  test('the game remains usable without horizontal overflow', async ({ page }) => {
    await setupDeterministicGame(page, {
      words: ['GATO'],
      random: 0,
      startingPlayer: 'player1',
    })
    await goToIntro(page)
    await startMatchByTap(page, 'Ana', 'Beto')

    expect(await hasHorizontalOverflow(page)).toBe(false)
    await expect(page.getByTestId('masked-word')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Adivinar' })).toBeVisible()
  })
})

test.describe('tablet viewport', () => {
  test.use({ viewport: { width: 768, height: 1024 } })

  test('the game remains usable without horizontal overflow', async ({ page }) => {
    await setupDeterministicGame(page, {
      words: ['GATO'],
      random: 0,
      startingPlayer: 'player1',
    })
    await goToIntro(page)
    await startMatchByTap(page, 'Ana', 'Beto')

    expect(await hasHorizontalOverflow(page)).toBe(false)
  })
})

function boundingBoxesOverlap(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number },
): boolean {
  const overlapsVertically = a.y < b.y + b.height && b.y < a.y + a.height
  const overlapsHorizontally = a.x < b.x + b.width && b.x < a.x + a.width
  return overlapsVertically && overlapsHorizontally
}

// A tall word plus a short viewport is what actually pushed content up
// against the fixed corner buttons; a short word never grew tall enough to
// reproduce the overlap this regression guards against.
test.describe('short viewport with tall content (320x568)', () => {
  test.use({ viewport: { width: 320, height: 568 } })

  test("the fixed menu button never overlaps the battle screen's own heading", async ({
    page,
  }) => {
    await setupDeterministicGame(page, {
      words: ['ELECTROENCEFALOGRAFICO'],
      random: 0,
      startingPlayer: 'player1',
    })
    await goToIntro(page)
    await startMatchByTap(page, 'Ana', 'Beto')

    const menuButton = await page.getByRole('button', { name: 'Menú principal' }).boundingBox()
    const turnHeading = await page.getByTestId('turn-indicator').boundingBox()
    expect(menuButton).not.toBeNull()
    expect(turnHeading).not.toBeNull()
    if (menuButton && turnHeading) {
      expect(boundingBoxesOverlap(menuButton, turnHeading)).toBe(false)
    }
  })

  test("the fixed menu button never overlaps the singleplayer streak header", async ({
    page,
  }) => {
    await setupDeterministicGame(page, { words: ['ELECTROENCEFALOGRAFICO'], random: 0 })
    await page.goto('/')
    await page.getByRole('button', { name: 'Un jugador' }).tap()
    await page.getByTestId('masked-word').waitFor()

    const menuButton = await page.getByRole('button', { name: 'Menú principal' }).boundingBox()
    const streakHeading = await page.getByTestId('streak').boundingBox()
    expect(menuButton).not.toBeNull()
    expect(streakHeading).not.toBeNull()
    if (menuButton && streakHeading) {
      expect(boundingBoxesOverlap(menuButton, streakHeading)).toBe(false)
    }
  })
})
