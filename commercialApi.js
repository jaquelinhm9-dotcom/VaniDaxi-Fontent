const SUPABASE_URL='https://oycwqpqoxgohzqivclzd.supabase.co'
const KEY=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY||''
const AUTH_KEY='vanidaxi-auth-session'
const headers=(token)=>({apikey:KEY,'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})})
const session=()=>{try{return JSON.parse(localStorage.getItem(AUTH_KEY)||'null')}catch{return null}}
const token=()=>session()?.access_token||''
const uid=()=>session()?.user?.id||''
async function rest(path,options={}){const r=await fetch(`${SUPABASE_URL}/rest/v1/${path}`,{...options,headers:{...headers(token()),...(options.headers||{})}});if(!r.ok){const e=await r.text().catch(()=> '');throw new Error(e||`Supabase ${r.status}`)}return r.status===204?null:r.json().catch(()=>null)}

export async function fetchCatalog(){
  const [categories,items]=await Promise.all([
    rest('categories?select=id,name,slug,description,image_url,is_active&is_active=eq.true&order=name'),
    rest('products?select=id,category_id,name,slug,description,price,compare_at_price,stock,image_url,images,status&status=eq.approved&order=created_at.desc')
  ])
  return {categories:categories||[],products:items||[]}
}

export async function loadCommercialState(){
  if(!uid()) return null
  const [favorites,addresses,cartRows,orders,profile]=await Promise.all([
    rest(`favorites?select=product_id&user_id=eq.${encodeURIComponent(uid())}`),
    rest(`addresses?select=*&user_id=eq.${encodeURIComponent(uid())}&order=is_default.desc,created_at.desc`),
    rest(`carts?select=id,updated_at&user_id=eq.${encodeURIComponent(uid())}&limit=1`),
    rest(`orders?select=id,order_number,status,subtotal,discount,shipping_cost,total,shipping_address,payment_provider,created_at&user_id=eq.${encodeURIComponent(uid())}&order=created_at.desc`),
    rest(`profiles?select=id,full_name,username,avatar_url,phone,role,is_active&id=eq.${encodeURIComponent(uid())}&limit=1`)
  ])
  let cart=[]
  if(cartRows?.[0]?.id){
    const rows=await rest(`cart_items?select=product_id,quantity,cart_id&cart_id=eq.${encodeURIComponent(cartRows[0].id)}`)
    cart=rows||[]
  }
  return {favorites:(favorites||[]).map(x=>x.product_id),addresses:addresses||[],cart,orders:orders||[],profile:profile?.[0]||null}
}

export async function syncFavorites(productIds){
  if(!uid()) return false
  const existing=await rest(`favorites?select=id,product_id&user_id=eq.${encodeURIComponent(uid())}`)||[]
  const want=new Set(productIds.map(String));const have=new Map(existing.map(x=>[String(x.product_id),x]))
  const remove=existing.filter(x=>!want.has(String(x.product_id))).map(x=>rest(`favorites?id=eq.${encodeURIComponent(x.id)}&user_id=eq.${encodeURIComponent(uid())}`,{method:'DELETE'}))
  const add=productIds.filter(id=>!have.has(String(id))).map(product_id=>rest('favorites',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify({user_id:uid(),product_id})}))
  await Promise.all([...remove,...add]);return true
}

export async function syncAddress(address){
  if(!uid()||!address?.street||!address?.city||!address?.zip) return false
  const current=await rest(`addresses?select=id&user_id=eq.${encodeURIComponent(uid())}&is_default=eq.true&limit=1`)
  const row={user_id:uid(),full_name:address.name||'Mi cuenta',phone:address.phone||null,address_line1:address.street,address_line2:address.line2||null,city:address.city,state:address.state||'',postal_code:address.zip,country:address.country||'México',is_default:true}
  if(current?.[0]?.id) await rest(`addresses?id=eq.${encodeURIComponent(current[0].id)}&user_id=eq.${encodeURIComponent(uid())}`,{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify(row)})
  else await rest('addresses',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify(row)})
  return true
}

export async function syncCart(cart, catalog){
  if(!uid()) return false
  const remote=await rest(`carts?select=id&user_id=eq.${encodeURIComponent(uid())}&limit=1`)
  let cartId=remote?.[0]?.id
  if(!cartId){const made=await rest('carts',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({user_id:uid()})});cartId=made?.[0]?.id}
  if(!cartId)return false
  await rest(`cart_items?cart_id=eq.${encodeURIComponent(cartId)}`,{method:'DELETE'})
  const rows=(cart||[]).map(x=>{const p=(catalog||[]).find(p=>String(p.id)===String(x.product?.id)||p.slug===x.product?.slug);return p?.id?{cart_id:cartId,product_id:p.id,quantity:Math.max(1,Number(x.qty||1))}:null}).filter(Boolean)
  if(rows.length) await rest('cart_items',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify(rows)})
  return true
}

export async function createCommercialOrder(order,catalog){
  if(!uid()||!order?.items?.length)return null
  const subtotal=order.items.reduce((sum,x)=>sum+Number(x.product?.price||0)*Number(x.qty||1),0)
  const shipping=0;const discount=Math.max(0,subtotal-Number(order.total||subtotal));const number=order.id||`VD-${Date.now()}`
  const created=await rest('orders',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({user_id:uid(),order_number:number,status:'pending',subtotal,discount,shipping_cost:shipping,total:Number(order.total||subtotal),shipping_address:order.address||null,payment_provider:order.payment?.method||null})})
  return created?.[0]||null
}

export function startCommercialSync(catalogProvider=()=>[]){
  let timer
  const run=async()=>{
    if(!uid())return
    const fav=read('vanidaxi-favorites',[]),cart=read('vanidaxi-cart',[]),addr=read('vanidaxi-address',null)
    try{await syncFavorites(fav);await syncCart(cart,catalogProvider());if(addr)await syncAddress(addr)}catch(e){console.warn('[VaniDaxi commercial sync]',e.message)}
  }
  const schedule=()=>{clearTimeout(timer);timer=setTimeout(run,700)}
  const original=localStorage.setItem.bind(localStorage)
  if(!window.__vaniCommercialPatched){
    localStorage.setItem=(k,v)=>{original(k,v);if(['vanidaxi-favorites','vanidaxi-cart','vanidaxi-address'].includes(k))schedule()}
    window.__vaniCommercialPatched=true
  }
  run();return()=>clearTimeout(timer)
}
function read(k,d){try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d))}catch{return d}}
