import React,{useEffect,useState}from'react'
import{ArrowRight}from'lucide-react'
import'./welcome-gate.css'

const BASE=import.meta.env.BASE_URL||'/'
const slides=[
 {type:'buyer',image:`${BASE}welcome-vandaxi-1.webp`,alt:'Bienvenida de compradores de VaniDaxi',label:'Entrar a VaniDaxi',aria:'la tienda'},
 {type:'seller',image:`${BASE}welcome-vandaxi-vendedor.webp`,alt:'Bienvenida de vendedores de VaniDaxi',label:'Vender en VaniDaxi',aria:'mi local'}
]

export default function WelcomeGate({onContinue}){
 const[index,setIndex]=useState(0)
 const slide=slides[index]
 useEffect(()=>{
  const timer=setInterval(()=>setIndex(i=>(i+1)%slides.length),5000)
  return()=>clearInterval(timer)
 },[])
 return <section className="vd-welcome" aria-label="Bienvenida a VaniDaxi">
  <div className="vd-welcome-scene" key={slide.type}>
   <img className="vd-welcome-image" src={slide.image} alt={slide.alt} draggable="false" />
   <div className="vd-welcome-overlay" aria-hidden="true" />
   <div className="vd-welcome-actions">
    <button className="vd-welcome-cta" type="button" onClick={()=>onContinue(slide.type)}>{slide.label}<ArrowRight size={18}/></button>
   </div>
  </div>
  <div className="vd-welcome-controls">
   <div className="vd-welcome-dots" role="tablist" aria-label="Seleccionar bienvenida">
    {slides.map((x,i)=><button key={x.type} type="button" role="tab" aria-selected={i===index} aria-label={`Ir a ${x.aria}`} className={i===index?'active':''} onClick={()=>setIndex(i)}/>) }
   </div>
   <span>Desliza automáticamente</span>
  </div>
 </section>
}
