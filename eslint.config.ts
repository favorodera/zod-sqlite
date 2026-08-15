import { factory } from '@favorodera/eslint-config'

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
