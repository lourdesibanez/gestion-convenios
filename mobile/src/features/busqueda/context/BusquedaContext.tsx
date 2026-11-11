import {
  createContext,
  useContext,
  useState,
  type PropsWithChildren,
} from 'react';

type BusquedaContextValue = {
  query: string;
  setQuery: (query: string) => void;
};

const BusquedaContext = createContext<BusquedaContextValue | null>(null);

export function BusquedaProvider({ children }: PropsWithChildren) {
  const [query, setQuery] = useState('');

  return (
    <BusquedaContext.Provider value={{ query, setQuery }}>
      {children}
    </BusquedaContext.Provider>
  );
}

export function useBusqueda() {
  const context = useContext(BusquedaContext);

  if (!context) {
    throw new Error('useBusqueda debe usarse dentro de BusquedaProvider.');
  }

  return context;
}