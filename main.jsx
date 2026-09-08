import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './AppFixed.jsx'
import './styles.css'
import './welcome-enhancer.css'
import { hydrateVaniDaxi, startVaniDaxiSync } from './api.js'
import { fetchCatalog, startCommercialSync } from './commercialApi.js'
import { observeWelcome } from './welcome-enhancer.js'

async function bootstrap() {
  await hydrateVaniDaxi()
  const catalog = await fetchCatalog().catch(() => ({ categories: [], products: [] }))
  window.__VANI_COMMERCIAL_CATALOG__ = catalog.products || []
  startVaniDaxiSync()
  createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>)
  observeWelcome()
  startCommercialSync(() => window.__VANI_COMMERCIAL_CATALOG__ || [])
}

bootstrap()
