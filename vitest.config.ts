import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    reporters: ['default', 'html'],
    outputFile: './.vitest/report.html',
    ui: true,
    watch: true,
    typecheck: { enabled: true },
    projects: [
      {
        test: {
          name: 'unit',
          root: './src',
          environment: 'node',
          include: ['../src/tests/unit/*.test.ts'],
        },
      },
    ],
  },
})
