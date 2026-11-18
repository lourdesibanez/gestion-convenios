import { Alert } from 'react-native';
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
import { usuarioStorage } from '@/services/usuarioStorage';
import { authService, Usuario } from '../services/authService';
import { pendientesCache } from '@/features/firma/services/pendientesCache';

// locked: hay sesión guardada, pero hace falta la huella (o la contraseña) para entrar.
type Status = 'loading' | 'signedIn' | 'locked' | 'signedOut';

type AuthContextValue = {
  status: Status;
  usuario: Usuario | null;
  tipoPerfil: string | null;
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
    if (token) {
      await authService.savePushToken(token);
      console.log('Token push registrado correctamente en el backend.');
    }
  } catch (e) {
    const mensaje = e instanceof Error ? e.message : 'Error desconocido al registrar el dispositivo.';
    console.error('No se pudo registrar el push:', e);
    Alert.alert('No se pudo registrar el push', mensaje);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [tipoPerfil, setTipoPerfil] = useState<string | null>(null);
  const [biometrics, setBiometrics] = useState<BiometricType[]>([]);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  // Al abrir la app: con huella activada queda bloqueada; si no, se valida el token directo.
  useEffect(() => {
    const restore = async () => {
      try {
        const token = await tokenStorage.get();
        if (!token) {
          setStatus('signedOut');
          return;
        }

        const prefersBiometrics = await biometricPreference.isEnabled();
        const available = prefersBiometrics ? await getAvailableBiometrics() : [];
        setBiometrics(available);

        const enabled = prefersBiometrics && available.length > 0;
        setBiometricEnabled(enabled);

        if (enabled) {
          setStatus('locked');
          return;
        }

        const error = await enterWithStoredToken();
        if (error) setStatus('signedOut');
      } catch (error) {
        console.error('No se pudo restaurar la sesión:', error);
        setStatus('signedOut');
      }
    };

    void restore();
  }, []);

  // Valida el token guardado contra la API. Devuelve un mensaje si no se pudo entrar.
  const enterWithStoredToken = async (): Promise<string | null> => {
    try {
      const usuarioAutenticado = await authService.me();
      await usuarioStorage.set(usuarioAutenticado); // se refresca la copia local
      setUsuario(usuarioAutenticado);
      setTipoPerfil(usuarioAutenticado.tipo_perfil);
      setStatus('signedIn');
      registerPush();
      return null;
    } catch (e) {
      // 401: el token ya no sirve (contraseña cambiada, usuario suspendido, sesión revocada).
      if (e instanceof ApiError && e.status === 401) {
        await forgetDevice();
        return 'Tu sesión venció. Ingresá con tu correo y contraseña.';
      }

      // Sin conexión (status 0): si hay sesión guardada, se entra en modo offline.
      if (e instanceof ApiError && e.status === 0) {
        const guardado = await usuarioStorage.get();
        if (guardado) {
          setUsuario(guardado);
          setTipoPerfil(guardado.tipo_perfil);
          setStatus('signedIn');
          return null;
        }
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
    await usuarioStorage.set(usuario);
    setUsuario(usuario);
    setTipoPerfil(usuario.tipo_perfil);
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
      setTipoPerfil(null);
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
    await usuarioStorage.remove(); //cuando alguien cambia de cuenta, no quedan los datos del usuario anterior en el celular
    await pendientesCache.borrar(); // los datos offline son del usuario que se va
    await biometricPreference.disable();
    setBiometricEnabled(false);
    setUsuario(null);
    setTipoPerfil(null);
    setStatus('signedOut');
  };

  return (
    <AuthContext.Provider
      value={{
        status,
        usuario,
        tipoPerfil,
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
