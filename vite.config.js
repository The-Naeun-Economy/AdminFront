import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  build: {
    outDir: 'dist/admin', // 기본은 'dist', 필요에 따라 변경
  },
  base: '/admin/',
  plugins: [react()],
  server: {
    port :5175
  }
})