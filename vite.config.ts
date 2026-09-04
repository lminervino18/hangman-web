import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'The Hangman Game',
        short_name: 'Hangman',
        description: 'Juego del ahorcado para uno o dos jugadores, en el navegador.',
        lang: 'es',
        start_url: '/',
        display: 'standalone',
        background_color: '#300944',
        theme_color: '#300944',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Precache the app shell and images; audio stays out of the eager
        // precache so installing the PWA doesn't pull down several MB of
        // sound up front (it's still fetched normally on first play).
        // Dictionary lookups on dle.rae.es are external and never cached.
        globPatterns: ['**/*.{js,css,html,png,svg,webmanifest}'],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    exclude: ['**/node_modules/**', '**/e2e/**'],
  },
})
