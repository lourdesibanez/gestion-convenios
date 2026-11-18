
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import { useAuth } from '@/app/context/authContext'

import {
  obtenerHome,
  obtenerPerfil,
  obtenerPendientesFirma,
} from '@/model/dashboardModel'

import Estadisticas from './Estadisticas'
import PendientesFirma from './PendientesFirma'
import RegistroGeneral from './RegistroGeneral'

export default function Dashboard() {
  const router = useRouter()
  const { token, isAuth, cargando: sesionCargando, logout } = useAuth()

  const [home, setHome] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [pendientes, setPendientes] = useState([])

  const [cargando, setCargando] = useState(true)
  const [cargandoPendientes, setCargandoPendientes] = useState(true)

  const [error, setError] = useState(null)
  const [errorPendientes, setErrorPendientes] = useState(false)

  useEffect(() => {
    if (sesionCargando) return

    if (!isAuth) {
      router.replace('/login')
      return
    }

    let cancelado = false

    async function cargarDashboard() {
      setCargando(true)
      setCargandoPendientes(true)
      setError(null)
      setErrorPendientes(false)

      const [resultadoHome, resultadoPerfil, resultadoPendientes] =
        await Promise.allSettled([
          obtenerHome(token),
          obtenerPerfil(token),
          obtenerPendientesFirma(token),
        ])

      if (cancelado) return

      // Datos generales
      if (resultadoHome.status === 'fulfilled') {
        setHome(resultadoHome.value?.data ?? resultadoHome.value)
      } else {
        setError('No se pudo cargar la información del dashboard.')

        if (resultadoHome.reason?.status === 401) {
          logout()
          router.replace('/login')
        }
      }

      // Perfil del usuario
      if (resultadoPerfil.status === 'fulfilled') {
        setPerfil(resultadoPerfil.value?.data ?? resultadoPerfil.value)
      } else if (resultadoPerfil.reason?.status === 401) {
        logout()
        router.replace('/login')
      }

      // Pendientes de firma
      if (resultadoPendientes.status === 'fulfilled') {
        const respuesta =
          resultadoPendientes.value?.data ?? resultadoPendientes.value

        const items = Array.isArray(respuesta)
          ? respuesta
          : respuesta?.data ?? []

        setPendientes(items)
      } else {
        setErrorPendientes(true)

        if (resultadoPendientes.reason?.status === 401) {
          logout()
          router.replace('/login')
        }
      }

      setCargando(false)
      setCargandoPendientes(false)
    }

    cargarDashboard()

    return () => {
      cancelado = true
    }
  }, [token, isAuth, sesionCargando, logout, router])

  if (sesionCargando || cargando) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status" />
        <span className="ms-3 text-muted small">
          Cargando dashboard...
        </span>
      </div>
    )
  }

  if (error && !home) {
    return (
      <div className="alert alert-danger">
        {error}
      </div>
    )
  }

  const usuario = home?.usuario ?? {}

  const tipoPerfil =
    perfil?.tipo_perfil ??
    (usuario.es_consulta ? 'consulta' : null)

  const esAdministracion = tipoPerfil === 'administracion'

  const movimientos = home?.ultimos_movimientos ?? []

  const nombre = perfil?.nombre ?? usuario.nombre ?? 'Usuario'

  const apellido =
    perfil?.apellido ?? usuario.apellido ?? ''

  return (
    <div className="container-fluid px-0">

      {/* Encabezado */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h1 className="h4 fw-bold mb-1">
            Panel de Convenios
          </h1>

          <p className="small text-muted mb-0">
            Visualización general de convenios autorizados.
          </p>
        </div>

        <div className="d-flex align-items-center gap-3">
          <div className="text-end">
            <div className="fw-semibold small">
              {nombre} {apellido}
            </div>

            <div className="text-muted small">
              {tipoPerfil ?? 'Perfil no identificado'}
            </div>
          </div>

          {esAdministracion && (
            <Link
              href="/convenios/nuevo"
              className="btn btn-primary btn-sm"
            >
              + Nuevo convenio
            </Link>
          )}
        </div>
      </div>

      {/* Estadísticas */}
      <Estadisticas resumen={home?.resumen} />

      {/* Pendientes de firma */}
      <PendientesFirma
        items={pendientes}
        cargando={cargandoPendientes}
        error={errorPendientes}
      />

      {/* Registro general */}
      <RegistroGeneral movimientos={movimientos} />

    </div>
  )
}
