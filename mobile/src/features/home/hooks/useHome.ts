import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '@/services/api';
import { HomeData, homeService } from '../services/homeService';

export function useHome() {
  const [data, setData] = useState<HomeData>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string>();

  const load = useCallback(async () => {
    setError(undefined);
    try {
      setData(await homeService.get());
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Ocurrió un error inesperado.');
    }
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  // Para "tirar hacia abajo y actualizar".
  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return { data, loading, refreshing, error, refresh };
}
