import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '@/services/api';
import { HomeData, homeService } from '../services/homeService';
import { useUnidad } from '@/features/unidades/context/UnidadContext';
import { recordatoriosLocales } from '@/features/notifications/services/recordatoriosLocales';

export function useHome() {
  const [data, setData] = useState<HomeData>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string>();
  const { unidadActiva } = useUnidad();
  const idUnidad = unidadActiva?.id ?? null;

    const load = useCallback(async () => {
      setError(undefined);
      try {
        const datos = await homeService.get(idUnidad);
        setData(datos);
        // Consigna "notificación vía app": si sigue pendiente en X horas, se recuerda
        void recordatoriosLocales.programarFirma(datos.pendientes.items);
      } catch (e) {
        setError(e instanceof ApiError ? e.message : 'Ocurrió un error inesperado.');
      }
    }, [idUnidad]);

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
