'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/authContext'
import { enviarJson, obtenerUno } from '@/app/lib/api'
import { ETIQUETAS_PERFIL, obtenerPerfil } from '@/app/lib/perfiles'

export default function Header({ onMenu }) {
  const { user, token, logout } = useAuth()
  const router = useRouter()
  const perfil = obtenerPerfil(user)
  const [sinLeer, setSinLeer] = useState(0)

  useEffect(() => {
    if (!token) return

    let activo = true

    const consultar = async () => {
      try {
        const datos = await obtenerUno('/api/notifications?per_page=1', token)
        if (activo) setSinLeer(Number(datos.unread_count ?? 0))
      } catch {
        // El contador vuelve a intentar en el próximo ciclo.
      }
    }

    consultar()
    const intervalo = window.setInterval(consultar, 30000)

    return () => {
      activo = false
      window.clearInterval(intervalo)
    }
  }, [token])

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
          <Link
            href="/notificacion"
            className="btn btn-light position-relative"
            aria-label={sinLeer > 0 ? `${sinLeer} notificaciones sin leer` : 'Notificaciones'}
            title="Notificaciones"
          >
            <span
              aria-hidden="true"
              className="d-inline-flex align-items-center justify-content-center user-select-none"
              style={{ lineHeight: 0 }}
            >
              <img
                src="./campana-azul-64.png"
                alt=""
                width={16}
                height={16}
                className="d-block"
              />
            </span>
            {sinLeer > 0 && (
              <span
                className="position-absolute top-0 start-100 translate-middle badge rounded-pill text-bg-danger"
                style={{ fontSize: '.65rem' }}
              >
                {sinLeer > 99 ? '99+' : sinLeer}
              </span>
            )}
          </Link>
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
