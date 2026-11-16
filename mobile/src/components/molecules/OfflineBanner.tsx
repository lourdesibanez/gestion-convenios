import { WifiOff } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { useOffline } from '@/services/useOffline';
import { colors, spacing, typography } from '@/theme';

type Props = { mensaje?: string };

// Cartel gris que aparece solo cuando no hay conexión.
export function OfflineBanner({
  mensaje = 'Sin conexión.',
}: Props) {
  const offline = useOffline();
  if (!offline) return null;

  return (
    <View
      style={styles.banner}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite" // Android: el lector de pantalla lo anuncia al aparecer
    >
      <WifiOff color="#FFFFFF" size={16} />
      <Text style={styles.text}>{mensaje}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.textMuted, // gris con buen contraste para texto blanco
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  text: {
    ...typography.small,
    color: '#FFFFFF',
    flex: 1,
  },
});
