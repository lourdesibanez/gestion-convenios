'use client'

import { useState } from 'react'

function fechaHora(valor) {
  if (!valor) return '—'

  const fecha = new Date(valor)

  if (Number.isNaN(fecha.getTime())) return valor

  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(fecha)
}

function nombreUsuario(usuario) {
  if (!usuario) return 'Usuario'

  return [usuario.nombre, usuario.apellido]
    .filter(Boolean)
    .join(' ') || 'Usuario'
}

function estiloEstado(estado) {
  switch (estado) {
    case 'pendiente':
      return 'text-bg-warning'
    case 'respondida':
      return 'text-bg-info'
    case 'resuelta':
      return 'text-bg-success'
    default:
      return 'text-bg-secondary'
  }
}

export default function ObservacionesTab({
  observaciones = [],
  puedeCrear = false,
  puedeAprobar = false,
  puedeDevolver = false,
  esRevision = false,
  version,
  onCrear,
  onResponder,
  onResolver,
  onAprobar,
  onDevolver,
  guardando = false,
  error = null,
  mensaje = null,
}) {
  const [contenido, setContenido] = useState('')
  const [respuestas, setRespuestas] = useState({})
  const [fundamento, setFundamento] = useState('')
  const [errorLocal, setErrorLocal] = useState(null)

  const pendientes = observaciones.filter(
    (observacion) => observacion.estado === 'pendiente'
  ).length

  const respondidas = observaciones.filter(
    (observacion) => observacion.estado === 'respondida'
  ).length

  const resueltas = observaciones.filter(
    (observacion) => observacion.estado === 'resuelta'
  ).length

  async function crear(event) {
    event.preventDefault()
    setErrorLocal(null)

    const texto = contenido.trim()

    if (!texto) {
      setErrorLocal('Escribí el contenido de la observación.')
      return
    }

    const correcto = await onCrear?.(texto)

    if (correcto) {
      setContenido('')
    }
  }

  async function responder(id) {
    setErrorLocal(null)

    const texto = String(respuestas[id] ?? '').trim()

    if (!texto) {
      setErrorLocal('Escribí una respuesta antes de enviarla.')
      return
    }

    const correcto = await onResponder?.(id, texto)

    if (correcto) {
      setRespuestas((actuales) => ({
        ...actuales,
        [id]: '',
      }))
    }
  }

  async function resolver(id) {
    setErrorLocal(null)

    const confirmar = window.confirm(
      '¿Confirmás que la observación fue revisada y está resuelta?'
    )

    if (!confirmar) return

    await onResolver?.(id)
  }

  async function aprobar() {
    setErrorLocal(null)

    if (!puedeAprobar) {
      setErrorLocal('No tenés permiso para aprobar este convenio.')
      return
    }

    if (pendientes > 0 || respondidas > 0) {
      setErrorLocal(
        'No se puede aprobar: quedan observaciones pendientes o sin resolver.'
      )
      return
    }

    const confirmar = window.confirm(
      '¿Confirmás la aprobación administrativa de este convenio?'
    )

    if (!confirmar) return

    await onAprobar?.(fundamento.trim() || null)
  }

  async function devolver() {
    setErrorLocal(null)

    if (!puedeDevolver) {
      setErrorLocal('No tenés permiso para devolver este convenio.')
      return
    }

    const texto = fundamento.trim()

    if (!texto) {
      setErrorLocal('Ingresá el fundamento de la devolución.')
      return
    }

    if (pendientes === 0) {
      setErrorLocal(
        'Registrá al menos una observación pendiente antes de devolver el convenio.'
      )
      return
    }

    const confirmar = window.confirm(
      '¿Confirmás la devolución del convenio para su corrección?'
    )

    if (!confirmar) return

    await onDevolver?.(texto)
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <div>
          <h2 className="h6 mb-1">Observaciones de revisión</h2>
          <p className="small text-muted mb-0">
            Registro privado de observaciones y respuestas del trámite.
          </p>
        </div>

        <span className="badge text-bg-secondary">
          {observaciones.length} registros
        </span>
      </div>

      <div className="row g-2 mb-4">
        <div className="col-4">
          <div className="border rounded p-2 h-100">
            <div className="small text-muted">Pendientes</div>
            <div className="h5 mb-0 text-warning">
              {pendientes}
            </div>
          </div>
        </div>

        <div className="col-4">
          <div className="border rounded p-2 h-100">
            <div className="small text-muted">Respondidas</div>
            <div className="h5 mb-0 text-info">
              {respondidas}
            </div>
          </div>
        </div>

        <div className="col-4">
          <div className="border rounded p-2 h-100">
            <div className="small text-muted">Resueltas</div>
            <div className="h5 mb-0 text-success">
              {resueltas}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger py-2 small">
          {error}
        </div>
      )}

      {mensaje && (
        <div className="alert alert-success py-2 small">
          {mensaje}
        </div>
      )}

      {errorLocal && (
        <div className="alert alert-danger py-2 small">
          {errorLocal}
        </div>
      )}

      {observaciones.length === 0 ? (
        <div className="alert alert-light border small">
          Todavía no se registraron observaciones para este convenio.
        </div>
      ) : (
        <div className="d-flex flex-column gap-3 mb-4">
          {observaciones.map((observacion) => (
            <article
              key={observacion.id}
              className="border rounded p-3"
            >
              <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-2">
                <div>
                  <div className="fw-semibold small">
                    {nombreUsuario(observacion.usuario)}
                  </div>

                  <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                    Registrada el {fechaHora(observacion.created_at)}
                  </div>
                </div>

                <span
                  className={`badge rounded-pill ${estiloEstado(observacion.estado)}`}
                >
                  {observacion.estado}
                </span>
              </div>

              <div className="small text-break">
                {observacion.contenido}
              </div>

              {observacion.respuesta && (
                <div className="bg-light rounded p-3 mt-3">
                  <div className="small fw-semibold mb-1">
                    Respuesta de {nombreUsuario(observacion.respondido_por)}
                  </div>

                  <div className="small text-break">
                    {observacion.respuesta}
                  </div>

                  <div className="text-muted mt-2" style={{ fontSize: '0.8rem' }}>
                    Respondida el {fechaHora(observacion.fecha_respuesta)}
                  </div>
                </div>
              )}

              {observacion.fecha_resolucion && (
                <div className="small text-success mt-2">
                  Resuelta el {fechaHora(observacion.fecha_resolucion)}
                </div>
              )}

              {observacion.puede_responder && (
                <div className="mt-3">
                  <label
                    htmlFor={`respuesta-${observacion.id}`}
                    className="form-label small fw-semibold"
                  >
                    Responder observación
                  </label>

                  <textarea
                    id={`respuesta-${observacion.id}`}
                    className="form-control form-control-sm mb-2"
                    rows={3}
                    maxLength={2000}
                    value={respuestas[observacion.id] ?? ''}
                    onChange={(event) =>
                      setRespuestas((actuales) => ({
                        ...actuales,
                        [observacion.id]: event.target.value,
                      }))
                    }
                    disabled={guardando}
                    placeholder="Describí la corrección realizada..."
                  />

                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => responder(observacion.id)}
                    disabled={guardando}
                  >
                    Enviar respuesta
                  </button>
                </div>
              )}

              {observacion.puede_resolver && (
                <div className="mt-3">
                  <button
                    type="button"
                    className="btn btn-outline-success btn-sm"
                    onClick={() => resolver(observacion.id)}
                    disabled={guardando}
                  >
                    Marcar como resuelta
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {puedeCrear && (
        <div className="card bg-light border-0 mb-4">
          <div className="card-body">
            <h3 className="h6 mb-2">Registrar observación</h3>

            <form onSubmit={crear}>
              <label
                htmlFor="nueva-observacion"
                className="form-label small fw-semibold"
              >
                Descripción de la observación
              </label>

              <textarea
                id="nueva-observacion"
                className="form-control form-control-sm mb-2"
                rows={4}
                maxLength={2000}
                value={contenido}
                onChange={(event) => setContenido(event.target.value)}
                disabled={guardando}
                placeholder="Indicá qué información debe corregirse o completarse..."
              />

              <div className="d-flex justify-content-between align-items-center">
                <span className="small text-muted">
                  Máximo 2000 caracteres.
                </span>

                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={guardando || !contenido.trim()}
                >
                  Registrar observación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {esRevision && (
        <div className="card border">
          <div className="card-body">
            <h3 className="h6 mb-2">Decisión de revisión</h3>

            <p className="small text-muted">
              La aprobación es administrativa y no representa la firma del convenio.
            </p>

            <label
              htmlFor="fundamento-revision"
              className="form-label small fw-semibold"
            >
              Fundamento de la decisión
            </label>

            <textarea
              id="fundamento-revision"
              className="form-control form-control-sm mb-3"
              rows={3}
              maxLength={2000}
              value={fundamento}
              onChange={(event) => setFundamento(event.target.value)}
              disabled={guardando}
              placeholder="Fundamento o aclaración de la decisión..."
            />

            <div className="d-flex flex-wrap justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-outline-warning btn-sm"
                onClick={devolver}
                disabled={guardando}
              >
                Devolver para corrección
              </button>

              <button
                type="button"
                className="btn btn-success btn-sm"
                onClick={aprobar}
                disabled={guardando}
              >
                Aprobar convenio
              </button>
            </div>

            {(pendientes > 0 || respondidas > 0) && (
              <div className="form-text mt-2">
                No se puede aprobar: quedan observaciones pendientes o sin resolver.
              </div>
            )}

            <div className="form-text">
              Versión revisada: {version ?? '—'}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}