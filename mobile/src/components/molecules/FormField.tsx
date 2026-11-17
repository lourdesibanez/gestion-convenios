import { useMemo } from 'react';
import { StyleSheet, Text, TextInputProps, View } from 'react-native';
import { Input, Label } from '@/components/atoms';
import { spacing, useTema, type Colores, type Tipografia } from '@/theme';

type Props = TextInputProps & {
  label: string;
  error?: string;
  required?: boolean;
};

export function FormField({ label, error, required, ...inputProps }: Props) {
  const { colors, typography } = useTema();
  const styles = useMemo(() => crearEstilos(colors, typography), [colors, typography]);
  return (
    <View style={styles.container}>
      <Label required={required}>{label}</Label>
      <Input hasError={!!error} {...inputProps} />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const crearEstilos = (colors: Colores, typography: Tipografia) =>
  StyleSheet.create({
    container: {
      gap: 0,
    },
    error: {
      ...typography.small,
      color: colors.error,
      marginTop: spacing.xs,
    },
  });
