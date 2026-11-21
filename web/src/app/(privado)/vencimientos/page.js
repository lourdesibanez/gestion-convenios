'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '../../../app/context/authContext'
import { fecha } from '../../components/convenio/Formato'
import { obtenerVencimientos } from '../../../model/convenioModel'
import {prepararVencimientos,filtrarPorHorizonte, resumirVencimientos} from '../../../controller/convenioController'

const norm = (t) =>
  (t ?? '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()

// "2026-11-30" → Date local a medianoche
const aFecha = (s) => {
  const [y, m, d] = s.slice(0, 10).split('-').map(Number)
  return new Date(y, m - 1, d)
}

// días desde hoy hasta la fecha (negativo = ya venció)
const diasHasta = (s, hoy) => Math.round((aFecha(s) - hoy) / 86400000)

const HORIZONTES = [
  { id: 'todos', label: 'Todos' },
  { id: 'vencidos', label: 'Vencidos' },
  { id: '30', label: 'Próximos 30 días' },
  { id: '90', label: 'Próximos 90 días' },
  { id: '180', label: 'Próximos 180 días' },
]

function Plazo({ dias }) {
  if (dias < 0) {
    const n = Math.abs(dias)
    return <span className="badge rounded-pill text-bg-danger">Vencido hace {n} {n === 1 ? 'día' : 'días'}</span>
  }
  if (dias === 0) return <span className="badge rounded-pill text-bg-danger">Vence hoy</span>

  const color = dias <= 30 ? 'danger' : dias <= 90 ? 'warning' : 'secondary'
  return <span className={`badge rounded-pill text-bg-${color}`}>En {dias} {dias === 1 ? 'día' : 'días'}</span>
}

export default function Vencimientos() {
  const { token, isAuth, cargando: sesionCargando } = useAuth()

  const [convenios, setConvenios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [horizonte, setHorizonte] = useState('90')
  const [hoy, setHoy] = useState(null) // se fija en el cliente, después de montar

  useEffect(() => {
    const d = new Date()
    setHoy(new Date(d.getFullYear(), d.getMonth(), d.getDate()))

    if (sesionCargando) return

    if (!isAuth) {
      setCargando(false)
      return
    }

    async function cargar() {
      try {
        const datos = await obtenerVencimientos(token)
        setConvenios(datos)
      } catch (err) {
        console.error(err)
        setError('No se pudieron cargar los vencimientos.')
      } finally {
        setCargando(false)
      }
    }

    cargar()
  }, [token, isAuth, sesionCargando])
  const lista = useMemo(() => prepararVencimientos(convenios, hoy), [convenios, hoy])
  const resumen = useMemo(() => resumirVencimientos(lista), [lista])
  const visibles = useMemo(() => filtrarPorHorizonte(lista, horizonte), [lista, horizonte])

  const hayPreaviso = lista.some((c) => c.preaviso !== undefined)
  const columnas = hayPreaviso ? 7 : 6
  const esperando = cargando || !hoy

  const TARJETAS = [
    { label: 'Vencidos', valor: resumen.vencidos, color: 'danger', filtro: 'vencidos' },
    { label: 'Vencen en 30 días', valor: resumen.d30, color: 'warning', filtro: '30' },
    { label: 'Entre 31 y 90 días', valor: resumen.d90, color: 'primary', filtro: '90' },
    { label: 'Más adelante', valor: resumen.despues, color: 'secondary', filtro: 'todos' },
  ]

  return (
    <div>
      <div className="mb-3">
        <h1 className="h4 text-primary mb-0">Vencimientos</h1>
        <p className="small text-muted mb-0">
          Instrumentos con fecha de vencimiento, del más urgente al más lejano.
        </p>
      </div>

      <div className="row g-3 mb-3">
        {TARJETAS.map((t) => (
          <div className="col-6 col-lg-3" key={t.label}>
            <button
              type="button"
              className="card shadow-sm h-100 w-100 text-start border-0"
              onClick={() => setHorizonte(t.filtro)}
            >
              <div className="card-body">
                <div className="small text-muted">{t.label}</div>
                <div className={`display-6 fw-bold text-${t.color}`}>{esperando ? '…' : t.valor}</div>
              </div>
            </button>
          </div>
        ))}
      </div>

      <div className="card shadow-sm mb-3">
        <div className="card-body py-3">
          <label htmlFor="horizonte" className="form-label small fw-semibold">Mostrar</label>
          <select
            id="horizonte"
            className="form-select"
            style={{ maxWidth: 260 }}
            value={horizonte}
            onChange={(e) => setHorizonte(e.target.value)}
          >
            {HORIZONTES.map((h) => (
              <option key={h.id} value={h.id}>{h.label}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="alert alert-danger small">{error}</div>}

      {!error && (
        <div className="card shadow-sm">
          <div className="table-responsive">
            <table className="table table-sm table-hover align-middle mb-0 small">
              <thead className="table-light">
                <tr>
                  <th className="ps-3">Código</th>
                  <th>Título</th>
                  <th>Unidad</th>
                  <th>Vence</th>
                  {hayPreaviso && <th>Preaviso</th>}
                  <th>Plazo</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {esperando ? (
                  <tr>
                    <td colSpan={columnas} className="text-center text-muted py-4">Cargando...</td>
                  </tr>
                ) : visibles.length === 0 ? (
                  <tr>
                    <td colSpan={columnas} className="text-center text-muted py-4">
                      No hay vencimientos en este período.
                    </td>
                  </tr>
                ) : (
                  visibles.map((c) => {
                    const enPreaviso = c.preaviso && c.dias >= 0 && diasHasta(c.preaviso, hoy) <= 0
                    return (
                      <tr key={c.id}>
                        <td className="ps-3 fw-semibold">
                          <Link href={`/admin/convenios/${c.id}`}>{c.codigo}</Link>
                        </td>
                        <td>{c.titulo}</td>
                        <td className="text-muted">{c.unidad}</td>
                        <td className="text-nowrap">{fecha(c.vence)}</td>
                        {hayPreaviso && (
                          <td className="text-nowrap">
                            {fecha(c.preaviso)}
                            {enPreaviso && <span className="badge rounded-pill text-bg-warning ms-2">En preaviso</span>}
                          </td>
                        )}
                        <td><Plazo dias={c.dias} /></td>
                        <td className="text-end pe-3">
                          <Link href={`/admin/convenios/${c.id}`} className="btn btn-outline-primary btn-sm">Ver</Link>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}