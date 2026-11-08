import { fecha } from '../Formato'

export default function PartesTab({ partes }) {
  if (partes.length === 0) return <p className="small text-muted">Sin partes registradas.</p>

  return (
    <div className="card shadow-sm">
      <div className="table-responsive">
        <table className="table table-sm align-middle mb-0 small">
          <thead className="table-light">
            <tr>
              <th className="ps-3">Institución</th>
              <th>CUIT</th>
              <th>Tipo</th>
              <th>Fecha de firma</th>
            </tr>
          </thead>
          <tbody>
            {partes.map((p) => (
              <tr key={p.id}>
                <td className="ps-3 fw-semibold">{p.nombre}</td>
                <td className="text-muted">{p.identificacion_fiscal ?? '—'}</td>
                <td>
                  <span className={`badge rounded-pill ${p.es_interna ? 'text-bg-primary' : 'text-bg-secondary'}`}>
                    {p.es_interna ? 'Interna' : 'Externa'}
                  </span>
                </td>
                <td>{fecha(p.fecha_firma)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}