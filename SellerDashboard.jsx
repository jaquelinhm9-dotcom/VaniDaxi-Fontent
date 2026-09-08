import React,{useEffect,useMemo,useState}from'react';
import{ChevronLeft,RefreshCw,Store,Package,ShoppingBag,DollarSign,TrendingUp,Users,AlertCircle,BarChart3}from'lucide-react';

const URL='https://oycwqpqoxgohzqivclzd.supabase.co';
const KEY=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY||'sb_publishable_OIoqR1IOg5t3BIQR7g6_0w_1KWzgpY';
const session=()=>{try{return JSON.parse(localStorage.getItem('vanidaxi-auth-session')||'null')}catch{return null}};
const money=n=>`$${Number(n||0).toLocaleString('es-MX',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
async function rest(path){const s=session(),t=s?.access_token;const r=await fetch(`${URL}/rest/v1/${path}`,{headers:{apikey:KEY,Authorization:`Bearer ${t||KEY}`}});if(!r.ok)throw Error(await r.text());return r.json()}

export default function SellerDashboard({go}){
 const[data,setData]=useState({store:null,products:[],items:[],orders:[]}),[loading,setLoading]=useState(true),[error,setError]=useState('');
 const load=async()=>{setLoading(true);setError('');try{
  const p=session()?.user?.id;if(!p)throw Error('Inicia sesión para acceder al panel de vendedor.');
  const profiles=await rest(`profiles?select=id,full_name,role&id=eq.${encodeURIComponent(p)}&limit=1`);if(profiles?.[0]?.role!=='seller')throw Error('Esta sección está disponible para cuentas de vendedor.');
  const stores=await rest(`seller_stores?select=id,owner_id,store_name,description,status&id=eq.${encodeURIComponent(p)}&limit=1`).catch(()=>[]);
  const store=stores?.[0]||null;
  if(!store){setData({store:null,products:[],items:[],orders:[]});setLoading(false);return}
  const products=await rest(`products?select=id,name,price,stock,status,created_at&seller_id=eq.${encodeURIComponent(store.id)}&order=created_at.desc`).catch(()=>[]);
  const items=await rest(`order_items?select=id,order_id,product_id,product_name,quantity,unit_price,total_price,created_at&seller_id=eq.${encodeURIComponent(store.id)}&order=created_at.desc`).catch(()=>[]);
  const ids=[...new Set(items.map(x=>x.order_id).filter(Boolean))];
  const orders=ids.length?await rest(`orders?select=id,order_number,status,total,created_at&id=in.(${ids.map(encodeURIComponent).join(',')})&order=created_at.desc`).catch(()=>[]):[];
  setData({store,products,items,orders});
 }catch(e){setError(e?.message||'No fue posible cargar el panel.')}finally{setLoading(false)}};
 useEffect(()=>{load()},[]);
 const stats=useMemo(()=>{const valid=new Set(['paid','processing','shipped','delivered']);const items=data.items.filter(x=>valid.has(data.orders.find(o=>o.id===x.order_id)?.status));const revenue=items.reduce((a,x)=>a+Number(x.total_price||0),0);const units=items.reduce((a,x)=>a+Number(x.quantity||0),0);const orders=new Set(items.map(x=>x.order_id)).size;const avg=orders?revenue/orders:0;return{revenue,units,orders,avg}},[data]);
 const low=data.products.filter(p=>Number(p.stock||0)<=5&&p.status!=='inactive');
 const days=useMemo(()=>{const now=Date.now();return Array.from({length:7},(_,i)=>{const d=new Date(now-(6-i)*86400000);const key=d.toISOString().slice(0,10);const value=data.items.filter(x=>x.created_at?.slice(0,10)===key).reduce((a,x)=>a+Number(x.total_price||0),0);return{label:d.toLocaleDateString('es-MX',{weekday:'short'}).replace('.',''),value}})},[data.items]);
 const max=Math.max(1,...days.map(x=>x.value));
 return <main className="scroll-page seller-dashboard"><header className="seller-top"><button className="icon-btn" onClick={()=>go('profile')}><ChevronLeft size={18}/></button><div><span>VaniDaxi</span><h1>Panel de vendedor</h1></div><button className="icon-btn" onClick={load} disabled={loading}><RefreshCw size={16}/></button></header>
 {loading?<div className="empty"><RefreshCw size={32}/><h2>Cargando análisis…</h2><p>Consultando ventas, productos e ingresos.</p></div>:error?<div className="empty"><AlertCircle size={36}/><h2>No disponible</h2><p>{error}</p><button onClick={()=>go('profile')}>Volver a mi cuenta</button></div>:!data.store?<div className="empty"><Store size={38}/><h2>Tu tienda aún no está creada</h2><p>Cuando tu registro como vendedor esté aprobado, aquí aparecerán tus métricas y operaciones.</p><button onClick={()=>go('profile')}>Volver a mi cuenta</button></div>:<>
 <section className="seller-store"><div className="seller-store-icon"><Store size={21}/></div><div><b>{data.store.store_name}</b><span>Estado: {data.store.status==='approved'?'Aprobada':data.store.status}</span></div></section>
 <div className="seller-stats"><article><DollarSign/><small>Ingresos</small><strong>{money(stats.revenue)}</strong></article><article><TrendingUp/><small>Ganancia estimada*</small><strong>{money(stats.revenue*0.9)}</strong></article><article><ShoppingBag/><small>Pedidos</small><strong>{stats.orders}</strong></article><article><Package/><small>Unidades</small><strong>{stats.units}</strong></article></div>
 <section className="seller-card"><div className="seller-title"><div><span>Rendimiento</span><h2>Ventas de los últimos 7 días</h2></div><BarChart3 size={19}/></div><div className="seller-chart">{days.map(d=><div className="seller-bar-wrap" key={d.label}><div className="seller-bar" style={{height:`${Math.max(5,d.value/max*100)}%`}} title={money(d.value)}/><small>{d.label}</small></div>)}</div></section>
 <section className="seller-card"><div className="seller-title"><div><span>Operación</span><h2>Resumen de tu tienda</h2></div></div><div className="seller-metrics"><div><span>Productos publicados</span><b>{data.products.filter(p=>p.status==='approved').length}</b></div><div><span>Productos pendientes</span><b>{data.products.filter(p=>p.status==='pending').length}</b></div><div><span>Ticket promedio</span><b>{money(stats.avg)}</b></div><div><span>Stock bajo</span><b>{low.length}</b></div></div></section>
 {low.length>0&&<section className="seller-card seller-warning"><AlertCircle size={18}/><div><b>Stock bajo</b><p>{low.slice(0,4).map(p=>p.name).join(' · ')}{low.length>4?'…':''}</p></div></section>}
 <p className="seller-note">* La ganancia mostrada es una estimación visual del 90% de los ingresos. El margen real, comisiones, impuestos y costos de envío deberán calcularse cuando VaniDaxi tenga configurado su esquema financiero definitivo.</p>
 </>}</main>
}