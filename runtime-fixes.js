/* VaniDaxi — compatibilidad y navegación real con historial Android/PWA */
(() => {
  try {
    const key = 'vanidaxi-address'
    const raw = localStorage.getItem(key)
    if (!raw) {
      localStorage.setItem(key, JSON.stringify({ name: 'Mi cuenta', street: '', city: '', zip: '' }))
    } else {
      const data = JSON.parse(raw)
      if (data && typeof data === 'object') {
        data.name = 'Mi cuenta'
        localStorage.setItem(key, JSON.stringify(data))
      }
    }
  } catch (_) {}

  // El botón de compartir del detalle siempre devuelve una Promise.
  try {
    if (!navigator.share) {
      Object.defineProperty(navigator, 'share', {
        configurable: true,
        value: ({ title = 'VaniDaxi', text = '' } = {}) => {
          const value = text || title
          if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(value)
          const area = document.createElement('textarea')
          area.value = value
          area.setAttribute('readonly', '')
          area.style.position = 'fixed'
          area.style.opacity = '0'
          document.body.appendChild(area)
          area.select()
          try { document.execCommand('copy') } finally { area.remove() }
          return Promise.resolve()
        },
      })
    }
  } catch (_) {}

  /*
   * Navegación SPA para Android/PWA.
   *
   * App.jsx usa estado interno para cambiar de pantalla, por lo que esas
   * transiciones no entraban en el historial del navegador. Aquí convertimos
   * las navegaciones visibles en entradas reales de History API y restauramos
   * la pantalla correspondiente al pulsar el botón físico Atrás.
   *
   * Importante: NO se crea un bucle que fuerce Inicio. La primera entrada es
   * Inicio y cada navegación añade una entrada nueva. Al volver a Inicio y
   * pulsar Atrás otra vez, ya no hay una entrada VaniDaxi que consumir y
   * Android puede cerrar la PWA normalmente.
   */
  try {
    const productNames = new Set([
      'Tenis casuales', 'Smartwatch', 'Mochila urbana', 'Audífonos inalámbricos',
      'Playera básica', 'Tenis deportivos', 'Gorra casual', 'Reloj de lujo',
      'Sudadera oversize', 'Tenis blancos', 'Camisa básica', 'Lámpara LED',
      'Vestido satinado', 'Set de skincare', 'Mancuernas fitness',
    ])
    const categoryNames = new Set([
      'Moda', 'Hombre', 'Mujer', 'Tecnología', 'Hogar', 'Calzado',
      'Ropa', 'Belleza', 'Deportes', 'Accesorios',
    ])

    let current = history.state?.vanidaxi || { screen: 'home' }
    let suppress = false

    history.replaceState(current, '', location.href)

    const textOf = el => (el?.getAttribute?.('aria-label') || el?.textContent || '').trim().replace(/\s+/g, ' ')
    const findByText = text => {
      const wanted = String(text).trim().toLowerCase()
      return [...document.querySelectorAll('button, a')].find(el => textOf(el).toLowerCase() === wanted)
    }
    const clickText = text => {
      const el = findByText(text)
      if (!el) return false
      suppress = true
      el.click()
      setTimeout(() => { suppress = false }, 80)
      return true
    }

    const inferNavigation = el => {
      const label = textOf(el)
      const lower = label.toLowerCase()
      const screen = current.screen

      if (lower === 'inicio' || lower === 'vanidaxi inicio') return { screen: 'home' }
      if (lower === 'categorías') return { screen: 'categories' }
      if (lower === 'favoritos') return { screen: 'favorites' }
      if (lower === 'carrito') return { screen: 'cart' }
      if (lower.includes('notificaciones y cuenta')) return { screen: 'profile' }
      if (lower === 'ofertas') return { screen: 'offers' }
      if (lower === 'volver') return { screen: 'back' }

      if (screen === 'categories' && categoryNames.has(label)) {
        return { screen: 'products', category: label }
      }

      if (screen === 'products' && productNames.has(label)) {
        return { screen: 'detail', productName: label, category: current.category || 'Todos' }
      }

      if (screen === 'cart' && productNames.has(label)) {
        return { screen: 'detail', productName: label, category: current.category || 'Todos' }
      }

      if (screen === 'home' && categoryNames.has(label)) {
        return { screen: 'products', category: label }
      }

      if (lower === 'continuar al pago' || lower === 'ir al pago' || lower === 'proceder al pago') {
        return { screen: 'checkout' }
      }

      if (lower.includes('confirmar pedido')) return { screen: 'orders' }

      return null
    }

    document.addEventListener('click', event => {
      if (suppress) return
      const el = event.target?.closest?.('button, a')
      if (!el) return
      const next = inferNavigation(el)
      if (!next) return

      // El botón visual "Volver" debe consumir la entrada anterior, no crear
      // otra entrada que salte directamente a Inicio.
      if (next.screen === 'back') {
        event.preventDefault()
        event.stopPropagation()
        history.back()
        return
      }

      const state = { vanidaxi: true, ...next }
      current = state
      history.pushState(state, '', location.href)
    }, true)

    const restore = state => {
      const target = state?.screen || 'home'
      const now = current?.screen || 'home'
      if (target === now) return

      if (target === 'home') return clickText('VaniDaxi inicio') || clickText('Inicio')
      if (target === 'categories') return clickText('Categorías')
      if (target === 'favorites') return clickText('Favoritos')
      if (target === 'cart') return clickText('Carrito')
      if (target === 'profile') return clickText('Notificaciones y cuenta')
      if (target === 'offers') return clickText('Ofertas')

      if (target === 'detail' && state.productName) {
        if (clickText(state.productName)) return true
        if (clickText('Volver')) {
          setTimeout(() => clickText(state.productName), 90)
          return true
        }
      }

      if (target === 'products') {
        if (now === 'categories' && state.category) return clickText(state.category)
        if (now === 'home' && state.category) return clickText(state.category)
        if (now === 'detail' && clickText('Volver')) {
          setTimeout(() => clickText(state.category || 'Moda'), 90)
          return true
        }
      }

      if (target === 'checkout') return clickText('Continuar al pago') || clickText('Ir al pago')
      if (target === 'orders') return clickText('Confirmar pedido')
    }

    window.addEventListener('popstate', event => {
      const state = event.state
      if (!state?.vanidaxi) return
      const previous = current
      current = state
      setTimeout(() => {
        try { restore(state) } catch (_) { current = previous }
      }, 0)
    })
  } catch (_) {}
})()
