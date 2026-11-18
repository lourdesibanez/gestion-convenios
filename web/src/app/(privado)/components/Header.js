'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/authContext'
import { enviarJson } from '@/app/lib/api'
import { ETIQUETAS_PERFIL, obtenerPerfil } from '@/app/lib/perfiles'

export default function Header({ onMenu }) {
  const { user, token, logout } = useAuth()
  const router = useRouter()
  const perfil = obtenerPerfil(user)

  const salir = async () => {
    try {
      await enviarJson('/api/auth/logout', {}, token)
    } catch {
      // Aunque falle la invalidación remota, se limpia la sesión local.
    }
    logout()
    router.replace('/login')
  }

  const nombre = [user?.nombre, user?.apellido].filter(Boolean).join(' ') || user?.name || 'Usuario'

  return (
    <header className="header">
      <button
        type="button"
        className="boton-hamburguesa"
        aria-label="Abrir menú"
        onClick={onMenu}
      >
        ☰
      </button>

      <div className="header-contenido">
        <h3 className="header-titulo">Gestión de Convenios</h3>
        <div className="header-opciones d-flex align-items-center gap-2">
          <div className="text-end d-none d-sm-block">
            <div className="small fw-semibold">{nombre}</div>
            <div className="text-muted" style={{ fontSize: '.65rem' }}>
              {ETIQUETAS_PERFIL[perfil]}
            </div>
          </div>
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={salir}>
            Cerrar sesión
          </button>
        </div>
      </div>
    </header>
  )
}
