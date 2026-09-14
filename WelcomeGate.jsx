import React,{useEffect,useRef,useState}from'react'
import{ArrowRight}from'lucide-react'
import'./welcome-gate.css'
import buyerImage from'./welcome-vandaxi-buyer.svg'
import sellerImage from'./welcome-vandaxi-seller.svg'

const slides=[
 {type:'buyer',image:buyerImage,alt:'Bienvenida para compradores de VaniDaxi',label:'Entrar a VaniDaxi',aria:'la experiencia de compra'},
 {type:'seller',image:sellerImage,alt:'Bienvenida para vendedores de VaniDaxi',label:'Entrar a mi local',aria:'la experiencia de vendedor'}
]

export default function WelcomeGate({onContinue}){
 const[index,setIndex]=useState(0)
 const touchStart=useRef(null)
 const touchEnd=useRef(null)
 const slide=slides[index]
 const goTo=i=>setIndex((i+slides.length)%slides.length)
 useEffect(()=>{const timer=setInterval(()=>setIndex(i=>(i+1)%slides.length),5000);return()=>clearInterval(timer)},[])
 const onTouchStart=e=>{touchStart.current=e.changedTouches[0].clientX;touchEnd.current=null}
 const onTouchMove=e=>{touchEnd.current=e.changedTouches[0].clientX}
 const onTouchEnd=()=>{if(touchStart.current===null||touchEnd.current===null)return;const distance=touchStart.current-touchEnd.current;if(Math.abs(distance)>=45)goTo(index+(distance>0?1:-1));touchStart.current=null;touchEnd.current=null}
 return <section className="vd-welcome" aria-label="Bienvenida a VaniDaxi">
  <div className="vd-welcome-scene" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
   <img className="vd-welcome-image" src={slide.image} alt={slide.alt} draggable="false" />
   <div className="vd-welcome-overlay" aria-hidden="true" />
   <div className="vd-welcome-actions">
    <button className="vd-welcome-cta" type="button" onClick={()=>onContinue(slide.type)}>{slide.label}<ArrowRight size={18}/></button>
   </div>
  </div>
  <div className="vd-welcome-controls">
   <div className="vd-welcome-dots" role="tablist" aria-label="Seleccionar bienvenida">
    {slides.map((x,i)=><button key={x.type} type="button" role="tab" aria-selected={i===index} aria-label={`Ir a ${x.aria}`} className={i===index?'active':''} onClick={()=>goTo(i)}/>) }
   </div>
   <span>Desliza o espera para continuar</span>
  </div>
 </section>
}
