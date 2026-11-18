'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import { useAuth } from '@/app/context/authContext'
import { obtenerConveniosPrivados } from '@/model/convenioModel'

function normalizar(valor) {
  return String(valor ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function fechaLegible(valor) {
  if (!valor) return 'Sin vencimiento registrado'

  const fecha = String(valor).slice(0, 10)
  const [anio, mes, dia] = fecha.split('-')

  if (!anio || !mes || !dia) return valor

  return `${dia}/${mes}/${anio}`
}

// El listado general devuelve árboles de convenios vinculados.
// Recorremos cada árbol y extraemos todos los que estén en revisión.
function extraerConveniosEnRevision(arboles) {
  const encontrados = []
  const visitados = new Set()

  function recorrer(nodo) {
    if (!nodo || typeof nodo !== 'object') return

    const identificador = nodo.id != null
      ? String(nodo.id)
      : null

    if (
      normalizar(nodo.estado) === 'revision' &&
      identificador &&
      !visitados.has(identificador)
    ) {
      visitados.add(identificador)
      encontrados.push(nodo)
    }

    if (Array.isArray(nodo.hijos)) {
      nodo.hijos.forEach((relacion) => {
        recorrer(relacion?.convenio)
      })
    }
  }

  if (Array.isArray(arboles)) {
    arboles.forEach(recorrer)
  }

  return encontrados
}

export default function RevisionPage() {
  const router = useRouter()

  const {
    token,
    isAuth,
    cargando: sesionCargando,
    logout,
  } = useAuth()

  const [convenios, setConvenios] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [pagina, setPagina] = useState(1)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const porPagina = 10

  useEffect(() => {
    if (sesionCargando) return

    if (!isAuth || !token) {
      router.replace('/login')
      return
    }

    let activo = true

    async function cargarRevision() {
      setCargando(true)
      setError(null)

      try {
        // Utilizamos el listado privado general, no el endpoint
        // exclusivo de usuarios con permiso de aprobación.
        const arboles = await obtenerConveniosPrivados(token)

        if (!activo) return

        const pendientes = extraerConveniosEnRevision(arboles)

        setConvenios(pendientes)
      } catch (err) {
        if (!activo) return

        if (err.status === 401) {
          logout()
          router.replace('/login')
          return
        }

        if (err.status === 403) {
          setError(
            'Tu usuario no tiene permiso para consultar los convenios.'
          )
          return
        }

        setError(
          err.datos?.message ??
          err.message ??
          'No se pudieron cargar los convenios pendientes de revisión.'
        )
      } finally {
        if (activo) setCargando(false)
      }
    }

    cargarRevision()

    return () => {
      activo = false
    }
  }, [token, isAuth, sesionCargando, logout, router])

  const filtrados = useMemo(() => {
    const consulta = normalizar(busqueda)

    if (!consulta) return convenios

    return convenios.filter((convenio) =>
      normalizar([
        convenio.codigo,
        convenio.titulo,
        convenio.tipo,
        convenio.unidad,
      ].join(' ')).includes(consulta)
    )
  }, [convenios, busqueda])

  const pendientes = convenios.length

  const unidadesConPendientes = new Set(
    convenios
      .map((convenio) => normalizar(convenio.unidad))
      .filter(Boolean)
  ).size

  const totalPaginas = Math.max(
    1,
    Math.ceil(filtrados.length / porPagina)
  )

  const paginaActual = Math.min(pagina, totalPaginas)

  const items = filtrados.slice(
    (paginaActual - 1) * porPagina,
    paginaActual * porPagina
  )

  function abrirConvenio(id) {
    router.push(`/convenios/${id}`)
  }

  if (sesionCargando || cargando) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border spinner-border-sm text-primary me-2" />
        <span className="small text-muted">
          Cargando bandeja de revisión...
        </span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        {error}
      </div>
    )
  }

  return (
    <div className="container-fluid px-0">

      <div className="mb-4">
        <h1 className="h4 mb-1">Bandeja de revisión</h1>
        <p className="small text-muted mb-0">
          Convenios pendientes de revisión dentro de tus unidades autorizadas.
        </p>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-12 col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="small text-muted">
                Convenios en revisión
              </div>
              <div className="display-6 text-primary">
                {pendientes}
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="small text-muted">
                Unidades con convenios pendientes
              </div>
              <div className="display-6 text-primary">
                {unidadesConPendientes}
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="card shadow-sm">
        <div className="card-header bg-white py-3">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div>
              <h2 className="h6 mb-1">Convenios pendientes</h2>
              <span className="small text-muted">
                {filtrados.length} resultados
              </span>
            </div>

            <div style={{ width: 'min(100%, 340px)' }}>
              <input
                type="search"
                className="form-control form-control-sm"
                placeholder="Buscar por código, título o unidad..."
                value={busqueda}
                onChange={(event) => {
                  setBusqueda(event.target.value)
                  setPagina(1)
                }}
              />
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light small">
              <tr>
                <th className="ps-3">Código / Convenio</th>
                <th>Tipo</th>
                <th>Unidad</th>
                <th>Estado</th>
                <th>Vencimiento</th>
                <th className="text-end pe-3">Acción</th>
              </tr>
            </thead>

            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center text-muted py-5"
                  >
                    {convenios.length === 0
                      ? 'No hay convenios pendientes de revisión.'
                      : 'No se encontraron coincidencias.'}
                  </td>
                </tr>
              ) : (
                items.map((convenio) => (
                  <tr key={convenio.id}>
                    <td className="ps-3">
                      <div className="fw-semibold text-primary">
                        {convenio.codigo ?? '—'}
                      </div>
                      <div className="small text-muted">
                        {convenio.titulo ?? 'Sin título'}
                      </div>
                    </td>

                    <td className="small">
                      {convenio.tipo ?? '—'}
                    </td>

                    <td className="small">
                      {convenio.unidad ?? '—'}
                    </td>

                    <td>
                      <span className="badge rounded-pill text-bg-warning">
                        Revisión
                      </span>
                    </td>

                    <td className="small text-nowrap">
                      {fechaLegible(convenio.vence)}
                    </td>

                    <td className="text-end pe-3">
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => abrirConvenio(convenio.id)}
                      >
                        Revisar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filtrados.length > porPagina && (
          <div className="card-footer bg-white d-flex justify-content-between align-items-center">
            <span className="small text-muted">
              Página {paginaActual} de {totalPaginas}
            </span>

            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setPagina((actual) => Math.max(1, actual - 1))}
                disabled={paginaActual === 1}
              >
                Anterior
              </button>

              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={() =>
                  setPagina((actual) => Math.min(totalPaginas, actual + 1))
                }
                disabled={paginaActual === totalPaginas}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}