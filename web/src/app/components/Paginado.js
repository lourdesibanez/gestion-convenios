export default function Paginado({
  pagina,
  totalPaginas,
  desde,
  hasta,
  total,
  onCambiar,
  porPagina = 10,
}) {
  const cantidad = Math.max(0, Number(total) || 0)
  const paginas = Math.max(1, Number(totalPaginas) || 1)

  const paginaActual = Math.min(
    Math.max(1, Number(pagina) || 1),
    paginas
  )

  const ini = Math.max(
    1,
    Math.min(paginaActual - 2, paginas - 4)
  )

  const fin = Math.min(paginas, ini + 4)

  const numeros = Array.from(
    { length: fin - ini + 1 },
    (_, i) => ini + i
  )

  const primerResultado =
    cantidad === 0 ? 0 : desde ?? ((paginaActual - 1) * porPagina + 1)

  const ultimoResultado =
    cantidad === 0 ? 0 : hasta ?? Math.min(paginaActual * porPagina, cantidad)

  return (
    <div className="card-footer bg-white d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 py-2">
      <span className="small text-muted">
        Mostrando {primerResultado}-{ultimoResultado} de {cantidad} resultados
      </span>

      <ul className="pagination pagination-sm mb-0">
        <li className={`page-item ${paginaActual === 1 ? 'disabled' : ''}`}>
          <button
            type="button"
            className="page-link"
            disabled={paginaActual === 1}
            onClick={() => onCambiar(paginaActual - 1)}
            aria-label="Página anterior"
          >
            &lsaquo;
          </button>
        </li>

        {numeros.map((n) => (
          <li key={n} className={`page-item ${n === paginaActual ? 'active' : ''}`}>
            <button
              type="button"
              className="page-link"
              disabled={n === paginaActual}
              onClick={() => onCambiar(n)}
              aria-current={n === paginaActual ? 'page' : undefined}
          >
              {n}
          </button>
          </li>
        ))}

        <li className={`page-item ${paginaActual === paginas ? 'disabled' : ''}`}>
          <button
            type="button"
            className="page-link"
            disabled={paginaActual === paginas}
            onClick={() => onCambiar(paginaActual + 1)}
            aria-label="Página siguiente"
          >
            &rsaquo;
          </button>
        </li>
      </ul>
    </div>
  )
}