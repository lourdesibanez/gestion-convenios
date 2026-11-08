'use client'
import { useEffect, useMemo, useState } from 'react'

const API = process.env.NEXT_PUBLIC_API_URL
const POR_PAGINA = 10

const norm = (t) =>
  (t ?? '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()

const traer = async (ruta) => {
  const res = await fetch(`${API}${ruta}`, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`Error ${res.status} en ${ruta}`)
  const json = await res.json()
  return Array.isArray(json) ? json : json.data ?? []
}

function Paginado({ pagina, total, onCambiar }) {
  const totalPaginas = Math.max(1, Math.ceil(total / POR_PAGINA))
  const desde = total === 0 ? 0 : (pagina - 1) * POR_PAGINA + 1
  const hasta = Math.min(pagina * POR_PAGINA, total)

  return (
    <div className="card-footer bg-white d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 py-2">
      <span className="small text-muted">
        Mostrando {desde}-{hasta} de {total} resultados
      </span>
      <ul className="pagination pagination-sm mb-0">
        <li className={`page-item ${pagina === 1 ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => onCambiar(pagina - 1)}>&lsaquo;</button>
        </li>
        <li className="page-item disabled">
          <span className="page-link">{pagina} / {totalPaginas}</span>
        </li>
        <li className={`page-item ${pagina === totalPaginas ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => onCambiar(pagina + 1)}>&rsaquo;</button>
        </li>
      </ul>
    </div>
  )
}

export default function PartesYPersonas() {
  const [instituciones, setInstituciones] = useState([])
  const [personas, setPersonas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const [pestania, setPestania] = useState('instituciones')
  const [buscar, setBuscar] = useState('')
  const [ambito, setAmbito] = useState('todas')
  const [pagina, setPagina] = useState(1)

  useEffect(() => {
    async function cargar() {
      try {
        const [i, p] = await Promise.all([
          traer('/api/instituciones'),
          traer('/api/representantes'),
        ])
        setInstituciones(i)
        setPersonas(p)
      } catch (err) {
        console.error(err)
        setError('No se pudieron cargar los datos. ¿Existen los endpoints /api/instituciones y /api/representantes?')
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [])

  // Al cambiar de pestaña o de filtro vuelve a la página 1
  useEffect(() => {
    setPagina(1)
  }, [pestania, buscar, ambito])

  const cambiarPestania = (id) => {
    setPestania(id)
    setBuscar('')
    setAmbito('todas')
  }

  const instFiltradas = useMemo(() => {
    const q = norm(buscar)
    return instituciones.filter((i) => {
      if (ambito === 'internas' && !i.es_interna) return false
      if (ambito === 'externas' && i.es_interna) return false
      if (q && !norm(`${i.nombre} ${i.identificacion_fiscal}`).includes(q)) return false
      return true
    })
  }, [instituciones, buscar, ambito])

  const personasFiltradas = useMemo(() => {
    const q = norm(buscar)
    if (!q) return personas
    return personas.filter((p) =>
      norm(`${p.nombre} ${p.apellido} ${p.correo_electronico}`).includes(q)
    )
  }, [personas, buscar])

  const lista = pestania === 'instituciones' ? instFiltradas : personasFiltradas
  const total = lista.length
  const visibles = lista.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA)

  return (
    <div>
      <div className="mb-3">
        <h1 className="h4 text-primary mb-0">Partes y personas</h1>
        <p className="small text-muted mb-0">
          Instituciones firmantes y representantes registrados.
        </p>
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
                type="text"
                id="buscar-partes"
                className="form-control"
                placeholder={
                  pestania === 'instituciones'
                    ? 'Nombre o CUIT'
                    : 'Nombre, apellido o correo'
                }
                value={buscar}
                onChange={(e) => setBuscar(e.target.value)}
              />
            </div>

            {pestania === 'instituciones' && (
              <div className="col-12 col-md-3">
                <label htmlFor="ambito" className="form-label small fw-semibold">Tipo</label>
                <select
                  id="ambito"
                  className="form-select"
                  value={ambito}
                  onChange={(e) => setAmbito(e.target.value)}
                >
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
                  ) : visibles.length === 0 ? (
                    <tr><td colSpan={4} className="text-center text-muted py-4">No hay instituciones que coincidan.</td></tr>
                  ) : (
                    visibles.map((i) => (
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
                  ) : visibles.length === 0 ? (
                    <tr><td colSpan={4} className="text-center text-muted py-4">No hay personas que coincidan.</td></tr>
                  ) : (
                    visibles.map((p) => (
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

          {!cargando && <Paginado pagina={pagina} total={total} onCambiar={setPagina} />}
        </div>
      )}
    </div>
  )
}