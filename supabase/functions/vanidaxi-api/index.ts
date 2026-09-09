import { createClient } from 'npm:@supabase/supabase-js@2'

const APP_ORIGIN = 'https://jaquelinhm9-dotcom.github.io'
const corsHeaders = {
  'Access-Control-Allow-Origin': APP_ORIGIN,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-vanidaxi-device',
  'Access-Control-Allow-Methods': 'GET,PUT,OPTIONS',
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

const cleanDeviceId = (value: string | null) => {
  if (!value || value.length < 8 || value.length > 120) return null
  if (!/^[a-zA-Z0-9._:-]+$/.test(value)) return null
  return value
}

const sanitizeState = (input: Record<string, unknown>, authenticated: boolean) => {
  const guestAllowed = ['vanidaxi-favorites', 'vanidaxi-cart', 'vanidaxi-payment']
  const authenticatedAllowed = [
    ...guestAllowed,
    'vanidaxi-orders',
    'vanidaxi-address',
  ]
  const allowed = authenticated ? authenticatedAllowed : guestAllowed
  const state: Record<string, unknown> = {}
  for (const key of allowed) if (key in input) state[key] = input[key]

  // Never persist card numbers, CVV, expiration dates, or arbitrary payment details.
  if (state['vanidaxi-payment'] && typeof state['vanidaxi-payment'] === 'object') {
    const payment = state['vanidaxi-payment'] as Record<string, unknown>
    state['vanidaxi-payment'] = {
      method: typeof payment.method === 'string' ? payment.method : 'Tarjeta',
    }
  }
  return state
}

async function getUser(req: Request) {
  const authHeader = req.headers.get('Authorization') || ''
  const token = authHeader.replace(/^Bearer\s+/i, '').trim()
  if (!token) return { user: null, invalid: false }
  const url = Deno.env.get('SUPABASE_URL')!
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
  const client = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data, error } = await client.auth.getUser(token)
  return { user: data?.user ?? null, invalid: Boolean(error) }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const deviceId = cleanDeviceId(req.headers.get('x-vanidaxi-device'))
  if (!deviceId) return json({ error: 'Invalid device id' }, 400)

  const auth = await getUser(req)
  if (auth.invalid) return json({ error: 'Invalid authentication' }, 401)
  const user = auth.user

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  )

  const { data: existing, error: existingError } = await supabase
    .from('vanidaxi_state')
    .select('user_id,state,updated_at')
    .eq('device_id', deviceId)
    .maybeSingle()
  if (existingError) return json({ error: existingError.message }, 500)

  if (existing?.user_id && (!user || existing.user_id !== user.id)) {
    return json({ error: 'State belongs to another account' }, user ? 403 : 401)
  }

  if (req.method === 'GET') {
    return json({
      state: sanitizeState(existing?.state || {}, Boolean(user)),
      updated_at: existing?.updated_at ?? null,
    })
  }

  if (req.method === 'PUT') {
    let body: { state?: Record<string, unknown> }
    try { body = await req.json() } catch { return json({ error: 'Invalid JSON' }, 400) }
    const state = sanitizeState(body.state || {}, Boolean(user))
    const record = {
      device_id: deviceId,
      user_id: user?.id ?? existing?.user_id ?? null,
      state,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('vanidaxi_state')
      .upsert(record, { onConflict: 'device_id' })
      .select('state,updated_at')
      .single()

    if (error) return json({ error: error.message }, 500)
    return json({ state: data.state, updated_at: data.updated_at })
  }

  return json({ error: 'Method not allowed' }, 405)
})
