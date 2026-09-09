import React,{useState}from'react'
import{LogIn,UserPlus,ShieldCheck,Truck,Store,Heart,ArrowRight}from'lucide-react'
import AuthChoice from'./AuthChoice.jsx'
import'./welcome-gate.css'

export default function WelcomeGate(){
 const[authOpen,setAuthOpen]=useState(false),[authType,setAuthType]=useState('login')
 const open=type=>{setAuthType(type);setAuthOpen(true)}
 return <div className="vd-welcome">
  <div className="vd-welcome-scene" aria-hidden="true"></div>
  <div className="vd-welcome-shade" aria-hidden="true"></div>
  <header className="vd-welcome-brand">
   <div className="vd-welcome-logo"><span>V</span></div><b>Vani<span>Daxi</span></b>
   <small>COMPRA · VENDE · DISFRUTA</small>
  </header>
  <main className="vd-welcome-content">
   <div className="vd-welcome-copy">
    <em>Hola,</em>
    <h1>Bienvenido a <strong>VaniDaxi</strong></h1>
    <p>Todo lo que necesitas para <b>comprar, vender y recibir</b> en un solo lugar.</p>
   </div>
   <div className="vd-welcome-actions">
    <button className="vd-welcome-primary" onClick={()=>open('login')}><LogIn/><span>Iniciar sesión</span><ArrowRight/></button>
    <button className="vd-welcome-secondary" onClick={()=>open('signup')}><UserPlus/><span>Crear cuenta</span><ArrowRight/></button>
   </div>
   <div className="vd-welcome-benefits">
    <div><ShieldCheck/><span>Compras<br/>seguras</span></div>
    <i></i>
    <div><Truck/><span>Envíos a<br/>todo México</span></div>
    <i></i>
    <div><Store/><span>Vende y haz crecer<br/>tu negocio</span></div>
    <i></i>
    <div><Heart/><span>Todo lo que<br/>te gusta</span></div>
   </div>
   <div className="vd-welcome-dots" aria-hidden="true"><b></b><i></i><i></i></div>
  </main>
  <footer className="vd-welcome-footer"><ShieldCheck size={15}/> Acceso seguro a tu cuenta</footer>
  {authOpen&&<AuthChoice type={authType} close={()=>setAuthOpen(false)} done={()=>{setAuthOpen(false);location.reload()}}/>}
 </div>
}
