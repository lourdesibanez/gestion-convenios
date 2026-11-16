import { StyleSheet, Text } from 'react-native';
import { colors, spacing, typography } from '@/theme';

type Props = {
  children: string;
  required?: boolean;
};

export function Label({ children, required }: Props) {
  return (
    <Text style={styles.label}>
      {children}
      {required && <Text style={styles.required}> *</Text>}
    </Text>
  );
}

const styles = StyleSheet.create({
  label: {
    ...typography.label,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  required: {
    color: colors.error,
  },
});
