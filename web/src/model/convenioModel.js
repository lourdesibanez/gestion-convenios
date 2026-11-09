const API = process.env.NEXT_PUBLIC_API_URL

// Laravel a veces devuelve [..] y a veces { data: [..] }
const lista = (json) => (Array.isArray(json) ? json : json.data ?? [])

const pedir = async (res) => {
  if (!res.ok) throw new Error(`Error ${res.status}`)
  return res.json()
}

// ---------- Públicos ----------
export async function obtenerConvenios() {
  const res = await fetch(`${API}/api/convenios`, { headers: { Accept: 'application/json' } })
  return lista(await pedir(res))
}

export async function obtenerConvenioPublico(id) {
  const res = await fetch(`${API}/api/publico/convenios/${id}`, { headers: { Accept: 'application/json' } })
  if (res.status === 404) return null
  const json = await pedir(res)
  return json.data ?? json
}

// ---------- Administración (reciben authFetch del contexto) ----------
export async function obtenerConvenioAdmin(authFetch, id) {
  const res = await authFetch(`${API}/api/convenios/${id}`)
  if (res.status === 404) return null
  const json = await pedir(res)
  return json.data ?? json
}

export async function obtenerRevision(authFetch){
  const res = await authFetch(`${API}/api/revision`, { headers: { Accept: 'application/json' } })
  if (res.status=== 404) return null
  const json = await pedir(res);
  console.log(json);
  return json.data ?? json;
}

export const obtenerInstituciones = async (authFetch) =>
  lista(await pedir(await authFetch(`${API}/api/instituciones`)))

export const obtenerRepresentantes = async (authFetch) =>
  lista(await pedir(await authFetch(`${API}/api/representantes`)))