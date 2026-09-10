import React,{useEffect,useState}from'react'
import App from'./App.jsx'
import SellerDashboardNew from'./SellerDashboardNew.jsx'
import AdminPortal from'./AdminPortal.jsx'
import LogisticsDashboard from'./LogisticsDashboard.jsx'
import PostPurchaseDashboard from'./PostPurchaseDashboard.jsx'
import ReputationDashboard from'./ReputationDashboard.jsx'
import CatalogAdvanced from'./CatalogAdvanced.jsx'
import DeliveryOrders from'./DeliveryOrders.jsx'
import ReturnsPage from'./ReturnsPage.jsx'
import CustomerNotificationBell from'./CustomerNotificationBell.jsx'
import{fetchCatalog}from'./commercialApi.js'
import{supabase}from'./supabaseClient.js'
import{saveSession}from'./auth.js'
const URL='https://oycwqpqoxgohzqivclzd.supabase.co',KEY=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY||'sb_publishable_OIoqR1IOg5t3BIQR7g6_0w_1KWzgpYj'
const session=()=>{try{return JSON.parse(localStorage.getItem('vanidaxi-auth-session')||'null')}catch{return null}}
const hasSession=()=>!!session()?.user?.id&&!!session()?.access_token
const lockKey='vanidaxi-app-lock'
const hasAppLock=()=>localStorage.getItem(lockKey)==='1'
export default function VaniDaxiShell(){
 const[route,setRoute]=useState(()=>location.hash||'#/home'),[role,setRole]=useState(''),[categories,setCategories]=useState([]),[authenticated,setAuthenticated]=useState(hasSession),[locked,setLocked]=useState(()=>hasSession()&&hasAppLock())
 useEffect(()=>{const onHash=()=>{setRoute(location.hash||'#/home')};addEventListener('hashchange',onHash);addEventListener('popstate',onHash);return()=>{removeEventListener('hashchange',onHash);removeEventListener('popstate',onHash)}},[])
 useEffect(()=>{let alive=true;const applySession=s=>{if(s){saveSession(s);if(alive){setAuthenticated(!!s.user?.id&&!!s.access_token);setLocked(!!s.user?.id&&!!s.access_token&&hasAppLock())}}else if(alive){setAuthenticated(false);setLocked(false)}};const{data:{subscription}}=supabase.auth.onAuthStateChange((event,s)=>{if(s)applySession(s);else if(event==='SIGNED_OUT'){localStorage.removeItem(lockKey);localStorage.removeItem('vanidaxi-auth-session');applySession(null)}});const check=async()=>{const authResult=await supabase.auth.getSession().catch(()=>null),sbSession=authResult?.data?.session||null;if(sbSession)applySession(sbSession);const s=sbSession||session(),id=s?.user?.id,ok=!!s?.user?.id&&!!s?.access_token;if(!sbSession&&ok&&alive){setAuthenticated(true);setLocked(hasAppLock())}if(!id){localStorage.removeItem(lockKey);if(alive){setLocked(false);setRole('');setCategories([])}}else{if(alive)setLocked(hasAppLock());try{const[r,c]=await Promise.all([fetch(`${URL}/rest/v1/profiles?select=role,is_active&id=eq.${encodeURIComponent(id)}&limit=1`,{headers:{apikey:KEY,Authorization:`Bearer ${s.access_token||KEY}`}}),fetchCatalog()]);const rows=await r.json();if(alive){setRole(rows?.[0]?.is_active?rows?.[0]?.role||'':'');setCategories(c?.categories||[])}}catch{if(alive)setRole('')}}};check();const onStorage=e=>{if(e.key==='vanidaxi-auth-session'||e.key===lockKey){setAuthenticated(hasSession());setLocked(hasSession()&&hasAppLock())}};const onVisibility=()=>{if(document.visibilityState==='hidden'&&hasSession()){localStorage.setItem(lockKey,'1');setLocked(true)}};const onPageHide=()=>{if(hasSession())localStorage.setItem(lockKey,'1')};addEventListener('storage',onStorage);document.addEventListener('visibilitychange',onVisibility);addEventListener('pagehide',onPageHide);return()=>{alive=false;subscription.unsubscribe();removeEventListener('storage',onStorage);document.removeEventListener('visibilitychange',onVisibility);removeEventListener('pagehide',onPageHide)}},[])
 const unlock=()=>{localStorage.removeItem(lockKey);setLocked(false);setAuthenticated(hasSession())}
 if(!authenticated)return <App/>
 if(locked)return <App/>
 if(route==='#/seller')return role==='seller'?<SellerDashboardNew back={()=>{location.hash='#/home';setRoute('#/home')}} categories={categories}/>:<App/>
 if(route==='#/admin')return role==='admin'?<AdminPortal/>:<App/>
 if(route==='#/logistics')return role==='admin'||role==='seller'?<LogisticsDashboard back={()=>{location.hash='#/home';setRoute('#/home')}}/>:<App/>
 if(route==='#/postventa')return <PostPurchaseDashboard back={()=>{location.hash='#/home';setRoute('#/home')}}/>
 if(route==='#/reputacion')return <ReputationDashboard back={()=>{location.hash='#/home';setRoute('#/home')}}/>
 if(route==='#/products')return <CatalogAdvanced back={()=>{location.hash='#/home';setRoute('#/home')}}/>
 if(route==='#/orders')return <DeliveryOrders go={n=>{location.hash=`#/${n}`;setRoute(`#/${n}`)}}/>
 if(route==='#/returns')return <ReturnsPage go={n=>{location.hash=`#/${n}`;setRoute(`#/${n}`)}}/>
 return <><App/><CustomerNotificationBell/></>
}