import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

export type BiometricType = 'fingerprint' | 'face';

const ENABLED_KEY = 'biometric_enabled';

/** Biometrías que el celular tiene y que el usuario configuró. Vacío si no hay ninguna. */
export async function getAvailableBiometrics(): Promise<BiometricType[]> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  if (!hasHardware || !isEnrolled) return [];

  const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
  const available: BiometricType[] = [];

  if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
    available.push('fingerprint');
  }
  if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
    available.push('face');
  }

  return available;
}

/** Abre el lector del sistema. Devuelve true si el dueño del celular se identificó. */
export async function authenticate(): Promise<boolean> {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Ingresá a Gestión de Convenios',
    cancelLabel: 'Usar contraseña',
    disableDeviceFallback: true,
  });

  return result.success;
}

/** Preferencia del usuario: si eligió ingresar con huella en este celular. */
export const biometricPreference = {
  isEnabled: async () => (await SecureStore.getItemAsync(ENABLED_KEY)) === 'true',
  enable: () => SecureStore.setItemAsync(ENABLED_KEY, 'true'),
  disable: () => SecureStore.deleteItemAsync(ENABLED_KEY),
};
