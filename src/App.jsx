import React, { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from './lib/supabaseClient'

function VaniMark({ className = '' }) {
  return (
    <span className={`vd-mark ${className}`} aria-hidden="true">
      <span className="vd-mark-v">V</span>
    </span>
  )
}

function AuthPanel({ onClose, initialMode = 'register' }) {
  const [mode, setMode] = useState(initialMode)
  const [role, setRole] = useState('buyer')
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
    const ensureHcaptcha = () => {
      if (!window.hcaptcha || cancelled) return
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
            data: { display_name: cleanName, onboarding_role: role },
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
          <div><span className="eyebrow">VaniDaxi</span><h2>{mode === 'register' ? 'Crea tu cuenta' : 'Bienvenido de nuevo'}</h2></div>
        </div>
        <div className="auth-tabs" role="tablist">
          <button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Crear cuenta</button>
          <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Iniciar sesión</button>
        </div>
        {mode === 'register' && (
          <div className="role-choice" aria-label="Tipo de cuenta">
            <span className="field-label">¿Cómo usarás VaniDaxi?</span>
            <div className="role-grid">
              <button type="button" className={role === 'buyer' ? 'role-card active' : 'role-card'} onClick={() => setRole('buyer')}><span className="role-icon">🛍️</span><strong>Comprar</strong><small>Explora y compra</small></button>
              <button type="button" className={role === 'seller' ? 'role-card active' : 'role-card'} onClick={() => setRole('seller')}><span className="role-icon">🏪</span><strong>Vender / Empresa</strong><small>Gestiona tu tienda</small></button>
            </div>
          </div>
        )}
        <form onSubmit={submit} className="auth-form">
          {mode === 'register' && <label><span>Nombre</span><input required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></label>}
          <label><span>Correo electrónico</span><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></label>
          <label><span>Contraseña</span><input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} autoComplete={mode === 'register' ? 'new-password' : 'current-password'} /></label>
          {mode === 'register' && <p className="password-hint">Usa al menos 8 caracteres. En la configuración final podremos endurecer estas reglas sin romper tu acceso existente.</p>}
          {siteKey && <div ref={captchaRef} className="captcha-slot" aria-label="Verificación de seguridad" />}
          <button className="primary-action" type="submit" disabled={loading || (captchaRequired && !captchaToken)}>{loading ? 'Procesando…' : mode === 'register' ? 'Crear cuenta' : 'Iniciar sesión'}</button>
        </form>
        <div className="divider"><span>o continúa con</span></div>
        <div className="social-row">
          <button type="button" onClick={() => oauth('google')} disabled={loading}><strong>G</strong><span>Google</span></button>
          <button type="button" onClick={() => oauth('facebook')} disabled={loading}><strong>f</strong><span>Facebook</span></button>
        </div>
        {mode === 'login' && <button className="forgot-link" type="button" onClick={() => setMessage('La recuperación de contraseña se configurará en la siguiente fase de Auth.')}>¿Olvidaste tu contraseña?</button>}
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
  const swipeStartX = useRef(null)

  const openAuth = (mode) => {
    setAuthMode(mode)
    setAuthOpen(true)
  }

  const onPointerDown = (event) => {
    swipeStartX.current = event.clientX
  }

  const onPointerUp = (event) => {
    if (swipeStartX.current === null) return
    const delta = event.clientX - swipeStartX.current
    swipeStartX.current = null
    if (Math.abs(delta) < 55) return
    if (delta < 0) setScene('seller')
    else setScene('buyer')
  }

  return (
    <main className="welcome-shell">
      <div className="welcome-stage" onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
        <div className={`welcome-scene ${scene === 'seller' ? 'seller' : 'buyer'}`}>
          <img
            className="welcome-art"
            src={scene === 'buyer' ? `${import.meta.env.BASE_URL}welcome-buyer.svg` : `${import.meta.env.BASE_URL}welcome-seller.svg`}
            alt={scene === 'buyer' ? 'VaniDaxi para compradores' : 'VaniDaxi para vendedores'}
            draggable="false"
          />
        </div>

        <button className="welcome-hit welcome-hit-swipe" aria-label={scene === 'buyer' ? 'Deslizar para vender' : 'Deslizar para comprar'} />
        <button className="welcome-hit welcome-hit-login" onClick={() => openAuth('login')} aria-label="Iniciar sesión" />
        <button className="welcome-hit welcome-hit-register" onClick={() => openAuth('register')} aria-label="Crear cuenta" />
        <button className="welcome-hit welcome-hit-skip" onClick={() => openAuth('login')}>Omitir</button>
      </div>
      {authOpen && <AuthPanel initialMode={authMode} onClose={() => setAuthOpen(false)} />}
    </main>
  )
}

export default function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setSession(data.session)
    })
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })
    return () => {
      mounted = false
      data.subscription.unsubscribe()
    }
  }, [])

  return <Welcome session={session} />
}
