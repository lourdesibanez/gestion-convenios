import { useState } from 'react';
import { router } from 'expo-router';
import { LoginData } from '@/components/organisms';
import { ApiError } from '@/services/api';
import { authService } from '../services/authService';

//Maneja el estado de la pantalla: si está cargando, qué error mostrar y qué hacer cuando sale bien.
export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const login = async (data: LoginData) => {
    setLoading(true);
    setError(undefined);

    try {
      const challenge = await authService.login(data);

      router.push({
        pathname: '/verify-code',
        params: {
          id: String(challenge.id_desafio),
          canal: challenge.canal,
          destino: challenge.destino,
          reenviar: String(challenge.reenviar_en_segundos),
          debug: challenge.codigo_debug ?? '',
        },
      });

    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Ocurrió un error inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
}
