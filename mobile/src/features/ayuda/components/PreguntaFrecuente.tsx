import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
import { spacing, useTema, type Colores, type Tipografia } from '@/theme';

type Props = {
  pregunta: string;
  respuesta: string;
  ultima?: boolean; // la última no lleva separador
};

// Pregunta que se despliega al tocarla para mostrar la respuesta.
export function PreguntaFrecuente({ pregunta, respuesta, ultima = false }: Props) {
  const { colors, typography } = useTema();
  const styles = useMemo(() => crearEstilos(colors, typography), [colors, typography]);
  const [abierta, setAbierta] = useState(false);

  return (
    <View style={[styles.item, !ultima && styles.separador]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: abierta }}
        onPress={() => setAbierta((actual) => !actual)}
        style={styles.fila}
      >
        <Text style={styles.pregunta}>{pregunta}</Text>
        {abierta ? (
          <Minus size={18} color={colors.primary} />
        ) : (
          <Plus size={18} color={colors.primary} />
        )}
      </Pressable>

      {abierta && <Text style={styles.respuesta}>{respuesta}</Text>}
    </View>
  );
}

const crearEstilos = (colors: Colores, typography: Tipografia) =>
  StyleSheet.create({
    item: { paddingVertical: spacing.sm },
    separador: { borderBottomWidth: 1, borderBottomColor: colors.border },
    fila: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, minHeight: 44 },
    pregunta: { ...typography.label, flex: 1, color: colors.text },
    respuesta: { ...typography.body, color: colors.textMuted, paddingBottom: spacing.sm },
  });
