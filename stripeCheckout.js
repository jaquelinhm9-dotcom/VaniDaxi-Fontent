const SUPABASE_URL='https://oycwqpqoxgohzqivclzd.supabase.co'
const KEY=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY||'sb_publishable_OIoqR1IOg5t3BIQR7g6_0w_1KWzgpY'
const AUTH_KEY='vanidaxi-auth-session'
const token=()=>{try{return JSON.parse(localStorage.getItem(AUTH_KEY)||'null')?.access_token||''}catch{return ''}}
export async function createStripeCheckout(orderId){
  const t=token();
  if(!t||!orderId) throw new Error('Sesión o pedido no disponible')
  const r=await fetch(`${SUPABASE_URL}/functions/v1/stripe-checkout`,{method:'POST',headers:{apikey:KEY,Authorization:`Bearer ${t}`,'Content-Type':'application/json'},body:JSON.stringify({order_id:orderId})})
  const data=await r.json().catch(()=>null)
  if(!r.ok||!data?.checkout_url) throw new Error(data?.error||`Stripe ${r.status}`)
  return data
}
