import './seller-new.css'

const URL='https://oycwqpqoxgohzqivclzd.supabase.co'
const KEY=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY||'sb_publishable_OIoqR1IOg5t3BIQR7g6_0w_1KWzgpYj'
const session=()=>{try{return JSON.parse(localStorage.getItem('vanidaxi-auth-session')||'null')}catch{return null}}
const headers=()=>{const s=session();return{apikey:KEY,Authorization:`Bearer ${s?.access_token||KEY}`}}
async function rest(path){const r=await fetch(`${URL}/rest/v1/${path}`,{headers:headers()});if(!r.ok)throw Error(`Supabase ${r.status}`);return r.json()}

let timer=null
async function syncSellerCustomers(){
  const root=[...document.querySelectorAll('h2')].find(x=>x.textContent?.trim()==='Clientes de VaniDaxi')
  if(!root)return
  const panel=root.closest('.seller-panel')
  if(!panel)return
  try{
    const [customers,orders,items]=await Promise.all([
      rest('profiles?select=id,full_name,username&role=eq.customer&limit=200'),
      rest('orders?select=id,user_id&limit=500'),
      rest('order_items?select=order_id,seller_id&limit=1000')
    ])
    const sellerItems=new Set((items||[]).map(x=>x.order_id))
    const buyerIds=new Set((orders||[]).filter(x=>x.user_id&&sellerItems.has(x.id)).map(x=>x.user_id))
    const byKey=new Map((customers||[]).map(c=>[
      String(c.id),
      buyerIds.has(c.id)
    ]))
    panel.querySelectorAll('.seller-row').forEach(row=>{
      const name=row.querySelector('b')?.textContent?.trim()
      const username=row.querySelectorAll('span')[0]?.textContent?.trim()
      const customer=(customers||[]).find(c=>
        (c.full_name||c.username||'Cliente')===name ||
        (c.username||'—')===username
      )
      if(!customer)return
      const status=row.querySelector('strong')
      if(status)status.textContent=byKey.get(String(customer.id))?'Con compras':'Sin compras'
    })
  }catch(e){console.warn('[VaniDaxi] No se pudo sincronizar clientes del vendedor',e)}
}

function schedule(){clearTimeout(timer);timer=setTimeout(syncSellerCustomers,120)}
const observer=new MutationObserver(schedule)
observer.observe(document.documentElement,{subtree:true,childList:true})
window.addEventListener('hashchange',schedule)
setTimeout(schedule,250)
