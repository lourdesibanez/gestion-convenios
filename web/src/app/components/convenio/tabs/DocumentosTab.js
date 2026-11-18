'use client'

import { useRef, useState } from 'react'
import { fechaHora, tamanio } from '../Formato'
import { TIPOS_DOCUMENTO_CONVENIO } from '@/model/convenioModel'

const TAMANO_MAXIMO = 20 * 1024 * 1024

export default function DocumentosTab({
  archivos = [],
  puedeSubir = false,
  onSubir,
  subiendo = false,
  errorCarga = null,
  mensajeCarga = null,
}) {
  const [tipoDocumento, setTipoDocumento] = useState('borrador')
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null)
  const [errorLocal, setErrorLocal] = useState(null)

  const inputRef = useRef(null)

  function seleccionarArchivo(event) {
    const archivo = event.target.files?.[0] ?? null

    setErrorLocal(null)
    setArchivoSeleccionado(null)

    if (!archivo) return

    if (!archivo.name.toLowerCase().endsWith('.pdf')) {
      setErrorLocal('El archivo debe tener formato PDF.')
      event.target.value = ''
      return
    }

    if (
      archivo.type &&
      !['application/pdf', 'application/x-pdf'].includes(archivo.type)
    ) {
      setErrorLocal('El archivo seleccionado no es un PDF válido.')
      event.target.value = ''
      return
    }

    if (archivo.size > TAMANO_MAXIMO) {
      setErrorLocal('El archivo supera el tamaño máximo de 20 MB.')
      event.target.value = ''
      return
    }

    setArchivoSeleccionado(archivo)
  }

  async function manejarSubida(event) {
    event.preventDefault()

    setErrorLocal(null)

    if (!puedeSubir) {
      setErrorLocal('No tenés permiso para subir documentos.')
      return
    }

    if (!archivoSeleccionado) {
      setErrorLocal('Seleccioná un archivo PDF.')
      return
    }

    if (!TIPOS_DOCUMENTO_CONVENIO.some(
      (tipo) => tipo.value === tipoDocumento
    )) {
      setErrorLocal('Seleccioná un tipo de documento válido.')
      return
    }

    if (typeof onSubir !== 'function') {
      setErrorLocal('No está disponible la función de carga.')
      return
    }

    const resultado = await onSubir(
      tipoDocumento,
      archivoSeleccionado
    )

    if (resultado) {
      setArchivoSeleccionado(null)

      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="h6 mb-0">
          Documentos adjuntos
        </h2>

        <span className="badge text-bg-secondary">
          {archivos.length}
        </span>
      </div>

      {archivos.length === 0 ? (
        <p className="text-muted small mb-3">
          Sin documentos adjuntos.
        </p>
      ) : (
        <div className="list-group list-group-flush mb-3">
          {archivos.map((archivo) => (
            <div
              key={archivo.id}
              className="list-group-item px-0 d-flex align-items-center gap-3"
            >
              <span className="badge text-bg-danger">
                {archivo.tipo_mime?.includes('pdf') ||
                archivo.nombre?.toLowerCase().endsWith('.pdf')
                  ? 'PDF'
                  : 'ARCH'}
              </span>

              <div className="flex-grow-1 min-width-0">
                <div className="fw-semibold small text-break">
                  {archivo.nombre}
                </div>

                <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                  {archivo.tipo_documento?.replaceAll('_', ' ') || 'Documento'}
                  {' · '}
                  {tamanio(archivo.tamanio_bytes)}
                  {' · '}
                  cargado el {fechaHora(archivo.created_at)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {puedeSubir && (
        <div className="border rounded p-3 mt-3">
          <h3 className="h6 mb-3">
            Adjuntar documento
          </h3>

          <form onSubmit={manejarSubida}>
            <div className="mb-3">
              <label
                htmlFor="tipo-documento"
                className="form-label small fw-semibold"
              >
                Tipo de documento
              </label>

              <select
                id="tipo-documento"
                className="form-select form-select-sm"
                value={tipoDocumento}
                onChange={(event) => setTipoDocumento(event.target.value)}
                disabled={subiendo}
              >
                {TIPOS_DOCUMENTO_CONVENIO.map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label
                htmlFor="archivo-documento"
                className="form-label small fw-semibold"
              >
                Archivo PDF
              </label>

              <input
                ref={inputRef}
                id="archivo-documento"
                type="file"
                className="form-control form-control-sm"
                accept=".pdf,application/pdf"
                onChange={seleccionarArchivo}
                disabled={subiendo}
              />

              <div className="form-text">
                Formato PDF. Tamaño máximo: 20 MB.
              </div>
            </div>

            {archivoSeleccionado && (
              <div className="small text-muted mb-3">
                Archivo seleccionado: {archivoSeleccionado.name}
                {' · '}
                {tamanio(archivoSeleccionado.size)}
              </div>
            )}

            {errorLocal && (
              <div className="alert alert-danger py-2 small">
                {errorLocal}
              </div>
            )}

            {errorCarga && (
              <div className="alert alert-danger py-2 small">
                {errorCarga}
              </div>
            )}

            {mensajeCarga && (
              <div className="alert alert-success py-2 small">
                {mensajeCarga}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-sm w-100"
              disabled={subiendo || !archivoSeleccionado}
            >
              {subiendo ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Subiendo documento...
                </>
              ) : (
                'Subir documento'
              )}
            </button>
          </form>
        </div>
      )}

      {!puedeSubir && archivos.length > 0 && (
        <p className="text-muted small mb-0">
          No tenés permisos para adjuntar documentos a este convenio.
        </p>
      )}
    </div>
  )
}