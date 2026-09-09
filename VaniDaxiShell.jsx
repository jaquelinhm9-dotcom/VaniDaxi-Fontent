import React,{useEffect,useState}from'react'
import App from'./App.jsx'
import SellerDashboardNew from'./SellerDashboardNew.jsx'
import AdminDashboard from'./AdminDashboard.jsx'
import{fetchCatalog}from'./commercialApi.js'

const URL='https://oycwqpqoxgohzqivclzd.supabase.co',KEY=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY||'sb_publishable_OIoqR1IOg5t3BIQR7g6_0w_1KWzgpY'
const session=()=>{try{return JSON.parse(localStorage.getItem('vanidaxi-auth-session')||'null')}catch{return null}}

export default function VaniDaxiShell(){
 const[route,setRoute]=useState(()=>location.hash||'#/home'),[role,setRole]=useState(''),[categories,setCategories]=useState([])
 useEffect(()=>{const onHash=()=>setRoute(location.hash||'#/home');addEventListener('hashchange',onHash);addEventListener('popstate',onHash);return()=>{removeEventListener('hashchange',onHash);removeEventListener('popstate',onHash)}},[])
 useEffect(()=>{let alive=true;const check=async()=>{const s=session(),id=s?.user?.id;if(!id){if(alive){setRole('');setCategories([])}return}try{const[r,c]=await Promise.all([fetch(`${URL}/rest/v1/profiles?select=role,is_active&id=eq.${encodeURIComponent(id)}&limit=1`,{headers:{apikey:KEY,Authorization:`Bearer ${s.access_token||KEY}`}}),fetchCatalog()]);const rows=await r.json();if(alive){setRole(rows?.[0]?.is_active?rows?.[0]?.role||'':'');setCategories(c?.categories||[])}}catch{if(alive)setRole('')}};check();return()=>{alive=false}},[])
 if(route==='#/seller')return role==='seller'?<SellerDashboardNew back={()=>{location.hash='#/home';setRoute('#/home')}} categories={categories}/>:<App/>
 if(route==='#/admin')return role==='admin'?<AdminDashboard go={()=>{location.hash='#/home';setRoute('#/home')}}/>:<App/>
 return <App/>
}
