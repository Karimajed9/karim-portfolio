/// <reference types="vitest/config" />
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { prerenderIndexableRoutes } from './scripts/prerender-routes.ts'

function prerenderIndexableRoutesPlugin(): Plugin {
  return {
    name: 'prerender-indexable-routes',
    apply: 'build',
    closeBundle() {
      prerenderIndexableRoutes(resolve(dirname(fileURLToPath(import.meta.url)), 'dist'))
    },
  }
}

// Prefer apex custom domain (https://karimmajed.com) → base "/".
// Project Pages without custom domain: set VITE_BASE_PATH=/karim-portfolio/
const base = process.env.VITE_BASE_PATH || '/'

export default defineConfig({
  base,
  plugins: [react(), tailwindcss(), prerenderIndexableRoutesPlugin()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
