import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';

// "X cantidad de horas" de la consigna. En la defensa poné MODO_DEMO = true para verlo en minutos.
const MODO_DEMO = true;
const SEGUNDOS_RECORDATORIO_FIRMA = MODO_DEMO ? 60 : 24 * 3600; // 24 h (demo: 1 min)
const SEGUNDOS_SIN_INGRESAR = MODO_DEMO ? 120 : 48 * 3600; // 48 h (demo: 2 min)

// Identificadores fijos: programar de nuevo reemplaza al aviso anterior en vez de duplicarlo.
const ID_FIRMA = 'recordatorio-firma';
const ID_NOVEDADES = 'aviso-novedades';

// Las notificaciones locales también necesitan permiso (Android 13+ / iOS).
async function tienePermiso(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  if (status === 'granted') return true;
  return (await Notifications.requestPermissionsAsync()).status === 'granted';
}

async function programar(
  id: string,
  titulo: string,
  texto: string,
  segundos: number,
  data: Record<string, unknown>,
) {
  await Notifications.cancelScheduledNotificationAsync(id);
  await Notifications.scheduleNotificationAsync({
    identifier: id,
    content: { title: titulo, body: texto, data },
    trigger: { type: SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: segundos },
  });
}

// Notificaciones vía app: las programa el celular, sin pasar por la API.
// Si algo falla (sin permiso, Expo Go, etc.) la app sigue funcionando igual.
export const recordatoriosLocales = {
  // "Aún tienes un convenio por firmar": se reprograma cada vez que se cargan los pendientes.
  async programarFirma(pendientes: { id_instrumento: number }[]) {
    try {
      if (pendientes.length === 0) {
        await Notifications.cancelScheduledNotificationAsync(ID_FIRMA);
        return;
      }
      if (!(await tienePermiso())) return;

      const unico = pendientes.length === 1 ? pendientes[0] : null;
      await programar(
        ID_FIRMA,
        'Convenios por firmar',
        unico
          ? 'Aún tienes un convenio por firmar.'
          : `Aún tienes ${pendientes.length} convenios por firmar.`,
        SEGUNDOS_RECORDATORIO_FIRMA,
        // Con uno solo abre ese convenio; con varios, la pestaña Firmar.
        unico ? { id_instrumento: unico.id_instrumento } : { url: '/sign' },
      );
    } catch (error) {
      console.warn('No se pudo programar el recordatorio de firma:', error);
    }
  },

  // "Hay novedades": se programa al salir de la app y se cancela al volver.
  async programarNovedades() {
    try {
      if (!(await tienePermiso())) return;
      await programar(
        ID_NOVEDADES,
        'Hay novedades',
        'Hay novedades en tus convenios. Entrá para verlas.',
        SEGUNDOS_SIN_INGRESAR,
        { url: '/home' },
      );
    } catch (error) {
      console.warn('No se pudo programar el aviso de novedades:', error);
    }
  },

  cancelarNovedades: () =>
    Notifications.cancelScheduledNotificationAsync(ID_NOVEDADES).catch(() => undefined),

  // Al cerrar sesión: los avisos eran del usuario que se va.
  cancelarTodos: () =>
    Promise.all([
      Notifications.cancelScheduledNotificationAsync(ID_FIRMA),
      Notifications.cancelScheduledNotificationAsync(ID_NOVEDADES),
    ]).catch(() => undefined),
};
