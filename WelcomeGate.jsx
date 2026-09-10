import React,{useEffect,useRef,useState}from'react'
import{ArrowLeft,ArrowRight,Fingerprint,LockKeyhole,LogIn,ShieldCheck,UserPlus}from'lucide-react'
import HCaptcha from'@hcaptcha/react-hcaptcha'
import AuthChoice from'./AuthChoice.jsx'
import{supabase}from'./supabaseClient.js'
import{saveSession}from'./auth.js'
import'./welcome-gate.css'

const HCAPTCHA_SITEKEY=import.meta.env.VITE_HCAPTCHA_SITEKEY||'390a44ec-b452-47d4-8514-5e6aeeece0ee'
const ART_VERSION='welcome-clean-20260910'
const BUYER_ART=`https://raw.githubusercontent.com/jaquelinhm9-dotcom/VaniDaxi-Fontent/main/welcome-vandaxi-1.webp?v=${ART_VERSION}`
const SELLER_ART=`https://raw.githubusercontent.com/jaquelinhm9-dotcom/VaniDaxi-Fontent/main/welcome-vandaxi-vendedor.webp?v=${ART_VERSION}`
const passkeySupported=()=>typeof window!=='undefined'&&window.isSecureContext&&'PublicKeyCredential'in window
const reducedMotion=()=>typeof window!=='undefined'&&window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

export default function WelcomeGate({locked=false,onUnlock}){
 const[authOpen,setAuthOpen]=useState(false),[authType,setAuthType]=useState('login'),[busy,setBusy]=useState(false),[err,setErr]=useState(''),[captchaReady,setCaptchaReady]=useState(false),[panel,setPanel]=useState(0),[touching,setTouching]=useState(false)
 const timerRef=useRef(null),captchaRef=useRef(null)
 const open=type=>{setAuthType(type);setErr('');setAuthOpen(true)}
 const stopAuto=()=>{if(timerRef.current){clearTimeout(timerRef.current);timerRef.current=null}}
 const goPanel=index=>setPanel(Math.max(0,Math.min(1,index)))
 const scheduleAuto=()=>{stopAuto();if(locked||authOpen||touching||reducedMotion()||document.visibilityState==='hidden')return;timerRef.current=setTimeout(()=>goPanel(panel===0?1:0),5200)}
 useEffect(()=>{scheduleAuto();return stopAuto},[panel,locked,authOpen,touching])
 useEffect(()=>{const onVisibility=()=>document.visibilityState==='hidden'?stopAuto():scheduleAuto();document.addEventListener('visibilitychange',onVisibility);return()=>document.removeEventListener('visibilitychange',onVisibility)},[panel,locked,authOpen,touching])
 const unlock=async()=>{setErr('');if(!passkeySupported()){setErr('Este dispositivo o navegador no tiene disponible la llave de acceso. Usa tu contraseña para continuar.');return}if(!captchaReady||!captchaRef.current){setErr('La verificación de seguridad todavía se está preparando.');return}setBusy(true);try{const captcha=await captchaRef.current.execute({async:true}),captchaToken=captcha?.response||captcha?.token||captchaRef.current.getResponse?.();if(!captchaToken)throw new Error('No se pudo completar la verificación de seguridad.');const{data,error}=await supabase.auth.signInWithPasskey({options:{captchaToken}});captchaRef.current.resetCaptcha?.();if(error)throw error;if(!data?.session)throw new Error('No se recibió una sesión válida.');saveSession(data.session);localStorage.removeItem('vanidaxi-app-lock');onUnlock?.()}catch(e){captchaRef.current?.resetCaptcha?.();if(e?.name==='NotAllowedError')setErr('La verificación del dispositivo fue cancelada.');else if(e?.code==='passkey_disabled')setErr('La llave de acceso no está disponible en este momento.');else setErr(e?.message||'No se pudo desbloquear la cuenta.')}finally{setBusy(false)}}
 if(locked)return <div className="vd-welcome vd-welcome-locked"><div className="vd-welcome-visual"><img src={BUYER_ART} alt=""/></div><div className="vd-welcome-overlay" aria-hidden="true"></div><header className="vd-welcome-lock-brand"><span className="vd-welcome-mark">V</span><strong>Vani<span>Daxi</span></strong></header><main className="vd-welcome-lock-panel"><div className="vd-welcome-lock-icon"><LockKeyhole size={28}/></div><div className="vd-welcome-lock-copy"><span>Tu cuenta está protegida</span><h1>Bienvenido de nuevo a <b>VaniDaxi</b></h1><p>Verifica tu dispositivo para continuar de forma segura.</p></div><div className="vd-welcome-lock-actions"><button className="vd-welcome-main-action" onClick={unlock} disabled={busy||!captchaReady}><Fingerprint/><span>{busy?'Verificando…':!captchaReady?'Preparando verificación…':'Desbloquear con huella, Face ID o PIN'}</span><ArrowRight/></button><button className="vd-welcome-alt-action" onClick={()=>open('login')} disabled={busy}><LogIn/><span>Continuar con contraseña</span><ArrowRight/></button></div><div className="vd-hidden-captcha"><HCaptcha ref={captchaRef} sitekey={HCAPTCHA_SITEKEY} size="invisible" onReady={()=>setCaptchaReady(true)} onLoad={()=>setCaptchaReady(true)} onError={()=>{setCaptchaReady(false);setErr('No se pudo completar la verificación de seguridad.')}} onExpire={()=>setCaptchaReady(true)}/></div>{err&&<div className="vd-welcome-error">{err}</div>}</main><footer className="vd-welcome-lock-footer"><ShieldCheck size={15}/> Acceso seguro a tu cuenta</footer>{authOpen&&<AuthChoice type={authType} close={()=>setAuthOpen(false)} done={()=>{setAuthOpen(false);localStorage.removeItem('vanidaxi-app-lock');onUnlock?.()}}/>}</div>
 const art=panel===0?BUYER_ART:SELLER_ART
 const title=panel===0?'Encuentra todo en un solo lugar':'Tu tienda, dentro de VaniDaxi'
 return <div className="vd-welcome vd-welcome-fresh" onPointerEnter={stopAuto} onPointerLeave={scheduleAuto} onTouchStart={()=>{setTouching(true);stopAuto()}} onTouchEnd={()=>setTouching(false)}>
   <main key={panel} className={`vd-welcome-stage ${panel===0?'is-buyer':'is-seller'}`} aria-live="polite">
     <div className="vd-welcome-photo"><img src={art} alt={panel===0?'Comprar en VaniDaxi':'Vender en VaniDaxi'} draggable="false"/></div>
     <div className="vd-welcome-shade" aria-hidden="true"></div>
     <section className="vd-welcome-surface">
       <div className="vd-welcome-copy"><span>{panel===0?'COMPRAR':'VENDER'}</span><h1>{title}</h1></div>
       <div className="vd-welcome-actions">
         <button className="vd-welcome-action vd-welcome-action-primary" onClick={()=>open('login')}><LogIn/><span>Iniciar sesión</span></button>
         <button className="vd-welcome-action vd-welcome-action-secondary" onClick={()=>open(panel===0?'signup':'seller-signup')}><UserPlus/><span>Crear cuenta</span></button>
       </div>
       <button className="vd-welcome-next" onClick={()=>goPanel(panel===0?1:0)} aria-label={panel===0?'Ver Vender':'Volver a Comprar'}>{panel===0?<><span>Vender</span><ArrowRight/></>:<><ArrowLeft/><span>Comprar</span></>}</button>
     </section>
   </main>
   <nav className="vd-welcome-dots" aria-label="Seleccionar bienvenida"><button className={panel===0?'active':''} aria-label="Comprar" onClick={()=>goPanel(0)}></button><button className={panel===1?'active':''} aria-label="Vender" onClick={()=>goPanel(1)}></button></nav>
   {authOpen&&<AuthChoice type={authType} close={()=>setAuthOpen(false)} done={()=>{setAuthOpen(false);location.reload()}}/>}
 </div>
}
