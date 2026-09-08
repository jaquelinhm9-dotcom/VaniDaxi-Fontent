import React, { useEffect, useMemo, useState } from 'react'
import {
  BarChart3,
  Check,
  Package,
  RefreshCw,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Store,
  TrendingUp,
  Users,
  Wallet,
  XCircle,
} from 'lucide-react'
import './admin-dashboard.css'
import { moderateProduct, moderateStore } from './commercialApi.js'

const URL = 'https://oycwqpqoxgohzqivclzd.supabase.co'
const KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_OIoqR1IOg5t3BIQR7g6_0w_1KWzgpY'

const session = () => {
  try {
    return JSON.parse(localStorage.getItem('vanidaxi-auth-session') || 'null')
  } catch {
    return null
  }
}

const money = (value) =>
  `$${Number(value || 0).toLocaleString('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

async function api(path, token, options = {}) {
  const response = await fetch(`${URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${token || KEY}`,
      ...(options.headers || {}),
    },
  })

  const data = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(data?.message || data?.hint || 'Error de Supabase')
  }
  return data
}

export default function AdminDashboard({ go }) {
  const [allowed, setAllowed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [data, setData] = useState({
    orders: [],
    commissions: [],
    sellers: [],
    products: [],
  })
  const [rate, setRate] = useState('10.00')
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState('resumen')

  const load = async () => {
    setLoading(true)
    setError('')

    try {
      const currentSession = session()
      const userId = currentSession?.user?.id

      if (!userId) {
        throw new Error('Sesión requerida')
      }

      const token = currentSession.access_token || KEY
      const profile = await api(
        `profiles?select=id,role,is_active&id=eq.${encodeURIComponent(userId)}&limit=1`,
        token,
      )

      const currentProfile = profile?.[0]
      if (currentProfile?.role !== 'admin' || !currentProfile?.is_active) {
        throw new Error('Acceso administrativo no autorizado')
      }

      setAllowed(true)

      const [orders, commissions, sellers, products, settings] = await Promise.all([
        api('orders?select=id,order_number,status,total,created_at&order=created_at.desc', token),
        api(
          'platform_commissions?select=id,gross_amount,commission_amount,status,created_at&order=created_at.desc',
          token,
        ),
        api(
          'seller_stores?select=id,owner_id,store_name,status,created_at&order=created_at.desc',
          token,
        ),
        api(
          'products?select=id,name,price,stock,status,seller_id,rejection_reason,created_at&order=created_at.desc',
          token,
        ),
        api('platform_settings?select=commission_rate&id=eq.true&limit=1', token),
      ])

      setData({
        orders: orders || [],
        commissions: commissions || [],
        sellers: sellers || [],
        products: products || [],
      })
      setRate(String(settings?.[0]?.commission_rate ?? 10))
    } catch (loadError) {
      setAllowed(false)
      setError(loadError?.message || 'No se pudo cargar el panel')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const earned = useMemo(
    () => data.commissions.filter((item) => item.status === 'earned'),
    [data.commissions],
  )
  const pending = useMemo(
    () => data.commissions.filter((item) => item.status === 'pending'),
    [data.commissions],
  )
  const reversed = useMemo(
    () => data.commissions.filter((item) => item.status === 'reversed'),
    [data.commissions],
  )

  const totalSales = useMemo(
    () => earned.reduce((sum, item) => sum + Number(item.gross_amount || 0), 0),
    [earned],
  )
  const totalEarnings = useMemo(
    () => earned.reduce((sum, item) => sum + Number(item.commission_amount || 0), 0),
    [earned],
  )
  const pendingEarnings = useMemo(
    () => pending.reduce((sum, item) => sum + Number(item.commission_amount || 0), 0),
    [pending],
  )
  const reversedEarnings = useMemo(
    () => reversed.reduce((sum, item) => sum + Number(item.commission_amount || 0), 0),
    [reversed],
  )
  const activeProducts = data.products.filter((item) => item.status === 'approved').length

  const daily = useMemo(() => {
    const grouped = new Map()

    for (const item of earned) {
      const date = new Date(item.created_at).toLocaleDateString('es-MX', {
        day: '2-digit',
        month: '2-digit',
      })
      const current = grouped.get(date) || 0
      grouped.set(date, current + Number(item.commission_amount || 0))
    }

    return [...grouped.entries()].slice(-7)
  }, [earned])

  const act = async (action, message) => {
    setNotice('')
    setError('')

    try {
      await action()
      setNotice(message)
      await load()
    } catch (actionError) {
      setError(actionError?.message || 'No se pudo completar la acción')
    }
  }

  const saveRate = async () => {
    const numericRate = Number(rate)

    if (!Number.isFinite(numericRate) || numericRate < 0 || numericRate > 100) {
      setError('La comisión debe estar entre 0% y 100%')
      return
    }

    setSaving(true)
    setError('')
    setNotice('')

    try {
      const currentSession = session()
      const token = currentSession?.access_token || KEY

      await api('platform_settings?id=eq.true', token, {
        method: 'PATCH',
        headers: {
          Prefer: 'return=minimal',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          commission_rate: numericRate,
          updated_at: new Date().toISOString(),
        }),
      })

      setNotice('Configuración guardada.')
      await load()
    } catch (saveError) {
      setError(saveError?.message || 'No se pudo guardar la comisión')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="admin-screen">
        <div className="admin-loading">
          <RefreshCw className="spin" />
          Cargando administración…
        </div>
      </div>
    )
  }

  if (!allowed) {
    return (
      <div className="admin-screen">
        <div className="admin-denied">
          <ShieldCheck size={42} />
          <h1>Acceso restringido</h1>
          <p>{error || 'Esta sección es exclusiva para administradores autorizados.'}</p>
          <button onClick={go}>Volver a VaniDaxi</button>
        </div>
      </div>
    )
  }

  const tabs = [
    ['resumen', 'Resumen', BarChart3],
    ['ventas', 'Ventas', ShoppingCart],
    ['vendedores', 'Vendedores', Store],
    ['usuarios', 'Usuarios', Users],
    ['productos', 'Productos', Package],
    ['ganancias', 'Ganancias VaniDaxi', Wallet],
    ['configuracion', 'Configuración', Settings],
  ]

  return (
    <div className="admin-screen">
      <header className="admin-top">
        <div>
          <span>VaniDaxi</span>
          <h1>Panel administrativo</h1>
          <p>Centro de control de la plataforma</p>
        </div>
        <button className="admin-refresh" onClick={load}>
          <RefreshCw size={16} />
          Actualizar
        </button>
      </header>

      <nav className="admin-tabs">
        {tabs.map(([id, label, Icon]) => (
          <button
            className={tab === id ? 'active' : ''}
            key={id}
            onClick={() => setTab(id)}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </nav>

      {error && <div className="admin-error">{error}</div>}
      {notice && <div className="admin-notice">{notice}</div>}

      {tab === 'resumen' && (
        <>
          <section className="admin-kpis">
            <Kpi icon={<Wallet />} label="Ganancias VaniDaxi" value={money(totalEarnings)} />
            <Kpi icon={<TrendingUp />} label="Ventas procesadas" value={money(totalSales)} />
            <Kpi icon={<Store />} label="Tiendas" value={data.sellers.length} />
            <Kpi icon={<Package />} label="Productos aprobados" value={activeProducts} />
          </section>

          <section className="admin-grid">
            <div className="admin-card">
              <h2>Ganancias por día</h2>
              {daily.length > 0 ? (
                <div className="admin-bars">
                  {daily.map(([date, value]) => {
                    const maximum = Math.max(...daily.map((entry) => entry[1]), 1)
                    const height = Math.max(8, Math.min(100, (value / maximum) * 100))

                    return (
                      <div className="admin-bar-wrap" key={date}>
                        <div className="admin-bar" style={{ height: `${height}%` }} />
                        <small>{date}</small>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <Empty text="Aún no hay ventas con comisión ganada." />
              )}
            </div>

            <div className="admin-card">
              <h2>Estado de comisiones</h2>
              <Row label="Ganadas" value={money(totalEarnings)} />
              <Row label="Pendientes" value={money(pendingEarnings)} />
              <Row label="Revertidas" value={money(reversedEarnings)} />
              <div className="rate-note">
                Comisión vigente: <b>{rate}%</b>
              </div>
            </div>
          </section>
        </>
      )}

      {tab === 'ventas' && (
        <List
          title="Ventas recientes"
          rows={data.orders.map((order) => [
            order.order_number,
            money(order.total),
            order.status,
            new Date(order.created_at).toLocaleDateString('es-MX'),
          ])}
        />
      )}

      {tab === 'vendedores' && (
        <div className="admin-card">
          <h2>Tiendas de vendedores</h2>
          {data.sellers.length > 0 ? (
            <div className="admin-list">
              {data.sellers.map((storeItem) => (
                <div className="admin-list-row admin-action-row" key={storeItem.id}>
                  <span>{storeItem.store_name}</span>
                  <span>{storeItem.status}</span>
                  <span>
                    {new Date(storeItem.created_at).toLocaleDateString('es-MX')}
                  </span>
                  <aside>
                    {storeItem.status !== 'approved' && (
                      <button
                        onClick={() =>
                          act(
                            () => moderateStore(storeItem.id, 'approved'),
                            'Tienda aprobada.',
                          )
                        }
                      >
                        <Check size={13} />
                        Aprobar
                      </button>
                    )}
                    {storeItem.status !== 'suspended' && (
                      <button
                        onClick={() =>
                          act(
                            () => moderateStore(storeItem.id, 'suspended'),
                            'Tienda suspendida.',
                          )
                        }
                      >
                        <XCircle size={13} />
                        Suspender
                      </button>
                    )}
                  </aside>
                </div>
              ))}
            </div>
          ) : (
            <Empty text="No hay tiendas registradas." />
          )}
        </div>
      )}

      {tab === 'usuarios' && (
        <div className="admin-card">
          <h2>Usuarios</h2>
          <p>
            El conteo detallado de compradores se mantiene detrás de una vista administrativa
            segura para no exponer datos personales innecesarios.
          </p>
        </div>
      )}

      {tab === 'productos' && (
        <div className="admin-card">
          <h2>Moderación de productos</h2>
          <p>Solo los productos aprobados aparecen en el catálogo público.</p>

          {data.products.length > 0 ? (
            <div className="admin-list">
              {data.products.map((product) => (
                <div className="admin-list-row admin-action-row" key={product.id}>
                  <span>
                    <b>{product.name}</b>
                    <small>
                      {money(product.price)} · stock {product.stock}
                    </small>
                  </span>
                  <span>
                    {product.status}
                    {product.rejection_reason ? ` · ${product.rejection_reason}` : ''}
                  </span>
                  <aside>
                    {product.status !== 'approved' && (
                      <button
                        onClick={() =>
                          act(
                            () => moderateProduct(product.id, 'approved'),
                            'Producto aprobado.',
                          )
                        }
                      >
                        <Check size={13} />
                        Aprobar
                      </button>
                    )}
                    {product.status !== 'rejected' && (
                      <button
                        onClick={() =>
                          act(
                            () =>
                              moderateProduct(
                                product.id,
                                'rejected',
                                'Requiere revisión administrativa.',
                              ),
                            'Producto rechazado.',
                          )
                        }
                      >
                        <XCircle size={13} />
                        Rechazar
                      </button>
                    )}
                    {product.status === 'approved' && (
                      <button
                        onClick={() =>
                          act(
                            () => moderateProduct(product.id, 'inactive'),
                            'Producto desactivado.',
                          )
                        }
                      >
                        <XCircle size={13} />
                        Desactivar
                      </button>
                    )}
                  </aside>
                </div>
              ))}
            </div>
          ) : (
            <Empty text="No hay productos registrados." />
          )}
        </div>
      )}

      {tab === 'ganancias' && (
        <div className="admin-card">
          <h2>Ganancias de VaniDaxi</h2>
          <p className="admin-big-number">{money(totalEarnings)}</p>
          <p>Ganancia registrada sobre comisiones con estado ganado.</p>
          <Row label="Pendiente de ganar" value={money(pendingEarnings)} />
          <Row label="Ventas que generan comisión" value={money(totalSales)} />
        </div>
      )}

      {tab === 'configuracion' && (
        <div className="admin-card admin-settings">
          <h2>Comisión de VaniDaxi</h2>
          <p>
            El porcentaje queda guardado en Supabase y se captura como instantánea en cada
            artículo vendido. Cambiarlo no modifica comisiones históricas.
          </p>
          <label>
            Comisión de plataforma (%)
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={rate}
              onChange={(event) => setRate(event.target.value)}
            />
          </label>
          <button onClick={saveRate} disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar configuración'}
          </button>
        </div>
      )}
    </div>
  )
}

function Kpi({ icon, label, value }) {
  return (
    <div className="admin-kpi">
      <span>{icon}</span>
      <small>{label}</small>
      <strong>{value}</strong>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="admin-row">
      <span>{label}</span>
      <b>{value}</b>
    </div>
  )
}

function Empty({ text }) {
  return <div className="admin-empty">{text}</div>
}

function List({ title, rows }) {
  return (
    <div className="admin-card">
      <h2>{title}</h2>
      {rows.length > 0 ? (
        <div className="admin-list">
          {rows.slice(0, 30).map((row, index) => (
            <div key={index} className="admin-list-row">
              {row.map((value, valueIndex) => (
                <span key={valueIndex}>{value}</span>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <Empty text="No hay datos registrados todavía." />
      )}
    </div>
  )
}
