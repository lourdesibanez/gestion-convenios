import * as Device from 'expo-device';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '@/services/api';
import { authService, LoginChallenge } from '../services/authService';
import { Alert } from 'react-native';

type Challenge = Pick<LoginChallenge,
  'id_desafio' | 'canal' | 'destino' | 'canales_disponibles'| 'reenviar_en_segundos' | 'codigo_debug' 
>;

//Acá vive la lógica: la cuenta regresiva, llamar a la API y guardar el token.
export function useVerifyCode(initial: Challenge) {
  const { signIn, biometrics, biometricEnabled, enableBiometrics } = useAuth();


  const [challenge, setChallenge] = useState(initial);
  const [resendIn, setResendIn] = useState(initial.reenviar_en_segundos);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string>();

  // Cuenta regresiva: cada segundo resta 1 hasta llegar a 0.
  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  const verify = async (codigo: string) => {
    if (loading) return;
    setLoading(true);
    setError(undefined);

    try {
      const { token, usuario } = await authService.verifyCode(
        challenge.id_desafio,
        codigo,
        Device.modelName ?? 'Celular',
      );
      // Al cambiar la sesión, el layout raíz lleva al home automáticamente.
      await signIn(token, usuario);
      
      // Primer ingreso con contraseña en este celular: ofrecer la huella para la próxima.
      if (biometrics.length > 0 && !biometricEnabled) {
        Alert.alert(
          'Ingreso con huella',
          '¿Querés usar tu huella para ingresar la próxima vez?',
          [
            { text: 'Ahora no', style: 'cancel' },
            { text: 'Activar', onPress: () => enableBiometrics() },
          ],
        );
      }

    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Ocurrió un error inesperado.');
    } finally {
      setLoading(false);
    }
  };

  //si no cambian el canal, reenvio por el ya seleccionado
  const resend = async (canal: LoginChallenge['canal'] = challenge.canal) => {
    if (resending) return;
    setResending(true);
    setError(undefined);

    try {
      const nuevo = await authService.resendCode(challenge.id_desafio, canal);
      setChallenge(nuevo);
      setResendIn(nuevo.reenviar_en_segundos);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Ocurrió un error inesperado.');
    } finally {
      setResending(false);
    }
  };

  return { challenge, resendIn, verify, resend, loading, resending, error };
}
