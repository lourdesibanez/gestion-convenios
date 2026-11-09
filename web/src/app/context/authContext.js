'use client'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)
const CLAVE = 'auth'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [cargando, setCargando] = useState(true) // true hasta leer el storage

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

  return (
    <AuthContext.Provider
      value={{ user, token, isAuth: !!user && !!token, cargando, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)