
const tarjetas = [
  {
    id: 'firmados',
    titulo: 'Firmados último año',
    campo: 'firmados_ultimo_anio',
    color: 'primary',
    icono: 'bi bi-file-earmark-check',
  },
  {
    id: 'vigentes',
    titulo: 'Convenios vigentes',
    campo: 'vigentes',
    color: 'success',
    icono: 'bi bi-check-circle',
  },
  {
    id: 'tramite',
    titulo: 'En trámite',
    campo: 'en_tramite',
    color: 'warning',
    icono: 'bi bi-hourglass-split',
  },
  {
    id: 'vencimientos',
    titulo: 'Vencen en 30 días',
    campo: 'vencen_30_dias',
    color: 'danger',
    icono: 'bi bi-calendar-event',
  },
]

export default function Estadisticas({ resumen = {} }) {
  return (
    <div className="row g-3 mb-3">
      {tarjetas.map((tarjeta) => (
        <div className="col-6 col-xl-3" key={tarjeta.id}>
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center justify-content-between">
              <div>
                <div className="text-muted small mb-2">
                  {tarjeta.titulo}
                </div>

                <div className={`fs-3 fw-bold text-${tarjeta.color}`}>
                  {resumen[tarjeta.campo] ?? 0}
                </div>
              </div>

              <div className={`rounded-3 bg-${tarjeta.color}-subtle text-${tarjeta.color} p-3`}>
                <i className={tarjeta.icono}></i>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
