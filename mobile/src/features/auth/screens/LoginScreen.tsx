import { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { TextLink } from '@/components/atoms';
import { LoginForm } from '@/components/organisms';
import { AuthTemplate } from '@/components/templates';
import { spacing } from '@/theme';
import { useAuth } from '../context/AuthContext';
import { useLogin } from '../hooks/useLogin';
import { OfflineBanner } from '@/components/molecules';

export function LoginScreen() {
  const { login, loading, error } = useLogin();
  const { status, biometrics, unlock, forgetDevice } = useAuth();
  const [unlockError, setUnlockError] = useState<string | null>(null);

  const locked = status === 'locked';

  const handleUnlock = async () => {
    setUnlockError(await unlock());
  };

  // Con la sesión bloqueada, el lector se abre solo al llegar a esta pantalla.
  useEffect(() => {
    if (locked) handleUnlock();
    // Solo cuando pasa a bloqueada; si no, se reabriría en cada render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locked]);

  const confirmForget = () =>
    Alert.alert(
      'Usar otra cuenta',
      'Se va a cerrar la sesión guardada y desactivar el ingreso con huella en este celular.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Continuar', style: 'destructive', onPress: forgetDevice },
      ],
    );

  return (
    <AuthTemplate
      title={locked ? 'Hola de nuevo' : 'Gestión de Convenios'}
      subtitle={locked ? 'Usá tu huella o ingresá con tu contraseña' : 'Ingresá con tu cuenta institucional'}
    >
      <OfflineBanner mensaje="Sin conexión. Necesitás internet para iniciar sesión." />
      <LoginForm
        onSubmit={login}
        loading={loading}
        serverError={unlockError ?? error}
        onForgotPassword={() => Alert.alert('Recuperar contraseña', 'Próximamente')}
        biometricTypes={locked ? biometrics : []}
        onBiometric={handleUnlock}
      />

      {locked && (
        <View style={styles.switchAccount}>
          <TextLink title="¿No sos vos? Usar otra cuenta" onPress={confirmForget} />
        </View>
      )}
    </AuthTemplate>
  );
}

const styles = StyleSheet.create({
  switchAccount: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
});
