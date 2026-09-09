import React,{useEffect,useState}from'react'
import{Bell,X,Check,Package,Truck,RotateCcw,ArrowRight}from'lucide-react'
import{loadNotifications,markNotificationRead,markAllNotificationsRead}from'./commercialApi.js'
import'./customer-notification-bell.css'

const AUTH='vanidaxi-auth-session'
const session=()=>{try{return JSON.parse(localStorage.getItem(AUTH)||'null')}catch{return null}}
const iconFor=t=>t==='order'?Package:t==='delivery'?Truck:t==='return'||t==='admin_return'?RotateCcw:Bell
const date=d=>{try{return new Date(d).toLocaleString('es-MX',{dateStyle:'short',timeStyle:'short'})}catch{return''}}

export default function CustomerNotificationBell(){
 const[open,setOpen]=useState(false),[items,setItems]=useState([]),[loading,setLoading]=useState(false)
 const refresh=async()=>{if(!session()?.user)return;setLoading(true);try{setItems(await loadNotifications())}finally{setLoading(false)}}
 useEffect(()=>{refresh();const t=setInterval(refresh,20000);const onStorage=e=>{if(e.key===AUTH)refresh()};addEventListener('storage',onStorage);return()=>{clearInterval(t);removeEventListener('storage',onStorage)}},[])
 const unread=items.filter(x=>!x.is_read).length
 const readOne=async id=>{await markNotificationRead(id).catch(()=>{});setItems(a=>a.map(x=>x.id===id?{...x,is_read:true}:x))}
 const readAll=async()=>{await markAllNotificationsRead().catch(()=>{});setItems(a=>a.map(x=>({...x,is_read:true}))) }
 if(!session()?.user)return null
 return <>
  <button className="customer-notification-trigger" aria-label="Notificaciones" onClick={()=>{setOpen(true);refresh()}}><Bell size={19}/>{unread>0&&<i>{unread>99?'99+':unread}</i>}</button>
  {open&&<div className="customer-notification-back" onClick={e=>e.target===e.currentTarget&&setOpen(false)}>
   <aside className="customer-notification-panel">
    <header><div><small>VaniDaxi</small><h2>Notificaciones</h2><p>{unread?`${unread} pendiente${unread===1?'':'s'} de leer`:'Todo al día'}</p></div><button onClick={()=>setOpen(false)} aria-label="Cerrar"><X size={19}/></button></header>
    {unread>0&&<button className="customer-notification-readall" onClick={readAll}><Check size={14}/> Marcar todo como leído</button>}
    <div className="customer-notification-list">{loading?<div className="customer-notification-empty">Cargando notificaciones…</div>:items.length?items.map(n=>{const I=iconFor(n.type);return <article key={n.id} className={n.is_read?'read':'unread'} onClick={()=>!n.is_read&&readOne(n.id)}><span className="customer-notification-icon"><I size={16}/></span><div><b>{n.title||'VaniDaxi'}</b><p>{n.message||''}</p><small>{date(n.created_at)}</small></div>{!n.is_read&&<em>Nuevo</em>}</article>}):<div className="customer-notification-empty"><Bell size={24}/><b>No tienes notificaciones</b><span>Aquí aparecerán avisos de pedidos, entregas y devoluciones.</span></div>}</div>
    <button className="customer-notification-more" onClick={()=>{setOpen(false);location.hash='#/postventa'}}><span>Ver centro de postventa</span><ArrowRight size={16}/></button>
   </aside>
  </div>}
 </>
}
