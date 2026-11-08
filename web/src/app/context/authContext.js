'use client'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const AuthContext = createContext(null)
const CLAVE = 'auth'

export function AuthProvider({ children }) {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [cargando, setCargando] = useState(true) // true hasta leer el storage

  // Al abrir la app, recupera la sesión guardada
  useEffect(() => {
    try {
      const guardado = localStorage.getItem(CLAVE) ?? sessionStorage.getItem(CLAVE)
      if (guardado) {
        const datos = JSON.parse(guardado)
        setUser(datos.user)
        setToken(datos.token)
      }
    } catch (err) {
      console.error('Sesión guardada inválida', err)
    }
    setCargando(false)
  }, [])

  const login = (user, token, recordar = false) => {
    localStorage.removeItem(CLAVE)
    sessionStorage.removeItem(CLAVE)
    // Con "Recordarme" persiste; sin tildar, se borra al cerrar el navegador
    const almacen = recordar ? localStorage : sessionStorage
    almacen.setItem(CLAVE, JSON.stringify({ user, token }))
    setUser(user)
    setToken(token)
  }

  const logout = useCallback(() => {
    localStorage.removeItem(CLAVE)
    sessionStorage.removeItem(CLAVE)
    setUser(null)
    setToken(null)
  }, [])

  // fetch con el token puesto; si el servidor responde 401, cierra la sesión
  const authFetch = useCallback(
    async (url, opciones = {}) => {
      const res = await fetch(url, {
        ...opciones,
        headers: {
          Accept: 'application/json',
          ...opciones.headers,
          Authorization: `Bearer ${token}`,
        },
      })
      if (res.status === 401) {
        logout()
        router.replace('/login')
      }
      return res
    },
    [token, logout, router]
  )

  return (
    <AuthContext.Provider
      value={{ user, token, isAuth: !!user && !!token, cargando, login, logout, authFetch }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)