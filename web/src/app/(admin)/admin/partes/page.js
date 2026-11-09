'use client'
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/app/context/authContext'
import Paginado from '@/app/components/Paginado'
import { obtenerInstituciones, obtenerRepresentantes } from '@/model/convenioModel'
import { paginar } from '@/controller/convenioController'
import { filtrarInstituciones, filtrarPersonas } from '@/controller/partesController'

export default function PartesYPersonas() {
  const { authFetch, isAuth, cargando: sesionCargando } = useAuth()

  const [instituciones, setInstituciones] = useState([])
  const [personas, setPersonas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const [pestania, setPestania] = useState('instituciones')
  const [buscar, setBuscar] = useState('')
  const [ambito, setAmbito] = useState('todas')
  const [pagina, setPagina] = useState(1)

  useEffect(() => {
    if (sesionCargando || !isAuth) return

    Promise.all([obtenerInstituciones(authFetch), obtenerRepresentantes(authFetch)])
      .then(([i, p]) => {
        setInstituciones(i)
        setPersonas(p)
      })
      .catch(() => setError('No se pudieron cargar los datos.'))
      .finally(() => setCargando(false))
  }, [authFetch, isAuth, sesionCargando])

  useEffect(() => setPagina(1), [pestania, buscar, ambito])

  const cambiarPestania = (id) => {
    setPestania(id)
    setBuscar('')
    setAmbito('todas')
  }

  const instFiltradas = useMemo(
    () => filtrarInstituciones(instituciones, buscar, ambito),
    [instituciones, buscar, ambito]
  )
  const personasFiltradas = useMemo(
    () => filtrarPersonas(personas, buscar),
    [personas, buscar]
  )

  const lista = pestania === 'instituciones' ? instFiltradas : personasFiltradas
  const { items, total, totalPaginas, desde, hasta } = paginar(lista, pagina)

  return (
    <div>
      <div className="mb-3">
        <h1 className="h4 text-primary mb-0">Partes y personas</h1>
        <p className="small text-muted mb-0">Instituciones firmantes y representantes registrados.</p>
      </div>

      <ul className="nav nav-tabs small mb-3">
        <li className="nav-item">
          <button
            className={`nav-link ${pestania === 'instituciones' ? 'active fw-semibold' : ''}`}
            onClick={() => cambiarPestania('instituciones')}
          >
            Instituciones{!cargando && ` · ${instituciones.length}`}
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${pestania === 'personas' ? 'active fw-semibold' : ''}`}
            onClick={() => cambiarPestania('personas')}
          >
            Personas{!cargando && ` · ${personas.length}`}
          </button>
        </li>
      </ul>

      <div className="card shadow-sm mb-3">
        <div className="card-body py-3">
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label htmlFor="buscar-partes" className="form-label small fw-semibold">Buscar</label>
              <input
                id="buscar-partes"
                type="text"
                className="form-control"
                placeholder={pestania === 'instituciones' ? 'Nombre o CUIT' : 'Nombre, apellido o correo'}
                value={buscar}
                onChange={(e) => setBuscar(e.target.value)}
              />
            </div>

            {pestania === 'instituciones' && (
              <div className="col-12 col-md-3">
                <label htmlFor="ambito" className="form-label small fw-semibold">Tipo</label>
                <select id="ambito" className="form-select" value={ambito} onChange={(e) => setAmbito(e.target.value)}>
                  <option value="todas">Todas</option>
                  <option value="internas">Internas</option>
                  <option value="externas">Externas</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger small">{error}</div>}

      {!error && (
        <div className="card shadow-sm">
          <div className="table-responsive">
            {pestania === 'instituciones' ? (
              <table className="table table-sm table-hover align-middle mb-0 small">
                <thead className="table-light">
                  <tr>
                    <th className="ps-3">Institución</th>
                    <th>CUIT</th>
                    <th>Tipo</th>
                    <th className="text-center">Convenios</th>
                  </tr>
                </thead>
                <tbody>
                  {cargando ? (
                    <tr><td colSpan={4} className="text-center text-muted py-4">Cargando...</td></tr>
                  ) : items.length === 0 ? (
                    <tr><td colSpan={4} className="text-center text-muted py-4">No hay instituciones que coincidan.</td></tr>
                  ) : (
                    items.map((i) => (
                      <tr key={i.id}>
                        <td className="ps-3 fw-semibold">{i.nombre}</td>
                        <td className="text-muted">{i.identificacion_fiscal ?? '—'}</td>
                        <td>
                          <span className={`badge rounded-pill ${i.es_interna ? 'text-bg-primary' : 'text-bg-secondary'}`}>
                            {i.es_interna ? 'Interna' : 'Externa'}
                          </span>
                        </td>
                        <td className="text-center">{i.total_convenios ?? 0}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
              <table className="table table-sm table-hover align-middle mb-0 small">
                <thead className="table-light">
                  <tr>
                    <th className="ps-3">Nombre</th>
                    <th>Correo</th>
                    <th>Teléfono</th>
                    <th className="text-center">Convenios</th>
                  </tr>
                </thead>
                <tbody>
                  {cargando ? (
                    <tr><td colSpan={4} className="text-center text-muted py-4">Cargando...</td></tr>
                  ) : items.length === 0 ? (
                    <tr><td colSpan={4} className="text-center text-muted py-4">No hay personas que coincidan.</td></tr>
                  ) : (
                    items.map((p) => (
                      <tr key={p.id}>
                        <td className="ps-3 fw-semibold">{p.apellido}, {p.nombre}</td>
                        <td>
                          {p.correo_electronico
                            ? <a href={`mailto:${p.correo_electronico}`}>{p.correo_electronico}</a>
                            : '—'}
                        </td>
                        <td className="text-nowrap">{p.telefono ?? '—'}</td>
                        <td className="text-center">{p.total_convenios ?? 0}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          {!cargando && (
            <Paginado
              pagina={pagina}
              totalPaginas={totalPaginas}
              desde={desde}
              hasta={hasta}
              total={total}
              onCambiar={setPagina}
            />
          )}
        </div>
      )}
    </div>
  )
}