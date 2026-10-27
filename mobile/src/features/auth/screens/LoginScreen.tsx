import { Alert } from 'react-native';
import { LoginForm } from '@/components/organisms';
import { AuthTemplate } from '@/components/templates';

export function LoginScreen() {
  return (
    <AuthTemplate title="Gestión de Convenios" subtitle="Ingresá con tu cuenta institucional">
      <LoginForm
        onSubmit={(data) => Alert.alert('Datos', JSON.stringify(data))}
        onForgotPassword={() => Alert.alert('Recuperar contraseña', 'Próximamente')}
        onBiometric={(type) => Alert.alert('Biometría', type)}
      />
    </AuthTemplate>
  );
}
