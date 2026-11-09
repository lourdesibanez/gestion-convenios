'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/app/context/authContext'
import { obtenerConvenioAdmin, obtenerConvenioPublico } from '@/model/convenioModel'

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
import { obtenerUno } from '@/app/lib/api'

export default function DetalleConvenio({ id, admin = false }) {
  const { authFetch, isAuth, cargando: sesionCargando } = useAuth()
  const base = admin ? '/admin/convenios' : '/convenios'
  
  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [pestania, setPestania] = useState('ficha')
  useEffect(() => {
    if (!id) return // todavía no llegó el id

    async function cargar() {
      const ruta = `/api/agreements/${id}`
      try {
        const info = await obtenerUno(ruta)

        if (!info?.convenio) {
          setError(`La respuesta de ${ruta} no trae el campo "convenio".`)
          return
        }
        setDatos(info)
      } catch (err) {
        console.error(err)
        setError(err instanceof Error ? err.message : 'No se pudo consultar el convenio.')
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [id])

  if (!id) return <div className="alert alert-warning small">No llegó el id del convenio.</div>
  if (cargando) return <p className="small text-muted">Cargando convenio...</p>
  if (error) return <div className="alert alert-danger small">{error}</div>
  if (!datos) return null
  
  const {
    convenio,
    partes = [],
    representantes = [],
    archivos = [],
    historial = [],
    observaciones = [],
    vinculos = [],
  } = datos

  const TODAS = [
    { id: 'ficha', label: 'Ficha' },
    { id: 'partes', label: 'Partes', n: partes.length },
    { id: 'personas', label: 'Personas', n: representantes.length, soloAdmin: true },
    { id: 'documentos', label: 'Documentos', n: archivos.length },
    { id: 'historial', label: 'Historial', soloAdmin: true},
    { id: 'observaciones', label: 'Observaciones', n: observaciones.length },
  ] 

  const PESTANIAS= TODAS.filter((p)=> admin || !p.soloAdmin);
  const activa = PESTANIAS.some((p) => p.id === pestania) ? pestania : 'ficha'

  return (
    <div>
      <nav className="small text-muted mb-2">
        <Link href={base} className="text-decoration-none">Convenios</Link>
        {' / '}{convenio.codigo}
      </nav>

      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3">
        <div>
          <div className="small fw-semibold text-uppercase text-primary-emphasis mb-1">
            {convenio.tipo} · {convenio.codigo}{' '}
            <span className="badge rounded-pill text-bg-primary-subtle ms-1">
              {convenio.estado}
            </span>
          </div>
          <h1 className="h4 text-primary mb-1">{convenio.titulo}</h1>
          <div className="small text-muted">
            {convenio.unidad} · versión {convenio.version}
          </div>
        </div>

        {admin && (
          <div className="d-flex gap-2">
            <button className="btn btn-outline-primary btn-sm">Editar</button>
            <button className="btn btn-success btn-sm">Registrar firma</button>
          </div>
        )}
      </div>

      <LineaEstados estado={convenio.estado} transiciones={historial} />

      <ul className="nav nav-tabs small my-3">
        {PESTANIAS.map((p) => (
          <li className="nav-item" key={p.id}>
            <button
              className={`nav-link ${pestania === p.id ? 'active fw-semibold' : ''}`}
              onClick={() => setPestania(p.id)}
            >
              {p.label}{p.n ? ` · ${p.n}` : ''}
            </button>
          </li>
        ))}
      </ul>

      {pestania === 'ficha' ? (
        <div className="row g-3">
          <div className="col-12 col-lg-8">
            <FichaConvenio convenio={convenio} />
          </div>
          <div className="col-12 col-lg-4 d-flex flex-column gap-3">
            <PlazosCard convenio={convenio} />
            <VinculosCard vinculos={vinculos} idActual={convenio.id} base={base} />
            <DocumentosCard documentos={archivos} admin={admin} />
          </div>
        </div>
      ) : (
        <div className="card shadow-sm">
          <div className="card-body small text-muted">
            {activa === 'ficha' && (
              <div className="row g-3">
                <div className="col-12 col-lg-8">
                  <FichaConvenio convenio={convenio} />
                </div>
                <div className="col-12 col-lg-4 d-flex flex-column gap-3">
                  <PlazosCard convenio={convenio} />
                  <VinculosCard vinculos={vinculos} idActual={convenio.id} base={base} />
                  <DocumentosCard documentos={archivos} admin={admin} />
                </div>
              </div>
            )}

            {activa === 'partes' && <PartesTab partes={partes} />}
            {activa === 'personas' && <PersonasTab representantes={representantes} />}
            {activa === 'documentos' && <DocumentosTab archivos={archivos} admin={admin} />}
            {activa === 'historial' && <HistorialTab historial={historial} />}
            {activa === 'observaciones' && <ObservacionesTab observaciones={observaciones} />}
          </div>
        </div>
      )}
    </div>
  )
}