import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { spacing, useTema, type Colores, type Tipografia } from '@/theme';

type Props = {
  numero: number;
  titulo: string;
  detalle: string;
  ultimo: boolean; // el último no lleva la línea que lo une con el siguiente
};

// Un paso de la guía, como línea de tiempo: número, línea y texto.
export function PasoGuia({ numero, titulo, detalle, ultimo }: Props) {
  const { colors, typography } = useTema();
  const styles = useMemo(() => crearEstilos(colors, typography), [colors, typography]);

  return (
    <View style={styles.fila}>
      <View style={styles.columnaLinea}>
        <View style={styles.circulo}>
          <Text style={styles.numero}>{numero}</Text>
        </View>
        {!ultimo && <View style={styles.linea} />}
      </View>

      <View style={styles.textos}>
        <Text style={styles.titulo}>{titulo}</Text>
        <Text style={styles.detalle}>{detalle}</Text>
      </View>
    </View>
  );
}

const crearEstilos = (colors: Colores, typography: Tipografia) =>
  StyleSheet.create({
    fila: { flexDirection: 'row', gap: spacing.md },
    columnaLinea: { alignItems: 'center' },
    circulo: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
    },
    numero: { ...typography.small, fontWeight: '700', color: colors.onPrimary },
    linea: { flex: 1, width: 2, marginVertical: 2, backgroundColor: colors.border },
    textos: { flex: 1, gap: 2, paddingBottom: spacing.md },
    titulo: { ...typography.label, color: colors.text },
    detalle: { ...typography.small, color: colors.textMuted },
  });
