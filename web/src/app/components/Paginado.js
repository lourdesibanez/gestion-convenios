export default function Paginado({ pagina, totalPaginas, desde, hasta, total, onCambiar }) {
  const ini = Math.max(1, Math.min(pagina - 2, totalPaginas - 4))
  const fin = Math.min(totalPaginas, ini + 4)
  const numeros = Array.from({ length: fin - ini + 1 }, (_, i) => ini + i)

  return (
    <div className="card-footer bg-white d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 py-2">
      <span className="small text-muted">
        Mostrando {desde}-{hasta} de {total} resultados
      </span>

      <ul className="pagination pagination-sm mb-0">
        <li className={`page-item ${pagina === 1 ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => onCambiar(pagina - 1)}>&lsaquo;</button>
        </li>
        {numeros.map((n) => (
          <li key={n} className={`page-item ${n === pagina ? 'active' : ''}`}>
            <button className="page-link" onClick={() => onCambiar(n)}>{n}</button>
          </li>
        ))}
        <li className={`page-item ${pagina === totalPaginas ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => onCambiar(pagina + 1)}>&rsaquo;</button>
        </li>
      </ul>
    </div>
  )
}