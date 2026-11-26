import { useMemo } from 'react';
import { WifiOff } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { useOffline } from '@/services/useOffline';
import { spacing, useTema, type Colores, type Tipografia } from '@/theme';

type Props = { mensaje?: string };

// Cartel gris que aparece solo cuando no hay conexión.
export function OfflineBanner({
  mensaje = 'Sin conexión.',
}: Props) {
  const { colors, typography } = useTema();
  const styles = useMemo(() => crearEstilos(colors, typography), [colors, typography]);
  const offline = useOffline();
  if (!offline) return null;

  return (
    <View
      style={styles.banner}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite" // Android: el lector de pantalla lo anuncia al aparecer
    >
      <WifiOff color={colors.background} size={16} />
      <Text style={styles.text}>{mensaje}</Text>
    </View>
  );
}

const crearEstilos = (colors: Colores, typography: Tipografia) =>
  StyleSheet.create({
    banner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: colors.textMuted, // gris; el texto usa colors.background para contrastar en claro y oscuro
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      // Tarjeta flotante: separada del header para no dejar huecos en sus esquinas redondeadas.
      marginHorizontal: spacing.md,
      marginTop: spacing.sm,
      borderRadius: 12,
    },
    text: {
      ...typography.small,
      color: colors.background,
      flex: 1,
    },
  });
