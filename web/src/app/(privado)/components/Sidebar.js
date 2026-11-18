'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/app/context/authContext'
import { obtenerPerfil } from '@/app/lib/perfiles'
import '../../css/headerfooter.css'

const itemsComunes = [
  { href: '/dashboard', label: 'Dashboard', exacto: true },
  { href: '/convenios', label: 'Ver convenios' },
  { href: '/notificaciones', label: 'Notificaciones' },
]

const itemsPorPerfil = {
  administrador: [
    { href: '/revision', label: 'Revisión' },
    { href: '/vencimientos', label: 'Vencimientos' },
    { href: '/partes', label: 'Partes y personas' },
  ],
  gestion: [
    { href: '/vencimientos', label: 'Vencimientos' },
    { href: '/partes', label: 'Partes y personas' },
  ],
  revision: [
    { href: '/revision', label: 'Bandeja de revisión' },
  ],
  consulta: [],
  desconocido: [],
}

function Lista({ pathname, onCerrar, items }) {
  return (
    <ul>
      {items.map((item) => {
        const activo = item.exacto
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`)

        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onCerrar}
              className={activo ? 'activo' : ''}
              aria-current={activo ? 'page' : undefined}
            >
              {item.label}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

function ListaConResaltado({ onCerrar, items }) {
  const pathname = usePathname()
  return <Lista pathname={pathname} onCerrar={onCerrar} items={items} />
}

export default function Sidebar({ abierto, onCerrar }) {
  const { user } = useAuth()
  const perfil = obtenerPerfil(user)
  const items = [
  { href: '/dashboard', label: 'Dashboard', exacto: true },
  { href: '/convenios', label: 'Ver convenios' },
  { href: '/revision', label: 'Revisión' },
  { href: '/vencimientos', label: 'Vencimientos' },
  { href: '/partes', label: 'Partes y Personas' },
]

  return (
    <aside className={`barra-lateral ${abierto ? 'barra-lateral-abierta' : ''}`}>
      <div className="barra-lateral-logo">
        <img src="/Logo.png" alt="Logo UNLPam" className="Logo" />
      </div>

      <nav className="barra-lateral-contenido" aria-label="Navegación principal">
        <div className="px-3 pt-3 pb-1 text-uppercase text-muted small">Navegación</div>
        <Suspense fallback={<Lista pathname="" onCerrar={onCerrar} items={items} />}>
          <ListaConResaltado onCerrar={onCerrar} items={items} />
        </Suspense>
      </nav>

      <div className="px-3 py-3 mt-auto border-top small text-muted">
        <div>Acceso interno</div>
        <strong className="text-body">UNLPam · Gestión de Convenios</strong>
      </div>
    </aside>
  )
}
