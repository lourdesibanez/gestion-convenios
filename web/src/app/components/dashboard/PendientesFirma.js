
export default function PendientesFirma({
  items = [],
  cargando = false,
  error = null,
}) {
  return (
    <div className="card border-0 shadow-sm mb-3">
      <div className="card-header bg-white py-3">
        <div className="d-flex justify-content-between align-items-center">
          <h2 className="h6 fw-semibold mb-0">
            Convenios pendientes de firma
          </h2>

          <span className="badge text-bg-warning">
            {items.length}
          </span>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-sm align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th className="ps-3">Código</th>
              <th>Convenio</th>
              <th>Estado</th>
            </tr>
          </thead>

          <tbody>
            {cargando ? (
              <tr>
                <td colSpan={3} className="text-center py-4 text-muted">
                  Cargando pendientes...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={3} className="text-center py-4 text-danger">
                  No se pudieron cargar los pendientes.
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-4 text-muted">
                  No hay convenios pendientes de firma.
                </td>
              </tr>
            ) : (
              items.slice(0, 10).map((item, index) => (
                <tr key={item.id ?? item.id_instrumento ?? index}>
                  <td className="ps-3 fw-semibold">
                    {item.codigo ?? item.instrumento?.codigo ?? '—'}
                  </td>

                  <td>
                    {item.titulo ??
                      item.instrumento?.titulo ??
                      item.convenio?.titulo ??
                      'Convenio pendiente'}
                  </td>

                  <td>
                    <span className="badge text-bg-warning">
                      Pendiente de firma
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
