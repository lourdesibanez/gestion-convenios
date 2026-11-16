import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View, type TextStyle } from 'react-native';
import { radius, spacing, useTema, type Colores, type Tipografia } from '@/theme';

export type SegmentedOption<T extends string> = {
  value: T;
  label: string;
  labelStyle?: TextStyle; // ej: mostrar cada tamaño de letra con su tamaño real
};

type Props<T extends string> = {
  label: string;
  options: SegmentedOption<T>[];
  value: T;
  onValueChange: (value: T) => void;
};

// Grupo de botones donde se elige una sola opción.
export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onValueChange,
}: Props<T>) {
  const { colors, typography } = useTema();
  const styles = useMemo(() => crearEstilos(colors, typography), [colors, typography]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.track} accessibilityRole="radiogroup" accessibilityLabel={label}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              onPress={() => onValueChange(option.value)}
              style={[styles.option, selected && styles.optionSelected]}
            >
              <Text style={[styles.text, option.labelStyle, selected && styles.textSelected]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const crearEstilos = (colors: Colores, typography: Tipografia) =>
  StyleSheet.create({
    container: { gap: spacing.sm },
    label: { ...typography.label, color: colors.text },
    track: {
      flexDirection: 'row',
      padding: spacing.xs,
      borderRadius: radius.md,
      backgroundColor: colors.surface,
    },
    option: {
      flex: 1,
      minHeight: 44, // tamaño mínimo táctil recomendado
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.sm,
    },
    optionSelected: { backgroundColor: colors.primary },
    text: { ...typography.body, color: colors.text },
    textSelected: { color: colors.onPrimary, fontWeight: '700' },
  });
