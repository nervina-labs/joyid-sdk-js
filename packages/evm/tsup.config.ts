import { defineConfig } from 'tsup'

import { dependencies } from './package.json'

export default defineConfig({
  name: 'joyid-evm',
  splitting: true,
  clean: true,
  bundle: true,
  dts: true,
  sourcemap: true,
  target: 'es2021',
  format: ['esm', 'cjs'],
  entry: ['src/index.ts'],
  external: [...Object.keys(dependencies)],
  platform: 'browser',
})
