import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/stash/', // GitHub Pages serves the app at youssefabdelkawy.github.io/stash/
  plugins: [react()],
})
