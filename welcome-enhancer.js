const esc=(v)=>String(v).replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]))
const section=(html)=>{const el=document.createElement('section');el.className='welcome-extra';el.innerHTML=html;return el}
export function enhanceWelcome(){
  if(document.querySelector('.welcome-extra'))return
  const page=document.querySelector('.scroll-page');if(!page)return
  const anchor=[...page.children].find(x=>x.classList.contains('mini-category-grid'))
  const more=section(`
    <div class="welcome-section-head"><div><span>Explora VaniDaxi</span><h2>Más para descubrir</h2></div><button data-welcome="categories">Ver todo</button></div>
    <div class="welcome-feature-grid">
      <button data-welcome="offers"><strong>⚡ Ofertas relámpago</strong><span>Precios especiales por tiempo limitado.</span><b>Ver ofertas →</b></button>
      <button data-welcome="products"><strong>✦ Nuevos productos</strong><span>Descubre lo más reciente del catálogo.</span><b>Explorar →</b></button>
      <button data-welcome="categories"><strong>♡ Compra por categoría</strong><span>Encuentra rápido lo que buscas.</span><b>Explorar →</b></button>
    </div>
    <div class="welcome-section-head"><div><span>Compra con confianza</span><h2>Todo en un solo lugar</h2></div></div>
    <div class="welcome-trust-grid">
      <div><span>🛡️</span><b>Compra segura</b><small>Tu cuenta y tus datos se manejan con protección.</small></div>
      <div><span>🚚</span><b>Seguimiento de pedidos</b><small>Consulta tus compras desde tu perfil.</small></div>
      <div><span>♡</span><b>Favoritos</b><small>Guarda productos para volver a ellos después.</small></div>
      <div><span>💬</span><b>Ayuda</b><small>Accede a soporte desde tu cuenta.</small></div>
    </div>
    <div class="welcome-wide-banner"><div><span>VaniDaxi</span><h2>Descubre. Elige. Compra.</h2><p>Moda, tecnología, hogar, belleza, deportes y más.</p><button data-welcome="products">Empezar a explorar →</button></div><div class="welcome-sparkles">✦ ✧ ✦</div></div>
  `)
  if(anchor?.parentNode)anchor.parentNode.insertBefore(more,anchor.nextSibling);else page.appendChild(more)
  more.querySelectorAll('[data-welcome]').forEach(btn=>btn.addEventListener('click',()=>{const target=btn.dataset.welcome;const labels={offers:'Ofertas relámpago',products:'Productos',categories:'Categorías'};const candidates=[...document.querySelectorAll('button')];const hit=candidates.find(x=>x.textContent.trim()===labels[target]);if(hit)hit.click();else if(target==='offers')document.querySelector('.home-hero button')?.click()}))
}
export function observeWelcome(){
  enhanceWelcome();
  const observer=new MutationObserver(()=>{if(document.querySelector('.scroll-page')&&!document.querySelector('.welcome-extra'))enhanceWelcome()})
  observer.observe(document.getElementById('root')||document.body,{childList:true,subtree:true});return()=>observer.disconnect()
}
