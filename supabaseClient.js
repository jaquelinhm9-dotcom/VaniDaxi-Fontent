import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://oycwqpqoxgohzqivclzd.supabase.co'
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_OIoqR1IOg5t3BIQR7g6_0w_1KWzgpYj'

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    experimental: { passkey: true },
  },
})
