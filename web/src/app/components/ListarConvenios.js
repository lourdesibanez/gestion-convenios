'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { obtenerTodos } from '../lib/api'

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

export default function ListarConvenios({ filtros = {}, base = '/convenios' }) {
  const router = useRouter()
  const [convenios, setConvenios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [pagina, setPagina] = useState(1)

  // 1) Se piden los datos UNA sola vez
  useEffect(() => {
    async function cargar() {
      try {
        setConvenios(await obtenerTodos('/api/agreements'))
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
  const filtrados = useMemo(() => filtrarConvenios(convenios, filtros), [convenios, filtros])
  const { items, total, totalPaginas, desde, hasta } = paginar(filtrados, pagina)

  // ventana de hasta 5 números de página alrededor de la actual
  const numeros = useMemo(() => {
    const desde = Math.max(1, Math.min(pagina - 2, totalPaginas - 4))
    const hasta = Math.min(totalPaginas, desde + 4)
    return Array.from({ length: hasta - desde + 1 }, (_, i) => desde + i)
  }, [pagina, totalPaginas])

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

  if (error) {
    return <div className="alert alert-danger small mt-3 mb-0">{error}</div>
  }

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
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-muted py-4">
                  No hay convenios que coincidan con la búsqueda.
                </td>
              </tr>
            ) : (
              items.map((c) => {
                const color = COLOR_ESTADO[norm(c.estado)] ?? 'secondary'
                const ruta = `${base}/${c.id}`

                return (
                  <tr
                    key={c.id ?? c.codigo}
                    style={{ cursor: 'pointer' }}
                    onClick={() => router.push(ruta)}
                  >
                    <td className="ps-3 fw-semibold">
                      <Link href={ruta} onClick={(e) => e.stopPropagation()}>
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

      <Paginado
        pagina={pagina}
        totalPaginas={totalPaginas}
        desde={desde}
        hasta={hasta}
        total={total}
        onCambiar={setPagina}
      />
    </div>
  )
}