import { defineConfig } from 'tsup'

import { dependencies, peerDependencies, name } from './package.json'

import config from '../../tsup-base.config'

export default defineConfig({
  ...config,
  name,
  external: [...Object.keys(dependencies), ...Object.keys(peerDependencies)],
  platform: 'browser',
})
