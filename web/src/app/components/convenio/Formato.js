// "2026-11-30" o "2026-11-30 10:20:00" → "30/11/2026"
export const fecha = (f) => {
  if (!f) return '—'
  const [y, m, d] = f.slice(0, 10).split('-')
  return `${d}/${m}/${y}`
}

export const tamanio = (bytes) => {
  if (!bytes) return ''
  return bytes >= 1048576
    ? `${(bytes / 1048576).toFixed(1)} MB`
    : `${Math.round(bytes / 1024)} KB`
}

// "2026-10-31 03:21:00" → "31/10/2026 03:21"
export const fechaHora = (f) => {
  if (!f) return '—'
  const [dia, hora = ''] = f.split(/[ T]/)
  const [y, m, d] = dia.split('-')
  return `${d}/${m}/${y}${hora ? ' ' + hora.slice(0, 5) : ''}`
}