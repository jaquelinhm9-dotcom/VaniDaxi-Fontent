import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const repairAppFixed = () => ({
  name: 'vanidaxi-repair-appfixed-home-symbol',
  enforce: 'pre',
  transform(code, id) {
    if (!id.endsWith('/AppFixed.jsx')) return null
    let next = code.replace("import{Bell,Heart,Home,Grid2X2", "import{Bell,Heart,Home as HomeIcon,Grid2X2")
    next = next.replaceAll('<Home ', '<HomeIcon ')
    next = next.replace('import React,{useEffect', "import ProductReviews from './ProductReviews.jsx';import ReturnsPage from './ReturnsPage.jsx';import DeliveryOrders from './DeliveryOrders.jsx';import AuthChoice from './AuthChoice.jsx';import NotificationCenter from './NotificationCenter.jsx';import React,{useEffect")
    next = next.replace("import{loadCommercialState,syncFavorites,syncCart,syncAddress,createCommercialOrder}from'./commercialApi.js'", "import{loadCommercialState,syncFavorites,syncCart,syncAddress,createCommercialOrder,loadNotifications}from'./commercialApi.js'")
    next = next.replace(/<Auth type=\{auth\} close=\{\(\)=>setAuth\(null\)\} done=\{logged\}\/>/g, '<AuthChoice type={auth} close={()=>setAuth(null)} done={logged}/>')
    next = next.replace(/<Orders go=\{go\} orders=\{orders\}\/>/g, '<DeliveryOrders go={go} orders={orders}/>')
    next = next.replace(/(<Detail[^>]*count=\{count\}\/>)/, '$1<ProductReviews product={selected} orders={orders}/>')
    next = next.replace(/\{s==='orders'&&<DeliveryOrders go=\{go\} orders=\{orders\}\/ >\}/g, "{s==='orders'&&<DeliveryOrders go={go} orders={orders}/>}{s==='returns'&&<ReturnsPage go={go}/>}")
    if (!next.includes("s==='returns'&&<ReturnsPage go={go}/>" ) && next.includes("s==='orders'&&<DeliveryOrders go={go} orders={orders}/>")) next=next.replace("{s==='orders'&&<DeliveryOrders go={go} orders={orders}/>" , "{s==='orders'&&<DeliveryOrders go={go} orders={orders}/>}{s==='returns'&&<ReturnsPage go={go}/>" )
    next = next.replace('[notes,setNotes]=useState(3)', '[notes,setNotes]=useState(0)')
    next = next.replace("useEffect(()=>localStorage.setItem('vanidaxi-payment',JSON.stringify(pay)),[pay]);", "useEffect(()=>localStorage.setItem('vanidaxi-payment',JSON.stringify(pay)),[pay]);useEffect(()=>{if(!user||boot)return;let live=true;const pull=async()=>{const rows=await loadNotifications().catch(()=>[]);if(live)setNotes(rows.filter(x=>!x.is_read).length)};pull();const t=setInterval(pull,20000);return()=>{live=false;clearInterval(t)}},[user,boot]);")
    next = next.replace('{modal&&<Account type={modal} close={()=>setModal(null)} addr={addr} setAddr={setAddr} pay={pay} setPay={setPay} notes={notes} setNotes={setNotes} msg={msg}/>}','{modal&&modal===\'notifications\'?<div className="modal-overlay"><NotificationCenter close={()=>setModal(null)} setNotes={setNotes}/></div>:modal&&<Account type={modal} close={()=>setModal(null)} addr={addr} setAddr={setAddr} pay={pay} setPay={setPay} notes={notes} setNotes={setNotes} msg={msg}/>}')
    if (next === code) return null
    return { code: next, map: null }
  },
})

export default defineConfig({
  plugins: [repairAppFixed(), react()],
  base: './',
})
