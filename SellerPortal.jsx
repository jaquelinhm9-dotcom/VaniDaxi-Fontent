import React,{useEffect,useState}from'react';
import SellerDashboard from'./SellerDashboard.jsx';

const URL='https://oycwqpqoxgohzqivclzd.supabase.co';
const KEY=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY||'sb_publishable_OIoqR1IOg5t3BIQR7g6_0w_1KWzgpY';
const session=()=>{try{return JSON.parse(localStorage.getItem('vanidaxi-auth-session')||'null')}catch{return null}};

export default function SellerPortal({children}){
 const[role,setRole]=useState(''),[open,setOpen]=useState(false);
 useEffect(()=>{let alive=true;const check=async()=>{const s=session(),id=s?.user?.id;if(!id){if(alive)setRole('');return}try{const r=await fetch(`${URL}/rest/v1/profiles?select=role&id=eq.${encodeURIComponent(id)}&limit=1`,{headers:{apikey:KEY,Authorization:`Bearer ${s.access_token||KEY}`}});const rows=await r.json();if(alive)setRole(rows?.[0]?.role||'')}catch{if(alive)setRole('')}};check();const on=()=>check();window.addEventListener('vani-auth-changed',on);return()=>{alive=false;window.removeEventListener('vani-auth-changed',on)}},[]);
 if(open)return <div className="seller-portal-overlay"><SellerDashboard go={()=>setOpen(false)}/></div>;
 return <>{children}{role==='seller'&&<button className="seller-launcher" onClick={()=>setOpen(true)}><span>▣</span> Panel de vendedor</button>}</>;
}
