import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3002,
    proxy: {
      '/api': {
        target: 'http://localhost:8092',
        changeOrigin: true,
      },
      '/login': {
        target: 'http://localhost:8092',
        changeOrigin: true,
      },
      '/oauth2': {
        target: 'http://localhost:8092',
        changeOrigin: true,
      },
      '/logout': {
        target: 'http://localhost:8092',
        changeOrigin: true,
      }
    }
  }
})