import { WifiOff } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/atoms';
import { colors, spacing, typography } from '@/theme';

type Props = {
  mensaje: string;
  accion?: { titulo: string; onPress: () => void };
};

// Estado vacío para secciones que no funcionan sin conexión.
export function SinConexion({ mensaje, accion }: Props) {
  return (
    <View style={styles.box}>
      <WifiOff size={40} color={colors.textMuted} />
      <Text style={styles.titulo}>Estás sin conexión</Text>
      <Text style={styles.mensaje}>{mensaje}</Text>
      {accion && <Button title={accion.titulo} variant="outline" onPress={accion.onPress} />}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  titulo: { ...typography.button, color: colors.text },
  mensaje: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
});
