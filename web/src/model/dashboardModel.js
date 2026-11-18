
import { obtenerUno } from '../app/lib/api'

// Estadísticas, movimientos y datos del dashboard
export const obtenerHome = (token) =>
  obtenerUno('/api/home', token)

// Perfil real del usuario autenticado
export const obtenerPerfil = (token) =>
  obtenerUno('/api/auth/me', token)

// Convenios que esperan firma
export const obtenerPendientesFirma = (token) =>
  obtenerUno('/api/signatures/pending', token)
