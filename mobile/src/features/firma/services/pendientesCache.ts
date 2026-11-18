import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PaginaFirmasPendientes } from './firmaService';
import type { ConvenioDetalle } from '@/features/convenios/Tipos';

const KEY_DETALLES = 'pendientes_firma_detalles';
const KEY = 'pendientes_firma';

export type PendientesGuardados = {
  pagina: PaginaFirmasPendientes;
  guardadoEn: string; // ISO, para mostrar "actualizado el ..."
};

// Copia local de la primera página de pendientes, para el modo offline.
export const pendientesCache = {
  guardar: (pagina: PaginaFirmasPendientes) =>
    AsyncStorage.setItem(
      KEY,
      JSON.stringify({ pagina, guardadoEn: new Date().toISOString() }),
    ),

  leer: async (): Promise<PendientesGuardados | null> => {
    const json = await AsyncStorage.getItem(KEY);
    return json ? (JSON.parse(json) as PendientesGuardados) : null;
  },

  borrar: () => AsyncStorage.multiRemove([KEY, KEY_DETALLES]),

  // Detalle de cada pendiente, para poder abrir la ficha sin conexión.
  guardarDetalles: (detalles: ConvenioDetalle[]) =>
    AsyncStorage.setItem(KEY_DETALLES, JSON.stringify(detalles)),

  leerDetalle: async (id: number): Promise<ConvenioDetalle | null> => {
    const json = await AsyncStorage.getItem(KEY_DETALLES);
    const detalles = json ? (JSON.parse(json) as ConvenioDetalle[]) : [];
    return detalles.find((detalle) => detalle.id === id) ?? null;
  },

};
