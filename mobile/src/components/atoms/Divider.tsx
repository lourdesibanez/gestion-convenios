import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { spacing, useTema, type Colores, type Tipografia } from '@/theme';

type Props = {
  text?: string;
};

export function Divider({ text }: Props) {
  const { colors, typography } = useTema();
  const styles = useMemo(() => crearEstilos(colors, typography), [colors, typography]);
  return (
    <View style={styles.container}>
      <View style={styles.line} />
      {text && <Text style={styles.text}>{text}</Text>}
      <View style={styles.line} />
    </View>
  );
}

const crearEstilos = (colors: Colores, typography: Tipografia) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    line: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    text: {
      ...typography.small,
      color: colors.textMuted,
    },
  });
