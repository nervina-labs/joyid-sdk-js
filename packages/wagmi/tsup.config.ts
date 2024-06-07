import { defineConfig } from 'tsup'

import { dependencies, peerDependencies, name } from './package.json'

export default defineConfig({
  name,
  splitting: true,
  clean: true,
  bundle: true,
  dts: true,
  sourcemap: true,
  target: 'es2021',
  format: ['esm', 'cjs'],
  entry: ['src/index.ts'],
  external: [...Object.keys(dependencies), ...Object.keys(peerDependencies)],
  platform: 'browser',
})
