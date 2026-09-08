import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const repairAppFixed = () => ({
  name: 'vanidaxi-repair-appfixed-home-symbol',
  enforce: 'pre',
  transform(code, id) {
    if (!id.endsWith('/AppFixed.jsx')) return null
    const fixedImport = code.replace("import{Bell,Heart,Home,Grid2X2", "import{Bell,Heart,Home as HomeIcon,Grid2X2")
    if (fixedImport === code) return null
    return { code: fixedImport.replaceAll('<Home ', '<HomeIcon '), map: null }
  },
})

export default defineConfig({
  plugins: [repairAppFixed(), react()],
  base: './',
})
