import { codeInMdGlob, factory, mdGlob } from '@favorodera/eslint-config'

export default factory({
  tailwind: false,
})
  .overrides({
    'favorodera/typescript/rules': {
      rules: {
        'ts/no-explicit-any': 'off',
      },
    },
  })
  .append({
    files: [
      mdGlob,
      codeInMdGlob,
    ],
    rules: {
      'style/line-comment-position': 'off',
      'ts/no-unused-expressions': 'off',
      'unused-imports/no-unused-vars': 'off',
    },
  })
