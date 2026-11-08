'use client'
import { useState } from 'react'
import Sidebar from '../components/SideBar'
import Header from '../components/Header'

export default function AdminLayout({ children }) {
  const [menuAbierto, setMenuAbierto] = useState(false)

  return (
    <div className="bloque-dashboard">
      {menuAbierto && (
        <div className="fondo-menu" onClick={() => setMenuAbierto(false)} />
      )}
      <Sidebar abierto={menuAbierto} onCerrar={() => setMenuAbierto(false)} />

      <div className="columna-principal">
        <Header admin onMenu={() => setMenuAbierto(true)} />
        <main className="contenido">{children}</main>
      </div>
    </div>
  )
}