import { useMemo } from 'react';
import { WifiOff } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/atoms';
import { spacing, useTema, type Colores, type Tipografia } from '@/theme';

type Props = {
  mensaje: string;
  accion?: { titulo: string; onPress: () => void };
};

// Estado vacío para secciones que no funcionan sin conexión.
export function SinConexion({ mensaje, accion }: Props) {
  const { colors, typography } = useTema();
  const styles = useMemo(() => crearEstilos(colors, typography), [colors, typography]);
  return (
    <View style={styles.box}>
      <WifiOff size={40} color={colors.textMuted} />
      <Text style={styles.titulo}>Estás sin conexión</Text>
      <Text style={styles.mensaje}>{mensaje}</Text>
      {accion && <Button title={accion.titulo} variant="outline" onPress={accion.onPress} />}
    </View>
  );
}

const crearEstilos = (colors: Colores, typography: Tipografia) =>
  StyleSheet.create({
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
