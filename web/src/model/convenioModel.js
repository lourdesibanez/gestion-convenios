import { obtenerUno, obtenerTodos } from '../app/lib/api'

// ---------- Públicos ----------
export const obtenerConvenios = () => obtenerTodos('/api/convenios')
export const obtenerConveniosAdmin = (token) => obtenerTodos('/api/agreementsWeb', token)  // admin: según su alcance

export async function obtenerConvenioPublico(id) {
  try {
    const json = await obtenerUno(`/api/publico/convenios/${id}`)
    return json.data ?? json
  } catch (err) {
    if (err.status === 404) return null
    throw err
  }
}

// ---------- Administración (reciben el token del contexto) ----------
export async function obtenerConvenioAdmin(token, id) {
  try {
    const json = await obtenerUno(`/api/agreementsWeb/${id}`, token)
    return json.data ?? json
  } catch (err) {
    if (err.status === 404) return null
    throw err
  }
}

export const obtenerRevision = (token) => obtenerTodos('/api/agreementsWeb/review', token)
export const obtenerVencimientos = (token) => obtenerTodos('/api/agreementsWeb', token)
export const obtenerInstituciones = (token) => obtenerTodos('/api/unitsWeb', token)
export const obtenerRepresentantes = (token) => obtenerTodos('/api/peopleWeb', token)