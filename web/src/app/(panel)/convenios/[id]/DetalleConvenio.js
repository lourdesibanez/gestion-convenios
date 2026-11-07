'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import LineaEstados from "../../../components/convenio/LineaEstados";
import FichaConvenio from '../../../components/convenio/FichaConvenio'
import PlazosCard from '../../../components/convenio/PlazosCard'
import VinculosCard from '../../../components/convenio/VinculosCard'
import DocumentosCard from '../../../components/convenio/DocumentosCard'

const API = process.env.NEXT_PUBLIC_API_URL

const PESTANIAS = [
  { id: 'ficha', label: 'Ficha' },
  { id: 'partes', label: 'Partes', cuenta: (c) => c.partes?.length },
  { id: 'personas', label: 'Personas', cuenta: (c) => c.personas?.length },
  { id: 'documentos', label: 'Documentos', cuenta: (c) => c.documentos?.length },
  { id: 'historial', label: 'Historial' },
  { id: 'observaciones', label: 'Observaciones', cuenta: (c) => c.observaciones?.length },
]


export default function DetalleConvenio({id}) {
  console.log('id convenio',id);
  const [convenio, setConvenio] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [pestania, setPestania] = useState('ficha');

  useEffect(() => {
    async function cargar() {
      try {
        setCargando(true)
        setError(null)

        const res = await fetch(`${API}/api/convenios/${id}`, {
          headers: { Accept: 'application/json' },
        })

        if (res.status === 404) {
          setConvenio(null)   // muestra "El convenio no existe."
          return
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`)

        const json = await res.json()
        if (!json.ok) throw new Error(json.mensaje || 'Respuesta inválida')

        const d = json.data
        setConvenio({
          ...d.convenio,                     // id, codigo, titulo, tipo, unidad, estado, vencimiento, etc.
          partes: d.partes ?? [],
          personas: d.representantes ?? [],  // renombrado para tus pestañas
          documentos: d.archivos ?? [],      // renombrado para tus pestañas
          historial: d.historial ?? [],
          observaciones: d.observaciones ?? [],
          vinculos: d.vinculos ?? [],
        })
      } catch (err) {
        console.error(err)
        setError('No se pudo cargar el convenio.')
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [id])

  if (cargando) return <p className="small text-muted">Cargando convenio...</p>
  if (error) return <div className="alert alert-danger small">{error}</div>
  if (!convenio) return <div className="alert alert-warning small">El convenio no existe.</div>

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="small text-muted mb-2">
        <Link href="/dashboard/convenios" className="text-decoration-none">Convenios</Link>
        {convenio.marco?.codigo && <> / {convenio.marco.codigo}</>}
        {' / '}{convenio.codigo}
      </nav>

      {/* Encabezado */}
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3">
        <div>
          <div className="small fw-semibold text-uppercase text-primary-emphasis mb-1">
            {convenio.tipo} · {convenio.codigo}{' '}
            <span className="badge rounded-pill text-bg-primary-subtle ms-1">{convenio.estado}</span>
          </div>
          <h1 className="h4 text-primary mb-1">{convenio.titulo}</h1>
          <div className="small text-muted">
            {convenio.unidad} · versión {convenio.version} · última modificación{' '}
            {convenio.ultima_modificacion} por {convenio.modificado_por}
          </div>
        </div>

        {/**Para El administrador 
         <div className="d-flex gap-2">
          <button className="btn btn-outline-primary btn-sm">Editar</button>
          <button className="btn btn-outline-primary btn-sm">Generar QR</button>
          <button className="btn btn-primary btn-sm">Registrar firma</button>
        </div>
         */}
      </div>

      {/* Línea de estados */}
      <LineaEstados estado={convenio.estado} transiciones={convenio.transiciones} />

      {/* Pestañas */}
      <ul className="nav nav-tabs small my-3">
        {PESTANIAS.map((p) => {
          const n = p.cuenta?.(convenio)
          return (
            <li className="nav-item" key={p.id}>
              <button
                className={`nav-link ${pestania === p.id ? 'active fw-semibold' : ''}`}
                onClick={() => setPestania(p.id)}
              >
                {p.label}{n ? ` · ${n}` : ''}
              </button>
            </li>
          )
        })}
      </ul>

      {/* Contenido */}
      {pestania === 'ficha' ? (
        <div className="row g-3">
          <div className="col-12 col-lg-8">
            <FichaConvenio convenio={convenio} />
          </div>
          <div className="col-12 col-lg-4 d-flex flex-column gap-3">
            <PlazosCard convenio={convenio} />
            <VinculosCard convenio={convenio} />
            <DocumentosCard documentos={convenio.documentos ?? []} />
          </div>
        </div>
      ) : (
        <div className="card shadow-sm">
          <div className="card-body small text-muted">
            Contenido de la pestaña «{PESTANIAS.find((p) => p.id === pestania).label}» (pendiente).
          </div>
        </div>
      )}
    </div>
  )
}