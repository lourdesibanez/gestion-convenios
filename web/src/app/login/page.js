'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../app/context/authContext'
import { enviarJson } from '../lib/api'
import '../css/login.css'

export default function Login() {
    const router = useRouter()
    const { login, isAuth, cargando: sesionCargando } = useAuth()

    const [datos, setDatos] = useState({ email: '', password: '', recordarme: false })
    const [cargando, setCargando] = useState(false)
    const [error, setError] = useState(null)

    // Si ya hay sesión, no tiene sentido ver el login
    useEffect(() => {
      if (!sesionCargando && isAuth) router.replace('/dashboard')
    }, [sesionCargando, isAuth, router])

    const handleChange = (e) => {
      const { name, value, type, checked } = e.target
      setDatos((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    }

    const handleSubmit = async (e) => {
      e.preventDefault()
      setError(null)
      setCargando(true)

      try {
        const data = await enviarJson('/api/auth/web/login', {
          email: datos.email,
          password: datos.password,
        })
        login(data.usuario, data.token, datos.recordarme)
        router.replace('/dashboard')
      } catch (err) {
        if (err.status === 422) setError(err.datos?.errors?.email?.[0] ?? 'Revisá los datos ingresados.')
        else if (err.status === 403) setError(err.datos?.message ?? 'El usuario está suspendido.')
        else setError('No se pudo conectar con el servidor.')
      } finally {
        setCargando(false)
      }
    }
    return (
    <div className="login">
      {/* Panel izquierdo */}
      <section className="login-panel">
        <Link href="/convenios" className="login-marca">
          <span className="login-marca-icono">
            <img src="/logo.png" alt="Logo" />
          </span>
          <span>Convenios UNLPam</span>
        </Link>

        <div className="login-mensaje">
          <h1>Gestión de convenios marco, específicos y pasantías.</h1>
          <p>
            Registrá instrumentos, seguí el circuito de revisión y controlá
            vencimientos desde un solo lugar.
          </p>
          <div className="login-chips">
            <span>Borrador</span>
            <span>Revisión</span>
            <span>Aprobado</span>
            <span>Firmado</span>
          </div>
        </div>

        <small className="login-pie">Uso interno · Facultad de Ingeniería UNLPam</small>
      </section>

      {/* Panel derecho */}
      <section className="login-form-zona">
        <div className="login-form">
          <h2>Iniciar sesión</h2>
          <p className="login-sub">Usá tu cuenta institucional.</p>

          {error && (
            <div className="alert alert-danger small py-2" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Correo institucional</label>
              <input
                type="email"
                className="form-control"
                id="email"
                name="email"
                placeholder="nombre@unlpam.edu.ar"
                value={datos.email}
                onChange={handleChange}
                autoComplete="username"
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">Contraseña</label>
              <input
                type="password"
                className="form-control"
                id="password"
                name="password"
                value={datos.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
              />
            </div>

            <div className="d-flex justify-content-between align-items-center mb-3 small">
              <div className="form-check mb-0">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="recordarme"
                  name="recordarme"
                  checked={datos.recordarme}
                  onChange={handleChange}
                />
                <label htmlFor="recordarme" className="form-check-label">Recordarme</label>
              </div>
              <Link href="/recuperar" className="login-link">¿Olvidaste tu contraseña?</Link>
            </div>

            <button type="submit" className="btn btn-login w-100" disabled={cargando}>
              {cargando ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Ingresando...
                </>
              ) : (
                'Ingresar'
              )}
            </button>
          </form>

          <div className="login-info">
            <span aria-hidden="true">ⓘ</span>
            <span>Después te pedimos un código de verificación enviado a tu correo.</span>
          </div>
        </div>
      </section>
    </div>
  )
}