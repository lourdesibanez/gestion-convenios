import { tamanio } from './Formato';

export default function DocumentosCard({ documentos = [], admin = false }) {
  return (
    <div className="card shadow-sm">
      <div className="card-body small">
        <h2 className="h6 text-primary">Documentos</h2>

        {documentos.length === 0 && <p className="text-muted">Sin documentos.</p>}

        {documentos.map((d) => (
          <div key={d.id} className="d-flex align-items-start gap-2 mb-2">
            <span className="badge text-bg-danger">
              {d.tipo_mime?.includes('pdf') ? 'PDF' : 'ARCH'}
            </span>
            <div>
              <div className="fw-semibold">{d.nombre}</div>
              <div className="text-muted" style={{ fontSize: '.75rem' }}>
                {[d.tipo_documento, tamanio(d.tamanio_bytes)].filter(Boolean).join(' · ')}
              </div>
            </div>
          </div>
        ))}

        {admin && (
          <button className="btn btn-outline-secondary btn-sm w-100 border-dashed">
            + Adjuntar PDF (máx. 20 MB)
          </button>
        )}
      </div>
    </div>
  )
}