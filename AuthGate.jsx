import React, { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

export default function AuthGate({ children }) {
  const [session, setSession] = useState(null)
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false) })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession))
    return () => listener.subscription.unsubscribe()
  }, [])

  async function submit(event) {
    event.preventDefault(); setBusy(true); setMessage('')
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(), password,
          options: { data: { full_name: name.trim() }, emailRedirectTo: window.location.origin + window.location.pathname },
        })
        if (error) throw error
        setMessage(data.session ? '¡Registro completado! Bienvenida a VaniDaxi.' : 'Revisa tu correo para confirmar tu registro.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
        if (error) throw error
      }
    } catch (error) { setMessage(error?.message || 'No fue posible completar la operación.') }
    finally { setBusy(false) }
  }

  if (loading) return <div className="auth-loading">Cargando VaniDaxi…</div>
  if (session) return children

  return <div className="auth-gate"><div className="auth-card"><div className="auth-brand"><span>V</span><b>VaniDaxi</b></div><h1>{mode === 'signup' ? 'Crea tu cuenta' : 'Bienvenida'}</h1><p>{mode === 'signup' ? 'Regístrate para guardar tus favoritos, pedidos y carrito.' : 'Inicia sesión para continuar comprando.'}</p>
    <form onSubmit={submit}>
      {mode === 'signup' && <input value={name} onChange={e => setName(e.target.value)} placeholder="Nombre completo" autoComplete="name" required />}
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Correo electrónico" autoComplete="email" required />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Contraseña" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} minLength={6} required />
      <button disabled={busy}>{busy ? 'Procesando…' : mode === 'signup' ? 'Registrarme' : 'Iniciar sesión'}</button>
    </form>
    {message && <div className="auth-message">{message}</div>}
    <button className="auth-switch" onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setMessage('') }}>{mode === 'signup' ? 'Ya tengo una cuenta' : 'Crear una cuenta nueva'}</button>
  </div></div>
}
