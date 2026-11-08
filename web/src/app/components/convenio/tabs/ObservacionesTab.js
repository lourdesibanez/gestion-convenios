import { fechaHora } from '../Formato'

export default function ObservacionesTab({ observaciones }) {
  if (observaciones.length === 0) return <p className="small text-muted">Sin observaciones.</p>

  return (
    <div className="d-flex flex-column gap-3">
      {observaciones.map((o) => (
        <div key={o.id} className="card shadow-sm">
          <div className="card-body small">
            <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
              <span className="text-muted">
                {o.usuario} · {fechaHora(o.created_at)}
              </span>
              <span className={`badge rounded-pill text-bg-${o.estado === 'respondida' ? 'success' : 'warning'}`}>
                {o.estado}
              </span>
            </div>

            <p className="mb-2">{o.contenido}</p>

            {o.respuesta && (
              <div className="border-start border-3 ps-3 text-muted">
                <div>{o.respuesta}</div>
                <div className="mt-1">Respondida el {fechaHora(o.fecha_respuesta)}</div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}