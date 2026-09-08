import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function stabilizeAppHomeImport() {
  return {
    name: 'stabilize-app-home-import',
    enforce: 'pre',
    transform(code, id) {
      if (!id.endsWith('/App.jsx')) return null
      const next = code
        .replace("Bell,Heart,Home,Grid2X2", "Bell,Heart,Home as HomeIcon,Grid2X2")
        .replace(/<Home\s+size=/g, '<HomeIcon size=')
      return next === code ? null : { code: next, map: null }
    },
  }
}

export default defineConfig({
  plugins: [stabilizeAppHomeImport(), react()],
  base: '/VaniDaxi-Fontent/',
})
