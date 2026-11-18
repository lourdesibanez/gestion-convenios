
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import { useAuth } from '@/app/context/authContext'
import './privado.css'

export default function PrivadoLayout({ children }) {
  const router = useRouter()
  const { isAuth, cargando } = useAuth()
  const [menuAbierto, setMenuAbierto] = useState(false)

  useEffect(() => {
    if (!cargando && !isAuth) {
      router.replace('/login')
    }
  }, [cargando, isAuth, router])

  return (
    <>
      <div className="bloque-dashboard">
        {menuAbierto && (
          <button
            type="button"
            className="fondo-menu"
            aria-label="Cerrar menú"
            onClick={() => setMenuAbierto(false)}
          />
        )}

        <Sidebar
          abierto={menuAbierto}
          onCerrar={() => setMenuAbierto(false)}
        />

        <div className="columna-principal">
          <Header onMenu={() => setMenuAbierto(true)} />

          <main
            className="contenido"
            style={{
              visibility: cargando || !isAuth ? 'hidden' : 'visible',
            }}
          >
            {children}
          </main>
        </div>
      </div>

      {(cargando || !isAuth) && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-white d-flex align-items-center justify-content-center"
          style={{ zIndex: 2000 }}
        >
          <span className="text-muted small">
            {cargando
              ? 'Verificando sesión...'
              : 'Redirigiendo al inicio de sesión...'}
          </span>
        </div>
      )}
    </>
  )
}
