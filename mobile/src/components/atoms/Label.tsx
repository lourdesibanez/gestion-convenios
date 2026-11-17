import { useMemo } from 'react';
import { StyleSheet, Text } from 'react-native';
import { spacing, useTema, type Colores, type Tipografia } from '@/theme';

type Props = {
  children: string;
  required?: boolean;
};

export function Label({ children, required }: Props) {
  const { colors, typography } = useTema();
  const styles = useMemo(() => crearEstilos(colors, typography), [colors, typography]);
  return (
    <Text style={styles.label}>
      {children}
      {required && <Text style={styles.required}> *</Text>}
    </Text>
  );
}

const crearEstilos = (colors: Colores, typography: Tipografia) =>
  StyleSheet.create({
    label: {
      ...typography.label,
      color: colors.text,
      marginBottom: spacing.sm,
    },
    required: {
      color: colors.error,
    },
  });
