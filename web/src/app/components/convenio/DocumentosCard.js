export default function DocumentosCard({ documentos }) {
  return (
    <div className="card shadow-sm">
      <div className="card-body small">
        <h2 className="h6 text-primary">Documentos</h2>

        {documentos.map((d) => (
          <div key={d.id} className="d-flex align-items-start gap-2 mb-2">
            <span className="badge text-bg-danger">PDF</span>
            <div>
              <div className="fw-semibold">{d.nombre}</div>
              <div className="text-muted" style={{ fontSize: '.75rem' }}>
                {d.tipo} · {d.tamanio} · SHA-256 {d.hash}
              </div>
            </div>
          </div>
        ))}

        {/* Para el administrador
        <button className="btn btn-outline-secondary btn-sm w-100 border-dashed">
          + Adjuntar PDF (máx. 20 MB)
        </button>*/}
      </div>
    </div>
  )
}