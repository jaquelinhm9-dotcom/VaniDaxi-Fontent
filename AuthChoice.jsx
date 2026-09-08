import React,{useRef,useState}from'react'
import{Eye,EyeOff,UserPlus,Store,LogIn,X,Check}from'lucide-react'
import HCaptcha from'@hcaptcha/react-hcaptcha'
import{signIn,signUp}from'./auth.js'
import'./auth-choice.css'

// The hCaptcha sitekey is public. Keep the Vite variable as the preferred source,
// with the generated public sitekey as a safe fallback for GitHub Pages builds.
const HCAPTCHA_SITEKEY=import.meta.env.VITE_HCAPTCHA_SITEKEY||'390a44ec-b452-47d4-8514-5e6aeeece0ee'

export default function AuthChoice({type='login',close,done}){
 const[mode,setMode]=useState(type==='signup'?'signup':'login')
 const[accountType,setAccountType]=useState('customer')
 const[name,setName]=useState('')
 const[email,setEmail]=useState('')
 const[pw,setPw]=useState('')
 const[show,setShow]=useState(false)
 const[busy,setBusy]=useState(false)
 const[err,setErr]=useState('')
 const[message,setMessage]=useState('')
 const[captchaToken,setCaptchaToken]=useState('')
 const captchaRef=useRef(null)
 const submit=async e=>{
  e.preventDefault();setBusy(true);setErr('');setMessage('')
  try{
   if(mode==='signup'){
    if(!name.trim())throw new Error('Escribe tu nombre.')
    if(!HCAPTCHA_SITEKEY)throw new Error('Falta configurar hCaptcha en VaniDaxi.')
    if(!captchaToken)throw new Error('Completa la verificación de seguridad antes de crear tu cuenta.')
    const r=await signUp(email.trim(),pw,name.trim(),accountType,captchaToken)
    captchaRef.current?.resetCaptcha();setCaptchaToken('')
    if(r?.access_token){done(r)}else{setMessage(accountType==='seller'?'Cuenta de vendedor creada. Confirma tu correo si se solicita y después inicia sesión.':'Cuenta de comprador creada. Confirma tu correo si se solicita y después inicia sesión.');setMode('login')}
   }else{
    const r=await signIn(email.trim(),pw);done(r)
   }
  }catch(e){captchaRef.current?.resetCaptcha();setCaptchaToken('');setErr(e?.message||'No se pudo completar la operación.')}finally{setBusy(false)}
 }
 return <div className="vd-auth-backdrop" role="dialog" aria-modal="true">
  <div className="vd-auth-card">
   <button className="vd-auth-close" onClick={close} aria-label="Cerrar"><X size={18}/></button>
   <div className="vd-auth-brand"><span>V</span><b>VaniDaxi</b></div>
   <div className="vd-auth-head"><h2>{mode==='signup'?'Crear cuenta':'Bienvenido de nuevo'}</h2><p>{mode==='signup'?'Elige cómo quieres usar VaniDaxi.':'Inicia sesión para continuar.'}</p></div>
   {mode==='signup'&&<div className="vd-role-grid">
    <button type="button" className={`vd-role ${accountType==='customer'?'active':''}`} onClick={()=>setAccountType('customer')}><UserPlus size={20}/><span><b>Comprador</b><small>Comprar y gestionar mis pedidos</small></span>{accountType==='customer'&&<Check size={16}/>}</button>
    <button type="button" className={`vd-role ${accountType==='seller'?'active':''}`} onClick={()=>setAccountType('seller')}><Store size={20}/><span><b>Vendedor</b><small>Publicar productos y administrar mi tienda</small></span>{accountType==='seller'&&<Check size={16}/>}</button>
   </div>}
   <form onSubmit={submit} className="vd-auth-form">
    {mode==='signup'&&<input value={name} onChange={e=>setName(e.target.value)} placeholder="Nombre completo" autoComplete="name" required/>}
    <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Correo electrónico" type="email" autoComplete="email" required/>
    <div className="vd-pass"><input value={pw} onChange={e=>setPw(e.target.value)} placeholder="Contraseña" type={show?'text':'password'} minLength={6} autoComplete={mode==='signup'?'new-password':'current-password'} required/><button type="button" onClick={()=>setShow(v=>!v)} aria-label={show?'Ocultar contraseña':'Mostrar contraseña'}>{show?<EyeOff size={17}/>:<Eye size={17}/>}</button></div>
    {mode==='signup'&&<div className="vd-captcha"><HCaptcha ref={captchaRef} sitekey={HCAPTCHA_SITEKEY} onVerify={token=>setCaptchaToken(token)} onExpire={()=>setCaptchaToken('')} onError={()=>setCaptchaToken('')}/></div>}
    <button className="vd-auth-submit" disabled={busy}>{busy?'Procesando…':mode==='signup'?(accountType==='seller'?'Crear cuenta de vendedor':'Crear cuenta de comprador'):'Iniciar sesión'} <LogIn size={16}/></button>
   </form>
   {message&&<div className="vd-auth-message">{message}</div>}
   {err&&<div className="vd-auth-error">{err}</div>}
   <button className="vd-auth-switch" onClick={()=>{setMode(v=>v==='signup'?'login':'signup');setErr('');setMessage('');setCaptchaToken('');captchaRef.current?.resetCaptcha()}}>{mode==='signup'?'Ya tengo una cuenta':'Crear una cuenta nueva'}</button>
  </div>
 </div>
}
