import { defineConfig } from 'tsup'

import { dependencies, name } from './package.json'

export default defineConfig({
  name,
  splitting: true,
  clean: true,
  bundle: true,
  dts: true,
  sourcemap: true,
  target: 'es2021',
  format: ['esm', 'cjs'],
  entry: ['src/index.ts', 'src/aa.ts', 'src/web2.ts'],
  external: [...Object.keys(dependencies)],
  platform: 'browser',
})
