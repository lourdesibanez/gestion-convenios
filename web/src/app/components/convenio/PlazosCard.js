import { fecha } from './Formato'

export default function PlazosCard({ convenio: c }) {
  const filas = [
    ['Inicio', fecha(c.fecha_inicio)],
    ['Vencimiento', fecha(c.vencimiento)],
    ['Preaviso', fecha(c.fecha_preaviso), true],
    ['Renovación', c.condiciones_renovacion || '—'],
  ]

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h2 className="h6 text-primary">Plazos</h2>
        {filas.map(([label, valor, destacar]) => (
          <div key={label} className="d-flex justify-content-between gap-3 small py-1">
            <span className="text-muted">{label}</span>
            <span className={`text-end ${destacar ? 'fw-semibold text-warning-emphasis' : ''}`}>
              {valor}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}