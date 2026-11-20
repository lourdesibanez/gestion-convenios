// Contenido de ayuda de la app: manual de uso y ayudas puntuales por sección.
// Es estático (no depende de la API), así que también funciona sin conexión.

// ---------- Ayuda puntual por sección ----------

export type SeccionAyuda =
  | 'inicio'
  | 'buscar'
  | 'firmar'
  | 'perfil'
  | 'ficha'
  | 'firma'
  | 'notificaciones'
  | 'crear'
  | 'identidad';

export type AyudaPuntual = {
  seccion: string; // etiqueta corta que se muestra arriba ("Buscador")
  titulo: string; // la pregunta que responde
  texto: string;
};

export const AYUDAS: Record<SeccionAyuda, AyudaPuntual> = {
  inicio: {
    seccion: 'Inicio',
    titulo: '¿Qué muestra el inicio?',
    texto:
      'Las tarjetas resumen tus convenios firmados en el último año, vigentes y en trámite. ' +
      'En "Mis pendientes" están los convenios que esperan tu firma, y en "Últimos movimientos" ' +
      'los 10 cambios más recientes. Deslizá hacia abajo para actualizar.',
  },
  buscar: {
    seccion: 'Buscador',
    titulo: '¿Cómo leo el árbol de resultados?',
    texto:
      'Cada convenio marco agrupa sus específicos y adendas. Tocá la flecha para desplegar ' +
      'resoluciones y PDFs asociados. Usá los filtros para acotar por tipo, unidad o año de firma.',
  },
  firmar: {
    seccion: 'Firmar',
    titulo: '¿Qué convenios aparecen acá?',
    texto:
      'Los convenios aprobados que esperan tu firma, del más reciente al más antiguo. ' +
      'Tocá uno para ver su ficha completa y firmarlo. Sin conexión vas a ver la última lista guardada.',
  },
  perfil: {
    seccion: 'Perfil',
    titulo: '¿Qué puedo configurar?',
    texto:
      'El tamaño de letra y el modo oscuro cambian toda la app y se guardan en este celular. ' +
      'Tocá la cámara sobre tu foto para cambiarla.',
  },
  ficha: {
    seccion: 'Ficha del convenio',
    titulo: '¿Qué veo en la ficha?',
    texto:
      'El circuito muestra en qué etapa está el convenio. Más abajo están los datos, los firmantes ' +
      'con su estado, los documentos y los comentarios internos, que solo ven los usuarios del convenio.',
  },
  firma: {
    seccion: 'Firma',
    titulo: '¿Cómo firmo?',
    texto:
      'Leé el PDF completo (podés hacer zoom), dibujá tu firma, marcá que leíste el documento ' +
      'y confirmá con tu huella. Se registran la fecha, la hora y la ubicación del acto.',
  },
  notificaciones: {
    seccion: 'Notificaciones',
    titulo: '¿Qué avisos recibo?',
    texto:
      'Nuevos convenios, comentarios, cambios de datos y cancelaciones. ' +
      'También te recordamos si tenés un convenio sin firmar. Tocá un aviso para abrir el convenio.',
  },
  crear: {
    seccion: 'Nuevo convenio',
    titulo: '¿Cómo cargo un convenio?',
    texto:
      'Completá los pasos en orden: datos generales, vigencia, clausulas y resoluciones. ' +
      'Los campos con * son obligatorios. Se guarda como borrador hasta que lo envíes a revisión, ' +
      'y antes de aprobarlo tiene que tener al menos dos partes.',
  },
  identidad: {
    seccion: 'Registrar mi identidad',
    titulo: '¿Para qué registro mi identidad?',
    texto:
      'Tu firma, tu rostro y tu huella se usan para confirmar que sos vos al firmar un convenio. ' +
      'El rostro y la huella quedan en tu celular: a la API solo llega que los registraste y cuándo.',
  },
};

// ---------- Guías paso a paso del manual ----------

export type PasoGuia = { titulo: string; detalle: string };

export type Guia = {
  id: 'identidad' | 'firmar';
  titulo: string;
  duracion: string; // estimado, se muestra como "3 pasos · 2 min"
  pasos: PasoGuia[];
};

export const GUIAS: Guia[] = [
  {
    id: 'identidad',
    titulo: 'Registrar mi identidad',
    duracion: '2 min',
    pasos: [
      {
        titulo: 'Registrá tu firma',
        detalle: 'Desde Perfil › Registrar mi identidad, dibujá tu firma en el cuadro y guardala.',
      },
      {
        titulo: 'Registrá tu rostro',
        detalle: 'Mirá a la cámara con buena luz hasta que se confirme el reconocimiento.',
      },
      {
        titulo: 'Registrá tu huella',
        detalle: 'Apoyá el dedo en el lector del celular. La usás después para confirmar firmas.',
      },
    ],
  },
  {
    id: 'firmar',
    titulo: 'Firmar un convenio',
    duracion: '3 min',
    pasos: [
      {
        titulo: 'Elegí un pendiente',
        detalle: 'Desde Inicio › Mis pendientes o la pestaña Firmar.',
      },
      {
        titulo: 'Leé el PDF completo',
        detalle: 'Pellizcá para hacer zoom. También podés compartirlo por WhatsApp o mail.',
      },
      {
        titulo: 'Firmá a mano',
        detalle: 'Dibujá tu firma y marcá que leíste el documento.',
      },
      {
        titulo: 'Confirmá con huella',
        detalle: 'Se guardan la fecha, la hora y la ubicación del acto de firma.',
      },
    ],
  },
];

// ---------- Preguntas frecuentes ----------

export type PreguntaFrecuente = { pregunta: string; respuesta: string };

export const PREGUNTAS: PreguntaFrecuente[] = [
  {
    pregunta: '¿Puedo firmar sin conexión?',
    respuesta:
      'No. Sin conexión solo podés ver tus convenios pendientes; la firma necesita conexión para registrarse.',
  },
  {
    pregunta: '¿Quién ve mis comentarios?',
    respuesta:
      'Solo los usuarios que participan del convenio. Si un comentario es ofensivo, el sistema lo ' +
      'reemplaza automáticamente por "comentario ofensivo".',
  },
  {
    pregunta: '¿Qué es el sello del documento?',
    respuesta:
      'Cuando subís un PDF desde la app, el sistema le agrega una marca con tu usuario, el convenio, ' +
      'la fecha y la hora. Así se puede verificar que se subió desde la app.',
  },
  {
    pregunta: '¿Cómo cambio el tamaño de letra o el modo oscuro?',
    respuesta: 'Desde Perfil › Apariencia. El cambio se aplica a toda la app y queda guardado.',
  },
  {
    pregunta: '¿Por qué me pide la ubicación al firmar?',
    respuesta:
      'Porque la firma registra dónde se realizó el acto, junto con la fecha y la hora. ' +
      'Solo se toma en ese momento; la app no sigue tu ubicación.',
  },
];

// ---------- Búsqueda del manual ----------

// Minúsculas y sin tildes, para que "revision" encuentre "revisión".
const normalizar = (texto: string) =>
  texto.toLocaleLowerCase('es-AR').normalize('NFD').replace(/[\u0300-\u036f]/g, '');

// Filtra guías y preguntas que contengan el texto buscado.
export function buscarEnManual(consulta: string) {
  const q = normalizar(consulta.trim());
  if (!q) return { guias: GUIAS, preguntas: PREGUNTAS };

  const coincide = (...textos: string[]) => textos.some((t) => normalizar(t).includes(q));

  return {
    guias: GUIAS.filter((g) =>
      coincide(g.titulo, ...g.pasos.flatMap((p) => [p.titulo, p.detalle])),
    ),
    preguntas: PREGUNTAS.filter((p) => coincide(p.pregunta, p.respuesta)),
  };
}
