'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { fecha } from '../../../components/convenio/Formato'
import { obtenerTodos } from '../../../lib/api'

const norm = (t) =>
  (t ?? '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()

export default function Revision() {
  const [convenios, setConvenios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [buscar, setBuscar] = useState('')

  useEffect(() => {
    async function cargar() {
      try {
        setConvenios(await obtenerTodos('/api/agreements/review'))
      } catch (err) {
        console.error(err)
        setError('No se pudieron cargar los convenios.')
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [])

  // Solo los que están en revisión, y que coincidan con la búsqueda
  const enRevision = useMemo(
    () => convenios.filter((c) => norm(c.estado) === 'revision'),
    [convenios]
  )

  const visibles = useMemo(() => {
    if (!buscar) return enRevision
    const q = norm(buscar)
    return enRevision.filter((c) =>
      norm(`${c.codigo} ${c.titulo} ${c.tipo} ${c.unidad}`).includes(q)
    )
  }, [enRevision, buscar])

  // La columna de observaciones solo aparece si el backend la envía
  const hayObservaciones = enRevision.some((c) => c.observaciones_pendientes !== undefined)

  return (
    <div>
      <div className="mb-3">
        <h1 className="h4 text-primary mb-0">Revisión</h1>
        <p className="small text-muted mb-0">
          {cargando
            ? 'Cargando...'
            : `${enRevision.length} instrumento${enRevision.length === 1 ? '' : 's'} esperando revisión`}
        </p>
      </div>

      <div className="card shadow-sm mb-3">
        <div className="card-body py-3">
          <label htmlFor="buscar-revision" className="form-label small fw-semibold">
            Buscar
          </label>
          <input
            type="text"
            id="buscar-revision"
            className="form-control"
            placeholder="Código, título, tipo o unidad"
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
          />
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
                  <th>Tipo</th>
                  <th>Unidad</th>
                  {hayObservaciones && <th className="text-center">Obs. pendientes</th>}
                  <th>Vence</th>
                  <th />
                </tr>
              </thead>

              <tbody>
                {cargando ? (
                  <tr>
                    <td colSpan={7} className="text-center text-muted py-4">
                      <span className="spinner-border spinner-border-sm me-2" />
                      Cargando...
                    </td>
                  </tr>
                ) : visibles.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center text-muted py-4">
                      {enRevision.length === 0
                        ? 'No hay convenios pendientes de revisión.'
                        : 'Ningún convenio coincide con la búsqueda.'}
                    </td>
                  </tr>
                ) : (
                  visibles.map((c) => (
                    <tr key={c.id}>
                      <td className="ps-3 fw-semibold">
                        <Link href={`/admin/convenios/${c.id}`}>{c.codigo}</Link>
                      </td>
                      <td>{c.titulo}</td>
                      <td className="text-muted">{c.tipo}</td>
                      <td className="text-muted">{c.unidad}</td>

                      {hayObservaciones && (
                        <td className="text-center">
                          <span
                            className={`badge rounded-pill ${
                              Number(c.observaciones_pendientes) > 0
                                ? 'text-bg-warning'
                                : 'text-bg-light border'
                            }`}
                          >
                            {c.observaciones_pendientes ?? 0}
                          </span>
                        </td>
                      )}

                      <td className="text-nowrap">{fecha(c.vence)}</td>
                      <td className="text-end pe-3">
                        <Link
                          href={`/admin/convenios/${c.id}`}
                          className="btn btn-outline-primary btn-sm"
                        >
                          Revisar
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!cargando && visibles.length > 0 && (
            <div className="card-footer bg-white small text-muted py-2">
              Mostrando {visibles.length} de {enRevision.length}
            </div>
          )}
        </div>
      )}
    </div>
  )
}