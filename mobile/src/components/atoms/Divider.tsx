import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '@/theme';

type Props = {
  text?: string;
};

export function Divider({ text }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.line} />
      {text && <Text style={styles.text}>{text}</Text>}
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
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
