const CAMPOS = [
  ['Objeto', 'objeto'],
  ['Alcance', 'alcance'],
  ['Obligaciones', 'obligaciones'],
  ['Rescisión', 'rescision'],
  ['Marco legal', 'marco_legal'],
  ['Resolución / expediente', 'resolucion'],
  ['Confidencialidad', 'confidencialidad'],
]

export default function FichaConvenio({ convenio }) {
  return (
    <div className="card shadow-sm">
      <div className="card-body">
        {CAMPOS.map(([label, campo], i) => (
          <div
            key={campo}
            className={`row small py-2 ${i < CAMPOS.length - 1 ? 'border-bottom' : ''}`}
          >
            <div className="col-sm-4 text-muted">{label}</div>
            <div className="col-sm-8">{convenio[campo] ?? '—'}</div>
          </div>
        ))}
      </div>
    </div>
  )
}