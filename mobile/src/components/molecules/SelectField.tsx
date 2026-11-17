import { useState, useMemo } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ChevronDown, X } from 'lucide-react-native';
import { Label } from '@/components/atoms';
import { spacing, useTema, type Colores } from '@/theme';

export type SelectFieldOption = {
  value: string;
  label: string;
};

type Props = {
  label: string;
  value: string;
  options: SelectFieldOption[];
  onValueChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
};

export function SelectField({
  label,
  value,
  options,
  onValueChange,
  placeholder = 'Seleccionar',
  required = false,
  disabled = false,
}: Props) {
  const { colors, fs } = useTema();
  const styles = useMemo(() => crearEstilos(colors, fs), [colors, fs]);
  const [open, setOpen] = useState(false);
  const selectedLabel =
    options.find((option) => option.value === value)?.label ?? placeholder;

  return (
    <>
      <View style={styles.field}>
        <Label required={required}>{label}</Label>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${label}${required ? ', obligatorio' : ''}: ${selectedLabel}`}
          accessibilityState={{ expanded: open, disabled }}
          disabled={disabled}
          onPress={() => setOpen(true)}
          style={styles.selector}
        >
          <Text numberOfLines={1} style={styles.selectorText}>
            {selectedLabel}
          </Text>
          <ChevronDown size={17} color={colors.textMuted} />
        </Pressable>
      </View>

      <Modal
        animationType="fade"
        onRequestClose={() => setOpen(false)}
        transparent
        visible={open}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable
            style={styles.modalCard}
            onPress={(event) => event.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cerrar"
                hitSlop={8}
                onPress={() => setOpen(false)}
              >
                <X size={21} color={colors.textMuted} />
              </Pressable>
            </View>

            <ScrollView>
              {options.map((option) => (
                <Pressable
                  key={`${label}-${option.value}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: option.value === value }}
                  onPress={() => {
                    onValueChange(option.value);
                    setOpen(false);
                  }}
                  style={styles.option}
                >
                  <Text
                    style={[
                      styles.optionText,
                      option.value === value && styles.optionSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const crearEstilos = (colors: Colores, fs: (tamano: number) => number) =>
  StyleSheet.create({
    field: {
      flex: 1,
      gap: spacing.xs,
    },
    selector: {
      minHeight: 44,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      backgroundColor: colors.background,
    },
    selectorText: {
      flex: 1,
      color: colors.text,
      fontSize: fs(14),
    },
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