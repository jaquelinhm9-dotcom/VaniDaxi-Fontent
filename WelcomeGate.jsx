import React,{useEffect,useState}from'react'
import{ArrowRight,Store,ShoppingBag,ShieldCheck}from'lucide-react'
import'./welcome-gate.css'
const slides=[
 {type:'buyer',eyebrow:'VaniDaxi MARKETPLACE',title:'Compra fácil.\nDescubre algo nuevo.',text:'Explora productos, encuentra ofertas y compra en una experiencia clara y segura.',label:'Comprar en VaniDaxi',icon:ShoppingBag},
 {type:'seller',eyebrow:'CRECE CON VaniDaxi',title:'Tu tienda también\ntiene un lugar aquí.',text:'Publica tus productos, organiza tus ventas y haz crecer tu negocio desde un solo espacio.',label:'Vender en VaniDaxi',icon:Store}
]
export default function WelcomeGate({onContinue}){
 const[index,setIndex]=useState(0),slide=slides[index],Icon=slide.icon
 useEffect(()=>{const timer=setInterval(()=>setIndex(i=>(i+1)%slides.length),5000);return()=>clearInterval(timer)},[])
 return <section className="vd-welcome" aria-label="Bienvenida a VaniDaxi">
  <div className="vd-welcome-bg" aria-hidden="true"><span/><i/><b/></div>
  <div className="vd-welcome-scene" key={slide.type}>
   <div className="vd-welcome-copy">
    <div className="vd-welcome-brand"><span>V</span><b>VaniDaxi</b></div>
    <small>{slide.eyebrow}</small>
    <h1>{slide.title.split('\n').map((line,i)=><React.Fragment key={line}>{i>0&&<br/>}{line}</React.Fragment>)}</h1>
    <p>{slide.text}</p>
    <button className="vd-welcome-cta" onClick={()=>onContinue(slide.type)}>{slide.label}<ArrowRight size={18}/></button>
    <div className="vd-welcome-trust"><ShieldCheck size={16}/><span>Una experiencia pensada para comprar y vender con confianza.</span></div>
   </div>
   <div className={'vd-welcome-art '+slide.type} aria-hidden="true">
    <div className="vd-art-orbit one"/><div className="vd-art-orbit two"/>
    <div className="vd-art-card"><Icon size={48}/><strong>{slide.type==='buyer'?'COMPRA':'VENDE'}</strong><span>{slide.type==='buyer'?'Encuentra lo que buscas':'Haz crecer tu tienda'}</span></div>
    <div className="vd-art-dot d1"/><div className="vd-art-dot d2"/><div className="vd-art-dot d3"/>
   </div>
  </div>
  <div className="vd-welcome-controls"><div className="vd-welcome-dots">{slides.map((x,i)=><button key={x.type} className={i===index?'active':''} aria-label={'Ir a '+(i===0?'comprar':'vender')} onClick={()=>setIndex(i)}/>)}</div><span>Desliza automáticamente</span></div>
 </section>
}
