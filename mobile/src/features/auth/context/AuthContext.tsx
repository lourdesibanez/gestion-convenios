import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { ApiError } from '@/services/api';
import {
  authenticate,
  BiometricType,
  biometricPreference,
  getAvailableBiometrics,
} from '@/services/biometrics';
import { getPushToken } from '@/services/pushNotifications';
import { tokenStorage } from '@/services/tokenStorage';
import { authService, Usuario } from '../services/authService';

// locked: hay sesión guardada, pero hace falta la huella (o la contraseña) para entrar.
type Status = 'loading' | 'signedIn' | 'locked' | 'signedOut';

type AuthContextValue = {
  status: Status;
  usuario: Usuario | null;
  biometrics: BiometricType[];
  biometricEnabled: boolean;
  signIn: (token: string, usuario: Usuario) => Promise<void>;
  signOut: () => Promise<void>;
  forgetDevice: () => Promise<void>;
  unlock: () => Promise<string | null>;
  enableBiometrics: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// Registra este celular para push. Si falla o no hay permiso, la app sigue funcionando igual.
async function registerPush() {
  try {
    const token = await getPushToken();
    if (token) await authService.savePushToken(token);
  } catch (e) {
    console.warn('No se pudo registrar el push:', e);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [biometrics, setBiometrics] = useState<BiometricType[]>([]);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  // Al abrir la app: con huella activada queda bloqueada; si no, se valida el token directo.
  useEffect(() => {
    const restore = async () => {
      const available = await getAvailableBiometrics();
      setBiometrics(available);

      const token = await tokenStorage.get();
      if (!token) {
        setStatus('signedOut');
        return;
      }

      const enabled = available.length > 0 && (await biometricPreference.isEnabled());
      setBiometricEnabled(enabled);

      if (enabled) {
        setStatus('locked');
        return;
      }

      const error = await enterWithStoredToken();
      if (error) setStatus('signedOut');
    };

    restore();
  }, []);

  // Valida el token guardado contra la API. Devuelve un mensaje si no se pudo entrar.
  const enterWithStoredToken = async (): Promise<string | null> => {
    try {
      setUsuario(await authService.me());
      setStatus('signedIn');
      registerPush();
      return null;
    } catch (e) {
      // 401: el token ya no sirve (contraseña cambiada, usuario suspendido, sesión revocada).
      if (e instanceof ApiError && e.status === 401) {
        await forgetDevice();
        return 'Tu sesión venció. Ingresá con tu correo y contraseña.';
      }
      return e instanceof ApiError ? e.message : 'Ocurrió un error inesperado.';
    }
  };

  const signIn = async (token: string, usuario: Usuario) => {
    // Si había otra sesión guardada (por ejemplo, bloqueada), se revoca antes de reemplazarla.
    if (await tokenStorage.get()) {
      await authService.logout().catch(() => {});
    }
    await tokenStorage.set(token);
    setUsuario(usuario);
    setStatus('signedIn');
    registerPush();
  };

  // Desbloquear con huella. null = entró o el usuario canceló; texto = error para mostrar.
  const unlock = async (): Promise<string | null> => {
    const ok = await authenticate();
    if (!ok) return null;
    return enterWithStoredToken();
  };

  const enableBiometrics = async () => {
    // Se pide la huella una vez para confirmar que es el dueño del celular.
    const ok = await authenticate();
    if (!ok) return false;
    await biometricPreference.enable();
    setBiometricEnabled(true);
    return true;
  };

  // Cerrar sesión: con huella activada solo se bloquea; sin huella se borra todo.
  const signOut = async () => {
    if (biometricEnabled) {
      setUsuario(null);
      setStatus('locked');
      return;
    }
    await forgetDevice();
  };

  // Cierre total: revoca el token en la API y desactiva la huella en este celular.
  const forgetDevice = async () => {
    try {
      await authService.logout();
    } catch {
      // Aunque la API falle, la sesión se cierra igual en el celular.
    }
    await tokenStorage.remove();
    await biometricPreference.disable();
    setBiometricEnabled(false);
    setUsuario(null);
    setStatus('signedOut');
  };

  return (
    <AuthContext.Provider
      value={{
        status,
        usuario,
        biometrics,
        biometricEnabled,
        signIn,
        signOut,
        forgetDevice,
        unlock,
        enableBiometrics,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }
  return context;
}
