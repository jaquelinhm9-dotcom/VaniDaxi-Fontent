import React,{useEffect,useState}from'react';
import AdminDashboard from'./AdminDashboard.jsx';
import AdminReviewModeration from'./AdminReviewModeration.jsx';
import'./admin-dashboard.css';
const URL='https://oycwqpqoxgohzqivclzd.supabase.co';
const KEY=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY||'sb_publishable_OIoqR1IOg5t3BIQR7g6_0w_1KWzgpY';
const session=()=>{try{return JSON.parse(localStorage.getItem('vanidaxi-auth-session')||'null')}catch{return null}};
export default function AdminPortal({children}){
 const[role,setRole]=useState(''),[open,setOpen]=useState('');
 useEffect(()=>{let alive=true;const check=async()=>{const s=session(),id=s?.user?.id;if(!id){if(alive){setRole('');setOpen('')}return}try{const r=await fetch(`${URL}/rest/v1/profiles?select=role,is_active&id=eq.${encodeURIComponent(id)}&limit=1`,{headers:{apikey:KEY,Authorization:`Bearer ${s.access_token||KEY}`}});const rows=await r.json();if(alive)setRole(rows?.[0]?.is_active?rows?.[0]?.role||'':'')}catch{if(alive)setRole('')}};check();const t=setInterval(check,2500);return()=>{alive=false;clearInterval(t)}},[]);
 if(open==='dashboard')return <div className="seller-portal-overlay"><AdminDashboard go={()=>setOpen('')}/></div>;
 if(open==='reviews')return <div className="seller-portal-overlay"><AdminReviewModeration back={()=>setOpen('dashboard')}/></div>;
 return <>{children}{role==='admin'&&<div className="admin-launcher-stack"><button className="admin-launcher" onClick={()=>setOpen('dashboard')}>👑 Panel administrativo</button><button className="admin-launcher" onClick={()=>setOpen('reviews')}>⭐ Moderar reseñas</button></div>}</>;
}
