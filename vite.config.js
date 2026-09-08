import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const repairAppFixed = () => ({
  name: 'vanidaxi-repair-appfixed-home-symbol',
  enforce: 'pre',
  transform(code, id) {
    if (!id.endsWith('/AppFixed.jsx')) return null
    let next = code.replace("import{Bell,Heart,Home,Grid2X2", "import{Bell,Heart,Home as HomeIcon,Grid2X2")
    next = next.replaceAll('<Home ', '<HomeIcon ')
    next = next.replace('import React,{useEffect', "import DeliveryOrders from './DeliveryOrders.jsx';import AuthChoice from './AuthChoice.jsx';import React,{useEffect")
    next = next.replace(/<Auth type=\{auth\} close=\{\(\)=>setAuth\(null\)\} done=\{logged\}\/>/g, '<AuthChoice type={auth} close={()=>setAuth(null)} done={logged}/>')
    next = next.replace(/<Orders go=\{go\} orders=\{orders\}\/>/g, '<DeliveryOrders go={go} orders={orders}/>')
    if (next === code) return null
    return { code: next, map: null }
  },
})

export default defineConfig({
  plugins: [repairAppFixed(), react()],
  base: './',
})
