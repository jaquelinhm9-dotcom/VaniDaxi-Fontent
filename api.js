/* VaniDaxi API bridge
 * Keeps the existing UI functional while moving persistence behind an API.
 * The browser only uses the public API URL; no server secret belongs here.
 */
const API_URL = (import.meta.env.VITE_VANIDAXI_API_URL || '').replace(/\/$/, '')
const DEVICE_KEY = 'vanidaxi-device-id'

function deviceId() {
  let id = localStorage.getItem(DEVICE_KEY)
  if (!id) {
    id = globalThis.crypto?.randomUUID?.() || `vd-${Date.now()}-${Math.random().toString(36).slice(2)}`
    localStorage.setItem(DEVICE_KEY, id)
  }
  return id
}

const stateKeys = [
  'vanidaxi-favorites',
  'vanidaxi-cart',
  'vanidaxi-orders',
  'vanidaxi-address',
  'vanidaxi-payment',
]

function readState() {
  const state = {}
  for (const key of stateKeys) {
    try { state[key] = JSON.parse(localStorage.getItem(key) || 'null') } catch { state[key] = null }
  }
  if (state['vanidaxi-payment'] && typeof state['vanidaxi-payment'] === 'object') {
    state['vanidaxi-payment'] = { method: state['vanidaxi-payment'].method || 'Tarjeta' }
  }
  return state
}

async function request(path, options = {}) {
  if (!API_URL) return null
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 9000)
  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'X-VaniDaxi-Device': deviceId(),
        ...(options.headers || {}),
      },
    })
    if (!response.ok) throw new Error(`VaniDaxi API ${response.status}`)
    return response.status === 204 ? null : response.json()
  } finally {
    window.clearTimeout(timeout)
  }
}

export async function hydrateVaniDaxi() {
  if (!API_URL) return false
  try {
    const payload = await request('/state')
    if (!payload?.state) return false
    for (const key of stateKeys) {
      if (payload.state[key] != null) localStorage.setItem(key, JSON.stringify(payload.state[key]))
    }
    return true
  } catch (error) {
    console.warn('[VaniDaxi] API unavailable; keeping local state.', error)
    return false
  }
}

let syncTimer = 0
export function syncVaniDaxiState() {
  if (!API_URL) return
  window.clearTimeout(syncTimer)
  syncTimer = window.setTimeout(async () => {
    try { await request('/state', { method: 'PUT', body: JSON.stringify(readState()) }) }
    catch (error) { console.warn('[VaniDaxi] state sync failed:', error) }
  }, 350)
}

export function startVaniDaxiSync() {
  if (!API_URL || startVaniDaxiSync.started) return
  startVaniDaxiSync.started = true
  const original = localStorage.setItem.bind(localStorage)
  localStorage.setItem = (key, value) => {
    original(key, value)
    if (stateKeys.includes(key)) syncVaniDaxiState()
  }
  window.addEventListener('online', syncVaniDaxiState)
  syncVaniDaxiState()
}

export const vanidaxiApi = {
  enabled: Boolean(API_URL),
  deviceId,
  getState: () => request('/state'),
  saveState: state => request('/state', { method: 'PUT', body: JSON.stringify(state) }),
}
