'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const API = process.env.NEXT_PUBLIC_API_URL
const POR_PAGINA = 7

const COLOR_ESTADO = {
  borrador: 'secondary',
  revision: 'warning',
  aprobado: 'primary',
  firmado: 'success',
  rescindido: 'danger',
}

// minúsculas y sin tildes: "Revisión" → "revision"
const norm = (t) =>
  (t ?? '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()

export default function ListaConvenios({ filtros }) {
  const [convenios, setConvenios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [pagina, setPagina] = useState(1)
  const router = useRouter();

  const [refId, setRefId] = useState(null);

  // 1) Se pide UNA sola vez
  useEffect(() => {
    async function cargar() {
      try {
        const res = await fetch(`${API}/api/convenios`, {
          headers: { Accept: 'application/json' },
        })
        if (!res.ok) throw new Error(`Error ${res.status}`)
        const data = await res.json()
        setConvenios(Array.isArray(data) ? data : data.data ?? data.convenios ?? [])
      } catch (err) {
        console.error(err)
        setError('No se pudieron cargar los convenios.')
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [])

  // 2) Se filtra sobre los datos que ya están en memoria
  const filtrados = useMemo(() => {
    const { buscar, tipo, estado, unidad, firmadoDesde } = filtros

    return convenios.filter((c) => {
      if (buscar) {
        const texto = norm(`${c.codigo} ${c.titulo} ${c.tipo} ${c.unidad}`)
        if (!texto.includes(norm(buscar))) return false
      }
      if (tipo && !norm(c.tipo).includes(norm(tipo))) return false
      if (estado && norm(c.estado) !== norm(estado)) return false
      if (unidad && norm(c.unidad) !== norm(unidad)) return false
      if (firmadoDesde && (!c.fecha_firma || c.fecha_firma < firmadoDesde)) return false
      return true
    })
  }, [convenios, filtros])

  // 3) Al cambiar los filtros vuelve a la página 1
  useEffect(() => {
    setPagina(1)
  }, [filtros])

  const total = filtrados.length
  const totalPaginas = Math.max(1, Math.ceil(total / POR_PAGINA))

  const visibles = useMemo(() => {
    const inicio = (pagina - 1) * POR_PAGINA
    return filtrados.slice(inicio, inicio + POR_PAGINA)
  }, [filtrados, pagina])

  const numeros = useMemo(() => {
    const desde = Math.max(1, Math.min(pagina - 2, totalPaginas - 4))
    const hasta = Math.min(totalPaginas, desde + 4)
    return Array.from({ length: hasta - desde + 1 }, (_, i) => desde + i)
  }, [pagina, totalPaginas])

  const desdeNum = total === 0 ? 0 : (pagina - 1) * POR_PAGINA + 1
  const hastaNum = Math.min(pagina * POR_PAGINA, total)

  if (cargando) {
    return (
      <div className="card shadow-sm mt-3">
        <div className="card-body text-center small text-muted py-4">
          <div className="spinner-border spinner-border-sm me-2" role="status" />
          Cargando convenios...
        </div>
      </div>
    )
  }

  if (error) return <div className="alert alert-danger small mt-3 mb-0">{error}</div>

   return (
    <div className="card shadow-sm mt-3">
      <div className="table-responsive">
        <table className="table table-sm table-hover align-middle mb-0 small">
          <thead className="table-light">
            <tr>
              <th className="ps-3">Código</th>
              <th>Título</th>
              <th>Tipo</th>
              <th>Unidad</th>
              <th>Estado</th>
              <th>Vence</th>
            </tr>
          </thead>
          <tbody>
            {visibles.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-muted py-4">
                  No hay convenios que coincidan con la búsqueda.
                </td>
              </tr>
            ) : (
              visibles.map((c) => {
                const color = COLOR_ESTADO[norm(c.estado)] ?? 'secondary'
                const ruta = `/convenios/${c.id}`

                return (
                  <tr
                    key={c.id ?? c.codigo}
                    style={{ cursor: 'pointer' }}
                    onClick={() => router.push(`/convenios/${c.id}`)}
                  >
                    <td className="ps-3 fw-semibold">
                      <Link href={`/convenios/${c.id}`} onClick={(e) => e.stopPropagation()}>
                        {c.codigo}
                      </Link>
                    </td>
                    <td>{c.titulo}</td>
                    <td className="text-muted">{c.tipo}</td>
                    <td className="text-muted">{c.unidad}</td>
                    <td>
                      <span className={`badge rounded-pill bg-${color}-subtle text-${color}-emphasis`}>
                        {c.estado}
                      </span>
                    </td>
                    <td className="text-nowrap">{c.vence ?? '—'}</td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="card-footer bg-white d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 py-2">
        <span className="small text-muted">
          Mostrando {desdeNum}-{hastaNum} de {total} resultados
        </span>

        <nav aria-label="Paginado de convenios">
          <ul className="pagination pagination-sm mb-0">
            <li className={`page-item ${pagina === 1 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setPagina(pagina - 1)}>
                &lsaquo;
              </button>
            </li>

            {numeros.map((n) => (
              <li key={n} className={`page-item ${n === pagina ? 'active' : ''}`}>
                <button className="page-link" onClick={() => setPagina(n)}>
                  {n}
                </button>
              </li>
            ))}

            <li className={`page-item ${pagina === totalPaginas ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setPagina(pagina + 1)}>
                &rsaquo;
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  )
}