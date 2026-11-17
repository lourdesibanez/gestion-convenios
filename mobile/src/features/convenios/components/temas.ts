import { useMemo } from 'react';
import { useTema } from '@/theme';

/**
 * Colores de la ficha del convenio, tomados del tema (claro u oscuro).
 * Mantiene los nombres de antes para no tocar cada estilo de la ficha.
 */
export function useColoresConvenio() {
  const { colors, esOscuro } = useTema();

  return useMemo(
    () => ({
      fondo: colors.surface,
      tarjeta: colors.background,
      tarjetaSuave: colors.surface,
      borde: colors.border,
      texto: colors.text,
      textoSuave: colors.textMuted,
      azul: colors.primary,
      azulClaro: colors.primarySoft,
      sobreAzul: colors.onPrimary, // texto/íconos sobre un fondo azul
      naranja: colors.status.revision,
      verde: colors.status.firmado,
      rojo: colors.error,
      rojoClaro: esOscuro ? '#3A1F22' : '#FCEAE8',
      pdf: '#D9363E',
    }),
    [colors, esOscuro],
  );
}

export type ColoresConvenio = ReturnType<typeof useColoresConvenio>;

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