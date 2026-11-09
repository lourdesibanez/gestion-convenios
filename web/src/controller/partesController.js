import { norm } from './convenioController'

export function filtrarInstituciones(lista, buscar, ambito) {
  const q = norm(buscar)
  return lista.filter((i) => {
    if (ambito === 'internas' && !i.es_interna) return false
    if (ambito === 'externas' && i.es_interna) return false
    if (q && !norm(`${i.nombre} ${i.identificacion_fiscal}`).includes(q)) return false
    return true
  })
}

export function filtrarPersonas(lista, buscar) {
  const q = norm(buscar)
  if (!q) return lista
  return lista.filter((p) =>
    norm(`${p.nombre} ${p.apellido} ${p.correo_electronico}`).includes(q)
  )
}