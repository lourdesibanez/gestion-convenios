import { Text, View } from 'react-native';
import { colors, spacing, typography } from '@/theme';

export default function Index() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: spacing.lg, backgroundColor: colors.surface }}>
      <Text style={[typography.button, { color: colors.primary }]}>
        El tema funciona ✔
      </Text>
    </View>
  );
}

