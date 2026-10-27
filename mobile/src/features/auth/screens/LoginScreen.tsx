import { Alert } from 'react-native';
import { LoginForm } from '@/components/organisms';
import { AuthTemplate } from '@/components/templates';
import { useLogin } from '../hooks/useLogin';

export function LoginScreen() {
  const { login, loading, error } = useLogin();

  return (
    <AuthTemplate title="Gestión de Convenios" subtitle="Ingresá con tu cuenta institucional">
      <LoginForm
        onSubmit={login}
        loading={loading}
        serverError={error}
        onForgotPassword={() => Alert.alert('Recuperar contraseña', 'Próximamente')}
        onBiometric={(type) => Alert.alert('Biometría', type)}
      />
    </AuthTemplate>
  );
}
