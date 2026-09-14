import React,{useEffect,useState}from'react'
import{createRoot}from'react-dom/client'
import VaniDaxiShell from'./VaniDaxiShell.jsx'
import PaymentReturn from'./PaymentReturn.jsx'
import PasswordRecovery from'./PasswordRecovery.jsx'
import{supabase}from'./supabaseClient.js'
import'./vanidaxi-new.css'
import'./responsive-fixes.css'
import'./accountEnhancer.js'
import'./profileEnhancer.js'
import'./seller-customer-enhancer.js'
import'./admin-returns-enhancer.js'
const root=document.getElementById('root')
if(!root)throw new Error('No se encontró #root')
const hasPaymentReturn=()=>new URLSearchParams(location.search).has('payment')
function AppEntry(){const[recovery,setRecovery]=useState(false);useEffect(()=>{const{data:{subscription}}=supabase.auth.onAuthStateChange(event=>{if(event==='PASSWORD_RECOVERY')setRecovery(true)});return()=>subscription.unsubscribe()},[]);if(hasPaymentReturn())return <PaymentReturn/>;return <>{recovery&&<PasswordRecovery onDone={()=>{setRecovery(false);location.hash='#/profile'}}/>}<VaniDaxiShell/></>}
createRoot(root).render(<React.StrictMode><AppEntry/></React.StrictMode>)
