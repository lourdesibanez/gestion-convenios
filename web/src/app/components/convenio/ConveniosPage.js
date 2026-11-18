'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/authContext'
import Paginado from '@/app/components/Paginado'

import {
  obtenerConveniosPrivados,
  obtenerOpcionesCreacion,
} from '@/model/convenioModel'

const ESTADOS = [
  'borrador',
  'revision',
  'aprobado',
  'firmado',
  'rescindido',
  'archivado',
]

function normalizar(valor) {
  return (valor ?? '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function mostrar(valor, alternativa = '—') {
  return valor === null || valor === undefined || valor === ''
    ? alternativa
    : valor
}

function fechaLegible(fecha) {
  if (!fecha) return null

  const [anio, mes, dia] = fecha.split('-')

  if (!anio || !mes || !dia) return fecha

  return `${dia}/${mes}/${anio}`
}

// Neutraliza valores que podrían interpretarse como fórmulas
// al abrir el CSV en Excel u otras planillas.
function escaparCeldaCSV(valor) {
  const texto = valor === null || valor === undefined
    ? ''
    : String(valor)

  // Detectar fórmulas incluso si están precedidas por espacios,
  // tabulaciones, saltos de línea o caracteres de control.
  const inicioSignificativo = texto.replace(
    /^[\s\u0000-\u001F\u007F-\u009F\uFEFF]+/u,
    ''
  )

  const esFormula = /^[=+\-@]/.test(inicioSignificativo)

  // El apóstrofo inicial obliga a tratar el contenido como texto.
  const seguro = esFormula ? `'${texto}` : texto

  // Escapar comillas dobles según las reglas CSV.
  return `"${seguro.replace(/"/g, '""')}"`
}

function claseEstado(estado) {
  switch (normalizar(estado)) {
    case 'firmado':
      return 'success'
    case 'aprobado':
      return 'primary'
    case 'revision':
      return 'warning'
    case 'rescindido':
      return 'danger'
    case 'archivado':
      return 'dark'
    case 'borrador':
    default:
      return 'secondary'
  }
}

// Devuelve el convenio y todos sus descendientes.
// Se utiliza para buscar y filtrar sin perder la estructura de vínculos.
function obtenerNodosArbol(convenio) {
  const nodos = [convenio]

  for (const relacion of convenio?.hijos ?? []) {
    if (relacion?.convenio) {
      nodos.push(...obtenerNodosArbol(relacion.convenio))
    }
  }

  return nodos
}

// Todos los filtros deben cumplirse sobre el mismo instrumento.
// Si coincide un descendiente, se conserva visible su convenio raíz.
function arbolCoincide(convenio, filtros) {
  const nodos = obtenerNodosArbol(convenio)

  return nodos.some((nodo) => {
    const texto = normalizar([
      nodo.codigo,
      nodo.titulo,
      nodo.tipo,
      nodo.categoria,
      nodo.ambito,
      nodo.unidad,
      nodo.numero_resolucion,
    ].join(' '))

    const busqueda = normalizar(filtros.q)

    const coincideTexto =
      !busqueda || texto.includes(busqueda)

    const coincideTipo =
      !filtros.tipo || nodo.tipo === filtros.tipo

    const coincideUnidad =
      !filtros.unidad || nodo.unidad === filtros.unidad

    const coincideEstado =
      !filtros.estado || normalizar(nodo.estado) === filtros.estado

    const fecha = nodo[filtros.campoFecha]

    const coincideDesde =
      !filtros.desde || (fecha && fecha >= filtros.desde)

    const coincideHasta =
      !filtros.hasta || (fecha && fecha <= filtros.hasta)

    return (
      coincideTexto &&
      coincideTipo &&
      coincideUnidad &&
      coincideEstado &&
      coincideDesde &&
      coincideHasta
    )
  })
}

function ordenarConvenios(convenios, orden) {
  const resultado = [...convenios]

  resultado.sort((a, b) => {
    if (orden === 'titulo') {
      return (a.titulo ?? '').localeCompare(
        b.titulo ?? '',
        'es',
        { sensitivity: 'base' }
      )
    }

    const fechaA = a.fecha_firma ?? ''
    const fechaB = b.fecha_firma ?? ''

    if (orden === 'antiguos') {
      return fechaA.localeCompare(fechaB) || a.id - b.id
    }

    return fechaB.localeCompare(fechaA) || b.id - a.id
  })

  return resultado
}

export default function ConveniosPage() {
  const router = useRouter()

  const {
    token,
    isAuth,
    cargando: sesionCargando,
    logout,
  } = useAuth()

  const [convenios, setConvenios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [puedeCrear, setPuedeCrear] = useState(false)

  const [pagina, setPagina] = useState(1)
  const [porPagina, setPorPagina] = useState(10)

  const [filtros, setFiltros] = useState({
    q: '',
    tipo: '',
    unidad: '',
    estado: '',
    campoFecha: 'fecha_firma',
    desde: '',
    hasta: '',
    orden: 'recientes',
  })

  // ---------- Carga de información ----------

  useEffect(() => {
    if (sesionCargando) return

    if (!isAuth || !token) {
      router.replace('/login')
      return
    }

    let activo = true

    async function cargar() {
      setCargando(true)
      setError(null)

      try {
        const [resultadoConvenios, resultadoOpciones] =
          await Promise.allSettled([
            obtenerConveniosPrivados(token),
            obtenerOpcionesCreacion(token),
          ])

        if (!activo) return

        if (resultadoConvenios.status === 'rejected') {
          throw resultadoConvenios.reason
        }

        if (
          resultadoConvenios.status === 'fulfilled' &&
          resultadoOpciones.status === 'rejected' &&
          resultadoOpciones.reason?.status === 401
        ) {
          throw resultadoOpciones.reason
        }

        setConvenios(resultadoConvenios.value)

        if (resultadoOpciones.status === 'fulfilled') {
          setPuedeCrear(
            resultadoOpciones.value?.puede_crear === true
          )
        } else {
          setPuedeCrear(false)
        }
      } catch (err) {
        if (!activo) return

        if (err.status === 401) {
          logout()
          router.replace('/login')
          return
        }

        setError(
          err.datos?.message ??
          err.message ??
          'No se pudieron cargar los convenios.'
        )
      } finally {
        if (activo) setCargando(false)
      }
    }

    cargar()

    return () => {
      activo = false
    }
  }, [token, isAuth, sesionCargando, logout, router])

  // ---------- Opciones de filtros ----------

  const todosLosNodos = useMemo(
    () => convenios.flatMap(obtenerNodosArbol),
    [convenios]
  )

  const tipos = useMemo(
    () => [...new Set(
      todosLosNodos
        .map((c) => c.tipo)
        .filter(Boolean)
    )].sort((a, b) => a.localeCompare(b, 'es')),
    [todosLosNodos]
  )

  const unidades = useMemo(
    () => [...new Set(
      todosLosNodos
        .map((c) => c.unidad)
        .filter(Boolean)
    )].sort((a, b) => a.localeCompare(b, 'es')),
    [todosLosNodos]
  )

  // ---------- Filtrado y ordenamiento ----------

  const filtrados = useMemo(() => {
    const coincidencias = convenios.filter((convenio) =>
      arbolCoincide(convenio, filtros)
    )

    return ordenarConvenios(coincidencias, filtros.orden)
  }, [convenios, filtros])

  // ---------- Paginación local ----------

  const total = filtrados.length
  const totalPaginas = Math.max(1, Math.ceil(total / porPagina))

  const paginaActual = Math.min(pagina, totalPaginas)

  const items = useMemo(() => {
    const inicio = (paginaActual - 1) * porPagina

    return filtrados.slice(inicio, inicio + porPagina)
  }, [filtrados, paginaActual, porPagina])

  const desde = total === 0
    ? 0
    : (paginaActual - 1) * porPagina + 1

  const hasta = Math.min(paginaActual * porPagina, total)

  // ---------- Manejadores ----------

  function cambiarFiltro(campo, valor) {
    setFiltros((actuales) => ({
      ...actuales,
      [campo]: valor,
    }))

    setPagina(1)
  }

  function limpiarFiltros() {
    setFiltros({
      q: '',
      tipo: '',
      unidad: '',
      estado: '',
      campoFecha: 'fecha_firma',
      desde: '',
      hasta: '',
      orden: 'recientes',
    })

    setPagina(1)
  }

  function abrirConvenio(id) {
    router.push(`/convenios/${id}`)
  }

  function exportarCSV() {
    if (filtrados.length === 0) return

    const encabezados = [
      'Código',
      'Título',
      'Tipo',
      'Categoría',
      'Ámbito',
      'Unidad responsable',
      'Estado',
      'Número de resolución',
      'Fecha de firma',
      'Vencimiento',
      'Instrumentos vinculados',
      'Documentos adjuntos',
    ]

    const filas = filtrados.map((convenio) => [
      convenio.codigo,
      convenio.titulo,
      convenio.tipo,
      convenio.categoria,
      convenio.ambito,
      convenio.unidad,
      convenio.estado,
      convenio.numero_resolucion,
      fechaLegible(convenio.fecha_firma) ?? '',
      fechaLegible(convenio.vence) ?? '',
      Number(convenio.hijos_count ?? 0),
      Number(convenio.documentos_count ?? 0),
    ])

    const contenido = '\uFEFF' + [
      encabezados,
      ...filas,
    ]
      .map((fila) => fila.map(escaparCeldaCSV).join(','))
      .join('\r\n')

    const archivo = new Blob(
      [contenido],
      { type: 'text/csv;charset=utf-8;' }
    )

    const url = window.URL.createObjectURL(archivo)
    const enlace = document.createElement('a')

    const ahora = new Date()

    const anio = ahora.getFullYear()
    const mes = String(ahora.getMonth() + 1).padStart(2, '0')
    const dia = String(ahora.getDate()).padStart(2, '0')

    enlace.href = url
    enlace.download = `convenios_${anio}-${mes}-${dia}.csv`

    document.body.appendChild(enlace)
    enlace.click()
    enlace.remove()

    window.setTimeout(() => {
      window.URL.revokeObjectURL(url)
    }, 1000)
  }

  // ---------- Render ----------

  if (sesionCargando || cargando) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border spinner-border-sm text-primary me-2" />
        <span className="text-muted small">Cargando convenios...</span>
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

      {/* Encabezado */}

      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h1 className="h4 mb-1">Convenios</h1>
          <p className="text-muted small mb-0">
            Consulta y gestión de instrumentos autorizados para tu perfil.
          </p>
        </div>

        {puedeCrear && (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => router.push('/convenios/nuevo')}
          >
            <span className="me-1">+</span>
            Nuevo convenio
          </button>
        )}
      </div>

      {/* Filtros */}

      <section className="card shadow-sm mb-3">
        <div className="card-body">
          <div className="row g-3">

            <div className="col-12 col-lg-4">
              <label htmlFor="convenios-busqueda" className="form-label small fw-semibold">
                Buscar
              </label>

              <input
                id="convenios-busqueda"
                type="search"
                className="form-control form-control-sm"
                placeholder="Código, título, tipo, unidad..."
                value={filtros.q}
                onChange={(e) => cambiarFiltro('q', e.target.value)}
              />
            </div>

            <div className="col-12 col-sm-6 col-lg-2">
              <label htmlFor="convenios-tipo" className="form-label small fw-semibold">
                Tipo
              </label>

              <select
                id="convenios-tipo"
                className="form-select form-select-sm"
                value={filtros.tipo}
                onChange={(e) => cambiarFiltro('tipo', e.target.value)}
              >
                <option value="">Todos</option>
                {tipos.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-sm-6 col-lg-2">
              <label htmlFor="convenios-unidad" className="form-label small fw-semibold">
                Unidad
              </label>

              <select
                id="convenios-unidad"
                className="form-select form-select-sm"
                value={filtros.unidad}
                onChange={(e) => cambiarFiltro('unidad', e.target.value)}
              >
                <option value="">Todas</option>
                {unidades.map((unidad) => (
                  <option key={unidad} value={unidad}>
                    {unidad}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-sm-6 col-lg-2">
              <label htmlFor="convenios-estado" className="form-label small fw-semibold">
                Estado
              </label>

              <select
                id="convenios-estado"
                className="form-select form-select-sm"
                value={filtros.estado}
                onChange={(e) => cambiarFiltro('estado', e.target.value)}
              >
                <option value="">Todos</option>
                {ESTADOS.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado.charAt(0).toUpperCase() + estado.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-sm-6 col-lg-2">
              <label htmlFor="convenios-campo-fecha" className="form-label small fw-semibold">
                Filtrar fechas por
              </label>

              <select
                id="convenios-campo-fecha"
                className="form-select form-select-sm"
                value={filtros.campoFecha}
                onChange={(e) => cambiarFiltro('campoFecha', e.target.value)}
              >
                <option value="fecha_firma">Fecha de firma</option>
                <option value="vence">Vencimiento</option>
              </select>
            </div>

            <div className="col-12 col-sm-6 col-lg-2">
              <label htmlFor="convenios-desde" className="form-label small fw-semibold">
                Desde
              </label>

              <input
                id="convenios-desde"
                type="date"
                className="form-control form-control-sm"
                value={filtros.desde}
                max={filtros.hasta || undefined}
                onChange={(e) => cambiarFiltro('desde', e.target.value)}
              />
            </div>

            <div className="col-12 col-sm-6 col-lg-2">
              <label htmlFor="convenios-hasta" className="form-label small fw-semibold">
                Hasta
              </label>

              <input
                id="convenios-hasta"
                type="date"
                className="form-control form-control-sm"
                value={filtros.hasta}
                min={filtros.desde || undefined}
                onChange={(e) => cambiarFiltro('hasta', e.target.value)}
              />
            </div>

            <div className="col-12 col-sm-6 col-lg-2">
              <label htmlFor="convenios-orden" className="form-label small fw-semibold">
                Ordenar por
              </label>

              <select
                id="convenios-orden"
                className="form-select form-select-sm"
                value={filtros.orden}
                onChange={(e) => cambiarFiltro('orden', e.target.value)}
              >
                <option value="recientes">Más recientes</option>
                <option value="antiguos">Más antiguos</option>
                <option value="titulo">Título</option>
              </select>
            </div>

            <div className="col-12 col-sm-6 col-lg-2 d-flex align-items-end">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm w-100"
                onClick={limpiarFiltros}
              >
                Limpiar filtros
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* Listado */}

      <section className="card shadow-sm">
        <div className="card-header bg-white d-flex flex-wrap justify-content-between align-items-center gap-2 py-3">
          <div>
            <h2 className="h6 mb-0">Registro de convenios</h2>
            <span className="text-muted small">
              {total} {total === 1 ? 'resultado' : 'resultados'}
            </span>
          </div>

          <div className="d-flex flex-wrap align-items-center gap-2">

            <button
              type="button"
              className="btn btn-outline-success btn-sm"
              onClick={exportarCSV}
              disabled={total === 0}
              title="Exportar todos los resultados que coinciden con los filtros"
            >
              <i className="bi bi-filetype-csv me-1" />
              Exportar CSV
            </button>

            <label htmlFor="convenios-por-pagina" className="small text-muted">
              Mostrar
            </label>

            <select
              id="convenios-por-pagina"
              className="form-select form-select-sm"
              style={{ width: 75 }}
              value={porPagina}
              onChange={(e) => {
                setPorPagina(Number(e.target.value))
                setPagina(1)
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
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
                <th>Fecha de firma</th>
                <th>Vencimiento</th>
                <th>Vinculados</th>
                <th className="text-end pe-3">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-muted py-5">
                    No hay convenios que coincidan con los filtros.
                  </td>
                </tr>
              ) : (
                items.map((convenio) => (
                  <tr
                    key={convenio.id}
                    role="link"
                    tabIndex={0}
                    style={{ cursor: 'pointer' }}
                    onClick={() => abrirConvenio(convenio.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        abrirConvenio(convenio.id)
                      }
                    }}
                  >
                    <td className="ps-3">
                      <div className="fw-semibold text-primary">
                        {mostrar(convenio.codigo)}
                      </div>
                      <div className="small text-muted">
                        {mostrar(convenio.titulo)}
                      </div>
                    </td>

                    <td className="small">
                      {mostrar(convenio.tipo)}
                    </td>

                    <td className="small">
                      {mostrar(convenio.unidad)}
                    </td>

                    <td>
                      <span className={`badge rounded-pill text-bg-${claseEstado(convenio.estado)}`}>
                        {mostrar(convenio.estado)}
                      </span>
                    </td>

                    <td className="small text-nowrap">
                      {fechaLegible(convenio.fecha_firma) ?? '—'}
                    </td>

                    <td className="small text-nowrap">
                      {fechaLegible(convenio.vence) ?? (
                        <span className="text-muted">
                          Sin vencimiento registrado
                        </span>
                      )}
                    </td>

                    <td className="small text-center">
                      {Number(convenio.hijos_count ?? 0)}
                    </td>

                    <td className="text-end pe-3">
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          abrirConvenio(convenio.id)
                        }}
                      >
                        Ver ficha
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {total > 0 && (
          <Paginado
            pagina={paginaActual}
            totalPaginas={totalPaginas}
            desde={desde}
            hasta={hasta}
            total={total}
            porPagina={porPagina}
            onCambiar={setPagina}
          />
        )}
      </section>
    </div>
  )
}