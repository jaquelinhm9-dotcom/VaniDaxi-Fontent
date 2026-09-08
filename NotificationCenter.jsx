import React,{useEffect,useMemo,useState}from'react'
import{Bell,Check,Clock,Package,RotateCcw,Truck,X}from'lucide-react'
import{loadNotifications,markAllNotificationsRead,markNotificationRead}from'./commercialApi.js'
import'./notification-center.css'

const iconFor=t=>t==='order'?Package:t==='delivery'?Truck:t==='return'||t==='admin_return'?RotateCcw:Bell
const dateText=d=>{try{return new Date(d).toLocaleString('es-MX',{dateStyle:'short',timeStyle:'short'})}catch{return''}}

export default function NotificationCenter({close,setNotes}){
 const[items,setItems]=useState([]),[loading,setLoading]=useState(true)
 const refresh=async()=>{setLoading(true);const rows=await loadNotifications().catch(()=>[]);setItems(rows);setNotes?.(rows.filter(x=>!x.is_read).length);setLoading(false)}
 useEffect(()=>{refresh();const t=setInterval(refresh,20000);return()=>clearInterval(t)},[])
 const unread=useMemo(()=>items.filter(x=>!x.is_read).length,[items])
 const readOne=async id=>{await markNotificationRead(id).catch(()=>{});setItems(a=>a.map(x=>x.id===id?{...x,is_read:true}:x));setNotes?.(Math.max(0,unread-1))}
 const readAll=async()=>{await markAllNotificationsRead().catch(()=>{});setItems(a=>a.map(x=>({...x,is_read:true})));setNotes?.(0)}
 return <div className="notification-modal"><div className="notification-head"><div><span className="eyebrow">VaniDaxi</span><h2>Notificaciones</h2><p>{unread?`${unread} pendiente${unread===1?'':'s'} de leer`:'Todo al día'}</p></div><button className="icon-btn" onClick={close}><X size={18}/></button></div><div className="notification-actions">{unread>0&&<button onClick={readAll}><Check size={14}/> Marcar todo como leído</button>}</div><div className="notification-list">{loading?<div className="notification-empty"><Clock size={20}/><p>Cargando notificaciones...</p></div>:items.length?items.map(n=>{const I=iconFor(n.type);return <article key={n.id} className={`notification-row ${n.is_read?'read':'unread'}`} onClick={()=>!n.is_read&&readOne(n.id)}><div className="notification-icon"><I size={17}/></div><div className="notification-copy"><b>{n.title}</b><p>{n.message}</p><small>{dateText(n.created_at)}</small></div>{!n.is_read&&<span className="notification-dot"/>}</article>}):<div className="notification-empty"><Bell size={24}/><h3>No tienes notificaciones</h3><p>Aquí aparecerán actualizaciones reales de tus pedidos, entregas y devoluciones.</p></div>}</div></div>
}
