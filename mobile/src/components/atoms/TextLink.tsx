import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, typography } from '@/theme';

type Props = {
  title: string;
  onPress: () => void;
};

export function TextLink({ title, onPress }: Props) {
  return (
    <Pressable onPress={onPress} hitSlop={8}>
      {({ pressed }) => (
        <Text style={[styles.text, pressed && styles.pressed]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  text: {
    ...typography.small,
    fontWeight: '600',
    color: colors.primary,
  },
  pressed: {
    opacity: 0.6,
  },
});
