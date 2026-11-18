import { useState, useMemo } from 'react';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';
import { radius, spacing, useTema, type Colores, type Tipografia } from '@/theme';

type Props = TextInputProps & {
  hasError?: boolean;
};

export function Input({ hasError = false, style, ...rest }: Props) {
  const { colors, typography } = useTema();
  const styles = useMemo(() => crearEstilos(colors, typography), [colors, typography]);
  const [focused, setFocused] = useState(false);

  return (
    <TextInput
      placeholderTextColor={colors.textMuted}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={[
        styles.input,
        focused && styles.focused,
        hasError && styles.error,
        style,
      ]}
      {...rest}
    />
  );
}

const crearEstilos = (colors: Colores, typography: Tipografia) =>
  StyleSheet.create({
    input: {
      ...typography.body,
      color: colors.text,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      height: 52,
    },
    focused: {
      borderColor: colors.primary,
      borderWidth: 2,
    },
    error: {
      borderColor: colors.error,
    },
  });
