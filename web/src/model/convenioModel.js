import { enviarJson, enviarFormData, obtenerUno, obtenerTodos, actualizarJson } from '../app/lib/api'

// ---------- Públicos: compatibilidad temporal ----------

export const obtenerConvenios = () =>
  obtenerTodos('/api/public/agreements')

export async function obtenerConvenioPublico(id) {
  try {
    const json = await obtenerUno(`/api/public/agreements/${id}`)
    return json.data ?? json
  } catch (err) {
    if (err.status === 404) return null
    throw err
  }
}

// ---------- Convenios privados ----------

// Obtiene todos los convenios visibles para el usuario autenticado.
export const obtenerConveniosPrivados = (token) =>
  obtenerTodos('/api/agreements?per_page=50&orden=recientes', token)

// Obtiene el detalle de un convenio visible para el usuario autenticado.
export async function obtenerConvenioPrivado(token, id) {
  try {
    const json = await obtenerUno(`/api/agreements/${id}`, token)
    return json.data ?? json
  } catch (err) {
    if (err.status === 404) return null
    throw err
  }
}

// ---------- Compatibilidad con componentes anteriores ----------

// Estos alias permiten que las pantallas viejas sigan funcionando
// mientras terminamos de migrarlas a las rutas privadas nuevas.
export const obtenerConveniosAdmin = obtenerConveniosPrivados
export const obtenerConvenioAdmin = obtenerConvenioPrivado

// ---------- Otras consultas privadas ----------

export const obtenerRevision = (token) =>
  obtenerTodos('/api/agreements/review', token)

export const obtenerVencimientos = (token) =>
  obtenerTodos('/api/agreements', token)

export const obtenerInstituciones = (token) =>
  obtenerTodos('/api/units', token)

export const obtenerRepresentantes = (token) =>
  obtenerTodos('/api/people', token)

// ---------- Creación de convenios ----------

export async function obtenerOpcionesCreacion(token) {
  const json = await obtenerUno(
    '/api/agreements/create-options',
    token
  )

  return json.data ?? json
}

export async function crearConvenio(token, datos) {
  const json = await enviarJson(
    '/api/agreements',
    datos,
    token
  )

  return json.data ?? json
}

export const TIPOS_DOCUMENTO_CONVENIO = [
  { value: 'resolucion', label: 'Resolución' },
  { value: 'borrador', label: 'Borrador' },
  { value: 'anexo', label: 'Anexo' },
  { value: 'convenio_aprobado', label: 'Convenio aprobado' },
]

export async function subirDocumentoConvenio(
  token,
  idInstrumento,
  tipoDocumento,
  archivo
) {
  const formData = new FormData()

  formData.append('id_instrumento', String(idInstrumento))
  formData.append('tipo_documento', tipoDocumento)
  formData.append('archivo', archivo)

  const json = await enviarFormData(
    '/api/documents',
    formData,
    token
  )

  return json?.data ?? json
}

export async function obtenerConvenioParaEdicion(token, id) {
  const detalle = await obtenerConvenioPrivado(token, id)

  if (!detalle?.puede_editar) {
    const error = new Error(
      'No tenés permiso para editar este convenio.'
    )
    error.status = 403
    throw error
  }

  const c = detalle.convenio

  if (!c) {
    throw new Error('No se encontró la información del convenio.')
  }

  return {
    version: c.version,
    tipoNombre: c.tipo ?? '',
    institucionNombre: c.unidad ?? '',
    datos: {
      titulo: c.titulo ?? '',
      id_tipo_instrumento: c.id_tipo_instrumento,
      id_institucion: c.id_unidad,
      fecha_inicio: c.fecha_inicio ?? null,
      fecha_fin: c.vencimiento ?? null,
      fecha_preaviso: c.fecha_preaviso ?? null,
      numero_resolucion: c.numero_resolucion ?? null,
      referencia_expediente: c.referencia_expediente ?? null,
      notas: c.notas ?? null,
      objeto: c.objeto ?? null,
      marco_legal: c.marco_legal ?? null,
      obligaciones: c.obligaciones ?? null,
      condiciones_terminacion: c.condiciones_terminacion ?? null,
      condiciones_renovacion: c.condiciones_renovacion ?? null,
      confidencialidad: c.confidencialidad ?? null,
      alcance_actividades: c.alcance_actividades ?? null,
    },
  }
}

export async function actualizarConvenio(
  token,
  id,
  datos,
  version
) {
  const respuesta = await actualizarJson(
    `/api/agreements/${id}`,
    {
      ...datos,
      version,
    },
    token
  )

  return respuesta?.data ?? respuesta
}

// --------------------------------------------------
// Observaciones de revisión
// --------------------------------------------------

export async function obtenerObservacionesConvenio(token, id) {
  const json = await obtenerUno(
    `/api/agreements/${id}/observations`,
    token
  )

  return json?.data ?? []
}

export async function crearObservacionConvenio(
  token,
  id,
  contenido
) {
  const json = await enviarJson(
    `/api/agreements/${id}/observations`,
    { contenido },
    token
  )

  return json?.data ?? json
}

export async function responderObservacionConvenio(
  token,
  id,
  respuesta
) {
  const json = await actualizarJson(
    `/api/observations/${id}/response`,
    { respuesta },
    token
  )

  return json?.data ?? json
}

export async function resolverObservacionConvenio(token, id) {
  const json = await actualizarJson(
    `/api/observations/${id}/resolve`,
    {},
    token
  )

  return json?.data ?? json
}

// --------------------------------------------------
// Decisiones de revisión
// --------------------------------------------------

export async function aprobarConvenio(
  token,
  id,
  version,
  fundamento = null
) {
  const json = await enviarJson(
    `/api/agreements/${id}/approve`,
    { version, fundamento },
    token
  )

  return json?.data ?? json
}

export async function devolverConvenio(
  token,
  id,
  version,
  fundamento
) {
  const json = await enviarJson(
    `/api/agreements/${id}/return`,
    { version, fundamento },
    token
  )

  return json?.data ?? json
}