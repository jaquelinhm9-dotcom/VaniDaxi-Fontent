import React,{useEffect,useState}from'react'
import App from'./App.jsx'
import WelcomeGate from'./WelcomeGate.jsx'
import RegistrationFlow from'./RegistrationFlow.jsx'
import AuthChoice from'./AuthChoice.jsx'
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
import{saveSession,becomeSeller}from'./auth.js'
const URL='https://oycwqpqoxgohzqivclzd.supabase.co',KEY=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY||'sb_publishable_OIoqR1IOg5t3BIQR7g6_0w_1KWzgpYj'
const session=()=>{try{return JSON.parse(localStorage.getItem('vanidaxi-auth-session')||'null')}catch{return null}}
const hasSession=()=>!!session()?.user?.id&&!!session()?.access_token
const lockKey='vanidaxi-app-lock',welcomeKey='vanidaxi-welcome-seen',authIntentKey='vanidaxi-auth-intent',onboardingKey='vanidaxi-pending-onboarding'
const hasAppLock=()=>localStorage.getItem(lockKey)==='1'
const hasSeenWelcome=()=>sessionStorage.getItem(welcomeKey)==='1'
const authIntent=()=>sessionStorage.getItem(authIntentKey)||'buyer'
const pendingOnboarding=()=>{try{return JSON.parse(localStorage.getItem(onboardingKey)||'null')}catch{return null}}
export default function VaniDaxiShell(){
 const[route,setRoute]=useState(()=>location.hash||'#/home'),[role,setRole]=useState(''),[categories,setCategories]=useState([]),[authenticated,setAuthenticated]=useState(hasSession),[locked,setLocked]=useState(()=>hasSession()&&hasAppLock()),[welcomeSeen,setWelcomeSeen]=useState(hasSeenWelcome),[onboarding,setOnboarding]=useState(()=>!!hasSession()&&!!pendingOnboarding())
 useEffect(()=>{const onHash=()=>{setRoute(location.hash||'#/home')};addEventListener('hashchange',onHash);addEventListener('popstate',onHash);return()=>{removeEventListener('hashchange',onHash);removeEventListener('popstate',onHash)}},[])
 useEffect(()=>{let alive=true;const applySession=s=>{if(s){saveSession(s);if(alive){const pending=pendingOnboarding();setAuthenticated(!!s.user?.id&&!!s.access_token);setLocked(!!s.user?.id&&!!s.access_token&&hasAppLock());setOnboarding(!!pending&&!!s.user?.id)}}else if(alive){setAuthenticated(false);setLocked(false);setOnboarding(false);setWelcomeSeen(false)}};const{data:{subscription}}=supabase.auth.onAuthStateChange((event,s)=>{if(s)applySession(s);else if(event==='SIGNED_OUT'){localStorage.removeItem(lockKey);localStorage.removeItem('vanidaxi-auth-session');localStorage.removeItem(onboardingKey);sessionStorage.removeItem(authIntentKey);applySession(null)}});const check=async()=>{const authResult=await supabase.auth.getSession().catch(()=>null),sbSession=authResult?.data?.session||null;if(sbSession)applySession(sbSession);const s=sbSession||session(),id=s?.user?.id,ok=!!s?.user?.id&&!!s?.access_token;if(!sbSession&&ok&&alive){setAuthenticated(true);setLocked(hasAppLock());setOnboarding(!!pendingOnboarding())}if(!id){localStorage.removeItem(lockKey);if(alive){setLocked(false);setRole('');setCategories([]);setOnboarding(false)}}else{if(alive)setLocked(hasAppLock());try{const oauthRole=new URLSearchParams(location.search).get('oauth_role');if(oauthRole==='seller'){await becomeSeller().catch(()=>{});const clean=new URL(location.href);clean.searchParams.delete('oauth_role');history.replaceState(history.state,'',clean.pathname+(clean.hash||''))}const[r,c]=await Promise.all([fetch(`${URL}/rest/v1/profiles?select=role,is_active&id=eq.${encodeURIComponent(id)}&limit=1`,{headers:{apikey:KEY,Authorization:`Bearer ${s.access_token||KEY}`}}),fetchCatalog()]);const rows=await r.json();if(alive){setRole(rows?.[0]?.is_active?rows?.[0]?.role||'':'');setCategories(c?.categories||[])}}catch{if(alive)setRole('')}}};check();const onStorage=e=>{if(e.key==='vanidaxi-auth-session'||e.key===lockKey||e.key===onboardingKey){setAuthenticated(hasSession());setLocked(hasSession()&&hasAppLock());setOnboarding(hasSession()&&!!pendingOnboarding())}};const onVisibility=()=>{if(document.visibilityState==='hidden'&&hasSession()){localStorage.setItem(lockKey,'1');setLocked(true)}};const onPageHide=()=>{if(hasSession())localStorage.setItem(lockKey,'1')};addEventListener('storage',onStorage);document.addEventListener('visibilitychange',onVisibility);addEventListener('pagehide',onPageHide);return()=>{alive=false;subscription.unsubscribe();removeEventListener('storage',onStorage);document.removeEventListener('visibilitychange',onVisibility);removeEventListener('pagehide',onPageHide)}},[])
 const continueWelcome=type=>{sessionStorage.setItem(welcomeKey,'1');sessionStorage.setItem(authIntentKey,type==='seller'?'seller':'buyer');setWelcomeSeen(true)}
 const closeAuth=()=>{sessionStorage.removeItem(authIntentKey);setWelcomeSeen(false);sessionStorage.removeItem(welcomeKey)}
 const finishOnboarding=type=>{localStorage.removeItem(onboardingKey);sessionStorage.removeItem(authIntentKey);sessionStorage.setItem(welcomeKey,'1');setOnboarding(false);const target=type==='seller'?'#/seller':'#/home';location.hash=target;setRoute(target)}
 if(!authenticated&&!welcomeSeen)return <WelcomeGate onContinue={continueWelcome}/>
 if(!authenticated&&welcomeSeen&&sessionStorage.getItem(authIntentKey))return <><App/><AuthChoice defaultMode="signup" defaultAccountType={authIntent()} onClose={closeAuth} onAuthenticated={()=>{}}/></>
 if(authenticated&&onboarding){const p=pendingOnboarding();return <RegistrationFlow accountType={p?.accountType==='seller'?'seller':'customer'} user={session()?.user} onFinish={finishOnboarding}/>} 
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
