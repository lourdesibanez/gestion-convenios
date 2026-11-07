export default function PlazosCard({ convenio }) {
  const filas = [
    ['Inicio', convenio.inicio],
    ['Vencimiento', convenio.vence],
    ['Preaviso', convenio.preaviso, true],
    ['Renovación', convenio.renovacion],
  ]
  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h2 className="h6 text-primary">Plazos</h2>
        {filas.map(([label, valor, destacar]) => (
          <div key={label} className="d-flex justify-content-between small py-1">
            <span className="text-muted">{label}</span>
            <span className={destacar ? 'fw-semibold text-warning-emphasis' : ''}>
              {valor ?? '—'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}