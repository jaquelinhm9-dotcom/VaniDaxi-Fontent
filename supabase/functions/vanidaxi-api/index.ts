import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
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

const sanitizeState = (input: Record<string, unknown>) => {
  const allowed = [
    'vanidaxi-favorites',
    'vanidaxi-cart',
    'vanidaxi-orders',
    'vanidaxi-address',
    'vanidaxi-payment',
  ]
  const state: Record<string, unknown> = {}
  for (const key of allowed) if (key in input) state[key] = input[key]

  // Never persist card numbers, CVV, expiration dates, or arbitrary payment details.
  if (state['vanidaxi-payment'] && typeof state['vanidaxi-payment'] === 'object') {
    const payment = state['vanidaxi-payment'] as Record<string, unknown>
    state['vanidaxi-payment'] = { method: typeof payment.method === 'string' ? payment.method : 'Tarjeta' }
  }
  return state
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const deviceId = cleanDeviceId(req.headers.get('x-vanidaxi-device'))
  if (!deviceId) return json({ error: 'Invalid device id' }, 400)

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  )

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('vanidaxi_state')
      .select('state,updated_at')
      .eq('device_id', deviceId)
      .maybeSingle()

    if (error) return json({ error: error.message }, 500)
    return json({ state: data?.state ?? null, updated_at: data?.updated_at ?? null })
  }

  if (req.method === 'PUT') {
    let body: { state?: Record<string, unknown> }
    try { body = await req.json() } catch { return json({ error: 'Invalid JSON' }, 400) }
    const state = sanitizeState(body.state || {})

    const { data, error } = await supabase
      .from('vanidaxi_state')
      .upsert({ device_id: deviceId, state, updated_at: new Date().toISOString() })
      .select('state,updated_at')
      .single()

    if (error) return json({ error: error.message }, 500)
    return json({ state: data.state, updated_at: data.updated_at })
  }

  return json({ error: 'Method not allowed' }, 405)
})
