import { fechaHora } from '../Formato'

const COLOR = {
  borrador: 'secondary',
  revision: 'warning',
  aprobado: 'primary',
  firmado: 'success',
  rescindido: 'danger',
}
const norm = (t) =>
  (t ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

const Estado = ({ nombre }) => (
  <span className={`badge rounded-pill text-bg-${COLOR[norm(nombre)] ?? 'secondary'}`}>
    {nombre}
  </span>
)

export default function HistorialTab({ historial }) {
  if (historial.length === 0) return <p className="small text-muted">Sin cambios de estado.</p>

  return (
    <div className="card shadow-sm">
      <ul className="list-group list-group-flush small">
        {historial.map((h, i) => (
          <li key={i} className="list-group-item">
            <div className="d-flex flex-wrap justify-content-between gap-2">
              <div className="d-flex align-items-center gap-2">
                {h.estado_anterior ? (
                  <>
                    <Estado nombre={h.estado_anterior} />
                    <span className="text-muted">→</span>
                  </>
                ) : (
                  <span className="text-muted">Alta →</span>
                )}
                <Estado nombre={h.estado_nuevo} />
              </div>
              <span className="text-muted">{fechaHora(h.created_at)}</span>
            </div>
            <div className="mt-1">{h.fundamento}</div>
            <div className="text-muted">Por {h.usuario}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}