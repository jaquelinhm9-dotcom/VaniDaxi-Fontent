import React from 'react'
import {ChevronLeft,CheckCircle2,Clock3,PackageCheck,Truck,Warehouse,MapPin} from 'lucide-react'
import './delivery-orders.css'

const money=n=>`$${Number(n||0).toLocaleString('es-MX')}`
const localSteps=[
  ['pending','Pedido confirmado','Tu pedido fue recibido por VaniDaxi.',Clock3],
  ['preparing','Preparando pedido','El vendedor está preparando tu paquete.',PackageCheck],
  ['awaiting_vanidaxi','En camino a VaniDaxi','El vendedor debe entregar el paquete a VaniDaxi.',Truck],
  ['received_by_vanidaxi','VaniDaxi recibió el paquete','Ya tenemos tu paquete y comenzaremos la entrega local.',Warehouse],
  ['in_transit','En camino a tu domicilio','VaniDaxi está realizando la entrega.',MapPin],
  ['delivered','Entregado','Tu pedido fue entregado.',CheckCircle2],
]
const outsideSteps=[
  ['pending','Pedido confirmado','Tu pedido fue recibido.',Clock3],
  ['preparing','Preparando pedido','El vendedor está preparando tu paquete.',PackageCheck],
  ['in_transit','En tránsito','El vendedor está gestionando la entrega o paquetería.',Truck],
  ['delivered','Entregado','Tu pedido fue entregado.',CheckCircle2],
]
const rank=s=>({pending:0,preparing:1,awaiting_vanidaxi:2,received_by_vanidaxi:3,in_transit:4,delivered:5,failed:99,cancelled:99}[s]??0)
function Timeline({order}){
  const local=order.delivery_provider==='vanidaxi'
  const steps=local?localSteps:outsideSteps
  const current=order.delivery_status||'pending'
  return <div className="delivery-card">
    <div className="delivery-head"><div><span className="delivery-kicker">LOGÍSTICA</span><h3>{local?'Entrega local VaniDaxi':'Entrega gestionada por el vendedor'}</h3></div><span className={`delivery-badge ${current}`}>{current==='delivered'?'Entregado':current==='received_by_vanidaxi'?'En VaniDaxi':current==='in_transit'?'En tránsito':current==='awaiting_vanidaxi'?'Esperando recepción':'En preparación'}</span></div>
    <p className="delivery-rule">{local?'Vendedor → VaniDaxi → Comprador':'Vendedor → Paquetería/entrega del vendedor → Comprador'}</p>
    <div className="delivery-timeline">{steps.map(([key,title,text,Icon])=>{const done=rank(current)>=rank(key)&&current!=='failed'&&current!=='cancelled';const active=current===key;return <div className={`delivery-step ${done?'done':''} ${active?'active':''}`} key={key}><div className="delivery-dot"><Icon size={14}/></div><div><b>{title}</b><small>{text}</small></div></div>})}</div>
    {order.delivery_tracking&&<div className="delivery-tracking"><b>Rastreo</b><span>{order.delivery_tracking}</span></div>}
    {order.delivery_notes&&<div className="delivery-notes">{order.delivery_notes}</div>}
    {(current==='failed'||current==='cancelled')&&<div className="delivery-alert">La entrega presenta el estado: {current==='failed'?'fallida':'cancelada'}.</div>}
  </div>
}
export default function DeliveryOrders({go,orders=[]}){return <main className="scroll-page"><header className="header"><div className="header-row"><button className="icon-btn" onClick={()=>go('home')}><ChevronLeft size={18}/></button><div className="simple-title"><span>Tu historial</span><b>Mis pedidos</b></div></div></header><section className="orders-page-heading"><span>Seguimiento</span><h1>Mis pedidos</h1><p>Consulta quién tiene tu paquete y el avance de cada entrega.</p></section>{orders.length?<div className="orders-list">{orders.map(o=><article className="order-card" key={o.id}><div className="order-top"><div><b>{o.id}</b><small>{o.date}</small></div><strong>{money(o.total)}</strong></div><div className="order-items">{(o.items||[]).slice(0,3).map((x,i)=><span key={`${o.id}-${i}`}>{x.product?.name||x.name||'Producto'} ×{x.qty||1}</span>)}</div><Timeline order={o}/></article>)}</div>:<div className="empty-orders"><PackageCheck size={28}/><b>Aún no tienes pedidos</b><span>Cuando completes una compra, aparecerá aquí.</span><button onClick={()=>go('products')}>Explorar productos</button></div>}</main>}
