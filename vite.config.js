import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' keeps assets working on GitHub Pages sub-paths and inside Docker/nginx.
export default defineConfig({
  plugins: [react()],
  base: './',
})
