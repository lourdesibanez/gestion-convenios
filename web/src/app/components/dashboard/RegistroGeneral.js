
'use client'

import Link from 'next/link'

const colores = {
  borrador: 'secondary',
  revision: 'warning',
  aprobado: 'primary',
  firmado: 'success',
  rescindido: 'danger',
  archivado: 'dark',
}

export default function RegistroGeneral({ movimientos = [] }) {
  const lista = movimientos.slice(0, 10)

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-header bg-white py-3">
        <div className="d-flex justify-content-between align-items-center">
          <h2 className="h6 fw-semibold mb-0">
            Registro general
          </h2>

          <Link
            href="/convenios"
            className="btn btn-outline-primary btn-sm"
          >
            Ver todos
          </Link>
        </div>
      </div>

      <div
        className="table-responsive"
        style={{
          maxHeight: '310px',
          overflowY: 'auto',
        }}
      >
        <table className="table table-hover table-sm align-middle mb-0">
          <thead className="table-light position-sticky top-0">
            <tr>
              <th className="ps-3">Código / título</th>
              <th>Estado</th>
              <th className="text-end pe-3">Acción</th>
            </tr>
          </thead>

          <tbody>
            {lista.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-4 text-muted">
                  No hay movimientos registrados.
                </td>
              </tr>
            ) : (
              lista.map((item) => {
                const color = colores[item.estado] ?? 'secondary'

                return (
                  <tr key={item.id}>
                    <td className="ps-3">
                      <div className="fw-semibold">
                        {item.codigo}
                      </div>

                      <div className="small text-muted">
                        {item.titulo}
                      </div>
                    </td>

                    <td>
                      <span className={`badge text-bg-${color}`}>
                        {item.estado}
                      </span>
                    </td>

                    <td className="text-end pe-3">
                      <Link
                        href={`/convenios/${item.id}`}
                        className="btn btn-outline-primary btn-sm"
                      >
                        Ver detalle
                      </Link>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="card-footer bg-white small text-muted">
        Mostrando {lista.length} de {movimientos.length} movimientos recientes.
      </div>
    </div>
  )
}
