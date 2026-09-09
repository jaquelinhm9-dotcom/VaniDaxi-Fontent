import React, { useEffect, useMemo, useState } from 'react'
import {
  BarChart3, Check, ChevronRight, ClipboardList, DollarSign, Package, RefreshCw,
  Settings, ShieldCheck, ShoppingCart, Store, Tag, Users, Wallet, XCircle,
} from 'lucide-react'
import './admin-dashboard.css'
import { moderateProduct, moderateStore } from './commercialApi.js'

const URL = 'https://oycwqpqoxgohzqivclzd.supabase.co'
const KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_OIoqR1IOg5t3BIQR7g6_0w_1KWzgpY'

const getSession = () => { try { return JSON.parse(localStorage.getItem('vanidaxi-auth-session') || 'null') } catch { return null } }
const money = (v) => `$${Number(v || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

async function api(path, token, options = {}) {
  const response = await fetch(`${URL}/rest/v1/${path}`, {
    ...options,
    headers: { apikey: KEY, Authorization: `Bearer ${token || KEY}`, ...(options.headers || {}) },
  })
  const data = await response.json().catch(() => null)
  if (!response.ok) throw new Error(data?.message || data?.hint || 'Error de Supabase')
  return data
}

export default function AdminDashboard({ go }) {
  const [loading, setLoading] = useState(true)
  const [allowed, setAllowed] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [tab, setTab] = useState('resumen')
  const [rate, setRate] = useState('10')
  const [saving, setSaving] = useState(false)
  const [data, setData] = useState({ orders: [], commissions: [], sellers: [], products: [], users: [], categories: [], promotions: [], returns: [], notifications: [] })

  const load = async () => {
    setLoading(true); setError('')
    try {
      const s = getSession(); const uid = s?.user?.id
      if (!uid) throw new Error('Sesión requerida')
      const token = s.access_token || KEY
      const profile = await api(`profiles?select=id,role,is_active,created_at&id=eq.${encodeURIComponent(uid)}&limit=1`, token)
      const current = profile?.[0]
      if (current?.role !== 'admin' || !current?.is_active) throw new Error('Acceso administrativo no autorizado')
      setAllowed(true)

      const requests = await Promise.allSettled([
        api('orders?select=id,order_number,status,total,subtotal,discount,shipping_cost,created_at,user_id&order=created_at.desc&limit=200', token),
        api('platform_commissions?select=id,gross_amount,commission_amount,status,created_at,order_id&order=created_at.desc&limit=200', token),
        api('seller_stores?select=id,owner_id,store_name,status,created_at&order=created_at.desc&limit=200', token),
        api('products?select=id,name,price,stock,status,seller_id,rejection_reason,created_at&order=created_at.desc&limit=300', token),
        api('profiles?select=id,role,is_active,created_at&order=created_at.desc&limit=500', token),
        api('categories?select=id,name,slug,description,image_url,is_active&order=name', token),
        api('promotions?select=id,promo_code,promotion_type,discount_value,is_active,automatic,start_at,end_at,usage_count,usage_limit&order=created_at.desc&limit=200', token),
        api('returns?select=*&order=created_at.desc&limit=100', token),
        api('notifications?select=*&order=created_at.desc&limit=100', token),
        api('platform_settings?select=commission_rate&id=eq.true&limit=1', token),
      ])
      const value = (i, fallback = []) => requests[i]?.status === 'fulfilled' ? (requests[i].value || fallback) : fallback
      setData({
        orders: value(0), commissions: value(1), sellers: value(2), products: value(3), users: value(4),
        categories: value(5), promotions: value(6), returns: value(7), notifications: value(8),
      })
      const settings = value(9)
      setRate(String(settings?.[0]?.commission_rate ?? 10))
      const failed = requests.filter((r) => r.status === 'rejected')
      if (failed.length && failed.length >= 7) setError('Algunas áreas administrativas todavía no tienen datos o permisos disponibles.')
    } catch (e) {
      setAllowed(false); setError(e?.message || 'No se pudo cargar el panel')
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const earned = useMemo(() => data.commissions.filter(x => x.status === 'earned'), [data.commissions])
  const pending = useMemo(() => data.commissions.filter(x => x.status === 'pending'), [data.commissions])
  const reversed = useMemo(() => data.commissions.filter(x => x.status === 'reversed'), [data.commissions])
  const sales = useMemo(() => earned.reduce((s, x) => s + Number(x.gross_amount || 0), 0), [earned])
  const earnings = useMemo(() => earned.reduce((s, x) => s + Number(x.commission_amount || 0), 0), [earned])
  const pendingEarnings = useMemo(() => pending.reduce((s, x) => s + Number(x.commission_amount || 0), 0), [pending])
  const reversedEarnings = useMemo(() => reversed.reduce((s, x) => s + Number(x.commission_amount || 0), 0), [reversed])
  const approvedProducts = data.products.filter(x => x.status === 'approved').length
  const activeStores = data.sellers.filter(x => x.status === 'approved').length
  const activeUsers = data.users.filter(x => x.is_active).length
  const openReturns = data.returns.filter(x => ['pending','requested','open','review'].includes(String(x?.status || '').toLowerCase())).length
  const activePromos = data.promotions.filter(x => x.is_active).length

  const act = async (fn, okMessage) => {
    setError(''); setNotice('')
    try { await fn(); setNotice(okMessage); await load() } catch (e) { setError(e?.message || 'No se pudo completar la acción') }
  }

  const saveRate = async () => {
    const value = Number(rate)
    if (!Number.isFinite(value) || value < 0 || value > 100) return setError('La comisión debe estar entre 0% y 100%')
    setSaving(true); setError(''); setNotice('')
    try {
      const token = getSession()?.access_token || KEY
      await api('platform_settings?id=eq.true', token, { method: 'PATCH', headers: { Prefer: 'return=minimal', 'Content-Type': 'application/json' }, body: JSON.stringify({ commission_rate: value, updated_at: new Date().toISOString() }) })
      setNotice('Configuración guardada.'); await load()
    } catch (e) { setError(e?.message || 'No se pudo guardar la comisión') } finally { setSaving(false) }
  }

  if (loading) return <div className="admin-screen"><div className="admin-loading"><RefreshCw className="spin" />Cargando centro administrativo…</div></div>
  if (!allowed) return <div className="admin-screen"><div className="admin-denied"><ShieldCheck size={46} /><h1>Acceso restringido</h1><p>{error || 'Esta sección es exclusiva para administradores autorizados.'}</p><button onClick={go}>Volver a VaniDaxi</button></div></div>

  const tabs = [
    ['resumen','Resumen',BarChart3], ['ventas','Ventas',ShoppingCart], ['vendedores','Vendedores',Store],
    ['productos','Productos',Package], ['usuarios','Usuarios',Users], ['categorias','Categorías',Tag],
    ['promociones','Promociones',Tag], ['devoluciones','Devoluciones',ClipboardList],
    ['ganancias','Finanzas',Wallet], ['notificaciones','Alertas',ShieldCheck], ['configuracion','Configuración',Settings],
  ]

  return <div className="admin-screen">
    <header className="admin-top">
      <div><span>VaniDaxi · CONTROL CENTRAL</span><h1>Administración</h1><p>Operación, marketplace, vendedores y finanzas desde un solo lugar.</p></div>
      <button className="admin-refresh" onClick={load}><RefreshCw size={16}/>Actualizar</button>
    </header>

    <nav className="admin-tabs">{tabs.map(([id,label,Icon]) => <button key={id} className={tab === id ? 'active':''} onClick={() => setTab(id)}><Icon size={15}/>{label}</button>)}</nav>
    {error && <div className="admin-error">{error}</div>}{notice && <div className="admin-notice">{notice}</div>}

    {tab === 'resumen' && <>
      <section className="admin-kpis">
        <Kpi icon={<DollarSign/>} label="Ventas procesadas" value={money(sales)}/><Kpi icon={<Wallet/>} label="Ganancia VaniDaxi" value={money(earnings)}/>
        <Kpi icon={<Store/>} label="Tiendas activas" value={activeStores}/><Kpi icon={<Users/>} label="Usuarios activos" value={activeUsers}/>
      </section>
      <section className="admin-mini-grid">
        <Metric title="Productos aprobados" value={approvedProducts} note={`${data.products.length} registrados`}/>
        <Metric title="Promociones activas" value={activePromos} note="Campañas vigentes"/><Metric title="Devoluciones abiertas" value={openReturns} note="Requieren seguimiento"/>
        <Metric title="Pendiente por ganar" value={money(pendingEarnings)} note={`Comisión actual ${rate}%`}/>
      </section>
      <section className="admin-grid"><div className="admin-card"><SectionTitle title="Actividad reciente"/><List rows={data.orders.slice(0,8).map(o => [o.order_number || o.id, money(o.total), o.status, date(o.created_at)])}/></div><div className="admin-card"><SectionTitle title="Estado financiero"/><Row label="Ganadas" value={money(earnings)}/><Row label="Pendientes" value={money(pendingEarnings)}/><Row label="Revertidas" value={money(reversedEarnings)}/><Row label="Comisión vigente" value={`${rate}%`}/></div></section>
    </>}

    {tab === 'ventas' && <DataPanel title="Pedidos y ventas" subtitle="Supervisión operativa del marketplace"><List rows={data.orders.slice(0,50).map(o => [o.order_number || o.id, money(o.total), o.status, date(o.created_at)])}/></DataPanel>}

    {tab === 'vendedores' && <DataPanel title="Vendedores y tiendas" subtitle="Aprobación, suspensión y estado de las tiendas"><div className="admin-list">{data.sellers.length ? data.sellers.map(s => <div className="admin-list-row admin-action-row" key={s.id}><span><b>{s.store_name || 'Tienda sin nombre'}</b><small>{s.owner_id}</small></span><span>{s.status}</span><span>{date(s.created_at)}</span><aside>{s.status !== 'approved' && <button onClick={() => act(() => moderateStore(s.id,'approved'),'Tienda aprobada.')}><Check size={13}/>Aprobar</button>}{s.status !== 'suspended' && <button onClick={() => act(() => moderateStore(s.id,'suspended'),'Tienda suspendida.')}><XCircle size={13}/>Suspender</button>}</aside></div>) : <Empty text="No hay tiendas registradas."/>}</div></DataPanel>}

    {tab === 'productos' && <DataPanel title="Catálogo y moderación" subtitle="Solo productos aprobados aparecen en el marketplace público."><div className="admin-list">{data.products.length ? data.products.map(p => <div className="admin-list-row admin-action-row" key={p.id}><span><b>{p.name}</b><small>{money(p.price)} · stock {p.stock}</small></span><span>{p.status}</span><span>{date(p.created_at)}</span><aside>{p.status !== 'approved' && <button onClick={() => act(() => moderateProduct(p.id,'approved'),'Producto aprobado.')}><Check size={13}/>Aprobar</button>}{p.status !== 'rejected' && <button onClick={() => act(() => moderateProduct(p.id,'rejected','Requiere revisión administrativa.'),'Producto rechazado.')}><XCircle size={13}/>Rechazar</button>}{p.status === 'approved' && <button onClick={() => act(() => moderateProduct(p.id,'inactive'),'Producto desactivado.')}><XCircle size={13}/>Desactivar</button>}</aside></div>) : <Empty text="No hay productos registrados."/>}</div></DataPanel>}

    {tab === 'usuarios' && <DataPanel title="Usuarios y cuentas" subtitle="Vista operativa sin mostrar credenciales ni información de autenticación."><section className="admin-mini-grid"><Metric title="Usuarios" value={data.users.length} note="Perfiles registrados"/><Metric title="Activos" value={activeUsers} note="Cuentas activas"/><Metric title="Vendedores" value={data.users.filter(x => x.role === 'seller').length} note="Rol seller"/><Metric title="Administradores" value={data.users.filter(x => x.role === 'admin').length} note="Rol admin"/></section><List rows={data.users.slice(0,30).map(u => [u.id, u.role || 'customer', u.is_active ? 'Activo' : 'Inactivo', date(u.created_at)])}/></DataPanel>}

    {tab === 'categorias' && <DataPanel title="Categorías" subtitle="Estructura visible del catálogo."><div className="admin-card-grid">{data.categories.length ? data.categories.map(c => <div className="admin-tile" key={c.id}><Tag size={17}/><div><b>{c.name}</b><small>{c.slug}</small></div><ChevronRight size={16}/></div>) : <Empty text="No hay categorías disponibles."/>}</div></DataPanel>}

    {tab === 'promociones' && <DataPanel title="Promociones" subtitle="Supervisión de campañas y códigos promocionales."><List rows={data.promotions.slice(0,50).map(p => [p.promo_code || 'Automática', `${p.discount_value ?? 0} ${p.promotion_type === 'percentage' ? '%' : ''}`, p.is_active ? 'Activa' : 'Inactiva', p.usage_limit ? `${p.usage_count || 0}/${p.usage_limit}` : `${p.usage_count || 0} usos`])}/></DataPanel>}

    {tab === 'devoluciones' && <DataPanel title="Devoluciones y reembolsos" subtitle="Cola administrativa para revisar incidencias postventa."><List rows={data.returns.slice(0,50).map(r => [r.order_id || r.id, r.status || '—', r.reason || 'Sin motivo', date(r.created_at)])}/></DataPanel>}

    {tab === 'ganancias' && <><section className="admin-kpis"><Kpi icon={<Wallet/>} label="Ganancia VaniDaxi" value={money(earnings)}/><Kpi icon={<ShoppingCart/>} label="Ventas asociadas" value={money(sales)}/><Kpi icon={<DollarSign/>} label="Pendiente" value={money(pendingEarnings)}/><Kpi icon={<XCircle/>} label="Revertido" value={money(reversedEarnings)}/></section><DataPanel title="Finanzas y comisiones" subtitle="La comisión histórica no cambia al modificar el porcentaje futuro."><Row label="Comisiones ganadas" value={money(earnings)}/><Row label="Comisiones pendientes" value={money(pendingEarnings)}/><Row label="Comisiones revertidas" value={money(reversedEarnings)}/><Row label="Tasa vigente" value={`${rate}%`}/></DataPanel></>}

    {tab === 'notificaciones' && <DataPanel title="Notificaciones y alertas" subtitle="Supervisión de eventos operativos del sistema."><List rows={data.notifications.slice(0,50).map(n => [n.type || n.title || 'Notificación', n.message || n.body || 'Evento', n.is_read === false ? 'Pendiente' : 'Vista', date(n.created_at)])}/></DataPanel>}

    {tab === 'configuracion' && <DataPanel title="Configuración administrativa" subtitle="Parámetros de plataforma que deben seguir protegidos por rol y RLS."><div className="admin-setting-block"><label>Comisión de plataforma (%)<input type="number" min="0" max="100" step="0.01" value={rate} onChange={e => setRate(e.target.value)}/></label><button className="admin-primary" onClick={saveRate} disabled={saving}>{saving ? 'Guardando…' : 'Guardar comisión'}</button></div><div className="admin-future"><h3>Base preparada para VaniDaxi Logistics</h3><p>La arquitectura de administración queda separada del marketplace para incorporar posteriormente envíos, fulfillment, seguimiento de paquetes y operaciones propias de VaniDaxi sin rehacer el panel.</p></div></DataPanel>}
  </div>
}

const date = (v) => v ? new Date(v).toLocaleDateString('es-MX') : '—'
const Kpi = ({ icon, label, value }) => <div className="admin-kpi"><span>{icon}</span><small>{label}</small><strong>{value}</strong></div>
const Metric = ({ title, value, note }) => <div className="admin-metric"><small>{title}</small><strong>{value}</strong><span>{note}</span></div>
const Row = ({ label, value }) => <div className="admin-row"><span>{label}</span><b>{value}</b></div>
const SectionTitle = ({ title }) => <h2 className="admin-section-title">{title}</h2>
const Empty = ({ text }) => <div className="admin-empty">{text}</div>
const List = ({ rows }) => rows.length ? <div className="admin-list">{rows.map((row,i) => <div className="admin-list-row" key={i}>{row.map((v,j) => <span key={j}>{v}</span>)}</div>)}</div> : <Empty text="No hay datos registrados todavía."/>
const DataPanel = ({ title, subtitle, children }) => <section className="admin-card admin-panel"><SectionTitle title={title}/>{subtitle && <p className="admin-subtitle">{subtitle}</p>}{children}</section>
