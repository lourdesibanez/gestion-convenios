import { useMemo, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import { spacing, useTema, type Colores } from '@/theme';

type Props = {
  titulo: string;
  /** Recibe el color que tiene que usar el ícono. */
  icono?: (color: string) => ReactNode;
  onPress: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

/** Acción principal de la pantalla, fija abajo a la derecha (Nuevo convenio, Enviar a revisión). */
export function BotonFlotante({ titulo, icono, onPress, disabled = false, accessibilityLabel, style }: Props) {
  const { colors, fs } = useTema();
  const styles = useMemo(() => crearEstilos(colors, fs), [colors, fs]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? titulo}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.boton, disabled && styles.deshabilitado, style]}
    >
      {icono?.(colors.onPrimary)}
      <Text style={styles.texto}>{titulo}</Text>
    </Pressable>
  );
}

const crearEstilos = (colors: Colores, fs: (tamano: number) => number) =>
  StyleSheet.create({
    boton: {
      position: 'absolute',
      right: spacing.lg,
      bottom: spacing.lg,
      minHeight: 56,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: 18,
      backgroundColor: colors.primary,
      elevation: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.22,
      shadowRadius: 4,
    },
    deshabilitado: { opacity: 0.6 },
    texto: { color: colors.onPrimary, fontSize: fs(14), fontWeight: '700' },
  });
