/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub project Pages: https://karimajed9.github.io/karim-portfolio/
// Local / Docker / custom domain at root: leave GITHUB_PAGES unset.
const base = process.env.GITHUB_PAGES === 'true' ? '/karim-portfolio/' : '/'

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
