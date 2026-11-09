'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../app/context/authContext'
import Paginado from '../../app/components/Paginado'
import { obtenerConvenios, obtenerConveniosAdmin } from '../../model/convenioModel'
import { filtrarConvenios, paginar, COLOR_ESTADO, norm } from '../../controller/convenioController'

export default function ListarConvenios({ filtros = {}, base = '/convenios',  admin = false }) {
  const router = useRouter()
  const { token, isAuth, cargando: sesionCargando, logout } = useAuth()

  const [convenios, setConvenios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [pagina, setPagina] = useState(1)

  useEffect(() => {
   if (admin && (sesionCargando || !isAuth)) return

    const pedir = admin ? obtenerConveniosAdmin(token) : obtenerConvenios()

    pedir
      .then(setConvenios)
      .catch(() => setError('No se pudieron cargar los convenios.'))
      .finally(() => setCargando(false))
  }, [admin, token, isAuth, sesionCargando])

  useEffect(() => setPagina(1), [filtros])

  const filtrados = useMemo(() => filtrarConvenios(convenios, filtros), [convenios, filtros])
  const { items, total, totalPaginas, desde, hasta } = paginar(filtrados, pagina)

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
            {cargando ? (
              <tr><td colSpan={6} className="text-center text-muted py-4">Cargando convenios...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={6} className="text-center text-muted py-4">No hay convenios que coincidan con la búsqueda.</td></tr>
            ) : (
              items.map((c) => {
                const color = COLOR_ESTADO[norm(c.estado)] ?? 'secondary'
                const ruta = `${base}/${c.id}`
                return (
                  <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => router.push(ruta)}>
                    <td className="ps-3 fw-semibold">
                      <Link href={ruta} onClick={(e) => e.stopPropagation()}>{c.codigo}</Link>
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
  )
}