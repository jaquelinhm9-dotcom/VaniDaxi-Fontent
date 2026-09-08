import React from'react'
import{createRoot}from'react-dom/client'
import App from'./App.jsx'
import SellerPortal from'./SellerPortal.jsx'
import AdminPortal from'./AdminPortal.jsx'
import'./vanidaxi-new.css'
const root=document.getElementById('root')
if(!root)throw new Error('No se encontró #root')
createRoot(root).render(<React.StrictMode><AdminPortal><SellerPortal><App/></SellerPortal></AdminPortal></React.StrictMode>)
