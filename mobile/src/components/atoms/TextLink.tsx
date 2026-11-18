import { useMemo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useTema, type Colores, type Tipografia } from '@/theme';

type Props = {
  title: string;
  onPress: () => void;
};

export function TextLink({ title, onPress }: Props) {
  const { colors, typography } = useTema();
  const styles = useMemo(() => crearEstilos(colors, typography), [colors, typography]);
  return (
    <Pressable onPress={onPress} hitSlop={8}>
      {({ pressed }) => (
        <Text style={[styles.text, pressed && styles.pressed]}>{title}</Text>
      )}
    </Pressable>
  );
}

const crearEstilos = (colors: Colores, typography: Tipografia) =>
  StyleSheet.create({
    text: {
      ...typography.small,
      fontWeight: '600',
      color: colors.primary,
    },
    pressed: {
      opacity: 0.6,
    },
  });
