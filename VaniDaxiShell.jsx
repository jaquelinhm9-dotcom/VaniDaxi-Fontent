import React,{useEffect,useState}from'react'
import App from'./App.jsx'
import WelcomeGate from'./WelcomeGate.jsx'
import SellerDashboardNew from'./SellerDashboardNew.jsx'
import AdminDashboard from'./AdminDashboard.jsx'
import LogisticsDashboard from'./LogisticsDashboard.jsx'
import PostPurchaseDashboard from'./PostPurchaseDashboard.jsx'
import ReputationDashboard from'./ReputationDashboard.jsx'
import CatalogAdvanced from'./CatalogAdvanced.jsx'
import DeliveryOrders from'./DeliveryOrders.jsx'
import ReturnsPage from'./ReturnsPage.jsx'
import CustomerNotificationBell from'./CustomerNotificationBell.jsx'
import{fetchCatalog}from'./commercialApi.js'
const URL='https://oycwqpqoxgohzqivclzd.supabase.co',KEY=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY||'sb_publishable_OIoqR1IOg5t3BIQR7g6_0w_1KWzgpY'
const session=()=>{try{return JSON.parse(localStorage.getItem('vanidaxi-auth-session')||'null')}catch{return null}}
export default function VaniDaxiShell(){
 const[route,setRoute]=useState(()=>location.hash||'#/home'),[role,setRole]=useState(''),[categories,setCategories]=useState([]),[authenticated,setAuthenticated]=useState(()=>!!session()?.user?.id&&!!session()?.access_token)
 useEffect(()=>{const onHash=()=>setRoute(location.hash||'#/home');addEventListener('hashchange',onHash);addEventListener('popstate',onHash);return()=>{removeEventListener('hashchange',onHash);removeEventListener('popstate',onHash)}},[])
 useEffect(()=>{let alive=true;const check=async()=>{const s=session(),id=s?.user?.id,ok=!!id&&!!s?.access_token;if(alive)setAuthenticated(ok);if(!id){if(alive){setRole('');setCategories([])}return}try{const[r,c]=await Promise.all([fetch(`${URL}/rest/v1/profiles?select=role,is_active&id=eq.${encodeURIComponent(id)}&limit=1`,{headers:{apikey:KEY,Authorization:`Bearer ${s.access_token||KEY}`}}),fetchCatalog()]);const rows=await r.json();if(alive){setRole(rows?.[0]?.is_active?rows?.[0]?.role||'':'');setCategories(c?.categories||[])}}catch{if(alive)setRole('')}};check();const onStorage=e=>{if(e.key==='vanidaxi-auth-session')setAuthenticated(!!session()?.user?.id&&!!session()?.access_token)};addEventListener('storage',onStorage);return()=>{alive=false;removeEventListener('storage',onStorage)}},[])
 if(!authenticated)return <WelcomeGate/>
 if(route==='#/seller')return role==='seller'?<SellerDashboardNew back={()=>{location.hash='#/home';setRoute('#/home')}} categories={categories}/>:<App/>
 if(route==='#/admin')return role==='admin'?<AdminDashboard go={()=>{location.hash='#/home';setRoute('#/home')}}/>:<App/>
 if(route==='#/logistics')return role==='admin'||role==='seller'?<LogisticsDashboard back={()=>{location.hash='#/home';setRoute('#/home')}}/>:<App/>
 if(route==='#/postventa')return <PostPurchaseDashboard back={()=>{location.hash='#/home';setRoute('#/home')}}/>
 if(route==='#/reputacion')return <ReputationDashboard back={()=>{location.hash='#/home';setRoute('#/home')}}/>
 if(route==='#/products')return <CatalogAdvanced back={()=>{location.hash='#/home';setRoute('#/home')}}/>
 if(route==='#/orders')return <DeliveryOrders go={n=>{location.hash=`#/${n}`;setRoute(`#/${n}`)}}/>
 if(route==='#/returns')return <ReturnsPage go={n=>{location.hash=`#/${n}`;setRoute(`#/${n}`)}}/>
 return <><App/><CustomerNotificationBell/></>
}