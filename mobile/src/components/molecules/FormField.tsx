import { StyleSheet, Text, TextInputProps, View } from 'react-native';
import { Input, Label } from '@/components/atoms';
import { colors, spacing, typography } from '@/theme';

type Props = TextInputProps & {
  label: string;
  error?: string;
  required?: boolean;
};

export function FormField({ label, error, required, ...inputProps }: Props) {
  return (
    <View style={styles.container}>
      <Label required={required}>{label}</Label>
      <Input hasError={!!error} {...inputProps} />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 0,
  },
  error: {
    ...typography.small,
    color: colors.error,
    marginTop: spacing.xs,
  },
});
