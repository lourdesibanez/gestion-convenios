import { useMemo } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { X } from 'lucide-react-native';
import { spacing, useTema, type Colores } from '@/theme';

export type OpcionModal = {
  value: string;
  label: string;
};

type Props = {
  visible: boolean;
  titulo: string;
  opciones: OpcionModal[];
  /** Si viene, esa opción se marca como elegida. */
  valorSeleccionado?: string;
  onSeleccionar: (value: string) => void;
  onCerrar: () => void;
};

/** Lista de opciones en un modal, con título y cruz para cerrar. La usan SelectField y la subida de documentos. */
export function ModalOpciones({
  visible,
  titulo,
  opciones,
  valorSeleccionado,
  onSeleccionar,
  onCerrar,
}: Props) {
  const { colors, fs } = useTema();
  const styles = useMemo(() => crearEstilos(colors, fs), [colors, fs]);

  return (
    <Modal animationType="fade" onRequestClose={onCerrar} transparent visible={visible}>
      <Pressable style={styles.backdrop} onPress={onCerrar}>
        <Pressable style={styles.modalCard} onPress={(event) => event.stopPropagation()}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{titulo}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cerrar"
              hitSlop={8}
              onPress={onCerrar}
            >
              <X size={21} color={colors.textMuted} />
            </Pressable>
          </View>

          <ScrollView>
            {opciones.map((opcion) => {
              const seleccionada = opcion.value === valorSeleccionado;
              return (
                <Pressable
                  key={`${titulo}-${opcion.value}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: seleccionada }}
                  onPress={() => onSeleccionar(opcion.value)}
                  style={styles.option}
                >
                  <Text style={[styles.optionText, seleccionada && styles.optionSelected]}>
                    {opcion.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const crearEstilos = (colors: Colores, fs: (tamano: number) => number) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      justifyContent: 'center',
      padding: spacing.lg,
      backgroundColor: colors.overlay,
    },
    modalCard: {
      maxHeight: '75%',
      padding: spacing.md,
      borderRadius: 16,
      backgroundColor: colors.elevated,
      borderWidth: 1,
      borderColor: colors.border,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    modalTitle: {
      color: colors.text,
      fontSize: fs(17),
      fontWeight: '700',
    },
    option: {
      paddingVertical: 13,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    optionText: {
      color: colors.text,
      fontSize: fs(15),
    },
    optionSelected: {
      color: colors.primary,
      fontWeight: '700',
    },
  });
