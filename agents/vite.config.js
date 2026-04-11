import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Expose all VITE_* vars from .env to import.meta.env
  envPrefix: 'VITE_',
})
