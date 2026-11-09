export const COLOR_ESTADO = {
  borrador: 'secondary',
  revision: 'warning',
  aprobado: 'primary',
  firmado: 'success',
  rescindido: 'danger',
}

// minúsculas y sin tildes: "Revisión" → "revision"
export const norm = (t) =>
  (t ?? '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()

export function filtrarConvenios(convenios, filtros = {}) {
  const { buscar, tipo, estado, unidad, firmadoDesde } = filtros

  return convenios.filter((c) => {
    if (buscar && !norm(`${c.codigo} ${c.titulo} ${c.tipo} ${c.unidad}`).includes(norm(buscar))) return false
    if (tipo && !norm(c.tipo).includes(norm(tipo))) return false
    if (estado && norm(c.estado) !== norm(estado)) return false
    if (unidad && norm(c.unidad) !== norm(unidad)) return false
    if (firmadoDesde && (!c.fecha_firma || c.fecha_firma < firmadoDesde)) return false
    return true
  })
}

export function paginar(lista, pagina, porPagina = 7) {
  const total = lista.length
  const totalPaginas = Math.max(1, Math.ceil(total / porPagina))
  const inicio = (pagina - 1) * porPagina

  return {
    items: lista.slice(inicio, inicio + porPagina),
    total,
    totalPaginas,
    desde: total === 0 ? 0 : inicio + 1,
    hasta: Math.min(pagina * porPagina, total),
  }
}

// días desde hoy hasta una fecha "YYYY-MM-DD" (negativo = ya venció)
export function diasHasta(fechaISO, hoy) {
  const [y, m, d] = fechaISO.slice(0, 10).split('-').map(Number)
  return Math.round((new Date(y, m - 1, d) - hoy) / 86400000)
}



// Filtra una lista por texto, buscando en los campos indicados
export const filtrarTexto = (lista, texto, campos) => {
  const q = norm(texto)
  if (!q) return lista
  return lista.filter((item) => norm(campos.map((c) => item[c]).join(' ')).includes(q))
}

// { borrador: 3, revision: 1, ... }
export function contarPorEstado(convenios) {
  return convenios.reduce((acc, c) => {
    const k = norm(c.estado)
    acc[k] = (acc[k] ?? 0) + 1
    return acc
  }, {})
}

// ---------- Vencimientos ----------
export const HORIZONTES = [
  { id: 'todos', label: 'Todos' },
  { id: 'vencidos', label: 'Vencidos' },
  { id: '30', label: 'Próximos 30 días' },
  { id: '90', label: 'Próximos 90 días' },
  { id: '180', label: 'Próximos 180 días' },
]

// Solo los que tienen vencimiento y siguen vivos, con los días que faltan, del más urgente al más lejano
export function prepararVencimientos(convenios, hoy) {
  if (!hoy) return []
  return convenios
    .filter((c) => c.vence && !['borrador', 'rescindido'].includes(norm(c.estado)))
    .map((c) => ({ ...c, dias: diasHasta(c.vence, hoy) }))
    .sort((a, b) => a.dias - b.dias)
}

export function resumirVencimientos(lista) {
  return {
    vencidos: lista.filter((c) => c.dias < 0).length,
    d30: lista.filter((c) => c.dias >= 0 && c.dias <= 30).length,
    d90: lista.filter((c) => c.dias > 30 && c.dias <= 90).length,
    despues: lista.filter((c) => c.dias > 90).length,
  }
}

export function filtrarPorHorizonte(lista, horizonte) {
  if (horizonte === 'todos') return lista
  if (horizonte === 'vencidos') return lista.filter((c) => c.dias < 0)
  const limite = Number(horizonte)
  return lista.filter((c) => c.dias >= 0 && c.dias <= limite)
}