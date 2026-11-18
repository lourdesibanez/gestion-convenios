import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { type Unidad, unidadService } from '../services/unidadService';

const KEY = 'unidad_activa';

type UnidadContextValue = {
  unidades: Unidad[];
  unidadActiva: Unidad | null; // null = "Todas mis unidades"
  setUnidadActiva: (id: number | null) => void;
};

const UnidadContext = createContext<UnidadContextValue | null>(null);

export function UnidadProvider({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [idActiva, setIdActiva] = useState<number | null>(null);

  useEffect(() => {
    if (status !== 'signedIn') {
      setUnidades([]);
      setIdActiva(null);
      return;
    }

    Promise.all([unidadService.misUnidades(), AsyncStorage.getItem(KEY)])
      .then(([lista, guardada]) => {
        setUnidades(lista);
        const id = guardada ? Number(guardada) : null;
        // Si la guardada ya no es suya (otro usuario o le sacaron el perfil), vuelve a "Todas".
        setIdActiva(lista.some((u) => u.id === id) ? id : null);
      })
      .catch((e) => console.warn('No se pudieron cargar las unidades:', e));
  }, [status]);

  // Se guarda en el celular, así se mantiene al cerrar la app.
  const setUnidadActiva = (id: number | null) => {
    setIdActiva(id);
    void (id === null ? AsyncStorage.removeItem(KEY) : AsyncStorage.setItem(KEY, String(id)));
  };

  return (
    <UnidadContext.Provider
      value={{
        unidades,
        unidadActiva: unidades.find((u) => u.id === idActiva) ?? null,
        setUnidadActiva,
      }}
    >
      {children}
    </UnidadContext.Provider>
  );
}

export function useUnidad() {
  const context = useContext(UnidadContext);
  if (!context) {
    throw new Error('useUnidad debe usarse dentro de <UnidadProvider>');
  }
  return context;
}
