/* VaniDaxi — navegación única montada después del render de React. */
export function mountVaniDaxiUi(){
  const root=document.getElementById('root')
  if(!root)return

  const styleId='vd-navigation-single-style'
  if(!document.getElementById(styleId)){
    const style=document.createElement('style')
    style.id=styleId
    style.textContent=`
      /* La navegación inferior original duplicaba el menú y su bolsa flotante se superponía con Perfil. */
      .bottom-nav{display:none!important}
      .vd-main-menu{display:grid!important;grid-template-columns:repeat(6,minmax(0,1fr));gap:4px!important;width:100%;overflow:visible!important;margin:7px 0 4px!important;padding:4px!important;border:1px solid rgba(112,66,154,.09)!important;border-radius:17px!important;background:rgba(255,255,255,.94)!important;box-shadow:0 7px 20px rgba(83,48,104,.07)!important;box-sizing:border-box}
      .vd-main-menu button{min-width:0!important;width:100%!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:3px!important;padding:7px 2px!important;border:0!important;border-radius:12px!important;background:transparent!important;color:#756b7d!important;font:700 8px/1.05 system-ui,sans-serif!important;white-space:nowrap!important;box-shadow:none!important}
      .vd-main-menu button.active{background:linear-gradient(135deg,#70429a,#914aa9)!important;color:#fff!important;box-shadow:0 6px 14px rgba(112,66,154,.18)!important}
      .vd-menu-icon{font-size:15px!important;line-height:1!important}
      .vd-main-menu button:active{transform:scale(.97)!important}
      .scroll-page{padding-bottom:24px!important}
      .profile-page{padding-bottom:24px!important}
      @media(max-width:380px){.vd-main-menu{gap:2px!important;padding:3px!important}.vd-main-menu button{font-size:7px!important;padding:7px 1px!important}.vd-menu-icon{font-size:14px!important}}
    `
    document.head.appendChild(style)
  }

  const headers=[...root.querySelectorAll('.header')].filter(h=>!h.closest('.detail-page'))
  headers.forEach(header=>{
    let menu=header.querySelector('.vd-main-menu')
    if(!menu){
      menu=document.createElement('nav')
      menu.className='vd-main-menu'
      menu.setAttribute('aria-label','Menú principal de VaniDaxi')
      const items=[
        ['home','Inicio','⌂'],
        ['offers','Ofertas','✦'],
        ['categories','Categorías','◈'],
        ['favorites','Favoritos','♡'],
        ['cart','Carrito','🛒'],
        ['profile','Perfil','◉']
      ]
      items.forEach(([route,label,icon])=>{
        const button=document.createElement('button')
        button.type='button'
        button.dataset.route=route
        button.innerHTML=`<span class="vd-menu-icon" aria-hidden="true">${icon}</span><span>${label}</span>`
        button.addEventListener('click',()=>activateRoute(route))
        menu.appendChild(button)
      })
      header.appendChild(menu)
    }
    syncMenuState(menu)
  })

  document.querySelectorAll('.scroll-page').forEach(page=>page.classList.add('vd-compact-page'))
  document.querySelectorAll('.product-grid,.product-row,.icon-categories,.mini-category-grid').forEach(el=>el.classList.add('vd-compact-grid'))
}

function activateRoute(route){
  const labels={home:'inicio',offers:'ofertas',categories:'categorías',favorites:'favoritos',cart:'carrito',profile:'perfil'}
  const target=labels[route]
  if(!target)return

  const buttons=[...document.querySelectorAll('.bottom-nav button')]
  const button=buttons.find(b=>(b.textContent||'').trim().toLowerCase().includes(target))
  if(button){button.click();return}

  /* Fallback para la bolsa del encabezado cuando la vista actual no contiene Nav. */
  if(route==='cart'){
    const headerCart=[...document.querySelectorAll('.header .icon-btn')].find(b=>b.querySelector('svg'))
    if(headerCart){headerCart.click();return}
  }
}

function syncMenuState(menu){
  const active=(document.querySelector('.bottom-nav button.active')?.textContent||'').trim().toLowerCase()
  menu.querySelectorAll('button').forEach(button=>{
    const label=(button.textContent||'').trim().toLowerCase()
    button.classList.toggle('active',Boolean(active&&label.includes(active.split(' ')[0])))
  })
}
