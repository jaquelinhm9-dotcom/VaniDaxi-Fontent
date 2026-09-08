import React,{useEffect,useState}from'react';
import AdminDashboard from'./AdminDashboard.jsx';
const URL='https://oycwqpqoxgohzqivclzd.supabase.co';
const KEY=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY||'...publishable fallback...';
const session=()=>{try{return JSON.parse(localStorage.getItem('vanidaxi-auth-session')||'null')}catch{return null}};
export default function AdminPortal({children}){
 const[role,setRole]=useState(''),[open,setOpen]=useState(false);
 useEffect(()=>{let alive=true;const check=async()=>{const s=session(),id=s?.user?.id;if(!id){if(alive)setRole('');return}try{const r=await fetch(`${URL}/rest/v1/profiles?select=role,is_active&id=eq.${encodeURIComponent(id)}&limit=1`,{headers:{apikey:KEY,Authorization:`Bearer ${s.access_token||KEY}`}});const rows=await r.json();if(alive)setRole(rows?.[0]?.is_active?rows?.[0]?.role||'':'')}catch{if(alive)setRole('')}};check();const t=setInterval(check,2500);return()=>{alive=false;clearInterval(t)}},[]);
 if(open)return <div className="seller-portal-overlay"><AdminDashboard go={()=>setOpen(false)}/></div>;
 return <>{children}{role==='admin'&&<button className="admin-launcher" onClick={()=>setOpen(true)}>👑 Panel administrativo</button>}</>;
}
