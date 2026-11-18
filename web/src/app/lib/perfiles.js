export function normalizarTexto(valor) {
  return (valor ?? '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function candidatosPerfil(usuario) {
  return [
    usuario?.perfil?.nombre,
    usuario?.perfil?.descripcion,
    usuario?.perfil?.name,
    usuario?.rol?.nombre,
    usuario?.rol?.descripcion,
    usuario?.rol?.name,
    usuario?.tipo_perfil?.nombre,
    usuario?.tipo_perfil,
    usuario?.tipoPerfil,
    usuario?.nombre_perfil,
    usuario?.perfil,
    usuario?.rol,
    usuario?.roles?.[0]?.nombre,
    usuario?.roles?.[0]?.name,
    usuario?.roles?.[0],
  ]
}

export function obtenerPerfil(usuario) {
  const valor = candidatosPerfil(usuario).find(
    (item) => typeof item === 'string' && item.trim(),
  )
  const perfil = normalizarTexto(valor)

  if (!perfil) return 'desconocido'
  if (perfil.includes('admin')) return 'administrador'
  if (perfil.includes('gestion') || perfil.includes('gestor')) return 'gestion'
  if (perfil.includes('revision') || perfil.includes('revisor')) return 'revision'
  if (perfil.includes('consulta') || perfil.includes('consultor')) return 'consulta'

  return 'desconocido'
}

export const ETIQUETAS_PERFIL = {
  administrador: 'Administrador',
  gestion: 'Gestión',
  revision: 'Revisión',
  consulta: 'Consulta',
  desconocido: 'Perfil sin identificar',
}

export function puedeCrearSegunPerfil(perfil, usuario) {
  // Si el backend incluye una capacidad explícita, prevalece sobre la regla visual.
  if (typeof usuario?.puede_crear_convenio === 'boolean') {
    return usuario.puede_crear_convenio
  }

  // Solo controla la presentación. Laravel vuelve a autorizar POST /agreements.
  return perfil === 'administrador' || perfil === 'gestion'
}
