
import { obtenerUno } from '../app/lib/api'

// Estadísticas, movimientos y datos del dashboard
export const obtenerHome = (token) =>
  obtenerUno('/api/home', token)

// Perfil real del usuario autenticado
export async function obtenerPerfil (token){
  const json = await obtenerUno('/api/auth/me', token);
  return json.data ?? json;
}

// Convenios que esperan firma
export const obtenerPendientesFirma = (token) =>
  obtenerUno('/api/signatures/pending', token)
