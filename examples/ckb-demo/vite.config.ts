import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgrPlugin from 'vite-plugin-svgr'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgrPlugin({
      svgrOptions: {
        // native: true,
        // icon: true,
        // ...svgr options (https://react-svgr.com/docs/options/)
      },
    }),
    nodePolyfills(),
  ],
})
