import { defineConfig } from '@favorodera/eslint-config'

export default defineConfig({
  tailwind: false,
  typescript: {
    overrides: {
      'typescript/no-explicit-any': 'off',
    },
  },
})
  .append({
    files: ['package.json'],
    rules: {
      'jsonc/array-bracket-newline': 'off',
    },
  })
