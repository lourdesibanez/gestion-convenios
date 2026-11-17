import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { coloresClaros, coloresOscuros, type Colores } from './colors';
import { crearTipografia, type Tipografia } from './typography';

export type ModoTema = 'claro' | 'oscuro';
export type TamanoLetra = 'chica' | 'mediana' | 'grande';

const ESCALAS: Record<TamanoLetra, number> = { chica: 0.9, mediana: 1, grande: 1.2 };
const KEY = 'preferencias_apariencia';

type Preferencias = { modo: ModoTema; tamanoLetra: TamanoLetra };

type TemaContextValue = Preferencias & {
  esOscuro: boolean;
  colors: Colores;
  typography: Tipografia;
  fs: (tamano: number) => number; // escala tamaños de letra escritos a mano (ej: fs(15))
  setModo: (modo: ModoTema) => void;
  setTamanoLetra: (tamano: TamanoLetra) => void;
};

const TemaContext = createContext<TemaContextValue | null>(null);

export function TemaProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<Preferencias>({ modo: 'claro', tamanoLetra: 'mediana' });

  // Al abrir la app se recuperan las preferencias guardadas en el celular.
  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((json) => {
        if (json) setPrefs((actuales) => ({ ...actuales, ...(JSON.parse(json) as Partial<Preferencias>) }));
      })
      .catch((e) => console.warn('No se pudieron leer las preferencias:', e));
  }, []);

  // Actualiza el estado y lo guarda, así se mantiene al cerrar la app.
  const actualizar = (cambios: Partial<Preferencias>) => {
    setPrefs((actuales) => {
      const nuevas = { ...actuales, ...cambios };
      void AsyncStorage.setItem(KEY, JSON.stringify(nuevas));
      return nuevas;
    });
  };

  const escala = ESCALAS[prefs.tamanoLetra];

  return (
    <TemaContext.Provider
      value={{
        ...prefs,
        esOscuro: prefs.modo === 'oscuro',
        colors: prefs.modo === 'oscuro' ? coloresOscuros : coloresClaros,
        typography: crearTipografia(escala),
        fs: (tamano) => Math.round(tamano * escala),
        setModo: (modo) => actualizar({ modo }),
        setTamanoLetra: (tamanoLetra) => actualizar({ tamanoLetra }),
      }}
    >
      {children}
    </TemaContext.Provider>
  );
}

export function useTema() {
  const context = useContext(TemaContext);
  if (!context) {
    throw new Error('useTema debe usarse dentro de <TemaProvider>');
  }
  return context;
}
