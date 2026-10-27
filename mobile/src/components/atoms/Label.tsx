import { StyleSheet, Text } from 'react-native';
import { colors, spacing, typography } from '@/theme';

type Props = {
  children: string;
};

export function Label({ children }: Props) {
  return <Text style={styles.label}>{children}</Text>;
}

const styles = StyleSheet.create({
  label: {
    ...typography.label,
    color: colors.text,
    marginBottom: spacing.sm,
  },
});
