import { useState, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { Label } from '@/components/atoms';
import { spacing, useTema, type Colores } from '@/theme';
import { ModalOpciones, type OpcionModal } from './ModalOpciones';

export type SelectFieldOption = OpcionModal;

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

      <ModalOpciones
        visible={open}
        titulo={label}
        opciones={options}
        valorSeleccionado={value}
        onSeleccionar={(valor) => {
          onValueChange(valor);
          setOpen(false);
        }}
        onCerrar={() => setOpen(false)}
      />
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
  });
