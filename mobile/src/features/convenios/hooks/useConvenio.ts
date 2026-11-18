import { useCallback, useEffect, useState } from 'react';
import { conveniosService } from '../services/convenioService';
import type { ConvenioDetalle } from '../Tipos';
import { ApiError } from '@/services/api';
import { pendientesCache } from '@/features/firma/services/pendientesCache';


export function useConvenio(id: string | undefined) {
  const [convenio, setConvenio] = useState<ConvenioDetalle | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
    
  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    setConvenio(null);

    if (!id || !Number.isSafeInteger(Number(id)) || Number(id) <= 0) {
      setError('El identificador del convenio no es válido.');
      setCargando(false);
      return;
    }

    try {
      setConvenio(await conveniosService.detalle(id));
    } catch (cause) {
      // Sin conexión: solo se pueden abrir los pendientes de firma guardados.
      if (cause instanceof ApiError && cause.status === 0) {
        const guardado = await pendientesCache.leerDetalle(Number(id));
        if (guardado) {
          setConvenio(guardado);
          return; // el finally igual apaga el "cargando"
        }
        setError('Sin conexión solo podés ver tus convenios pendientes de firma.');
        return;
      }

      setError(
        cause instanceof Error
          ? cause.message
          : 'No pudimos cargar el convenio. Revisá tu conexión e intentá de nuevo.',
      );
    } finally {
      setCargando(false);
    }

  }, [id]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return { convenio, cargando, error, recargar: cargar };
}



