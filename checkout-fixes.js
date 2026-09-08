/* VaniDaxi — selector de pago único para Checkout */
(() => {
  const KEY = 'vanidaxi-payment-method'
  const LEGACY_KEY = 'vanidaxi-payment'
  const METHODS = {
    Tarjeta: {
      icon: '💳',
      text: 'Serás enviado a Stripe Checkout para introducir los datos de tu tarjeta de forma segura. VaniDaxi no guarda los datos de la tarjeta.',
      button: 'Continuar a pago con tarjeta'
    },
    OXXO: {
      icon: '🧾',
      text: 'Serás enviado a Stripe Checkout para generar tu referencia de pago OXXO. Completarás el pago en un establecimiento OXXO.',
      button: 'Continuar a pago OXXO'
    },
    Transferencia: {
      icon: '🏦',
      text: 'Serás enviado a Stripe Checkout para seleccionar la opción de transferencia bancaria y completar las instrucciones de pago.',
      button: 'Continuar a transferencia'
    }
  }

  const normalize = value => {
    const v = String(value || '').trim().toLowerCase()
    if (v.includes('oxxo')) return 'OXXO'
    if (v.includes('transfer')) return 'Transferencia'
    return 'Tarjeta'
  }

  const read = () => {
    try {
      const direct = localStorage.getItem(KEY)
      if (direct) return normalize(direct)
      const legacy = JSON.parse(localStorage.getItem(LEGACY_KEY) || 'null')
      return normalize(legacy?.method)
    } catch (_) {
      return 'Tarjeta'
    }
  }

  const save = method => {
    const safe = normalize(method)
    try {
      localStorage.setItem(KEY, safe)
      localStorage.setItem(LEGACY_KEY, JSON.stringify({ method: safe, detail: '' }))
    } catch (_) {}
    return safe
  }

  const findCheckout = () => document.querySelector('.checkout-page')

  function enhanceCheckout() {
    const page = findCheckout()
    if (!page) return

    const sections = [...page.querySelectorAll('.checkout-section')]
    const paymentSection = sections.find(section => /Método de pago/i.test(section.textContent || ''))
    if (!paymentSection) return

    const options = paymentSection.querySelector('.payment-options')
    if (!options) return

    let selected = read()
    options.dataset.vdPaymentReady = '1'
    options.innerHTML = `
      <button type="button" class="vd-checkout-pay ${selected === 'Tarjeta' ? 'active' : ''}" data-vd-method="Tarjeta"><span>💳</span><strong>Tarjeta</strong><small>Pago seguro mediante Stripe Checkout.</small><b>${selected === 'Tarjeta' ? '✓' : ''}</b></button>
      <button type="button" class="vd-checkout-pay ${selected === 'OXXO' ? 'active' : ''}" data-vd-method="OXXO"><span>🧾</span><strong>OXXO</strong><small>Genera tu referencia de pago mediante Stripe.</small><b>${selected === 'OXXO' ? '✓' : ''}</b></button>
      <button type="button" class="vd-checkout-pay ${selected === 'Transferencia' ? 'active' : ''}" data-vd-method="Transferencia"><span>🏦</span><strong>Transferencia bancaria</strong><small>Completa las instrucciones de pago mediante Stripe.</small><b>${selected === 'Transferencia' ? '✓' : ''}</b></button>
    `

    const note = paymentSection.querySelector(':scope > small')
    if (note) note.textContent = METHODS[selected].text

    const submit = page.querySelector('.checkout-summary button:not([disabled])') || page.querySelector('.checkout-summary button')
    if (submit) submit.textContent = METHODS[selected].button

    options.querySelectorAll('[data-vd-method]').forEach(button => {
      button.addEventListener('click', () => {
        selected = save(button.dataset.vdMethod)
        options.querySelectorAll('[data-vd-method]').forEach(item => {
          const active = normalize(item.dataset.vdMethod) === selected
          item.classList.toggle('active', active)
          const check = item.querySelector('b')
          if (check) check.textContent = active ? '✓' : ''
        })
        if (note) note.textContent = METHODS[selected].text
        if (submit) submit.textContent = METHODS[selected].button
      })
    })
  }

  function style() {
    if (document.getElementById('vd-checkout-payment-style')) return
    const css = document.createElement('style')
    css.id = 'vd-checkout-payment-style'
    css.textContent = `
      .checkout-page .payment-options{display:grid;gap:10px}
      .checkout-page .vd-checkout-pay{display:grid;grid-template-columns:42px 1fr auto;grid-template-rows:auto auto;align-items:center;gap:2px 10px;width:100%;padding:13px 14px;border:1px solid #e7ddea;border-radius:17px;background:#fff;color:#2d2633;text-align:left;cursor:pointer;transition:.18s ease}
      .checkout-page .vd-checkout-pay>span{grid-row:1/3;width:42px;height:42px;border-radius:13px;background:#f2e8f8;display:grid;place-items:center;font-size:19px}
      .checkout-page .vd-checkout-pay>strong{font-size:14px}
      .checkout-page .vd-checkout-pay>small{font-size:11px;color:#756a7c;line-height:1.35}
      .checkout-page .vd-checkout-pay>b{grid-column:3;grid-row:1/3;color:#70429a;font-size:17px}
      .checkout-page .vd-checkout-pay.active{border-color:#70429a;background:#f8f2fb;box-shadow:0 0 0 2px rgba(112,66,154,.08)}
    `
    document.head.appendChild(css)
  }

  const run = () => {
    style()
    enhanceCheckout()
  }

  window.addEventListener('load', () => setTimeout(run, 700))
  new MutationObserver(() => enhanceCheckout()).observe(document.documentElement, { childList: true, subtree: true })
  run()
})()
