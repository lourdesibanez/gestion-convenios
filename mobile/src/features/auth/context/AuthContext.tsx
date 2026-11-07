import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { ApiError } from '@/services/api';
import { tokenStorage } from '@/services/tokenStorage';
import { authService, Usuario } from '../services/authService';

type Status = 'loading' | 'signedIn' | 'signedOut';

type AuthContextValue = {
  status: Status;
  usuario: Usuario | null;
  signIn: (token: string, usuario: Usuario) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');                  //loading pq al abrir la app no se sabe si hay token guardado o no
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  // Al abrir la app: si hay un token guardado, se valida contra la API.
  useEffect(() => {
    const restore = async () => {
      const token = await tokenStorage.get();

      if (!token) {
        setStatus('signedOut');
        return;
      }

      try {
        setUsuario(await authService.me());
        setStatus('signedIn');
      } catch (e) {
        // 401: el token ya no sirve (logout en otro lado, contraseña cambiada, usuario suspendido).
        if (e instanceof ApiError && e.status === 401) {
          await tokenStorage.remove();
        }
        setStatus('signedOut');
      }
    };

    restore();
  }, []);

  const signIn = async (token: string, usuario: Usuario) => {
    await tokenStorage.set(token);
    setUsuario(usuario);
    setStatus('signedIn');
  };

  const signOut = async () => {
    try {
      await authService.logout();
    } catch {
      // Aunque la API falle, la sesión se cierra igual en el celular.
    }
    await tokenStorage.remove();
    setUsuario(null);
    setStatus('signedOut');
  };

  return (
    <AuthContext.Provider value={{ status, usuario, signIn, signOut }}>
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
