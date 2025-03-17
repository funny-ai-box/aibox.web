import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
      
    },
  },
  server: {
    proxy: {
      // 配置代理
      '/api': {
        target: 'http://106.75.71.65:57460',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  }
})