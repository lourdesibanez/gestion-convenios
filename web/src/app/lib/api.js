const API = process.env.NEXT_PUBLIC_API_URL

async function solicitar(ruta, opciones = {}) {
  const { token, ...resto } = opciones



  const respuesta = await fetch(`${API}${ruta}`, {
    ...resto,
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...resto.headers,
    },
  })

  const datos = await respuesta.json().catch(() => null) // 204 no trae cuerpo

  if (!respuesta.ok) {
    const error = new Error(`Error ${respuesta.status} al consultar ${ruta}`)
    error.status = respuesta.status
    error.datos = datos // deja disponible el mensaje de Laravel (errors, message)
    throw error
  }

  return datos
}

export async function enviarJson(ruta, datos, token) {
  return solicitar(ruta, {
    method: 'POST',
    token,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  })
}

export async function enviarFormData(ruta, formData, token) {
  return solicitar(ruta, {
    method: 'POST',
    token,
    body: formData,
  })
}

export async function actualizarJson(ruta, datos, token) {
  return solicitar(ruta, {
    method: 'PATCH',
    token,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(datos),
  })
}

export async function obtenerUno(ruta, token) {
  const datos = await solicitar(ruta, { token })
  if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
    throw new Error(`La respuesta de ${ruta} no tiene un formato válido.`)
  }
  return datos
}

export async function obtenerTodos(ruta, token) {
  const resultados = []
  let pagina = 1
  let ultimaPagina = 1

  do {
    const separador = ruta.includes('?') ? '&' : '?'
    const datos = await solicitar(`${ruta}${separador}page=${pagina}`, { token })
    if (!datos || typeof datos !== 'object' || !Array.isArray(datos.data)) {
      throw new Error(`La respuesta paginada de ${ruta} no tiene un campo data válido.`)
    }

    resultados.push(...datos.data)
    ultimaPagina = Number.isInteger(datos.meta?.last_page) && datos.meta.last_page > 0
      ? datos.meta.last_page
      : 1
    pagina += 1
  } while (pagina <= ultimaPagina)

  return resultados
}

export async function obtenerPagina(ruta, token) {
  const datos = await obtenerUno(ruta, token)

  if (!Array.isArray(datos.data)) {
    throw new Error(
      `La respuesta paginada de ${ruta} no tiene un campo data válido.`
    )
  }

  const meta = datos.meta ?? {}

  return {
    items: datos.data,
    links: datos.links ?? {},
    meta: {
      current_page: Number(meta.current_page ?? 1),
      last_page: Number(meta.last_page ?? 1),
      per_page: Number(meta.per_page ?? datos.data.length),
      from: meta.from ?? null,
      to: meta.to ?? null,
      total: Number(meta.total ?? datos.data.length),
    },
  }
}

