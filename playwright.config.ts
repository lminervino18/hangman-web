import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testMatch: ['hangman.spec.ts', 'singleplayer.spec.ts'],
    },
    {
      // A Chromium-based device keeps this project self-contained with the
      // browser already installed for the desktop project (no WebKit needed).
      name: 'mobile-chromium',
      use: { ...devices['Pixel 7'] },
      testMatch: 'mobile.spec.ts',
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
})
