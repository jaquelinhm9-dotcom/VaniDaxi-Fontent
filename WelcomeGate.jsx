import React,{useEffect,useState}from'react'
import{ArrowRight,Store,ShoppingBag,ShieldCheck,LayoutGrid,Utensils}from'lucide-react'
import'./welcome-gate.css'
const slides=[
 {type:'buyer',eyebrow:'ENTRA A VaniDaxi',title:'La gran tienda\nempieza aquí.',text:'Recorre secciones como ropa, zapatos, tecnología, hogar, servicios y comida — nuestro minisúper digital.',label:'Entrar a VaniDaxi',icon:ShoppingBag,zone:'TIENDAS · PRODUCTOS · OFERTAS'},
 {type:'seller',eyebrow:'ABRE TU LOCAL EN VaniDaxi',title:'Tu tienda tiene\nsu propio espacio.',text:'Cada vendedor cuenta con su local dentro de la gran tienda VaniDaxi para organizar productos, ventas e inventario.',label:'Vender en VaniDaxi',icon:Store,zone:'TU LOCAL · TU CATÁLOGO · TUS VENTAS'}
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
    <div className="vd-welcome-trust"><ShieldCheck size={16}/><span>Una sola experiencia para descubrir locales, comprar, vender y crecer.</span></div>
   </div>
   <div className={'vd-welcome-art '+slide.type} aria-hidden="true">
    <div className="vd-art-orbit one"/><div className="vd-art-orbit two"/>
    <div className="vd-art-card"><Icon size={46}/><strong>{slide.type==='buyer'?'VaniDaxi STORE':'MI LOCAL'}</strong><span>{slide.zone}</span></div>
    <div className="vd-art-mini"><LayoutGrid size={17}/><span>Secciones</span></div>
    <div className="vd-art-mini food"><Utensils size={17}/><span>Minisúper</span></div>
    <div className="vd-art-dot d1"/><div className="vd-art-dot d2"/><div className="vd-art-dot d3"/>
   </div>
  </div>
  <div className="vd-welcome-controls"><div className="vd-welcome-dots">{slides.map((x,i)=><button key={x.type} className={i===index?'active':''} aria-label={'Ir a '+(i===0?'la tienda':'mi local')} onClick={()=>setIndex(i)}/>)}</div><span>Desliza automáticamente</span></div>
 </section>
} 
