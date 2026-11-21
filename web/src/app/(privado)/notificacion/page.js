'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/app/context/authContext'
import { actualizarJson, obtenerUno } from '@/app/lib/api'
import { fechaHora } from '@/app/components/convenio/Formato'

export default function NotificacionesPage() {
  const { token, isAuth, cargando: cargandoSesion } = useAuth()
  const [notificaciones, setNotificaciones] = useState([])
  const [sinLeer, setSinLeer] = useState(0)
  const [pagina, setPagina] = useState(1)
  const [ultimaPagina, setUltimaPagina] = useState(1)
  const [cargando, setCargando] = useState(true)
  const [cargandoMas, setCargandoMas] = useState(false)
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState('')

  const cargar = useCallback(async (numeroPagina = 1, agregar = false) => {
    if (!token) return
    setError('')
    if (agregar) setCargandoMas(true)
    else setCargando(true)

    try {
      const datos = await obtenerUno(`/api/notifications?page=${numeroPagina}`, token)
      setNotificaciones((actuales) =>
        agregar ? [...actuales, ...(datos.data ?? [])] : (datos.data ?? [])
      )
      setSinLeer(Number(datos.unread_count ?? 0))
      setPagina(Number(datos.meta?.current_page ?? numeroPagina))
      setUltimaPagina(Number(datos.meta?.last_page ?? 1))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudieron cargar las notificaciones.')
    } finally {
      setCargando(false)
      setCargandoMas(false)
    }
  }, [token])

  useEffect(() => {
    if (cargandoSesion || !isAuth || !token) return

    cargar(1)
    const intervalo = window.setInterval(() => cargar(1), 30000)
    return () => window.clearInterval(intervalo)
  }, [cargandoSesion, isAuth, token, cargar])

  const marcarLeida = async (notificacion) => {
    if (notificacion.leido) return
    try {
      await actualizarJson(`/api/notifications/${notificacion.id}/read`, {}, token)
      setNotificaciones((actuales) =>
        actuales.map((item) =>
          item.id === notificacion.id ? { ...item, leido: true } : item
        )
      )
      setSinLeer((actual) => Math.max(0, actual - 1))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo marcar como leída.')
    }
  }

  const marcarTodasLeidas = async () => {
    if (procesando || sinLeer === 0) return
    setProcesando(true)
    setError('')
    try {
      await actualizarJson('/api/notifications/read-all', {}, token)
      setNotificaciones((actuales) => actuales.map((item) => ({ ...item, leido: true })))
      setSinLeer(0)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudieron marcar las notificaciones.')
    } finally {
      setProcesando(false)
    }
  }

  const abrirConvenio = async (notificacion) => {
    await marcarLeida(notificacion)
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3 gap-3">
        <div>
          <h1 className="h4 text-primary mb-1">Notificaciones</h1>
          <p className="small text-muted mb-0">
            {sinLeer === 0
              ? 'No tienes notificaciones sin leer.'
              : `${sinLeer} notificación${sinLeer === 1 ? '' : 'es'} sin leer.`}
          </p>
        </div>
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={marcarTodasLeidas}
          disabled={procesando || sinLeer === 0}
        >
          {procesando ? 'Marcando...' : 'Marcar todas como leídas'}
        </button>
      </div>

      {error && <div className="alert alert-danger small">{error}</div>}

      {cargando ? (
        <div className="card shadow-sm">
          <div className="card-body text-center text-muted py-4">Cargando notificaciones...</div>
        </div>
      ) : notificaciones.length === 0 ? (
        <div className="card shadow-sm">
          <div className="card-body text-center text-muted py-5">
            Todavía no hay notificaciones.
          </div>
        </div>
      ) : (
        <>
          <div className="d-flex flex-column gap-2">
            {notificaciones.map((notificacion) => (
              <article
                key={notificacion.id}
                className={`card shadow-sm ${notificacion.leido ? '' : 'border-primary'}`}
              >
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start gap-3">
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        {!notificacion.leido && (
                          <span
                            className="d-inline-block rounded-circle bg-primary"
                            style={{ width: 8, height: 8 }}
                            aria-label="Sin leer"
                          />
                        )}
                        <span className="small fw-semibold text-primary">
                          {notificacion.tipo === 'convenio_firmado'
                            ? 'Convenio firmado'
                            : notificacion.tipo === 'firma_registrada'
                              ? 'Firma registrada'
                              : 'Notificación'}
                        </span>
                      </div>
                      <p className="mb-1">{notificacion.mensaje}</p>
                      {notificacion.convenio && (
                        <p className="small text-muted mb-0">
                          {notificacion.convenio.codigo} · {notificacion.convenio.titulo}
                        </p>
                      )}
                    </div>
                    <time className="small text-muted text-nowrap">
                      {fechaHora(notificacion.created_at)}
                    </time>
                  </div>

                  <div className="d-flex gap-2 mt-3">
                    {notificacion.id_instrumento && (
                      <Link
                        href={`/convenios/${notificacion.id_instrumento}`}
                        className="btn btn-primary btn-sm"
                        onClick={() => abrirConvenio(notificacion)}
                      >
                        Ver convenio
                      </Link>
                    )}
                    {!notificacion.leido && (
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => marcarLeida(notificacion)}
                      >
                        Marcar como leída
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>

          {pagina < ultimaPagina && (
            <div className="text-center mt-3">
              <button
                type="button"
                className="btn btn-outline-primary btn-sm"
                onClick={() => cargar(pagina + 1, true)}
                disabled={cargandoMas}
              >
                {cargandoMas ? 'Cargando...' : 'Cargar más'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
