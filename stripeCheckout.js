const SUPABASE_URL='https://oycwqpqoxgohzqivclzd.supabase.co'
const KEY=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY||'sb_publishable_OIoqR1IOg5t3BIQR7g6_0w_1KWzgpY'
const AUTH_KEY='vanidaxi-auth-session'
const PAYMENT_KEY='vanidaxi-payment-method'
const token=()=>{try{return JSON.parse(localStorage.getItem(AUTH_KEY)||'null')?.access_token||''}catch{return ''}}
const selectedPayment=()=>{try{const v=String(localStorage.getItem(PAYMENT_KEY)||'Tarjeta').toLowerCase();if(v.includes('oxxo'))return'OXXO';if(v.includes('transfer'))return'Transferencia';return'Tarjeta'}catch{return'Tarjeta'}}
export async function createStripeCheckout(orderId){
  const t=token();
  if(!t||!orderId) throw new Error('Sesión o pedido no disponible')
  const payment_method=selectedPayment()
  const r=await fetch(`${SUPABASE_URL}/functions/v1/stripe-checkout`,{method:'POST',headers:{apikey:KEY,Authorization:`Bearer ${t}`,'Content-Type':'application/json'},body:JSON.stringify({order_id:orderId,payment_method})})
  const data=await r.json().catch(()=>null)
  if(!r.ok||!data?.checkout_url) throw new Error(data?.error||`Stripe ${r.status}`)
  return data
}
