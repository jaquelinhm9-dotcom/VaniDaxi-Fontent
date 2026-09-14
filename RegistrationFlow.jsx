import React,{useState}from'react'
import{ArrowRight,CheckCircle2,Fingerprint,LockKeyhole,ShieldCheck}from'lucide-react'
import{supabase}from'./supabaseClient.js'
import'./registration-flow.css'

export default function RegistrationFlow({accountType='customer',user,onFinish}){
 const[step,setStep]=useState('choose'),[loading,setLoading]=useState(false),[error,setError]=useState('')
 const seller=accountType==='seller'
 const firstName=(user?.user_metadata?.name||user?.email?.split('@')[0]||'').trim().split(/\s+/)[0]
 const setupBiometric=async()=>{
  setError('')
  if(!window.isSecureContext||!window.PublicKeyCredential){setError('Este dispositivo o navegador no permite inicio con biometría aquí. Puedes continuar con contraseña.');return}
  setLoading(true)
  try{
   const{data,error}=await supabase.auth.registerPasskey()
   if(error)throw error
   if(!data)throw new Error('No se pudo registrar la credencial biométrica.')
   localStorage.setItem('vanidaxi-login-preference','biometric')
   setStep('done')
  }catch(err){setError(err?.message||'No se pudo configurar la biometría. Puedes elegir contraseña.')}
  finally{setLoading(false)}
 }
 const choosePassword=()=>{localStorage.setItem('vanidaxi-login-preference','password');setStep('done');setError('')}
 const finish=()=>onFinish?.(seller?'seller':'customer')
 return <div className="registration-flow" role="dialog" aria-modal="true" aria-label="Finalizar registro">
  <div className="registration-card">
   {step==='choose'&&<>
    <div className="registration-icon"><ShieldCheck/></div>
    <small>CUENTA CREADA</small>
    <h1>¿Cómo quieres iniciar sesión la próxima vez?</h1>
    <p>Elige cómo prefieres proteger tu acceso a VaniDaxi. Puedes cambiar esta opción después.</p>
    <div className="registration-options">
     <button className="registration-option" type="button" onClick={setupBiometric} disabled={loading}>
      <span><Fingerprint/></span><div><b>Usar biometría</b><small>Huella, rostro o PIN del dispositivo mediante Passkey.</small></div><ArrowRight/>
     </button>
     <button className="registration-option" type="button" onClick={choosePassword} disabled={loading}>
      <span><LockKeyhole/></span><div><b>Usar contraseña</b><small>Entrar con tu correo y contraseña de VaniDaxi.</small></div><ArrowRight/>
     </button>
    </div>
    {loading&&<div className="registration-status">Configurando tu acceso…</div>}
    {error&&<div className="registration-error" role="alert">{error}</div>}
   </>}
   {step==='done'&&<>
    <div className="registration-success"><CheckCircle2/></div>
    <small>BIENVENIDO A VANIDAXI</small>
    <h1>{firstName?`Gracias por registrarte, ${firstName}.`:'Gracias por registrarte en VaniDaxi.'}</h1>
    <p>{seller?'Tu cuenta de vendedor está lista para continuar con la configuración de tu local y empezar a vender.':'Tu cuenta está lista. Ahora puedes descubrir tiendas, productos y ofertas dentro de VaniDaxi.'}</p>
    <button className="registration-primary" type="button" onClick={finish}>{seller?'Ir a vender':'Ir a comprar'}<ArrowRight/></button>
   </>}
  </div>
 </div>
}
