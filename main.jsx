import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles.css'
import { hydrateVaniDaxi, startVaniDaxiSync } from './api.js'

async function bootstrap() {
  await hydrateVaniDaxi()
  startVaniDaxiSync()
  createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>)
}

bootstrap()
