import React, { useEffect, useRef, useState } from 'react'
import { supabase } from './lib/supabaseClient'

const FUTURE_MODULES = {
  travel: {
    status: 'coming_soon',
    title: 'Viajes',
    message: 'Próximamente. VaniDaxi habilitará esta sección únicamente para proveedores de transporte legalmente autorizados.',
  },
}

function VaniMark({ className = '' }) {
  return (
    <span className={`vd-mark ${className}`} aria-hidden="true">
      <span className="vd-mark-v">V</span>
    </span>
  )
}

function AuthPanel({ onClose, initialMode = 'register', initialRole = 'buyer' }) {
  const [mode, setMode] = useState(initialMode)
  const [role] = useState(initialRole)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [captchaToken, setCaptchaToken] = useState('')
  const [captchaRequired, setCaptchaRequired] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const captchaRef = useRef(null)
  const widgetId = useRef(null)
  const siteKey = import.meta.env.VITE_HCAPTCHA_SITEKEY || ''

  useEffect(() => {
    if (!siteKey) return undefined
    let cancelled = false
    const ensure = () => {
      if (!window.hcaptcha || cancelled || !captchaRef.current || widgetId.current !== null) return
      widgetId.current = window.hcaptcha.render(captchaRef.current, {
        sitekey: siteKey,
        callback: (token) => setCaptchaToken(token || ''),
        'expired-callback': () => setCaptchaToken(''),
        'error-callback': () => setCaptchaToken(''),
      })
    }

    if (window.hcaptcha) ensure()
    else {
      let script = document.querySelector('script[data-vanidaxi-hcaptcha]')
      if (!script) {
        script = document.createElement('script')
        script.src = 'https://js.hcaptcha.com/1/api.js?render=explicit'
        script.async = true
        script.defer = true
        script.dataset.vanidaxiHcaptcha = 'true'
        document.head.appendChild(script)
      }
      script.addEventListener('load', ensure, { once: true })
    }

    return () => { cancelled = true }
  }, [siteKey])

  useEffect(() => {
    setCaptchaRequired(Boolean(siteKey))
    setCaptchaToken('')
    setMessage('')
    if (window.hcaptcha && widgetId.current !== null) {
      try { window.hcaptcha.reset(widgetId.current) } catch {}
    }
  }, [mode, siteKey])

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
        setMessage(
          data.session
            ? `Cuenta creada como ${role === 'seller' ? 'vendedor/empresa' : 'comprador'}. La siguiente página será la bienvenida interna de VaniDaxi.`
            : 'Cuenta creada. Revisa tu correo para confirmar la cuenta y después inicia sesión.',
        )
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
          options: captchaToken ? { captchaToken } : undefined,
        })
        if (error) throw error
        setMessage('Inicio de sesión correcto. Preparando tu experiencia VaniDaxi...')
      }
    } catch (error) {
      setMessage(error?.message || 'No fue posible completar la operación.')
    } finally {
      setLoading(false)
      setCaptchaToken('')
    }
  }

  const oauth = async (provider) => {
    setLoading(true)
    setMessage('')
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin + window.location.pathname,
        },
      })
      if (error) throw error
    } catch (error) {
      setMessage(error?.message || `No fue posible iniciar sesión con ${provider}.`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-overlay" role="dialog" aria-modal="true" aria-label="Autenticación VaniDaxi">
      <button className="auth-backdrop" onClick={onClose} aria-label="Cerrar" />
      <section className="auth-panel">
        <div className="auth-top">
          <VaniMark />
          <div>
            <span className="eyebrow">VaniDaxi</span>
            <h2>{mode === 'register' ? 'Crea tu cuenta' : 'Bienvenido de nuevo'}</h2>
          </div>
          <button className="auth-close" onClick={onClose} aria-label="Cerrar">×</button>
        </div>

        <div className="auth-tabs">
          <button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Crear cuenta</button>
          <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Iniciar sesión</button>
        </div>

        {mode === 'register' && (
          <div className="role-summary">
            <span className="role-summary-icon">{role === 'seller' ? '🏪' : '🛍️'}</span>
            <div>
              <strong>{role === 'seller' ? 'Vender / Empresa' : 'Comprar'}</strong>
              <small>{role === 'seller' ? 'Tu cuenta iniciará como tienda y panel de negocio.' : 'Tu cuenta iniciará como experiencia de mall.'}</small>
            </div>
          </div>
        )}

        <form onSubmit={submit} className="auth-form">
          {mode === 'register' && (
            <label><span>Nombre</span><input required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></label>
          )}
          <label><span>Correo electrónico</span><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></label>
          <label><span>Contraseña</span><input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} autoComplete={mode === 'register' ? 'new-password' : 'current-password'} /></label>
          {mode === 'register' && <p className="password-hint">Usa al menos 8 caracteres.</p>}
          {siteKey && <div ref={captchaRef} className="captcha-slot" />}
          <button className="primary-action" type="submit" disabled={loading || (captchaRequired && !captchaToken)}>
            {loading ? 'Procesando…' : mode === 'register' ? 'Crear cuenta' : 'Iniciar sesión'}
          </button>
        </form>

        <div className="divider"><span>o continúa con</span></div>
        <div className="social-row">
          <button type="button" onClick={() => oauth('google')} disabled={loading}><strong>G</strong><span>Google</span></button>
          <button type="button" onClick={() => oauth('facebook')} disabled={loading}><strong>f</strong><span>Facebook</span></button>
        </div>
        {message && <div className="auth-message" role="status">{message}</div>}
        <p className="legal-note">Al continuar, aceptas los términos aplicables y reconoces el aviso de privacidad de VaniDaxi.</p>
      </section>
    </div>
  )
}

function Welcome() {
  const [scene, setScene] = useState('buyer')
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('register')
  const touchStart = useRef(null)
  const autoAdvanceDone = useRef(false)

  useEffect(() => {
    if (authOpen || autoAdvanceDone.current || scene !== 'buyer') return undefined
    const timer = window.setTimeout(() => {
      autoAdvanceDone.current = true
      setScene('seller')
    }, 5000)
    return () => window.clearTimeout(timer)
  }, [authOpen, scene])

  const openAuth = (mode) => {
    setAuthMode(mode)
    setAuthOpen(true)
  }

  const onPointerDown = (event) => { touchStart.current = event.clientX }
  const onPointerUp = (event) => {
    if (touchStart.current === null) return
    const delta = event.clientX - touchStart.current
    touchStart.current = null
    if (Math.abs(delta) < 55) return
    setScene(delta < 0 ? 'seller' : 'buyer')
  }

  const isBuyer = scene === 'buyer'
  const role = isBuyer ? 'buyer' : 'seller'

  return (
    <main className="reference-welcome" aria-label="Bienvenida VaniDaxi">
      <div className="reference-viewport" onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={() => { touchStart.current = null }}>
        <img className="reference-background" src={`${import.meta.env.BASE_URL}welcome-${role}.svg`} alt="" draggable="false" />
        <div className="reference-vignette" aria-hidden="true" />

        <header className="welcome-header">
          <div className="welcome-brand">
            <VaniMark />
            <div><strong>VaniDaxi</strong><span>COMPRA · VENDE · CONECTA</span></div>
          </div>
          <span className="welcome-role-chip">{isBuyer ? 'COMPRADOR' : 'VENDEDOR / EMPRESA'}</span>
        </header>

        <section className={`welcome-content ${isBuyer ? 'is-buyer' : 'is-seller'}`}>
          <div className="welcome-copy">
            <span className="welcome-kicker">{isBuyer ? 'Tu mall digital' : 'Tu tienda digital'}</span>
            <h1>{isBuyer ? <>Descubre un mundo<br /><em>de posibilidades</em></> : <>Haz crecer tu negocio<br /><em>sin límites</em></>}</h1>
            <p>{isBuyer
              ? 'Explora miles de tiendas y productos en un solo lugar. Moda, tecnología, hogar, belleza, supermercado y mucho más.'
              : 'Gestiona tus productos, pedidos y ventas desde un solo lugar. Conecta con más clientes y lleva tu tienda al siguiente nivel.'}</p>
          </div>

          <div className="welcome-dots" aria-label={`Pantalla ${isBuyer ? 1 : 2} de 2`}>
            <span className={isBuyer ? 'active' : ''} /><span className={!isBuyer ? 'active' : ''} />
          </div>

          <button className="welcome-swipe" type="button" onClick={() => setScene(isBuyer ? 'seller' : 'buyer')}>
            <span>{isBuyer ? '→' : '←'}</span> Desliza para {isBuyer ? 'vender' : 'comprar'}
          </button>

          <div className="welcome-actions">
            <button className="welcome-login" type="button" onClick={() => openAuth('login')}>Iniciar sesión</button>
            <button className="welcome-register" type="button" onClick={() => openAuth('register')}>Crear cuenta</button>
          </div>
          <button className="welcome-skip" type="button" onClick={() => openAuth('login')}>Omitir</button>
        </section>
      </div>

      {authOpen && <AuthPanel initialMode={authMode} initialRole={role} onClose={() => setAuthOpen(false)} />}
    </main>
  )
}

export default function App() {
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange(() => {})
    return () => data.subscription.unsubscribe()
  }, [])

  void FUTURE_MODULES
  return <Welcome />
}
