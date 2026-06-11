import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json'],
      thresholds: {
        branches: 85,
        functions: 90,
        lines: 95,
        statements: 95,
      },
    },
  },
})
