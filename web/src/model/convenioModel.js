import { obtenerUno, obtenerTodos } from '../app/lib/api'

// ---------- Públicos ----------
export const obtenerConvenios = () => obtenerTodos('/api/public/agreements')
export const obtenerConveniosAdmin = (token) => obtenerTodos('/api/agreements', token)

export async function obtenerConvenioPublico(id) {
  try {
    const json = await obtenerUno(`/api/public/agreements/${id}`)
    return json.data ?? json
  } catch (err) {
    if (err.status === 404) return null
    throw err
  }
}

// ---------- Administración (reciben el token del contexto) ----------
export async function obtenerConvenioAdmin(token, id) {
  try {
    const json = await obtenerUno(`/api/agreements/${id}`, token)
    return json.data ?? json
  } catch (err) {
    if (err.status === 404) return null
    throw err
  }
}

export const obtenerRevision = (token) => obtenerTodos('/api/agreements/review', token)
export const obtenerVencimientos = (token) => obtenerTodos('/api/agreements', token)
export const obtenerInstituciones = (token) => obtenerTodos('/api/units', token)
export const obtenerRepresentantes = (token) => obtenerTodos('/api/people', token)