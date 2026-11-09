'use client'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import useDatosAdmin from '../../../../app/hooks/useDatosAdmin'
import { fecha } from '../../../../app/components/convenio/Formato'
import { obtenerRevision } from '../../../../model/convenioModel'
import { filtrarTexto } from '../../../../controller/convenioController'

const VACIO = []

export default function Revision() {
  const { datos, cargando, error } = useDatosAdmin(obtenerRevision)
  const convenios = datos ?? VACIO
  const [buscar, setBuscar] = useState('')

  const visibles = useMemo(
    () => filtrarTexto(convenios, buscar, ['codigo', 'titulo', 'tipo', 'unidad']),
    [convenios, buscar]
  )

  const hayObs = convenios.some((c) => c.observaciones_pendientes !== undefined)
  const columnas = hayObs ? 7 : 6

  return (
    <div>
      <div className="mb-3">
        <h1 className="h4 text-primary mb-0">Revisión</h1>
        <p className="small text-muted mb-0">
          {cargando ? 'Cargando...' : `${convenios.length} instrumento${convenios.length === 1 ? '' : 's'} esperando revisión`}
        </p>
      </div>

      <div className="card shadow-sm mb-3">
        <div className="card-body py-3">
          <label htmlFor="buscar-revision" className="form-label small fw-semibold">Buscar</label>
          <input
            id="buscar-revision"
            type="text"
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
                  {hayObs && <th className="text-center">Obs. pendientes</th>}
                  <th>Vence</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {cargando ? (
                  <tr><td colSpan={columnas} className="text-center text-muted py-4">Cargando...</td></tr>
                ) : visibles.length === 0 ? (
                  <tr>
                    <td colSpan={columnas} className="text-center text-muted py-4">
                      {convenios.length === 0 ? 'No hay convenios pendientes de revisión.' : 'Ningún convenio coincide con la búsqueda.'}
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
                      {hayObs && (
                        <td className="text-center">
                          <span className={`badge rounded-pill ${Number(c.observaciones_pendientes) > 0 ? 'text-bg-warning' : 'text-bg-light border'}`}>
                            {c.observaciones_pendientes ?? 0}
                          </span>
                        </td>
                      )}
                      <td className="text-nowrap">{fecha(c.vence)}</td>
                      <td className="text-end pe-3">
                        <Link href={`/admin/convenios/${c.id}`} className="btn btn-outline-primary btn-sm">Revisar</Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}