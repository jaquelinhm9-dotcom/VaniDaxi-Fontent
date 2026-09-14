import React,{useEffect,useRef,useState}from'react'
import{ArrowRight,ShoppingBag,Store,Shirt,Smartphone,Utensils,BriefcaseBusiness,Boxes}from'lucide-react'
import'./welcome-gate.css'

const slides=[
 {type:'buyer',eyebrow:'BIENVENIDO A VANIDAXI',title:'Compra en un solo lugar.',text:'Descubre tiendas, ropa, zapatos, tecnología, comida, servicios y mucho más.',cta:'Crear mi cuenta',icon:ShoppingBag,items:[[Shirt,'Ropa y zapatos'],[Smartphone,'Tecnología'],[Utensils,'Comida'],[BriefcaseBusiness,'Servicios']]},
 {type:'seller',eyebrow:'TU NEGOCIO EN VANIDAXI',title:'Convierte tu local en digital.',text:'Publica productos, organiza inventario, recibe pedidos y haz crecer tus ventas.',cta:'Crear mi local',icon:Store,items:[[Boxes,'Productos'],[ShoppingBag,'Pedidos'],[BriefcaseBusiness,'Ventas'],[Store,'Tu local']]}
]

export default function WelcomeGate({onContinue}){
 const[index,setIndex]=useState(0),touchStart=useRef(null),touchEnd=useRef(null)
 const slide=slides[index],Icon=slide.icon
 const goTo=i=>setIndex((i+slides.length)%slides.length)
 useEffect(()=>{const timer=setInterval(()=>setIndex(i=>(i+1)%slides.length),5000);return()=>clearInterval(timer)},[])
 const onTouchStart=e=>{touchStart.current=e.changedTouches[0].clientX;touchEnd.current=null}
 const onTouchMove=e=>{touchEnd.current=e.changedTouches[0].clientX}
 const onTouchEnd=()=>{if(touchStart.current===null||touchEnd.current===null)return;const distance=touchStart.current-touchEnd.current;if(Math.abs(distance)>=45)goTo(index+(distance>0?1:-1));touchStart.current=null;touchEnd.current=null}
 return <section className="vd-welcome" aria-label="Bienvenida a VaniDaxi"><div className="vd-welcome-glow"/><div className="vd-welcome-shell" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
  <header className="vd-welcome-brand"><span>V</span><b>VaniDaxi</b></header>
  <div className="vd-welcome-layout">
   <div className="vd-welcome-copy"><small>{slide.eyebrow}</small><h1>{slide.title}</h1><p>{slide.text}</p><div className="vd-welcome-pills">{slide.items.map(([Item,label])=><div key={label}><Item size={17}/><span>{label}</span></div>)}</div><button className="vd-welcome-cta" type="button" onClick={()=>onContinue(slide.type)}><Icon size={19}/>{slide.cta}<ArrowRight size={18}/></button></div>
   <div className={`vd-welcome-art ${slide.type}`} aria-hidden="true"><div className="vd-art-ring ring-a"/><div className="vd-art-ring ring-b"/><div className="vd-art-card main-card"><div className="vd-art-top"><span className="vd-art-mark">V</span><span className="vd-art-dot"/></div><div className="vd-art-window"><span/><span/><span/></div><div className="vd-art-stack"><i/><i/><i/></div><div className="vd-art-person"><div className="head"/><div className="body"/><div className="arm left"/><div className="arm right"/></div><div className="vd-art-bubble">{slide.type==='seller'?'Tu local, tus ventas':'Descubre · Compra · Disfruta'}</div></div><div className="vd-art-mini mini-one"><ShoppingBag/></div><div className="vd-art-mini mini-two"><Icon/></div></div>
  </div>
  <div className="vd-welcome-bottom"><div className="vd-welcome-dots" role="tablist" aria-label="Tipo de bienvenida">{slides.map((x,i)=><button key={x.type} type="button" role="tab" aria-selected={i===index} className={i===index?'active':''} aria-label={x.type==='seller'?'Vendedor':'Comprador'} onClick={()=>goTo(i)}/>)}</div><span>Desliza para cambiar</span></div>
 </div></section>
}
