import { useCallback, useEffect, useState } from 'react';
import { conveniosService } from '../services/convenioService';
import type { ConvenioDetalle } from '../Tipos';

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



