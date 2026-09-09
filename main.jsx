import React from'react'
import{createRoot}from'react-dom/client'
import VaniDaxiShell from'./VaniDaxiShell.jsx'
import'./vanidaxi-new.css'
const root=document.getElementById('root')
if(!root)throw new Error('No se encontró #root')
createRoot(root).render(<React.StrictMode><VaniDaxiShell/></React.StrictMode>)
