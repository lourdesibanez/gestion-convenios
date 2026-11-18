import { router, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from '@/features/auth/context/AuthContext';
import { notificationService } from '@/features/notifications/services/notificationService';
import { TemaProvider, useTema } from '@/theme';
import { UnidadProvider } from '@/features/unidades/context/UnidadContext';

// El splash queda visible hasta saber si hay sesión, así no se ve el login un instante.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <TemaProvider>
      <AuthProvider>
        <UnidadProvider>
          <RootNavigator />
        </UnidadProvider>
      </AuthProvider>
    </TemaProvider>
  );
}

function RootNavigator() {
  const { status } = useAuth();
  const { esOscuro } = useTema();

  const ultimaRespuestaProcesada = useRef<string | null>(null);

  useEffect(() => {
    if (status !== 'signedIn') return;

    const abrirConvenioNotificado = (response: Notifications.NotificationResponse | null) => {
      if (!response) return;

      void Notifications.clearLastNotificationResponseAsync().catch((error) => {
        console.warn('No se pudo limpiar la respuesta de notificación:', error);
      });

      const requestId = response.notification.request.identifier;
      if (requestId === ultimaRespuestaProcesada.current) return;

      const datos = response.notification.request.content.data;
      const rawId = datos?.id_instrumento;
      const idInstrumento = typeof rawId === 'number' ? rawId : Number(rawId);
      if (!Number.isSafeInteger(idInstrumento) || idInstrumento <= 0) return;

      ultimaRespuestaProcesada.current = requestId;
      const rawNotificacionId = datos?.notificacion_id;
      const idNotificacion =
        typeof rawNotificacionId === 'number' ? rawNotificacionId : Number(rawNotificacionId);
      if (Number.isSafeInteger(idNotificacion) && idNotificacion > 0) {
        void notificationService.markRead(idNotificacion).catch((error) => {
          console.warn('No se pudo marcar como leída la notificación seleccionada:', error);
        });
      }
      router.push(`/agreement/${idInstrumento}`);
    };

    const subscription = Notifications.addNotificationResponseReceivedListener(
      abrirConvenioNotificado,
    );
    const receivedSubscription = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notificación recibida:', notification.request.content);
    });

    void Notifications.getLastNotificationResponseAsync()
      .then(abrirConvenioNotificado)
      .catch((error) => {
        console.warn('No se pudo procesar la notificación seleccionada:', error);
      });

    return () => {
      subscription.remove();
      receivedSubscription.remove();
    };
  }, [status]);
  
  useEffect(() => {
    if (status !== 'loading') {
      SplashScreen.hideAsync();
    }
  }, [status]);

    return (
      <>
        <StatusBar style={esOscuro ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />

          <Stack.Protected guard={status === 'signedIn'}>
            <Stack.Screen name="(app)" />
          </Stack.Protected>

          <Stack.Protected guard={status !== 'signedIn'}>
            <Stack.Screen name="(auth)" />
          </Stack.Protected>
        </Stack>
      </>
    );


}
