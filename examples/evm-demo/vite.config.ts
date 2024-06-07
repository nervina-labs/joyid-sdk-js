import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'
// import { nodePolyfills } from 'vite-plugin-node-polyfills'
// import WindiCSS from 'vite-plugin-windicss';

export default defineConfig({
  plugins: [
    solidPlugin(),
    // nodePolyfills()
  ],
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
  },
})
