import React, { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from './lib/supabaseClient'

const AUTO_ADVANCE_MS = 5000

const buyerStores = [
  { type: 'Moda', title: 'Tu tienda', detail: 'Moda', className: 'store-fashion', accent: 'rose' },
  { type: 'Tecnología', title: 'Tu tienda', detail: 'Tecnología', className: 'store-tech', accent: 'blue' },
  { type: 'Hogar', title: 'Tu tienda', detail: 'Hogar', className: 'store-home', accent: 'amber' },
  { type: 'Servicios', title: 'Tu tienda', detail: 'Servicios', className: 'store-service', accent: 'violet' },
  { type: 'Supermercado', title: 'Tu tienda', detail: 'Supermercado', className: 'store-market', accent: 'green' },
]

const sellerProducts = ['Tecnología', 'Moda', 'Hogar', 'Belleza', 'Alimentos']

function VaniMark({ className = '' }) {
  return (
    <span className={`vd-mark ${className}`} aria-hidden="true">
      <span className="vd-mark-v">V</span>
    </span>
  )
}

function PhonePortal() {
  return (
    <div className="phone-portal" aria-hidden="true">
      <div className="phone-device">
        <div className="phone-camera" />
        <div className="phone-screen">
          <div className="phone-topline">
            <span>VaniDaxi</span>
            <span className="phone-dot" />
          </div>
          <div className="phone-hero" />
          <div className="phone-tiles">
            <span /><span /><span /><span />
          </div>
          <div className="phone-nav">
            <i /><i className="active" /><i /><i />
          </div>
        </div>
      </div>
      <div className="portal-ring portal-ring-one" />
      <div className="portal-ring portal-ring-two" />
    </div>
  )
}

function Person({ className = '', bag = null }) {
  return (
    <div className={`person ${className}`} aria-hidden="true">
      <span className="person-head" />
      <span className="person-body" />
      <span className="person-leg person-leg-left" />
      <span className="person-leg person-leg-right" />
      {bag && (
        <span className={`shopping-bag bag-${bag}`}>
          <span className="bag-handle" />
          {bag !== 'vanidaxi' && <span className="bag-label">Tu tienda</span>}
          {bag === 'vanidaxi' && <VaniMark />}
        </span>
      )}
    </div>
  )
}

function MallBuyerScene() {
  return (
    <div className="mall-scene buyer-scene" aria-label="Mall VaniDaxi para compradores">
      <div className="mall-sky" />
      <div className="mall-haze" />
      <div className="mall-building">
        <div className="mall-roof">
          <div className="brand-transform">VANIDAXI</div>
        </div>
        <div className="mall-glass-strip" />
        <div className="mall-store-row">
          {buyerStores.map((store) => (
            <div className={`mall-store ${store.className}`} key={store.type}>
              <div className="store-sign">{store.title} ✍🏻</div>
              <div className="store-category">{store.detail}</div>
              <div className={`store-window window-${store.accent}`}>
                <span className="display-card display-card-one" />
                <span className="display-card display-card-two" />
                <span className="display-product" />
              </div>
            </div>
          ))}
        </div>
        <div className="mall-entrance">
          <div className="entrance-wordmark">VANIDAXI</div>
          <div className="entrance-doors"><span /><span /></div>
        </div>
      </div>
      <div className="mall-forecourt" />
      <div className="people-zone">
        <Person className="person-one" />
        <Person className="person-two" />
        <Person className="person-three" bag="fashion" />
        <Person className="person-four" bag="vanidaxi" />
        <Person className="person-five" bag="tech" />
        <Person className="person-six" />
      </div>
      <div className="scene-light scene-light-one" />
      <div className="scene-light scene-light-two" />
    </div>
  )
}

function SellerStoreScene() {
  return (
    <div className="seller-world" aria-label="Vista para vendedores y empresas">
      <div className="seller-backdrop">
        <div className="seller-mall-sign">VANIDAXI</div>
        <div className="seller-store-shell">
          <div className="seller-store-header">
            <div>
              <span className="seller-small-label">Tu tienda</span>
              <strong>Tu negocio en VaniDaxi</strong>
            </div>
            <span className="seller-live-dot">Activo</span>
          </div>
          <div className="seller-display-row">
            <div className="seller-shelf shelf-tech"><span>TECH</span><i /><i /><i /></div>
            <div className="seller-shelf shelf-fashion"><span>MODA</span><i /><i /><i /></div>
            <div className="seller-shelf shelf-home"><span>HOGAR</span><i /><i /><i /></div>
            <div className="seller-shelf shelf-beauty"><span>BELLEZA</span><i /><i /><i /></div>
            <div className="seller-shelf shelf-market"><span>ALIMENTOS</span><i /><i /><i /></div>
          </div>
        </div>
      </div>
      <div className="seller-dashboard">
        <div className="dashboard-head">
          <div>
            <span>Resumen</span>
            <strong>Tu negocio hoy</strong>
          </div>
          <span className="dashboard-pill">En línea</span>
        </div>
        <div className="dashboard-cards">
          <div className="metric-card metric-sales"><span>Ventas</span><strong>$12,480</strong><small>+18% esta semana</small></div>
          <div className="metric-card metric-orders"><span>Pedidos</span><strong>38</strong><small>7 por preparar</small></div>
          <div className="metric-card metric-stock"><span>Inventario</span><strong>96%</strong><small>Stock saludable</small></div>
        </div>
        <div className="seller-buy-strip">
          <div className="mini-store-icon"><VaniMark /></div>
          <div><strong>También puedes comprar</strong><span>Encuentra productos de otros vendedores dentro de VaniDaxi.</span></div>
          <span className="mini-arrow">→</span>
        </div>
      </div>
      <div className="seller-orbit orbit-one" />
      <div className="seller-orbit orbit-two" />
    </div>
  )
}

function AuthPanel({ onClose }) {
  const [mode, setMode] = useState('register')
  const [role, setRole] = useState('buyer')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [captchaToken, setCaptchaToken] = useState('')
  const [captchaReady, setCaptchaReady] = useState(false)
  const [captchaRequired, setCaptchaRequired] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const captchaRef = useRef(null)
  const widgetId = useRef(null)

  const siteKey = import.meta.env.VITE_HCAPTCHA_SITEKEY || ''

  useEffect(() => {
    if (!siteKey) return undefined

    let cancelled = false

    const ensureHcaptcha = () => {
      if (!window.hcaptcha) return
      if (cancelled) return
      setCaptchaReady(true)
      if (captchaRef.current && widgetId.current === null) {
        widgetId.current = window.hcaptcha.render(captchaRef.current, {
          sitekey: siteKey,
          callback: (token) => setCaptchaToken(token || ''),
          'expired-callback': () => setCaptchaToken(''),
          'error-callback': () => setCaptchaToken(''),
        })
      }
    }

    if (window.hcaptcha) {
      ensureHcaptcha()
      return () => { cancelled = true }
    }

    const existing = document.querySelector('script[data-vanidaxi-hcaptcha]')
    if (existing) {
      existing.addEventListener('load', ensureHcaptcha, { once: true })
      return () => { cancelled = true }
    }

    const script = document.createElement('script')
    script.src = 'https://js.hcaptcha.com/1/api.js?render=explicit'
    script.async = true
    script.defer = true
    script.dataset.vanidaxiHcaptcha = 'true'
    script.addEventListener('load', ensureHcaptcha, { once: true })
    document.head.appendChild(script)

    return () => { cancelled = true }
  }, [siteKey])

  const resetCaptcha = useCallback(() => {
    setCaptchaToken('')
    if (window.hcaptcha && widgetId.current !== null) {
      try { window.hcaptcha.reset(widgetId.current) } catch { /* no-op */ }
    }
  }, [])

  useEffect(() => {
    setCaptchaRequired(Boolean(siteKey))
    resetCaptcha()
    setMessage('')
  }, [mode, resetCaptcha, siteKey])

  const submit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (captchaRequired && !captchaToken) {
        setMessage('Completa la verificación de seguridad antes de continuar.')
        return
      }

      if (mode === 'register') {
        const cleanEmail = email.trim().toLowerCase()
        const cleanName = name.trim()
        if (!cleanName || !cleanEmail || password.length < 8) {
          setMessage('Completa tu nombre, un correo válido y una contraseña de al menos 8 caracteres.')
          return
        }

        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            captchaToken: captchaToken || undefined,
            data: {
              display_name: cleanName,
              onboarding_role: role,
            },
          },
        })

        if (error) throw error

        if (data.session) {
          setMessage('Cuenta creada. La siguiente etapa configurará tu experiencia según el rol elegido.')
        } else {
          setMessage('Cuenta creada. Revisa tu correo para confirmar la cuenta y después inicia sesión.')
        }
        resetCaptcha()
        return
      }

      const cleanEmail = email.trim().toLowerCase()
      const { error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
        options: captchaToken ? { captchaToken } : undefined,
      })
      if (error) throw error
      setMessage('Inicio de sesión correcto. Preparando tu experiencia VaniDaxi...')
    } catch (error) {
      setMessage(error?.message || 'No fue posible completar la operación.')
      resetCaptcha()
    } finally {
      setLoading(false)
    }
  }

  const oauth = async (provider) => {
    setLoading(true)
    setMessage('')
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: window.location.origin + window.location.pathname },
      })
      if (error) throw error
    } catch (error) {
      setMessage(error?.message || `No fue posible iniciar sesión con ${provider}.`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-overlay" role="dialog" aria-modal="true" aria-label={mode === 'register' ? 'Crear cuenta' : 'Iniciar sesión'}>
      <button className="auth-backdrop" onClick={onClose} aria-label="Cerrar" />
      <section className="auth-panel">
        <div className="auth-top">
          <button className="auth-close" onClick={onClose} aria-label="Cerrar">×</button>
          <VaniMark />
          <div>
            <span className="eyebrow">VaniDaxi</span>
            <h2>{mode === 'register' ? 'Crea tu cuenta' : 'Bienvenido de nuevo'}</h2>
          </div>
        </div>

        <div className="auth-tabs" role="tablist">
          <button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')} role="tab" aria-selected={mode === 'register'}>Crear cuenta</button>
          <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')} role="tab" aria-selected={mode === 'login'}>Iniciar sesión</button>
        </div>

        {mode === 'register' && (
          <div className="role-choice" aria-label="Tipo de cuenta">
            <span className="field-label">¿Cómo usarás VaniDaxi?</span>
            <div className="role-grid">
              <button className={role === 'buyer' ? 'role-card active' : 'role-card'} onClick={() => setRole('buyer')} type="button">
                <span className="role-icon">🛍️</span>
                <strong>Comprar</strong>
                <small>Explora y compra</small>
              </button>
              <button className={role === 'seller' ? 'role-card active' : 'role-card'} onClick={() => setRole('seller')} type="button">
                <span className="role-icon">🏪</span>
                <strong>Vender / Empresa</strong>
                <small>Gestiona tu tienda</small>
              </button>
            </div>
          </div>
        )}

        <form onSubmit={submit} className="auth-form">
          {mode === 'register' && (
            <label><span>Nombre</span><input autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" /></label>
          )}
          <label><span>Correo electrónico</span><input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" /></label>
          <label><span>Contraseña</span><input required type="password" autoComplete={mode === 'register' ? 'new-password' : 'current-password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={mode === 'register' ? 'Mínimo 8 caracteres' : 'Tu contraseña'} minLength={8} /></label>

          {mode === 'register' && <p className="password-hint">Usa al menos 8 caracteres. En la configuración final podremos endurecer estas reglas sin romper tu acceso existente.</p>}

          {siteKey && <div ref={captchaRef} className="captcha-slot" aria-label="Verificación de seguridad" />}

          <button className="primary-action" type="submit" disabled={loading || (captchaRequired && !captchaToken)}>
            {loading ? 'Procesando…' : mode === 'register' ? 'Crear cuenta' : 'Iniciar sesión'}
          </button>
        </form>

        <div className="divider"><span>o continúa con</span></div>
        <div className="social-row">
          <button type="button" onClick={() => oauth('google')} disabled={loading}><strong>G</strong><span>Google</span></button>
          <button type="button" onClick={() => oauth('facebook')} disabled={loading}><strong>f</strong><span>Facebook</span></button>
        </div>

        {mode === 'login' && <button className="text-action" type="button" onClick={() => setMessage('La recuperación de contraseña quedará conectada al flujo de Auth existente.')}>¿Olvidaste tu contraseña?</button>}
        {message && <div className="auth-message" role="status">{message}</div>}
        <p className="legal-note">Al continuar, aceptas los términos aplicables y reconoces el aviso de privacidad de VaniDaxi.</p>
      </section>
    </div>
  )
}

function Welcome({ onAuth }) {
  const [scene, setScene] = useState(0)
  const [authOpen, setAuthOpen] = useState(false)
  const touchStart = useRef(null)
  const autoTimer = useRef(null)

  const nextScene = useCallback(() => setScene(1), [])
  const prevScene = useCallback(() => setScene(0), [])

  useEffect(() => {
    autoTimer.current = window.setTimeout(() => {
      setScene((current) => current === 0 ? 1 : 0)
    }, AUTO_ADVANCE_MS)
    return () => window.clearTimeout(autoTimer.current)
  }, [scene])

  const handlePointerDown = (event) => {
    touchStart.current = event.clientX
  }

  const handlePointerUp = (event) => {
    if (touchStart.current === null) return
    const delta = event.clientX - touchStart.current
    touchStart.current = null
    if (Math.abs(delta) < 45) return
    if (delta < 0) nextScene()
    else prevScene()
  }

  const openAuth = () => setAuthOpen(true)

  return (
    <main className="welcome-page" onPointerDown={handlePointerDown} onPointerUp={handlePointerUp} onPointerCancel={() => { touchStart.current = null }}>
      <div className={`welcome-stage scene-${scene}`}>
        <div className="welcome-brand"><VaniMark /><span>VaniDaxi</span></div>

        <div className="scene-viewport">
          <div className="scene-frame scene-frame-buyer">
            <PhonePortal />
            <MallBuyerScene />
          </div>
          <div className="scene-frame scene-frame-seller">
            <SellerStoreScene />
          </div>
        </div>

        <div className="welcome-copy">
          <div className="copy-block copy-buyer">
            <span className="scene-kicker">COMPRADOR</span>
            <h1>Encuentra todo en un solo lugar</h1>
          </div>
          <div className="copy-block copy-seller">
            <span className="scene-kicker">VENDEDOR / EMPRESA</span>
            <h1>Lleva tu negocio a VaniDaxi</h1>
            <p>Tu tienda. Tus productos. Un superapp/marketplace para hacerlos visibles.</p>
          </div>
        </div>

        <div className="scene-controls">
          <div className="page-control" aria-label={`Escena ${scene + 1} de 2`}><span className={scene === 0 ? 'active' : ''} /><span className={scene === 1 ? 'active' : ''} /></div>
          <button className="swipe-hint" onClick={scene === 0 ? nextScene : prevScene} type="button">
            <span className="swipe-arrow">{scene === 0 ? '→' : '←'}</span>
            <span>{scene === 0 ? 'Desliza para vender' : 'Desliza para comprar'}</span>
          </button>
          <button className="skip-link" onClick={openAuth} type="button">Omitir</button>
        </div>

        <div className="welcome-actions">
          <button className="secondary-auth" onClick={() => { setAuthOpen(true) }} type="button">Iniciar sesión</button>
          <button className="primary-auth" onClick={() => { setAuthOpen(true) }} type="button">Crear cuenta</button>
        </div>

        <div className="welcome-access-note">Tu experiencia cambia automáticamente según el rol de tu cuenta.</div>
      </div>
      {authOpen && <AuthPanel onClose={() => setAuthOpen(false)} />}
      <button className="sr-only" onClick={() => onAuth?.('register')} type="button">Abrir acceso</button>
    </main>
  )
}

export default function App() {
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setAuthenticated(Boolean(data.session))
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthenticated(Boolean(session))
    })
    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  return (
    <div className={authenticated ? 'app-root has-session' : 'app-root'}>
      <Welcome />
    </div>
  )
}
