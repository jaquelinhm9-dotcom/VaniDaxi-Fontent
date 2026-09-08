import React from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import './welcome-enhancer.css'
import './seller.css'
import { hydrateVaniDaxi, startVaniDaxiSync } from './api.js'
import { fetchCatalog, startCommercialSync } from './commercialApi.js'
import { observeWelcome } from './welcome-enhancer.js'
import SellerPortal from './SellerPortal.jsx'

async function bootstrap() {
  await hydrateVaniDaxi()
  const catalog = await fetchCatalog().catch(() => ({ categories: [], products: [] }))
  window.__VANI_COMMERCIAL_CATALOG__ = catalog.products || []
  window.__VANI_COMMERCIAL_CATEGORIES__ = catalog.categories || []
  const module = await import('./AppFixed.jsx')
  const App = module.default
  startVaniDaxiSync()
  createRoot(document.getElementById('root')).render(<React.StrictMode><SellerPortal><App /></SellerPortal></React.StrictMode>)
  observeWelcome()
  startCommercialSync(() => window.__VANI_COMMERCIAL_CATALOG__ || [])
}

bootstrap()
