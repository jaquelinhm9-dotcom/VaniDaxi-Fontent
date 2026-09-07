/* VaniDaxi — compatibilidad, navegación atrás y saneamiento del cliente */
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

  // Android/PWA: el botón físico de atrás no debe cerrar VaniDaxi al estar
  // dentro de una pantalla de la app. Volvemos a Inicio mediante la navegación
  // visible de React y dejamos una entrada centinela en el historial.
  try {
    const base = '/VaniDaxi-Fontent/'
    if (location.pathname === base || location.pathname === `${base}index.html`) {
      history.replaceState({ vanidaxi: true }, '', base)
      history.pushState({ vanidaxi: true }, '', base)

      let handling = false
      window.addEventListener('popstate', () => {
        if (handling) return
        handling = true
        history.pushState({ vanidaxi: true }, '', base)

        setTimeout(() => {
          const buttons = [...document.querySelectorAll('button, a')]
          const home = buttons.find(el => {
            const text = (el.getAttribute('aria-label') || el.textContent || '').trim().toLowerCase()
            return text === 'inicio' || text.includes('inicio')
          })
          if (home) home.click()
          handling = false
        }, 0)
      })
    }
  } catch (_) {}
})()
