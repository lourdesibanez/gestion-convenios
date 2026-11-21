'use client'
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/app/context/authContext'
import { obtenerPerfil } from '../../../model/dashboardModel'
import '../../css/headerfooter.css'

const itemsComunes = [
  { href: '/dashboard', label: 'Dashboard', exacto: true },
  { href: '/convenios', label: 'Ver convenios' },
]

const itemsPorPerfil = {
  administrador: [
    { href: '/vencimientos', label: 'Vencimientos' },
    { href: '/partes', label: 'Partes y personas' },
  ],
  gestion: [
    { href: '/vencimientos', label: 'Vencimientos' },
    { href: '/partes', label: 'Partes y personas' },
  ],
  revision: [],
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

function normalizarClavePerfil(perfil) {
  console.log()
  const valor = String(perfil.tipo_perfil ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

  if (['admin', 'administrador', 'administracion'].includes(valor)) {
    return 'administrador'
  }

  if (['gestion', 'gestor'].includes(valor)) {
    return 'gestion'
  }

  if (['revision', 'revisor'].includes(valor)) {
    return 'revision'
  }

  if (valor === 'consulta') {
    return 'consulta'
  }

  return 'desconocido'
}


export default function Sidebar({ abierto, onCerrar }) {
  const { user, token } = useAuth();

  const [perfilOriginal, setPerfilOriginal] = useState(null);

  useEffect(() => {
    async function cargarPerfil() {
      try {
        const resultado = await obtenerPerfil(token);
        setPerfilOriginal(resultado);
      } catch (error) {
        console.error('Error al obtener perfil:', error);
      }
    }

    if (user?.id && token) {
      cargarPerfil();
    }
  }, [user, token]);

  if (!user?.id || !token) {
    return null;
  }
  
  const perfil = perfilOriginal
    ? normalizarClavePerfil(perfilOriginal)
    : 'desconocido';

  const items = [
    ...itemsComunes,
    ...(itemsPorPerfil[perfil] ?? itemsPorPerfil.desconocido),
  ];

  return (
    <aside className={`barra-lateral ${abierto ? 'barra-lateral-abierta' : ''}`}>
      <div className="barra-lateral-logo">
        <img src="/Logo.png" alt="Logo UNLPam" className="Logo" />
      </div>

      <nav
        className="barra-lateral-contenido"
        aria-label="Navegación principal"
      >
        <div className="px-3 pt-3 pb-1 text-uppercase text-muted small">
          Navegación
        </div>

        <Suspense
          fallback={
            <Lista
              pathname=""
              onCerrar={onCerrar}
              items={items}
            />
          }
        >
          <ListaConResaltado
            onCerrar={onCerrar}
            items={items}
          />
        </Suspense>
      </nav>

      <div className="px-3 py-3 mt-auto border-top small text-muted">
        <div>Acceso interno</div>
        <strong className="text-body">
          UNLPam · Gestión de Convenios
        </strong>
      </div>
    </aside>
  );
}