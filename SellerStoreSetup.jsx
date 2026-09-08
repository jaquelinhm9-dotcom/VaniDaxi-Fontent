import React, { useState } from 'react'
import { AlertCircle, ArrowLeft, Save, Store } from 'lucide-react'
import { saveMySellerStore } from './commercialApi.js'
import './seller-dashboard.css'

export default function SellerStoreSetup({ onDone, onBack }) {
  const [form, setForm] = useState({
    store_name: '',
    description: '',
    logo_url: '',
    banner_url: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  const submit = async (event) => {
    event.preventDefault()
    setError('')

    if (!form.store_name.trim()) {
      setError('El nombre de la tienda es obligatorio.')
      return
    }

    setSaving(true)
    try {
      await saveMySellerStore(form)
      onDone?.()
    } catch (saveError) {
      setError(saveError?.message || 'No se pudo guardar la tienda.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="scroll-page seller-dashboard">
      <header className="seller-top">
        <button className="icon-btn" onClick={onBack} aria-label="Volver">
          <ArrowLeft size={18} />
        </button>
        <div>
          <span>VaniDaxi · Vendedor</span>
          <h1>Configura tu tienda</h1>
        </div>
      </header>

      <section className="seller-module">
        <div className="seller-module-title">
          <Store size={19} />
          <div>
            <span>Primer paso</span>
            <h2>Crea tu tienda de vendedor</h2>
          </div>
        </div>

        <p className="seller-note">
          Completa los datos básicos. La tienda quedará pendiente de aprobación administrativa antes de publicar productos.
        </p>

        {error && (
          <div className="seller-toast">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        <form className="seller-modal seller-setup-form" onSubmit={submit}>
          <label className="seller-field">
            <span>Nombre de la tienda</span>
            <input
              value={form.store_name}
              onChange={(event) => update('store_name', event.target.value)}
              maxLength={120}
              required
              autoFocus
            />
          </label>

          <label className="seller-field">
            <span>Descripción</span>
            <textarea
              value={form.description}
              onChange={(event) => update('description', event.target.value)}
              maxLength={2000}
              rows={5}
            />
          </label>

          <label className="seller-field">
            <span>Logo URL (opcional)</span>
            <input
              type="url"
              value={form.logo_url}
              onChange={(event) => update('logo_url', event.target.value)}
            />
          </label>

          <label className="seller-field">
            <span>Banner URL (opcional)</span>
            <input
              type="url"
              value={form.banner_url}
              onChange={(event) => update('banner_url', event.target.value)}
            />
          </label>

          <button className="seller-primary" type="submit" disabled={saving}>
            <Save size={14} />
            {saving ? 'Guardando…' : 'Guardar y enviar a revisión'}
          </button>
        </form>
      </section>
    </main>
  )
}
