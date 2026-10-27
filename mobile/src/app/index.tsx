import { Alert, View } from 'react-native';
import { LoginForm } from '@/components/organisms';
import { colors, spacing } from '@/theme';

export default function Index() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: spacing.lg, backgroundColor: colors.background }}>
      <LoginForm
        onSubmit={(data) => Alert.alert('Datos', JSON.stringify(data))}
        onForgotPassword={() => Alert.alert('Recuperar contraseña')}
        onBiometric={(type) => Alert.alert('Biometría', type)}
      />
    </View>
  );
}

