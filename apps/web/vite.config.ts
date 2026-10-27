import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/comtesse-academy/',
  plugins: [react()],
  server: {
    proxy: {
      '/auth': { target: 'http://127.0.0.1:3000', changeOrigin: true },
      '/modules': { target: 'http://127.0.0.1:3000', changeOrigin: true },
      '/admin': { target: 'http://127.0.0.1:3000', changeOrigin: true },
      '/exams': { target: 'http://127.0.0.1:3000', changeOrigin: true },
      '/learner': { target: 'http://127.0.0.1:3000', changeOrigin: true },
      '/manager': { target: 'http://127.0.0.1:3000', changeOrigin: true },
    },
  },
})
