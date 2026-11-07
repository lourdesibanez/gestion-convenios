const ETAPAS = [
  { clave: 'borrador', label: 'Borrador', color: 'secondary' },
  { clave: 'revision', label: 'Revisión', color: 'warning' },
  { clave: 'aprobado', label: 'Aprobado', color: 'primary' },
  { clave: 'firmado', label: 'Firmado', color: 'success' },
]

const norm = (t) =>
  (t ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

export default function LineaEstados({ estado, transiciones = [] }) {
  const actual = ETAPAS.findIndex((e) => e.clave === norm(estado))

  return (
    <div className="card shadow-sm">
      <div className="card-body py-3">
        <div className="row g-2">
          {ETAPAS.map((e, i) => {
            const alcanzada = i <= actual
            const fecha = transiciones.find((t) => norm(t.estado) === e.clave)?.fecha
            return (
              <div className="col-6 col-md-3" key={e.clave}>
                <div
                  className={alcanzada ? `bg-${e.color}` : 'bg-secondary-subtle'}
                  style={{ height: 6, borderRadius: 3 }}
                />
                <div className={`small mt-1 ${i === actual ? 'fw-bold text-primary' : 'text-muted'}`}>
                  {e.label}{fecha ? ` · ${fecha}` : ''}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}