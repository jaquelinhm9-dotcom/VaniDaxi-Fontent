import React,{useEffect,useState}from'react';
import SellerDashboard from'./SellerDashboard.jsx';
import SellerStoreSetup from'./SellerStoreSetup.jsx';

const URL='https://oycwqpqoxgohzqivclzd.supabase.co';
const KEY=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY||'sb_publishable_OIoqR1IOg5t3BIQR7g6_0w_1KWzgpYj';
const session=()=>{try{return JSON.parse(localStorage.getItem('vanidaxi-auth-session')||'null')}catch{return null}};

export default function SellerPortal({children}){
 const[role,setRole]=useState(''),[open,setOpen]=useState(false),[setup,setSetup]=useState(false);
 useEffect(()=>{let alive=true;const check=async()=>{const s=session(),id=s?.user?.id;if(!id){if(alive){setRole('');setOpen(false);setSetup(false)}return}try{const r=await fetch(`${URL}/rest/v1/profiles?select=role,is_active&id=eq.${encodeURIComponent(id)}&limit=1`,{headers:{apikey:KEY,Authorization:`Bearer ${s.access_token||KEY}`}});const rows=await r.json();if(alive){const nextRole=rows?.[0]?.is_active?rows?.[0]?.role||'':'';setRole(nextRole)}}catch{if(alive)setRole('')}};check();const timer=setInterval(check,2500);return()=>{alive=false;clearInterval(timer)}},[]);
 if(role!=='seller')return <>{children}</>;
 if(setup)return <div className="seller-portal-overlay"><SellerStoreSetup onDone={()=>{setSetup(false);setOpen(true)}} onBack={()=>setSetup(false)}/></div>;
 if(open)return <div className="seller-portal-overlay"><SellerDashboard go={()=>setOpen(false)}/></div>;
 return <>{children}<button className="seller-launcher" onClick={()=>setOpen(true)}><span>▣</span> Panel de vendedor</button><button className="seller-launcher seller-store-setup-launcher" onClick={()=>setSetup(true)}>🏪 Configurar tienda</button></>;
}
