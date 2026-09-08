/* VaniDaxi — navegación única + capa visual premium. */
export function mountVaniDaxiUi(){
  const root=document.getElementById('root')
  if(!root)return

  const styleId='vd-navigation-single-style'
  if(!document.getElementById(styleId)){
    const style=document.createElement('style')
    style.id=styleId
    style.textContent=`
      .bottom-nav{display:none!important}
      .scroll-page,.profile-page{padding-bottom:28px!important}

      /* Header / marca */
      .header{padding:13px 16px 12px!important;background:rgba(248,240,250,.94)!important;border-bottom:1px solid rgba(112,66,154,.055)!important}
      .header-row{margin-bottom:7px!important}
      .logo{font-size:21px!important;font-weight:800!important;letter-spacing:-.8px!important}
      .brand-svg{width:31px!important;height:31px!important}
      .header-actions{gap:7px!important}
      .icon-btn{width:38px!important;height:38px!important;border-radius:13px!important;background:rgba(255,255,255,.95)!important;box-shadow:0 6px 18px rgba(73,44,88,.09)!important}
      .search{height:46px!important;margin-top:6px!important;border:1px solid rgba(112,66,154,.08)!important;border-radius:15px!important;box-shadow:0 7px 18px rgba(74,48,91,.055)!important}
      .search input{font-size:12px!important}
      .search-filter{width:35px!important;height:35px!important;border-radius:11px!important;background:#f7eff9!important;color:#70429a!important}

      /* Menú principal: una sola navegación, tipo app real */
      .vd-main-menu{display:grid!important;grid-template-columns:repeat(6,minmax(0,1fr));gap:4px!important;width:100%!important;margin:8px 0 1px!important;padding:4px!important;border:1px solid rgba(112,66,154,.10)!important;border-radius:18px!important;background:linear-gradient(180deg,#fff,#fbf7fc)!important;box-shadow:0 8px 24px rgba(83,48,104,.075)!important;box-sizing:border-box!important}
      .vd-main-menu button{min-width:0!important;width:100%!important;height:54px!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:4px!important;padding:6px 1px!important;border:0!important;border-radius:13px!important;background:transparent!important;color:#817586!important;font:700 8.5px/1.05 Manrope,system-ui,sans-serif!important;white-space:nowrap!important;box-shadow:none!important;transition:transform .16s ease,background .16s ease,color .16s ease,box-shadow .16s ease!important}
      .vd-main-menu button:hover{background:#f7eff9!important;color:#70429a!important;transform:translateY(-1px)!important}
      .vd-main-menu button.active{background:linear-gradient(145deg,#70429a,#9a4cac)!important;color:#fff!important;box-shadow:0 8px 18px rgba(112,66,154,.22)!important}
      .vd-menu-icon{width:28px!important;height:28px!important;display:grid!important;place-items:center!important;border-radius:9px!important;font-size:16px!important;line-height:1!important;background:rgba(112,66,154,.065)!important}
      .vd-main-menu button.active .vd-menu-icon{background:rgba(255,255,255,.16)!important}
      .vd-main-menu button:active{transform:scale(.97)!important}

      /* Jerarquía visual del inicio */
      .home-hero{height:194px!important;margin:10px 16px 0!important;border-radius:22px!important;padding:21px 18px!important;background:linear-gradient(115deg,#e5d3f0 0%,#efd8ec 56%,#f9e1e9 100%)!important;box-shadow:0 14px 30px rgba(87,53,104,.12)!important}
      .hero-label{font-size:8px!important;letter-spacing:1.35px!important}
      .home-hero h1{font-size:30px!important;line-height:1.02!important;margin:6px 0 8px!important}
      .home-hero p{font-size:10px!important;line-height:1.5!important;margin-bottom:13px!important}
      .home-hero button{height:40px!important;padding:0 14px!important;border-radius:11px!important;font-size:10px!important;background:linear-gradient(135deg,#6c3d91,#8e4aa6)!important;box-shadow:0 8px 18px rgba(98,55,133,.18)!important}
      .hero-photo{right:-14px!important;bottom:-24px!important;width:205px!important;height:205px!important;border-width:9px!important;box-shadow:0 14px 28px rgba(85,48,104,.20)!important}

      .section-title{padding:21px 16px 11px!important}
      .section-title h2{font-size:17px!important;font-weight:800!important;letter-spacing:-.4px!important}
      .section-title h2:after{content:' •';color:#dd4a95}
      .section-title button{font-size:9px!important;font-weight:700!important}

      /* Categorías: menos emoji-plantilla, más tarjetas de navegación */
      .icon-categories{gap:8px!important;padding:0 16px!important}
      .icon-categories button,.mini-category-grid button{gap:7px!important}
      .icon-categories span,.mini-category-grid span{width:53px!important;height:53px!important;border-radius:15px!important;font-size:23px!important;background:linear-gradient(145deg,#fff,#f9f2fb)!important;box-shadow:0 7px 17px rgba(79,48,94,.08)!important;border:1px solid rgba(112,66,154,.07)!important}
      .icon-categories button:active span,.mini-category-grid button:active span{transform:translateY(-2px)!important}
      .icon-categories small,.mini-category-grid small{font-size:9px!important;font-weight:600!important;color:#756c7b!important}

      /* Producto: aspecto marketplace */
      .product-row{grid-auto-columns:152px!important;gap:12px!important;padding:0 16px 4px!important}
      .product-grid{gap:13px!important;padding:0 16px 24px!important}
      .product-card{padding-bottom:4px!important}
      .product-image{height:165px!important;border-radius:17px!important;background:#eee7f1!important;box-shadow:0 8px 20px rgba(73,44,88,.075)!important}
      .product-card:hover .product-image{transform:translateY(-2px)!important}
      .discount{left:9px!important;top:9px!important;border-radius:7px!important;padding:5px 7px!important;font-size:8px!important;box-shadow:0 5px 12px rgba(214,63,141,.18)!important}
      .heart{right:9px!important;top:9px!important;width:31px!important;height:31px!important;box-shadow:0 5px 12px rgba(73,44,88,.10)!important}
      .product-info{padding:8px 3px 2px!important}
      .product-info small{font-size:8px!important;color:#9b919f!important}
      .product-info h3{font-size:12px!important;font-weight:700!important;margin:3px 0 6px!important;line-height:1.25!important}
      .rating{font-size:9px!important;gap:3px!important}
      .price{margin-top:5px!important;gap:6px!important}
      .price b{font-size:14px!important;font-weight:800!important}
      .price del{font-size:8px!important}

      /* Banner editorial */
      .promo-card{height:128px!important;margin:22px 16px 0!important;border-radius:20px!important;padding-left:18px!important;background:linear-gradient(110deg,#29232d,#5a4c5c)!important;box-shadow:0 12px 24px rgba(46,37,49,.15)!important}
      .promo-card b{font-size:9px!important;letter-spacing:.4px!important}
      .promo-card strong{font-size:16px!important;line-height:1.18!important;margin-bottom:11px!important}
      .promo-card button{font-size:9px!important;border-radius:10px!important;padding:9px 12px!important;background:rgba(255,255,255,.14)!important;border:1px solid rgba(255,255,255,.16)!important}
      .promo-card img{width:59%!important;opacity:.9!important}

      /* Secciones internas */
      .page-heading{padding:18px 18px 17px!important}
      .page-heading span{font-size:9px!important}
      .page-heading h1{font-size:27px!important;margin:4px 0 6px!important}
      .page-heading p{font-size:10px!important;line-height:1.45!important}
      .offer-hero{margin:0 16px 15px!important;padding:15px!important;border-radius:17px!important;box-shadow:0 10px 22px rgba(112,64,154,.15)!important}
      .offer-hero b{font-size:13px!important}.offer-hero span{font-size:8px!important}.offer-hero strong{font-size:11px!important}
      .chip-row,.filter-tabs{gap:8px!important;padding:0 16px 14px!important}
      .chip-row button,.filter-tabs button{border-radius:10px!important;padding:9px 12px!important;font-size:9px!important}
      .chip-row button.active,.filter-tabs button.active{box-shadow:0 6px 14px rgba(112,66,154,.15)!important}
      .category-grid{gap:13px!important;padding:0 16px!important}
      .category-tile{height:145px!important;border-radius:18px!important;padding:16px!important;box-shadow:0 9px 23px rgba(83,48,104,.09)!important}
      .category-tile span{font-size:34px!important}.category-tile b{font-size:14px!important}.category-tile small{font-size:8px!important}

      /* Perfil / carrito */
      .profile-page{padding:16px 16px 26px!important}
      .profile-card{margin-top:18px!important;border-radius:19px!important;padding:17px!important;box-shadow:0 10px 24px rgba(83,48,104,.09)!important}
      .avatar{width:64px!important;height:64px!important;border-radius:20px!important}
      .profile-card h1{font-size:17px!important}.profile-card p{font-size:9px!important}
      .profile-list{margin-top:14px!important;border-radius:19px!important;padding:5px 15px!important;box-shadow:0 10px 24px rgba(83,48,104,.08)!important}
      .profile-list button{height:57px!important}.profile-list button>span{font-size:10px!important}
      .profile-summary{gap:9px!important;margin-top:14px!important}.profile-summary span{padding:11px 4px!important;border-radius:14px!important}.profile-summary b{font-size:15px!important}.profile-summary small{font-size:8px!important}
      .cart-items{gap:10px!important;padding:0 16px!important}.cart-item{border-radius:17px!important;padding:10px!important;box-shadow:0 8px 20px rgba(75,49,91,.07)!important}.cart-item img{width:66px!important;height:66px!important;border-radius:12px!important}.cart-item b{font-size:11px!important}.cart-item strong{font-size:12px!important}
      .cart-total{margin:16px!important;border-radius:18px!important;padding:16px!important}.cart-total b{font-size:18px!important}.cart-total button{height:44px!important;border-radius:12px!important;font-size:10px!important}

      /* Checkout / pagos */
      .checkout-section,.checkout-summary{margin:0 16px 12px!important;padding:16px!important;border-radius:18px!important;box-shadow:0 8px 22px rgba(78,51,93,.06)!important}
      .checkout-title b{font-size:11px!important}.checkout-section input{height:41px!important;font-size:10px!important;border-radius:10px!important}
      .payment-options{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:8px!important}
      .payment-options button{min-height:65px!important;border-radius:13px!important;font-size:9px!important;font-weight:700!important}
      .checkout-summary .total-line b{font-size:18px!important}

      @media(max-width:380px){
        .vd-main-menu{gap:2px!important;padding:3px!important}
        .vd-main-menu button{height:51px!important;font-size:7.5px!important}
        .vd-menu-icon{width:26px!important;height:26px!important;font-size:14px!important}
        .home-hero{height:186px!important}.home-hero h1{font-size:28px!important}.hero-photo{width:190px!important;height:190px!important}
        .product-row{grid-auto-columns:145px!important}.product-image{height:156px!important}
      }
      @media(prefers-reduced-motion:reduce){.vd-main-menu button,.product-image{transition:none!important}}
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
        ['cart','Carrito','🛍'],
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
  if(route==='cart'){
    const headerButtons=[...document.querySelectorAll('.header .icon-btn')]
    const headerCart=headerButtons[headerButtons.length-1]
    if(headerCart)headerCart.click()
  }
}

function syncMenuState(menu){
  const active=(document.querySelector('.bottom-nav button.active')?.textContent||'').trim().toLowerCase()
  menu.querySelectorAll('button').forEach(button=>{
    const label=(button.textContent||'').trim().toLowerCase()
    const first=active.split(' ')[0]
    button.classList.toggle('active',Boolean(active&&label.includes(first)))
  })
}
