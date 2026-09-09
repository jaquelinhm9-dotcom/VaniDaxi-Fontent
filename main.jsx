import React from'react'
import{createRoot}from'react-dom/client'
import VaniDaxiShell from'./VaniDaxiShell.jsx'
import'./vanidaxi-new.css'
import'./responsive-fixes.css'
import'./accountEnhancer.js'
import'./profileEnhancer.js'
import'./seller-customer-enhancer.js'
import'./admin-returns-enhancer.js'
const root=document.getElementById('root')
if(!root)throw new Error('No se encontró #root')
createRoot(root).render(<React.StrictMode><VaniDaxiShell/></React.StrictMode>)
