import React,{useEffect,useMemo,useState}from'react';
import{BarChart3,Store,Users,Package,ShoppingCart,Wallet,Settings,RefreshCw,ShieldCheck,TrendingUp}from'lucide-react';
import'./admin-dashboard.css';

const URL='https://oycwqpqoxgohzqivclzd.supabase.co';
const KEY=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY||'...publishable fallback...';
const session=()=>{try{return JSON.parse(localStorage.getItem('vanidaxi-auth-session')||'null')}catch{return null}};
const money=n=>`$${Number(n||0).toLocaleString('es-MX',{minimumFractionDigits:2,maximumFractionDigits:2})}`;

async function api(path,token){const r=await fetch(`${URL}/rest/v1/${path}`,{headers:{apikey:KEY,Authorization:`Bearer ${token||KEY}`}});const data=await r.json();if(!r.ok)throw new Error(data?.message||'Error');return data}

export default function AdminDashboard({go}){
 const[s,setS]=useState(null),[allowed,setAllowed]=useState(false),[loading,setLoading]=useState(true),[error,setError]=useState(''),[data,setData]=useState({orders:[],items:[],commissions:[],sellers:[],products:[]}),[rate,setRate]=useState('10.00'),[saving,setSaving]=useState(false),[tab,setTab]=useState('resumen');
 const load=async()=>{setLoading(true);setError('');try{const x=session();setS(x);const uid=x?.user?.id;if(!uid)throw new Error('Sesión requerida');const token=x.access_token||KEY;const p=await api(`profiles?select=id,full_name,role,is_active&id=eq.${encodeURIComponent(uid)}&limit=1`,token);if(p?.[0]?.role!=='admin'||!p?.[0]?.is_active)throw new Error('Acceso administrativo no autorizado');setAllowed(true);const [o,i,c,ss,pr,st]=await Promise.all([api('orders?select=id,order_number,status,total,created_at&order=created_at.desc',token),api('order_items?select=id,order_id,seller_id,product_name,quantity,total_price,created_at&order=created_at.desc',token),api('platform_commissions?select=id,order_id,order_item_id,seller_id,gross_amount,commission_rate,commission_amount,seller_amount,status,created_at&order=created_at.desc',token),api('seller_stores?select=id,owner_id,store_name,status,created_at&order=created_at.desc',token),api('products?select=id,name,price,stock,status,seller_id,created_at&order=created_at.desc',token),api('platform_settings?select=commission_rate&id=eq.true&limit=1',token)]);setData({orders:o||[],items:i||[],commissions:c||[],sellers:ss||[],products:pr||[]});setRate(String(st?.[0]?.commission_rate??10));}catch(e){setAllowed(false);setError(e.message||'No se pudo cargar el panel');}finally{setLoading(false)}};
 useEffect(()=>{load()},[]);
 const earned=data.commissions.filter(x=>x.status==='earned');
 const pending=data.commissions.filter(x=>x.status==='pending');
 const reversed=data.commissions.filter(x=>x.status==='reversed');
 const totalSales=earned.reduce((a,x)=>a+Number(x.gross_amount||0),0);
 const totalEarnings=earned.reduce((a,x)=>a+Number(x.commission_amount||0),0);
 const pendingEarnings=pending.reduce((a,x)=>a+Number(x.commission_amount||0),0);
 const customers=new Set(data.orders.map(x=>x.user_id).filter(Boolean));
 const sellerCount=data.sellers.length;
 const activeProducts=data.products.filter(x=>x.status==='approved').length;
 const daily=useMemo(()=>{const m=new Map();earned.forEach(x=>{const d=new Date(x.created_at).toLocaleDateString('es-MX',{day:'2-digit',month:'2-digit'});m.set(d,(m.get(d)||0)+Number(x.commission_amount||0))});return [...m].slice(-7)},[earned]);
 const saveRate=async()=>{const n=Number(rate);if(!Number.isFinite(n)||n<0||n>100)return setError('La comisión debe estar entre 0% y 100%');setSaving(true);try{const x=session();const token=x?.access_token||KEY;await fetch(`${URL}/rest/v1/platform_settings?id=eq.true`,{method:'PATCH',headers:{apikey:KEY,Authorization:`Bearer ${token}`,Prefer:'return=minimal','Content-Type':'application/json'},body:JSON.stringify({commission_rate:n,updated_at:new Date().toISOString()})}).then(async r=>{if(!r.ok)throw new Error(await r.text())});await load()}catch(e){setError('No se pudo guardar la comisión')}finally{setSaving(false)}};
 if(loading)return <div className="admin-screen"><div className="admin-loading"><RefreshCw className="spin"/> Cargando administración…</div></div>;
 if(!allowed)return <div className="admin-screen"><div className="admin-denied"><ShieldCheck size={42}/><h1>Acceso restringido</h1><p>{error||'Esta sección es exclusiva para administradores autorizados.'}</p><button onClick={go}>Volver a VaniDaxi</button></div></div>;
 return <div className="admin-screen"><header className="admin-top"><div><span>VaniDaxi</span><h1>Panel administrativo</h1><p>Centro de control de la plataforma</p></div><button className="admin-refresh" onClick={load}><RefreshCw size={16}/> Actualizar</button></header>
 <nav className="admin-tabs">{[['resumen','Resumen',BarChart3],['ventas','Ventas',ShoppingCart],['vendedores','Vendedores',Store],['usuarios','Usuarios',Users],['productos','Productos',Package],['ganancias','Ganancias VaniDaxi',Wallet],['configuracion','Configuración',Settings]].map(([id,label,I])=><button className={tab===id?'active':''} key={id} onClick={()=>setTab(id)}><I size={16}/>{label}</button>)}</nav>
 {error&&<div className="admin-error">{error}</div>}
 {tab==='resumen'&&<><section className="admin-kpis"><Kpi icon={<Wallet/>} label="Ganancias VaniDaxi" value={money(totalEarnings)}/><Kpi icon={<TrendingUp/>} label="Ventas procesadas" value={money(totalSales)}/><Kpi icon={<Store/>} label="Tiendas" value={sellerCount}/><Kpi icon={<Package/>} label="Productos aprobados" value={activeProducts}/></section><section className="admin-grid"><div className="admin-card"><h2>Ganancias por día</h2>{daily.length?<div className="admin-bars">{daily.map(([d,v])=><div className="admin-bar-wrap" key={d}><div className="admin-bar" style={{height:`${Math.max(8,Math.min(100,(v/Math.max(...daily.map(x=>x[1]),1))*100))}%`}} title={money(v)}/><small>{d}</small></div>)}</div>:<Empty text="Aún no hay ventas con comisión ganada."/>}</div><div className="admin-card"><h2>Estado de comisiones</h2><Row label="Ganadas" value={money(totalEarnings)}/><Row label="Pendientes" value={money(pendingEarnings)}/><Row label="Revertidas" value={money(reversed.reduce((a,x)=>a+Number(x.commission_amount||0),0))}/><div className="rate-note">Comisión vigente: <b>{rate}%</b></div></div></section></>}
 {tab==='ventas'&&<List title="Ventas recientes" rows={data.orders.map(x=>[x.order_number,money(x.total),x.status,new Date(x.created_at).toLocaleDateString('es-MX')])}/>} 
 {tab==='vendedores'&&<List title="Tiendas de vendedores" rows={data.sellers.map(x=>[x.store_name,x.status,new Date(x.created_at).toLocaleDateString('es-MX')])}/>} 
 {tab==='usuarios'&&<div className="admin-card"><h2>Usuarios</h2><p>El panel está preparado para mostrar compradores y sus métricas. La consulta se ampliará con una vista administrativa segura para no exponer datos personales innecesarios.</p></div>}
 {tab==='productos'&&<List title="Productos" rows={data.products.map(x=>[x.name,money(x.price),`Stock ${x.stock}`,x.status])}/>} 
 {tab==='ganancias'&&<div className="admin-card"><h2>Ganancias de VaniDaxi</h2><p className="admin-big-number">{money(totalEarnings)}</p><p>Ganancia registrada sobre ventas con estado pagado, en proceso, enviado o entregado.</p><Row label="Pendiente de ganar" value={money(pendingEarnings)}/><Row label="Ventas que generan comisión" value={money(totalSales)}/></div>}
 {tab==='configuracion'&&<div className="admin-card admin-settings"><h2>Comisión de VaniDaxi</h2><p>Este porcentaje se guarda en Supabase y se captura como una instantánea en cada artículo vendido. Cambiarlo no modifica comisiones históricas.</p><label>Comisión de plataforma (%)<input type="number" min="0" max="100" step="0.01" value={rate} onChange={e=>setRate(e.target.value)}/></label><button onClick={saveRate} disabled={saving}>{saving?'Guardando…':'Guardar configuración'}</button></div>}
 </div>
}
function Kpi({icon,label,value}){return <div className="admin-kpi"><span>{icon}</span><small>{label}</small><strong>{value}</strong></div>}
function Row({label,value}){return <div className="admin-row"><span>{label}</span><b>{value}</b></div>}
function Empty({text}){return <div className="admin-empty">{text}</div>}
function List({title,rows}){return <div className="admin-card"><h2>{title}</h2>{rows.length?<div className="admin-list">{rows.slice(0,30).map((r,i)=><div key={i} className="admin-list-row">{r.map((x,j)=><span key={j}>{x}</span>)}</div>)}</div>:<Empty text="No hay datos registrados todavía."/>}</div>}
