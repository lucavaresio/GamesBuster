import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/api-proxy': {
        target: 'https://mock-api-server-production-7f5d.up.railway.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-proxy/, '')
      }
    }
  }
});
