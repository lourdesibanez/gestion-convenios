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