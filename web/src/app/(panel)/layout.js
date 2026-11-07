'use client'
import { useState } from 'react'
import SideBar from '../components/SideBar'
import Header from '../components/Header'

export default function PanelLayout({ children }) {
  const [menuAbierto, setMenuAbierto] = useState(false)

  return (
    <div className="bloque-dashboard">
      {menuAbierto && (
        <div className="fondo-menu" onClick={() => setMenuAbierto(false)} />
      )}
      <SideBar abierto={menuAbierto} onCerrar={() => setMenuAbierto(false)} />

      <div className="columna-principal">
        <Header onMenu={() => setMenuAbierto(true)} />
        <main className="contenido">{children}</main>
      </div>
    </div>
  )
}