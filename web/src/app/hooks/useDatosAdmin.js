'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '../../app/context/authContext'

// Pide datos protegidos: espera a que haya sesión, le pasa el token a `pedir`
// y, si el servidor responde 401, cierra la sesión (el guard redirige al login).
export default function useDatosAdmin(pedir) {
  const { token, isAuth, cargando: sesionCargando, logout } = useAuth()
  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (sesionCargando || !isAuth) return
    let activo = true

    pedir(token)
      .then((d) => activo && setDatos(d))
      .catch((err) => {
        if (!activo) return
        if (err.status === 401) logout()
        else setError('No se pudieron cargar los datos.')
      })
      .finally(() => activo && setCargando(false))

    return () => { activo = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, isAuth, sesionCargando, logout])

  return { datos, cargando, error }
}