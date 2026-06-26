import { defineConfig } from 'tsdown'

export default defineConfig({
  clean: true,
  dts: {
    tsgo: true,
  },
  exports: true,
})
