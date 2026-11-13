export const colores = {
  fondo: '#F3F5F9',
  tarjeta: '#FFFFFF',
  borde: '#E1E6EF',
  texto: '#1B2540',
  textoSuave: '#6B7690',
  azul: '#1F4E9C',
  azulClaro: '#E6EEFB',
  naranja: '#B5651D',
  verde: '#2E7D4F',
  rojo: '#B3261E',
  rojoClaro: '#FCEAE8',
  pdf: '#D9363E',
};

export const fechaCorta = (iso: string | null) => {
  if (!iso) return '—';

  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return '—';

  return fecha.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const fechaHora = (iso: string) => {
  const d = new Date(iso);
  const f = d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const h = d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  return `${f} ${h}`;
};