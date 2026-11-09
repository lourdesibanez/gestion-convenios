'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../app/context/authContext'
import { enviarJson } from '../lib/api'

export default function Header({ onMenu, admin = false }) {
  const { user, token, isAuth, logout } = useAuth()
  const router = useRouter()

  const salir = async () => {
    try {
      await enviarJson('/api/auth/logout', {}, token) // invalida el token en el servidor
    } catch {}
    logout()
    router.replace('/login')
  }

  return (
    <header className="header">
      {onMenu && (
        <button className="boton-hamburguesa" aria-label="Abrir menú" onClick={onMenu}>☰</button>
      )}

      <div className='header-contenido'>
          <h3 className='header-titulo'>Convenios</h3>
          <div className="header-opciones d-flex align-items-center gap-2">
          {admin ? (
            <>
              <span className="small">{user?.nombre} {user?.apellido}</span>
              <button className="btn btn-outline-danger btn-sm" onClick={salir}>Cerrar sesión</button>
            </>
          ) : isAuth ? (
            <Link href="/admin" className="btn btn-primary">Ir al panel</Link>
          ) : (
            <Link href="/login" className="btn btn-primary">Iniciar Sesión</Link>
          )}
        </div>
      </div>
    </header>
  )
}