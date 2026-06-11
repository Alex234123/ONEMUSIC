import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react({
      babel: {
        plugins: [
          'react-dev-locator',
        ],
      },
    }),
    tsconfigPaths({
      ignoreConfigErrors: true,
      projects: ['.'],
    }),
  ],
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      'react/compiler-runtime': path.resolve(__dirname, 'node_modules/react-compiler-runtime/dist/index.js'),
    },
  },
  optimizeDeps: {
    exclude: ['amll-reference'],
    entries: ['index.html'],
  },
  build: {
    rollupOptions: {
      external: [],
    },
  },
  server: {
    watch: {
      ignored: ['**/amll-reference/**'],
    },
    fs: {
      allow: ['.'],
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        timeout: 30000,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      }
    }
  }
})
