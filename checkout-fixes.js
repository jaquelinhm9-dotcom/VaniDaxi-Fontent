/* VaniDaxi — selector de pago único para Checkout y Cuenta */
(() => {
  const KEY = 'vanidaxi-payment-method'
  const LEGACY_KEY = 'vanidaxi-payment'
  const METHODS = {
    Tarjeta: { icon: '💳', text: 'Serás enviado a Stripe Checkout para introducir los datos de tu tarjeta de forma segura. VaniDaxi no guarda los datos de la tarjeta.', button: 'Continuar a pago con tarjeta' },
    OXXO: { icon: '🧾', text: 'Serás enviado a Stripe Checkout para generar tu referencia de pago OXXO. Completarás el pago en un establecimiento OXXO.', button: 'Continuar a pago OXXO' },
    Transferencia: { icon: '🏦', text: 'Serás enviado a Stripe Checkout para seleccionar la opción de transferencia bancaria y completar las instrucciones de pago.', button: 'Continuar a transferencia' }
  }
  const normalize = value => { const v = String(value || '').trim().toLowerCase(); if (v.includes('oxxo')) return 'OXXO'; if (v.includes('transfer')) return 'Transferencia'; return 'Tarjeta' }
  const read = () => { try { const direct = localStorage.getItem(KEY); if (direct) return normalize(direct); const legacy = JSON.parse(localStorage.getItem(LEGACY_KEY) || 'null'); return normalize(legacy?.method) } catch (_) { return 'Tarjeta' } }
  const save = method => { const safe = normalize(method); try { localStorage.setItem(KEY, safe); localStorage.setItem(LEGACY_KEY, JSON.stringify({ method: safe, detail: '' })) } catch (_) {} return safe }

  function ensureStyle() {
    if (document.getElementById('vd-payment-style')) return
    const css = document.createElement('style'); css.id = 'vd-payment-style'
    css.textContent = `
      .vd-payment-list{display:grid;gap:10px;margin-top:14px}
      .vd-payment-option{display:grid;grid-template-columns:42px 1fr auto;grid-template-rows:auto auto;align-items:center;gap:2px 10px;width:100%;padding:13px 14px;border:1px solid #e7ddea;border-radius:17px;background:#fff;color:#2d2633;text-align:left;cursor:pointer;transition:.18s ease}
      .vd-payment-option>span{grid-row:1/3;width:42px;height:42px;border-radius:13px;background:#f2e8f8;display:grid;place-items:center;font-size:19px}
      .vd-payment-option>strong{font-size:14px}.vd-payment-option>small{font-size:11px;color:#756a7c;line-height:1.35}.vd-payment-option>b{grid-column:3;grid-row:1/3;color:#70429a;font-size:17px}
      .vd-payment-option.active{border-color:#70429a;background:#f8f2fb;box-shadow:0 0 0 2px rgba(112,66,154,.08)}
      .checkout-page .payment-options{display:grid;gap:10px}
    `
    document.head.appendChild(css)
  }

  function renderOptions(container, selected, onSelect) {
    container.innerHTML = Object.keys(METHODS).map(method => `
      <button type="button" class="vd-payment-option ${method === selected ? 'active' : ''}" data-vd-method="${method}">
        <span>${METHODS[method].icon}</span>
        <strong>${method === 'Transferencia' ? 'Transferencia bancaria' : method}</strong>
        <small>${method === 'Tarjeta' ? 'Pago seguro mediante Stripe Checkout.' : method === 'OXXO' ? 'Genera tu referencia de pago mediante Stripe.' : 'Completa las instrucciones de pago mediante Stripe.'}</small>
        <b>${method === selected ? '✓' : ''}</b>
      </button>`).join('')
    container.querySelectorAll('[data-vd-method]').forEach(button => button.addEventListener('click', () => onSelect(button.dataset.vdMethod)))
  }

  function enhanceCheckout() {
    const page = document.querySelector('.checkout-page'); if (!page) return
    const sections = [...page.querySelectorAll('.checkout-section')]
    const paymentSection = sections.find(section => /Método de pago/i.test(section.textContent || ''))
    const options = paymentSection?.querySelector('.payment-options'); if (!paymentSection || !options || options.dataset.vdBound === '1') return
    options.dataset.vdBound = '1'
    let selected = read()
    const note = paymentSection.querySelector(':scope > small')
    const submit = page.querySelector('.checkout-summary button:not([disabled])') || page.querySelector('.checkout-summary button')
    const refresh = () => {
      renderOptions(options, selected, method => { selected = save(method); refresh() })
      if (note) note.textContent = METHODS[selected].text
      if (submit) submit.textContent = METHODS[selected].button
    }
    refresh()
  }

  function enhanceAccountPayment() {
    const modal = [...document.querySelectorAll('.account-modal')].find(m => /Métodos de pago/i.test(m.querySelector('.modal-head h2')?.textContent || ''))
    if (!modal) return
    const body = modal.querySelector('.modal-body'); if (!body || body.dataset.vdBound === '1') return
    body.dataset.vdBound = '1'
    let selected = read()
    body.innerHTML = `
      <div class="saved-payment" style="display:flex;align-items:center;gap:12px"><div data-vd-icon style="width:42px;height:42px;border-radius:13px;background:#f2e8f8;display:grid;place-items:center;font-size:19px">${METHODS[selected].icon}</div><div><b>Formas de pago</b><small style="display:block;color:#756a7c;margin-top:3px">La misma forma se utilizará al iniciar tu próximo pago.</small></div></div>
      <div class="vd-payment-list" data-vd-account-options></div>
      <p data-vd-note style="margin:12px 0 0;font-size:11px;color:#756a7c;line-height:1.45">${METHODS[selected].text}</p>
      <button class="modal-primary" data-vd-save style="margin-top:8px">Guardar forma de pago</button>
    `
    const options = body.querySelector('[data-vd-account-options]'), note = body.querySelector('[data-vd-note]'), icon = body.querySelector('[data-vd-icon]')
    const refresh = () => { renderOptions(options, selected, method => { selected = save(method); refresh() }); if (note) note.textContent = METHODS[selected].text; if (icon) icon.textContent = METHODS[selected].icon }
    refresh()
    body.querySelector('[data-vd-save]')?.addEventListener('click', () => { save(selected); let notice = body.querySelector('.vd-payment-success'); if (!notice) { notice = document.createElement('div'); notice.className = 'vd-payment-success'; notice.style.cssText = 'margin-top:10px;font-size:12px;color:#70429a;font-weight:700'; body.appendChild(notice) } notice.textContent = 'Forma de pago guardada correctamente.' })
  }

  function run() { ensureStyle(); enhanceCheckout(); enhanceAccountPayment() }
  window.addEventListener('load', () => setTimeout(run, 700))
  new MutationObserver(run).observe(document.documentElement, { childList: true, subtree: true })
  run()
})()
