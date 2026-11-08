const CAMPOS = [
  ['Objeto', (c) => c.objeto],
  ['Alcance', (c) => c.alcance_actividades],
  ['Obligaciones', (c) => c.obligaciones],
  ['Rescisión', (c) => c.condiciones_terminacion],
  ['Marco legal', (c) => c.marco_legal],
  ['Resolución / expediente', (c) =>
    [c.numero_resolucion, c.referencia_expediente].filter(Boolean).join(' · ')],
  ['Confidencialidad', (c) => c.confidencialidad],
]

export default function FichaConvenio({ convenio }) {
  return (
    <div className="card shadow-sm">
      <div className="card-body">
        {CAMPOS.map(([label, obtener], i) => (
          <div
            key={label}
            className={`row small py-2 ${i < CAMPOS.length - 1 ? 'border-bottom' : ''}`}
          >
            <div className="col-sm-4 text-muted">{label}</div>
            <div className="col-sm-8">{obtener(convenio) || '—'}</div>
          </div>
        ))}
      </div>
    </div>
  )
}