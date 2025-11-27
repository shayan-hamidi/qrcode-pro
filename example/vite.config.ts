import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'qrcode-pro': path.resolve(__dirname, '../dist/index.esm.js'),
    },
  },
})

