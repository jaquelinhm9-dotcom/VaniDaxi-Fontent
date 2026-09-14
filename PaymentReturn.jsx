import React,{useEffect,useState}from'react'
import{CheckCircle2,Clock3,XCircle,Package,ArrowRight,RefreshCw}from'lucide-react'
import{loadCommercialState}from'./commercialApi.js'
import'./vanidaxi-new.css'

const money=v=>`$${Number(v||0).toLocaleString('es-MX',{minimumFractionDigits:2,maximumFractionDigits:2})}`
const statusText={paid:'Pagado',processing:'Preparando',shipped:'En camino',delivered:'Entregado',pending:'Pendiente',cancelled:'Cancelado',refunded:'Reembolsado'}

export default function PaymentReturn(){
 const params=new URLSearchParams(location.search),kind=String(params.get('payment')||'').toLowerCase(),orderId=params.get('order')||''
 const[order,setOrder]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState('')
 useEffect(()=>{let alive=true;(async()=>{try{const state=await loadCommercialState();const found=(state?.orders||[]).find(o=>String(o.id)===String(orderId));if(alive)setOrder(found||null)}catch(e){if(alive)setError(e?.message||'No se pudo verificar el pedido.')}finally{if(alive)setLoading(false)}})();return()=>{alive=false}},[orderId])
 const verifiedPaid=order?.status&&['paid','processing','shipped','delivered'].includes(String(order.status).toLowerCase())
 const title=verifiedPaid?'Pago confirmado':kind==='cancelled'||kind==='failure'?'Pago no completado':'Pago pendiente de confirmación'
 const Icon=verifiedPaid?CheckCircle2:kind==='cancelled'||kind==='failure'?XCircle:Clock3
 const detail=verifiedPaid?'Tu pedido quedó registrado correctamente y ya puedes consultar su seguimiento.':kind==='cancelled'||kind==='failure'?'No se confirmó el pago. Tu pedido no debe considerarse pagado.':'El proveedor de pago todavía no ha confirmado el resultado. VaniDaxi actualizará el pedido cuando llegue la confirmación.'
 const goHome=()=>{history.replaceState({},'',location.pathname);location.hash='#/home';location.reload()}
 const goOrders=()=>{history.replaceState({},'',location.pathname);location.hash='#/postventa';location.reload()}
 return <main className="page" style={{minHeight:'70vh',display:'grid',placeItems:'center'}}><section className="profile-card" style={{maxWidth:620,width:'100%',textAlign:'center'}}><Icon size={56}/><small>VaniDaxi · PAGO</small><h1>{title}</h1><p>{detail}</p>{loading&&<p><RefreshCw className="spin"/> Verificando el pedido…</p>}{error&&<p>{error}</p>}{order&&<div style={{margin:'24px 0',padding:16,borderRadius:16,background:'rgba(0,0,0,.03)',display:'grid',gap:8}}><strong>{order.order_number||order.id}</strong><span>Estado: {statusText[String(order.status||'').toLowerCase()]||order.status}</span><span>Total: {money(order.total)}</span></div>}<div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}><button className="primary" onClick={goOrders}><Package/> Ver mi pedido <ArrowRight/></button><button onClick={goHome}>Volver al inicio</button></div></section></main>
}
