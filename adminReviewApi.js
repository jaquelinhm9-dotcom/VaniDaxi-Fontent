const SUPABASE_URL='https://oycwqpqoxgohzqivclzd.supabase.co'
const KEY=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY||'sb_publishable_OIoqR1IOg5t3BIQR7g6_0w_1KWzgpY'
const session=()=>{try{return JSON.parse(localStorage.getItem('vanidaxi-auth-session')||'null')}catch{return null}}
export async function moderateReview(id,status){const s=session();if(!s?.access_token||!id)return null;const r=await fetch(`${SUPABASE_URL}/rest/v1/rpc/moderate_review`,{method:'POST',headers:{apikey:KEY,Authorization:`Bearer ${s.access_token}`,'Content-Type':'application/json'},body:JSON.stringify({p_review_id:id,p_status:status,p_reason:null})});if(!r.ok)throw Error(await r.text().catch(()=>`Supabase ${r.status}`));return r.json().catch(()=>null)}
