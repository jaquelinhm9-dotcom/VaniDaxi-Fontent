import React from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import './welcome-enhancer.css'
import './seller.css'
import { hydrateVaniDaxi, startVaniDaxiSync } from './api.js'
import { fetchCatalog, startCommercialSync } from './commercialApi.js'
import { observeWelcome } from './welcome-enhancer.js'
import SellerPortal from './SellerPortal.jsx'
import AdminPortal from './AdminPortal.jsx'
import App from './App.jsx'

function renderFatalError(error) {
  const root = document.getElementById('root')
  if (!root) return
  const message = error instanceof Error ? error.message : String(error || 'Error desconocido')
  root.innerHTML = `<main style="min-height:100vh;display:grid;place-items:center;padding:24px;font-family:system-ui,sans-serif;background:#faf7fc;color:#2a2030"><section style="max-width:520px;width:100%;background:#fff;border:1px solid #eadff0;border-radius:20px;padding:28px;box-shadow:0 12px 40px rgba(50,25,60,.08)"><div style="font-size:32px;margin-bottom:8px">VaniDaxi</div><h1 style="font-size:22px;margin:0 0 10px">No se pudo cargar la aplicación</h1><p style="line-height:1.55;margin:0 0 18px;color:#675c69">Se produjo un error al iniciar VaniDaxi. Intenta recargar la página.</p><button onclick="location.reload()" style="border:0;border-radius:12px;padding:11px 16px;background:#7b4aa8;color:#fff;font-weight:700;cursor:pointer">Recargar</button><details style="margin-top:18px"><summary style="cursor:pointer">Detalle técnico</summary><pre style="white-space:pre-wrap;word-break:break-word;font-size:12px;color:#756b77;margin-top:10px">${message.replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))}</pre></details></section></main>`
}

async function bootstrap() {
  try {
    await hydrateVaniDaxi()
    const catalog = await fetchCatalog().catch(() => ({ categories: [], products: [] }))
    window.__VANI_COMMERCIAL_CATALOG__ = catalog.products || []
    window.__VANI_COMMERCIAL_CATEGORIES__ = catalog.categories || []
    if (typeof App !== 'function') throw new Error('La aplicación no exporta un componente válido')
    startVaniDaxiSync()
    const root = document.getElementById('root')
    if (!root) throw new Error('No se encontró el contenedor #root')
    createRoot(root).render(
      <React.StrictMode>
        <AdminPortal>
          <SellerPortal>
            <App />
          </SellerPortal>
        </AdminPortal>
      </React.StrictMode>
    )
    observeWelcome()
    startCommercialSync(() => window.__VANI_COMMERCIAL_CATALOG__ || [])
  } catch (error) {
    console.error('[VaniDaxi] bootstrap failed:', error)
    renderFatalError(error)
  }
}

bootstrap()
