import stylistic from '@stylistic/eslint-plugin'
import typescript from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'
import { defineConfig } from 'eslint/config'

export default defineConfig([
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
    ],
  },
  {
    files: ['**/*.js', '**/*.mjs', '**/*.mts', '**/*.ts'],
    plugins: { '@stylistic': stylistic },
    rules: { ...stylistic.configs.recommended.rules },
  },
  {
    files: ['**/*.ts', '**/*.mts'],
    plugins: { '@typescript-eslint': typescript },
    rules: { ...typescript.configs.recommended.rules },
    languageOptions: {
      parser: typescriptParser,
    },
  },
  {
    rules: {
      '@stylistic/quotes': ['error', 'single', { avoidEscape: true }],
      '@stylistic/no-multiple-empty-lines': ['error', { max: 2, maxEOF: 2, maxBOF: 0 }],
      '@stylistic/padded-blocks': 'off',
      '@stylistic/no-trailing-spaces': ['error', { skipBlankLines: true }],
      '@stylistic/brace-style': 'off',
    },
  },
])
