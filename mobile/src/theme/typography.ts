// Tipografía escalada según el tamaño de letra elegido en Mi Perfil.
export function crearTipografia(escala: number) {
  const fs = (tamano: number) => Math.round(tamano * escala);

  return {
    label: { fontSize: fs(14), fontWeight: '600' as const },
    body: { fontSize: fs(16), fontWeight: '400' as const },
    button: { fontSize: fs(16), fontWeight: '700' as const },
    small: { fontSize: fs(13), fontWeight: '400' as const },
  };
}

export type Tipografia = ReturnType<typeof crearTipografia>;
