/* VaniDaxi — barra de menú y ajuste visual coordinado */
(() => {
  const labels = {
    home: ['Inicio','home'],
    offers: ['Ofertas','offers'],
    categories: ['Categorías','categories'],
    favorites: ['Favoritos','favorites'],
    profile: ['Perfil','profile']
  }
  const routeByExistingButton = route => {
    const [label] = labels[route] || []
    if (!label) return
    const buttons = [...document.querySelectorAll('button')]
    const candidates = buttons.filter(b => (b.textContent || '').trim().toLowerCase().includes(label.toLowerCase()))
    const target = candidates.find(b => !b.closest('.vd-menu')) || candidates[0]
    if (target) target.click()
  }
  const style = document.createElement('style')
  style.textContent = `
    .vd-menu{display:flex;gap:7px;overflow-x:auto;scrollbar-width:none;padding:7px 0 4px;margin:0 0 5px;border-bottom:1px solid rgba(112,66,154,.08)}
    .vd-menu::-webkit-scrollbar{display:none}
    .vd-menu button{flex:0 0 auto;display:flex;align-items:center;gap:5px;padding:8px 11px;border:1px solid rgba(112,66,154,.10);border-radius:12px;background:rgba(255,255,255,.92);color:#6f6374;font:700 9px/1 system-ui,sans-serif;box-shadow:0 4px 12px rgba(83,48,104,.05);white-space:nowrap}
    .vd-menu button.active{background:#70429a;color:#fff;border-color:#70429a}
    .vd-menu button:active{transform:scale(.97)}
    .header{padding-bottom:5px!important}
    .home-hero{margin-top:6px!important}
    .section-title{padding-top:11px!important;padding-bottom:7px!important}
    .product-grid{gap:11px!important}
    .product-row{gap:10px!important}
    .category-grid{gap:10px!important}
    .category-tile{height:124px!important}
    .profile-page,.scroll-page{padding-bottom:94px!important}
    .bottom-nav{left:9px!important;right:9px!important;bottom:7px!important;height:66px!important;border-radius:18px!important;box-shadow:0 10px 26px rgba(66,40,80,.14)!important}
    .cart-item{margin-bottom:9px!important}
    .cart-total{margin-top:10px!important}
    @media(max-width:360px){.vd-menu{gap:5px}.vd-menu button{padding:7px 9px;font-size:8px}}
  `
  document.head.appendChild(style)
  function mountMenu() {
    document.querySelectorAll('.header').forEach(header => {
      if (header.querySelector('.vd-menu')) return
      const menu = document.createElement('nav')
      menu.className = 'vd-menu'
      menu.setAttribute('aria-label','Menú principal')
      Object.entries(labels).forEach(([route,[label]]) => {
        const b = document.createElement('button')
        b.type = 'button'
        b.textContent = label
        b.dataset.route = route
        b.addEventListener('click', () => routeByExistingButton(route))
        menu.appendChild(b)
      })
      header.appendChild(menu)
    })
    const current = document.querySelector('.bottom-nav button.active')?.textContent?.trim().toLowerCase() || ''
    document.querySelectorAll('.vd-menu button').forEach(b => b.classList.toggle('active',b.textContent.trim().toLowerCase()===current))
  }
  window.addEventListener('load', () => setTimeout(mountMenu, 250))
  new MutationObserver(() => mountMenu()).observe(document.documentElement,{childList:true,subtree:true})
  mountMenu()
})()
