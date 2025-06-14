import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vue() as any],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('src', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
  },
})
