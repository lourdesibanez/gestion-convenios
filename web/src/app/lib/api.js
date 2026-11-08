const API = process.env.NEXT_PUBLIC_API_URL

async function solicitar(ruta, opciones = {}) {
  const respuesta = await fetch(`${API}${ruta}`, {
    ...opciones,
    headers: {
      Accept: 'application/json',
      ...opciones.headers,
    },
  })
  const datos = await respuesta.json()

  if (!respuesta.ok) {
    const error = new Error(`Error ${respuesta.status} al consultar ${ruta}`)
    error.status = respuesta.status
    throw error
  }

  return datos
}

export async function enviarJson(ruta, datos) {
  return solicitar(ruta, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  })
}

export async function obtenerUno(ruta) {
  const datos = await solicitar(ruta)
  if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
    throw new Error(`La respuesta de ${ruta} no tiene un formato válido.`)
  }

  return datos
}

export async function obtenerTodos(ruta) {
  const resultados = []
  let pagina = 1
  let ultimaPagina = 1

  do {
    const separador = ruta.includes('?') ? '&' : '?'
    const datos = await solicitar(`${ruta}${separador}page=${pagina}`)
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
