import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Alert, Platform } from 'react-native';

// Qué hacer si llega una notificación con la app abierta: mostrarla igual.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Pide permiso y devuelve el push token de este celular,
 * o null si el usuario no dio permiso o no es un celular real.
 */
export async function getPushToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    console.warn('Las notificaciones push requieren la app móvil en un dispositivo físico.');
    return null;
  }

  if (!Device.isDevice) {
    Alert.alert(
      'Push no disponible',
      'Para obtener notificaciones push, abrí la app en un dispositivo físico.',
    );
    return null;
  }

  // Android 8+ exige un "canal" para mostrar notificaciones.
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'General',
      importance: AndroidImportance.HIGH,
    });
  }

  let { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    ({ status } = await Notifications.requestPermissionsAsync());
  }
  console.log('Permiso de notificaciones:', status);

  if (status !== 'granted') {
    Alert.alert(
      'Permiso denegado',
      'No se pueden recibir notificaciones. Habilitá los permisos de notificación para esta app en la configuración del dispositivo.',
    );
    return null;
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) {
    throw new Error('No se encontró el projectId de EAS en la configuración de Expo.');
  }

  const { data } = await Notifications.getExpoPushTokenAsync({ projectId });

  console.log('Expo Push Token:', data);
  return data;
}
