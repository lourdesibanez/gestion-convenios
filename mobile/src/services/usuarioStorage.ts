import * as SecureStore from 'expo-secure-store';
import type { Usuario } from '@/features/auth/services/authService';

const USUARIO_KEY = 'auth_usuario';

// Copia del usuario logueado, para poder entrar a la app sin conexión.
export const usuarioStorage = {
  get: async (): Promise<Usuario | null> => {
    const json = await SecureStore.getItemAsync(USUARIO_KEY);
    return json ? (JSON.parse(json) as Usuario) : null;
  },
  set: (usuario: Usuario) => SecureStore.setItemAsync(USUARIO_KEY, JSON.stringify(usuario)),
  remove: () => SecureStore.deleteItemAsync(USUARIO_KEY),
};
