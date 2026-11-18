'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { useAuth } from '@/app/context/authContext'
import { obtenerConvenioPrivado, subirDocumentoConvenio } from '@/model/convenioModel'

import LineaEstados from './LineaEstados'
import FichaConvenio from './FichaConvenio'
import PlazosCard from './PlazosCard'
import VinculosCard from './VinculosCard'
import DocumentosCard from './DocumentosCard'

import PartesTab from './tabs/PartesTab'
import PersonasTab from './tabs/PersonasTab'
import DocumentosTab from './tabs/DocumentosTab'
import HistorialTab from './tabs/HistorialTab'
import ObservacionesTab from './tabs/ObservacionesTab'

export default function DetalleConvenio({ id }) {
  const router = useRouter()

  const {
    token,
    isAuth,
    cargando: sesionCargando,
    logout,
  } = useAuth()

  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [pestania, setPestania] = useState('ficha')
  const [subiendoDocumento, setSubiendoDocumento] = useState(false)
  const [errorDocumento, setErrorDocumento] = useState(null)
  const [mensajeDocumento, setMensajeDocumento] = useState(null)

  // ---------- Cargar detalle privado ----------

  useEffect(() => {
    if (sesionCargando) return

    if (!isAuth || !token) {
      router.replace('/login')
      return
    }

    if (!id) {
      setError('No llegó el identificador del convenio.')
      setCargando(false)
      return
    }

    let activo = true

    async function cargarConvenio() {
      setCargando(true)
      setError(null)

      try {
        const info = await obtenerConvenioPrivado(token, id)

        if (!activo) return

        if (!info?.convenio) {
          setError('El convenio no existe o no está disponible.')
          return
        }

        setDatos(info)
      } catch (err) {
        if (!activo) return

        if (err.status === 401) {
          logout()
          router.replace('/login')
          return
        }

        if (err.status === 403) {
          setError('No tenés autorización para consultar este convenio.')
          return
        }

        setError(
          err.datos?.message ??
          'No se pudo cargar la información del convenio.'
        )
      } finally {
        if (activo) setCargando(false)
      }
    }

    cargarConvenio()

    return () => {
      activo = false
    }
  }, [id, token, isAuth, sesionCargando, logout, router])


  async function manejarSubidaDocumento(tipoDocumento, archivo) {
    if (!token || !id) return false

    setSubiendoDocumento(true)
    setErrorDocumento(null)
    setMensajeDocumento(null)

    try {
      await subirDocumentoConvenio(
        token,
        Number(id),
        tipoDocumento,
        archivo
      )

      setMensajeDocumento('Documento cargado correctamente.')

      // Actualizar el detalle para incorporar el archivo recién cargado.
      try {
        const infoActualizada = await obtenerConvenioPrivado(token, id)

        if (infoActualizada?.convenio) {
          setDatos(infoActualizada)
        } else {
          setErrorDocumento(
            'El documento se cargó, pero no se pudo actualizar la ficha.'
          )
        }
      } catch {
        setErrorDocumento(
          'El documento se cargó, pero no se pudo actualizar la lista. Recargá la página.'
        )
      }

      return true
    } catch (err) {
      if (err.status === 401) {
        logout()
        router.replace('/login')
        return false
      }

      if (err.status === 403) {
        setErrorDocumento(
          'No tenés autorización para subir documentos a este convenio.'
        )
        return false
      }

      if (err.status === 422) {
        const errores = err.datos?.errors

        if (errores && typeof errores === 'object') {
          const mensajes = Object.values(errores).flat()

          setErrorDocumento(
            mensajes.join(' ') || 'El documento no cumple las validaciones.'
          )
        } else {
          setErrorDocumento(
            err.datos?.message ?? 'El documento no cumple las validaciones.'
          )
        }

        return false
      }

      setErrorDocumento(
        err.datos?.message ?? 'No se pudo cargar el documento.'
      )

      return false
    } finally {
      setSubiendoDocumento(false)
    }
  }

  // ---------- Estados de pantalla ----------

  if (sesionCargando || cargando) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border spinner-border-sm text-primary me-2" />
        <span className="small text-muted">Cargando convenio...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        {error}
        <div className="mt-3">
          <Link href="/convenios" className="btn btn-outline-secondary btn-sm">
            Volver a convenios
          </Link>
        </div>
      </div>
    )
  }

  if (!datos) return null

  // ---------- Información del convenio ----------

  const {
    convenio,
    partes = [],
    representantes = [],
    archivos = [],
    historial = [],
    observaciones = [],
    vinculos = [],
    puede_editar = false,
    puede_enviar_revision = false,
    puede_subir_archivo = false,
    puede_eliminar = false,
  } = datos

  // Los permisos quedan disponibles para conectar las acciones.
  const permisos = {
    puede_editar,
    puede_enviar_revision,
    puede_subir_archivo,
    puede_eliminar,
  }

  const pestanias = [
    { id: 'ficha', label: 'Ficha' },
    { id: 'partes', label: 'Partes', cantidad: partes.length },
    { id: 'personas', label: 'Personas', cantidad: representantes.length },
    { id: 'documentos', label: 'Documentos', cantidad: archivos.length },
    { id: 'historial', label: 'Historial', cantidad: historial.length },
    { id: 'observaciones', label: 'Observaciones', cantidad: observaciones.length },
  ]

  const pestaniaActiva = pestanias.some(
    (p) => p.id === pestania
  ) ? pestania : 'ficha'

  // ---------- Ficha principal ----------

  function contenidoFicha() {
    return (
      <div className="row g-3">
        <div className="col-12 col-lg-8">
          <FichaConvenio convenio={convenio} />
        </div>

        <div className="col-12 col-lg-4 d-flex flex-column gap-3">
          <PlazosCard convenio={convenio} />

          <VinculosCard
            vinculos={vinculos}
            idActual={convenio.id}
            base="/convenios"
          />

          <DocumentosCard documentos={archivos} />
        </div>
      </div>
    )
  }

  // ---------- Render ----------

  return (
    <div>

      {/* Navegación */}

      <nav className="small text-muted mb-3">
        <Link href="/convenios" className="text-decoration-none">
          Convenios
        </Link>
        {' / '}
        {convenio.codigo}
      </nav>

      {/* Encabezado */}

      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3">
        <div>
          <div className="small fw-semibold text-uppercase text-primary-emphasis mb-1">
            {convenio.tipo} · {convenio.codigo}

            <span className="badge rounded-pill text-bg-primary-subtle ms-2">
              {convenio.estado}
            </span>
          </div>

          <h1 className="h4 text-primary mb-1">
            {convenio.titulo}
          </h1>

          <div className="small text-muted">
            {convenio.unidad}
            {' · '}
            Versión {convenio.version ?? '—'}
          </div>
        </div>

        <div className="d-flex flex-wrap gap-2">
          {puede_editar && (
            <Link
              href={`/convenios/${convenio.id}/editar`}
              className="btn btn-primary btn-sm"
            >
              Editar borrador
            </Link>
          )}

          <Link
            href="/convenios"
            className="btn btn-outline-secondary btn-sm"
          >
            Volver al listado
          </Link>
        </div>
      </div>

      {/* Circuito de estados */}

      <LineaEstados
        estado={convenio.estado}
        transiciones={historial}
      />

      {/* Pestañas */}

      <ul className="nav nav-tabs small my-3">
        {pestanias.map((p) => (
          <li className="nav-item" key={p.id}>
            <button
              type="button"
              className={`nav-link ${pestaniaActiva === p.id ? 'active fw-semibold' : ''
                }`}
              onClick={() => setPestania(p.id)}
            >
              {p.label}

              {p.cantidad !== undefined && (
                <span className="ms-1 text-muted">
                  · {p.cantidad}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>

      {/* Contenido de pestañas */}

      {pestaniaActiva === 'ficha' && contenidoFicha()}

      {pestaniaActiva !== 'ficha' && (
        <div className="card shadow-sm">
          <div className="card-body">
            {pestaniaActiva === 'partes' && (
              <PartesTab partes={partes} />
            )}

            {pestaniaActiva === 'personas' && (
              <PersonasTab representantes={representantes} />
            )}

            {pestaniaActiva === 'documentos' && (
              <DocumentosTab
                archivos={archivos}
                puedeSubir={puede_subir_archivo}
                onSubir={manejarSubidaDocumento}
                subiendo={subiendoDocumento}
                errorCarga={errorDocumento}
                mensajeCarga={mensajeDocumento}
              />
            )}

            {pestaniaActiva === 'historial' && (
              <HistorialTab historial={historial} />
            )}

            {pestaniaActiva === 'observaciones' && (
              <ObservacionesTab observaciones={observaciones} />
            )}
          </div>
        </div>
      )}
    </div>
  )
}