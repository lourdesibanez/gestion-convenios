import { fecha } from '../Formato'

export default function PersonasTab({ representantes }) {
  if (representantes.length === 0) return <p className="small text-muted">Sin personas asociadas.</p>

  return (
    <div className="card shadow-sm">
      <div className="table-responsive">
        <table className="table table-sm align-middle mb-0 small">
          <thead className="table-light">
            <tr>
              <th className="ps-3">Nombre</th>
              <th>Rol</th>
              <th>Correo</th>
              <th>Teléfono</th>
              <th>Desde</th>
              <th>Hasta</th>
            </tr>
          </thead>
          <tbody>
            {representantes.map((r) => (
              <tr key={r.id_representante_instrumento}>
                <td className="ps-3 fw-semibold">{r.apellido}, {r.nombre}</td>
                <td className="text-capitalize">{r.rol}</td>
                <td>
                  {r.correo_electronico
                    ? <a href={`mailto:${r.correo_electronico}`}>{r.correo_electronico}</a>
                    : '—'}
                </td>
                <td className="text-nowrap">{r.telefono ?? '—'}</td>
                <td>{fecha(r.fecha_inicio)}</td>
                <td>{fecha(r.fecha_fin)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}