import { fechaHora, tamanio } from '../Formato'

export default function DocumentosTab({ archivos, admin }) {
  return (
    <div className="card shadow-sm">
      <div className="card-body small">
        {archivos.length === 0 && <p className="text-muted">Sin documentos adjuntos.</p>}

        {archivos.map((a) => (
          <div key={a.id} className="d-flex align-items-center gap-3 py-2 border-bottom">
            <span className="badge text-bg-danger">
              {a.tipo_mime?.includes('pdf') ? 'PDF' : 'ARCH'}
            </span>
            <div className="flex-grow-1">
              <div className="fw-semibold">{a.nombre}</div>
              <div className="text-muted">
                {a.tipo_documento?.replaceAll('_', ' ')} · {tamanio(a.tamanio_bytes)} · cargado el {fechaHora(a.created_at)}
              </div>
            </div>
          </div>
        ))}

        {admin && (
          <button className="btn btn-outline-secondary btn-sm w-100 border-dashed mt-3">
            + Adjuntar PDF (máx. 20 MB)
          </button>
        )}
      </div>
    </div>
  )
}