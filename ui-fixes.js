/* VaniDaxi — navegación y compactación montadas después del render de React. */
export function mountVaniDaxiUi(){
  const root=document.getElementById('root')
  if(!root)return

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

  document.querySelectorAll('.bottom-nav').forEach(nav=>{
    nav.classList.add('vd-bottom-nav-ready')
    nav.querySelectorAll('button').forEach(button=>{
      const text=(button.textContent||'').trim().toLowerCase()
      if(text.includes('carrito'))button.classList.add('vd-cart-action')
      if(text.includes('perfil'))button.classList.add('vd-profile-action')
    })
  })

  document.querySelectorAll('.scroll-page').forEach(page=>page.classList.add('vd-compact-page'))
  document.querySelectorAll('.product-grid,.product-row,.icon-categories,.mini-category-grid').forEach(el=>el.classList.add('vd-compact-grid'))
}

function activateRoute(route){
  if(route==='cart'){
    const button=findBottomButton('carrito')
    if(button){button.click();return}
  }
  const labels={home:'inicio',offers:'ofertas',categories:'categorías',favorites:'favoritos',profile:'perfil'}
  const target=labels[route]
  if(target){
    const button=findBottomButton(target)
    if(button){button.click();return}
  }
}

function findBottomButton(label){
  return [...document.querySelectorAll('.bottom-nav button')].find(button=>(button.textContent||'').trim().toLowerCase().includes(label))||null
}

function syncMenuState(menu){
  const active=(document.querySelector('.bottom-nav button.active')?.textContent||'').trim().toLowerCase()
  menu.querySelectorAll('button').forEach(button=>{
    const label=(button.textContent||'').trim().toLowerCase()
    button.classList.toggle('active',Boolean(active&&label.includes(active.split(' ')[0])))
  })
}
