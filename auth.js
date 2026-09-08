const SUPABASE_URL = 'https://oycwqpqoxgohzqivclzd.supabase.co'
// Vite env is preferred; the fallback is Supabase's public publishable key and is safe for browser use.
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_OIoqR1IOg5t3BIQR7g6_0w_1KWzgpY'
const STORAGE_KEY = 'vanidaxi-auth-session'

function headers(extra = {}) {
  return { apikey: SUPABASE_KEY, 'Content-Type': 'application/json', ...extra }
}

export async function signUp(email, password, name = '', accountType = 'customer') {
  const safeType = accountType === 'seller' ? 'seller' : 'customer'
  const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ email, password, data: { name, account_type: safeType } })
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.msg || data.message || data.error_description || 'No se pudo crear la cuenta')
  if (data.access_token) saveSession(data)
  return data
}

export async function signIn(email, password) {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST', headers: headers(), body: JSON.stringify({ email, password })
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.msg || data.message || data.error_description || 'Correo o contraseña incorrectos')
  saveSession(data)
  return data
}

export async function signOut() {
  const session = getSession()
  if (session?.access_token) {
    await fetch(`${SUPABASE_URL}/auth/v1/logout`, { method: 'POST', headers: headers({ Authorization: `Bearer ${session.access_token}` }) }).catch(() => {})
  }
  localStorage.removeItem(STORAGE_KEY)
}

export function getSession() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') } catch { return null }
}

export function saveSession(session) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ access_token: session.access_token, refresh_token: session.refresh_token, user: session.user }))
}

export async function getCurrentUser() {
  const session = getSession()
  if (!session?.access_token) return null
  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: headers({ Authorization: `Bearer ${session.access_token}` }) })
  if (!response.ok) { localStorage.removeItem(STORAGE_KEY); return null }
  return response.json()
}

export async function refreshSession() {
  const session = getSession()
  if (!session?.refresh_token) return null
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
    method: 'POST', headers: headers(), body: JSON.stringify({ refresh_token: session.refresh_token })
  })
  if (!response.ok) return null
  const data = await response.json()
  saveSession(data)
  return data
}

export async function saveUserState(state) {
  const session = getSession()
  if (!session?.access_token || !session.user?.id) return false
  const response = await fetch(`${SUPABASE_URL}/rest/v1/user_app_state?on_conflict=user_id`, {
    method: 'POST',
    headers: headers({ Authorization: `Bearer ${session.access_token}`, Prefer: 'resolution=merge-duplicates,return=minimal' }),
    body: JSON.stringify({ user_id: session.user.id, state })
  })
  return response.ok
}

export async function loadUserState() {
  const session = getSession()
  if (!session?.access_token || !session.user?.id) return null
  const response = await fetch(`${SUPABASE_URL}/rest/v1/user_app_state?select=state&user_id=eq.${encodeURIComponent(session.user.id)}`, {
    headers: headers({ Authorization: `Bearer ${session.access_token}` })
  })
  if (!response.ok) return null
  const rows = await response.json()
  return rows[0]?.state || null
}
