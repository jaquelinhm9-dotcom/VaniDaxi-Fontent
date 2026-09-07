/* VaniDaxi — compatibilidad y saneamiento del cliente */
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
  // En navegadores sin Web Share API, copia el texto al portapapeles.
  try {
    if (!navigator.share) {
      Object.defineProperty(navigator, 'share', {
        configurable: true,
        value: ({ title = 'VaniDaxi', text = '' } = {}) => {
          const value = text || title
          if (navigator.clipboard?.writeText) {
            return navigator.clipboard.writeText(value)
          }
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
})()
