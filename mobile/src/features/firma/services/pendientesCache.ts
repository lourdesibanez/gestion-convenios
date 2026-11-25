import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PaginaFirmasPendientes } from './firmaService';
import type { ConvenioDetalle } from '@/features/convenios/Tipos';
import { Directory, File, Paths } from 'expo-file-system';

const KEY_DETALLES = 'pendientes_firma_detalles';
const KEY = 'pendientes_firma';
// Carpeta permanente (no cache) para que el sistema no borre los PDF.
const carpetaPdfs = () => new Directory(Paths.document, 'pendientes-firma');
const archivoPdf = (id: number) => new File(carpetaPdfs(), `convenio-${id}.pdf`);

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

  borrar: async () => {
    await AsyncStorage.multiRemove([KEY, KEY_DETALLES]);
    const carpeta = carpetaPdfs();
    if (carpeta.exists) carpeta.delete(); // también se van los PDF del usuario
  },

  // Mueve el PDF descargado a la carpeta offline, con nombre fijo por convenio.
  guardarPdf: (id: number, descargado: File) => {
    carpetaPdfs().create({ intermediates: true, idempotent: true });
    descargado.move(archivoPdf(id), { overwrite: true });
  },

  leerPdf: (id: number): File | null => {
    const archivo = archivoPdf(id);
    return archivo.exists ? archivo : null;
  },

  // Borra los PDF de convenios que ya no están pendientes (firmados o reasignados).
  limpiarPdfs: (idsVigentes: number[]) => {
    const carpeta = carpetaPdfs();
    if (!carpeta.exists) return;
    const vigentes = new Set(idsVigentes.map((id) => `convenio-${id}.pdf`));
    for (const item of carpeta.list()) {
      if (item instanceof File && !vigentes.has(item.name)) item.delete();
    }
  },

  // Detalle de cada pendiente, para poder abrir la ficha sin conexión.
  guardarDetalles: (detalles: ConvenioDetalle[]) =>
    AsyncStorage.setItem(KEY_DETALLES, JSON.stringify(detalles)),

  leerDetalle: async (id: number): Promise<ConvenioDetalle | null> => {
    const json = await AsyncStorage.getItem(KEY_DETALLES);
    const detalles = json ? (JSON.parse(json) as ConvenioDetalle[]) : [];
    return detalles.find((detalle) => detalle.id === id) ?? null;
  },

};
