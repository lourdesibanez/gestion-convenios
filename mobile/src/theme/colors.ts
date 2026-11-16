// Paleta clara (la original de la app).
export const coloresClaros = {
  // Marca
  primary: '#2B5289',
  secondary: '#446699',
  emphasis: '#04087A',
  onPrimary: '#FFFFFF', // texto/íconos sobre fondo primary
  background: '#FFFFFF',
  surface: '#F4F6FA',
  primarySoft: '#E8EEF7',

  // Textos y bordes
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
    pendiente: '#B45309',
  },
};

export type Colores = typeof coloresClaros;

// Paleta oscura: mismas claves, tonos ajustados para mantener contraste sobre fondo oscuro.
export const coloresOscuros: Colores = {
  primary: '#8DB1E8',
  secondary: '#A3BBE3',
  emphasis: '#B9C4FF',
  onPrimary: '#0B1220',
  background: '#121417',
  surface: '#1B1E23',
  primarySoft: '#1F2B3E',

  text: '#F3F4F6',
  textMuted: '#A1A8B3',
  border: '#373C45',
  error: '#F87171',

  status: {
    borrador: '#A1A8B3',
    revision: '#F5A524',
    aprobado: '#8DB1E8',
    firmado: '#4ADE80',
    rescindido: '#F87171',
    archivado: '#D1D5DB',
    pendiente: '#F5A524',
  },
};

// Temporal: los archivos que todavía no migraron siguen usando la paleta clara.
// Cuando todo use useTema(), se borra.
export const colors = coloresClaros;
