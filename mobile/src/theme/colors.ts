export const colors = {
  // Marca
  primary: '#2B5289',
  secondary: '#446699',
  emphasis: '#04087A',
  background: '#FFFFFF',
  surface: '#F4F6FA',

  // Textos y bordes (grises para el formulario)
  text: '#111827',
  textMuted: '#6B7280',
  border: '#D1D5DB',
  error: '#B91C1C',

  // Estados de convenios
  status: {
    borrador: '#6B7280',
    revision: '#B45309',
    aprobado: '#2B5289',
    firmado: '#15803D',
    rescindido: '#B91C1C',
    archivado: '#374151',
  },
} as const;
