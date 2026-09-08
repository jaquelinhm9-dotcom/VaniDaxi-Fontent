import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://oycwqpqoxgohzqivclzd.supabase.co'
const supabasePublishableKey = 'sb_publishable_your-key-is-configured-at-build-time'

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
