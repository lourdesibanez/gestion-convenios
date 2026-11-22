import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Keyboard, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {Easing, FadeIn, FadeOut, useAnimatedStyle, useSharedValue, withTiming,ZoomIn} from 'react-native-reanimated';
import { Bell, Camera, Search, X } from 'lucide-react-native';
import { router, useFocusEffect, usePathname } from 'expo-router';
import { Avatar } from '@/components/atoms';
import { useAuth } from '@/features/auth/context/AuthContext';
import { homeService } from '@/features/home/services/homeService';
import { useBusqueda } from '@/features/busqueda/context/BusquedaContext';
import { useOffline } from '@/services/useOffline';
import { spacing, useTema, type Colores } from '@/theme';
import { UnidadSelector } from '@/components/molecules';
import { useUnidad } from '@/features/unidades/context/UnidadContext';
import { BotonAyuda } from '@/features/ayuda/components/BotonAyuda';
import type { SeccionAyuda } from '@/features/ayuda/contenidoAyuda';
import { PerfilCabecera } from '@/features/perfil/components/PerfilCabecera';
import { useFotoPerfil } from '@/features/perfil/hooks/useFotoPerfil';


// Qué ayuda abre el "?" según la pestaña en la que estás.
const AYUDA_POR_RUTA: [string, SeccionAyuda][] = [
  ['/search', 'buscar'],
  ['/sign', 'firmar'],
  ['/profile', 'perfil'],
];

export function AppHeader() {
  const { usuario } = useAuth();
  const { colors, fs } = useTema();
  const insets = useSafeAreaInsets(); // alto de la zona de la hora, se pinta de azul
  const styles = useMemo(() => crearEstilos(colors, fs), [colors, fs]);
  const [unidad, setUnidad] = useState('');
  const [notificacionesSinLeer, setNotificacionesSinLeer] = useState(0);
  const offline = useOffline();

  const pathname = usePathname();
  const enBusqueda = pathname.endsWith('/search');
  const enPerfil = pathname.endsWith('/profile'); // en Perfil el header se expande
  const seccionAyuda = AYUDA_POR_RUTA.find(([ruta]) => pathname.endsWith(ruta))?.[1] ?? 'inicio';
  const { query, setQuery } = useBusqueda();

  // Efecto persiana: el alto del fondo azul se anima hasta el alto del contenido.
  const altura = useSharedValue(0);
  const estiloPersiana = useAnimatedStyle(() => ({ height: altura.value }));
  const { unidades, unidadActiva, setUnidadActiva } = useUnidad();

  //Imagen perfil
  const {subiendo, abrirMenu} = useFotoPerfil();

  const medirContenido = (alto: number) => {
    // La primera vez se fija sin animar, para que no "baje" al abrir la app.
    // set()/get() en lugar de .value: es la forma recomendada con el React Compiler.
    altura.set(
      altura.get() === 0
        ? alto
        : withTiming(alto, { duration: 400, easing: Easing.out(Easing.cubic) }),
    );
  };

  useFocusEffect(useCallback(() => {
    let activo = true;

    homeService.get()
      .then((data) => {
        if (!activo) return;
        setUnidad(data.usuario.unidad);
        setNotificacionesSinLeer(data.notificaciones_sin_leer);
      })
      .catch((error) => {
        console.warn('No se pudo cargar la información del encabezado:', error);
      });

    return () => {
      activo = false;
    };
  }, []));

  const nombreCompleto = usuario ? `${usuario.nombre} ${usuario.apellido}` : '';
  console.log(usuario?.foto_url);

  // El cambio de foto se conecta en el paso 4.

  return (
    <SafeAreaView edges={['left', 'right']}>
      {/* Fondo azul: su alto se anima, por eso baja como una persiana */}
      <Animated.View style={[styles.persiana, estiloPersiana]}>
        {/* Contenido real: se mide para saber hasta dónde tiene que bajar */}
        <View
          style={[styles.contenido, { paddingTop: spacing.sm + insets.top }]}
          onLayout={(e) => medirContenido(e.nativeEvent.layout.height)}
        >
        {/* Ayuda y notificaciones, fijas arriba a la derecha en los dos estados.
            Van con posición absoluta, así que bajan lo que mide la zona de la hora. */}
        <View style={[styles.acciones, { top: spacing.sm + insets.top + 4 }]}>
          <BotonAyuda seccion={seccionAyuda} color={colors.onPrimary} style={styles.botonIcono} />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              notificacionesSinLeer > 0
                ? `${notificacionesSinLeer} notificaciones sin leer`
                : 'Notificaciones'
            }
            onPress={() => router.push('/notifications')}
            style={styles.botonIcono}
          >
            <Bell size={22} color={colors.onPrimary} />
            {notificacionesSinLeer > 0 && <View style={styles.notificationDot} />}
          </Pressable>
        </View>


        {enPerfil ? (
          // Header expandido: avatar grande, nombre y mail
          <View style={styles.perfil}>
            <Animated.View key="avatar-grande" entering={ZoomIn.duration(250)}>
              <Avatar name={nombreCompleto} uri={usuario?.foto_url} size={88} bordered />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cambiar foto de perfil"
                hitSlop={8}
                disabled={subiendo}
                onPress={abrirMenu}
                style={styles.badgeCamara}
              >
                {subiendo ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Camera size={16} color={colors.primary} />
                )}
              </Pressable>
            </Animated.View>
            <Animated.Text entering={FadeIn.duration(250)} style={styles.nombrePerfil}>
              {nombreCompleto}
            </Animated.Text>
            <Animated.Text entering={FadeIn.duration(250)} style={styles.emailPerfil}>
              {usuario?.email}
            </Animated.Text>
          </View>
        ) : (
          // Header normal: avatar chico (lleva a Perfil) y saludo
          <View style={styles.topRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Ir a mi perfil"
              onPress={() => router.push('/profile')}
            >
              <Animated.View key="avatar-chico" entering={FadeIn.duration(250)}>
                <Avatar name={nombreCompleto} uri={usuario?.foto_url} size={48} bordered />
              </Animated.View>
            </Pressable>

            <View style={styles.userInfo}>
              {unidades.length > 1 ? (
                <UnidadSelector
                  unidades={unidades}
                  idActiva={unidadActiva?.id ?? null}
                  onCambiar={setUnidadActiva}
                />
              ) : (
                !!unidad && (
                  <Text numberOfLines={1} style={styles.unit}>
                    {unidad}
                  </Text>
                )
              )}
              <Text numberOfLines={1} style={styles.greeting}>
                Hola, {usuario?.nombre}
              </Text>
            </View>
          </View>
        )}

        {/* El buscador se oculta en Perfil y vuelve al salir */}
        {!enPerfil && (
          <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)}>
            {enBusqueda ? (
              <View style={styles.searchButton}>
                <Search size={20} color={colors.primary} />
                <TextInput
                  accessibilityLabel="Buscar convenios"
                  autoFocus
                  onChangeText={setQuery}
                  onSubmitEditing={Keyboard.dismiss}
                  placeholder="Convenio, código o parte..."
                  placeholderTextColor={colors.textMuted}
                  returnKeyType="search"
                  style={styles.searchInput}
                  value={query}
                />
                {query.length > 0 ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Limpiar búsqueda"
                    hitSlop={8}
                    onPress={() => setQuery('')}
                  >
                    <X size={19} color={colors.textMuted} />
                  </Pressable>
                ) : null}
              </View>
            ) : (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Buscar convenios"
                onPress={() => router.push('/search')}
                style={styles.searchButton}
              >
                <Search size={20} color={colors.primary} />
                <Text numberOfLines={1} style={styles.searchText}>
                  {offline ? 'Buscador sin conexión' : 'Buscar convenio, código o parte...'}
                </Text>
              </Pressable>
            )}
          </Animated.View>
        )}
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const crearEstilos = (colors: Colores, fs: (tamano: number) => number) =>
  StyleSheet.create({
    persiana: {
      backgroundColor: colors.primary,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
      overflow: 'hidden', // tapa lo que todavía no entra mientras baja
    },
    contenido: {
      gap: spacing.md,
      paddingHorizontal: spacing.md,
      paddingTop: spacing.sm,
      paddingBottom: spacing.md,
    },
    topRow: {
      minHeight: 52,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingRight: 104, // lugar para ayuda + campana
    },
    userInfo: { flex: 1 },
    unit: { color: colors.onPrimary, opacity: 0.8, fontSize: fs(12) },
    greeting: { color: colors.onPrimary, fontSize: fs(17), fontWeight: '700' },

    perfil: { alignItems: 'center', gap: spacing.xs, paddingTop: spacing.sm },
    badgeCamara: {
      position: 'absolute',
      right: -2,
      bottom: -2,
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
      borderWidth: 2,
      borderColor: colors.primary,
    },
    nombrePerfil: {
      color: colors.onPrimary,
      fontSize: fs(19),
      fontWeight: '700',
      marginTop: spacing.sm,
      textAlign: 'center',
    },
    emailPerfil: { color: colors.onPrimary, opacity: 0.85, fontSize: fs(13), textAlign: 'center' },

    acciones: {
      position: 'absolute',
      right: spacing.md,
      zIndex: 1,
      flexDirection: 'row',
      gap: spacing.sm,
    },
    botonIcono: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: `${colors.onPrimary}24`, // onPrimary con ~14% de opacidad
      alignItems: 'center',
      justifyContent: 'center',
    },

    notificationDot: {
      position: 'absolute',
      top: 9,
      right: 9,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#FBBF24',
    },
    searchButton: {
      minHeight: 48,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      borderRadius: 14,
      paddingHorizontal: spacing.md,
      gap: spacing.sm,
    },
    searchText: { flex: 1, color: colors.textMuted, fontSize: fs(14) },
    searchInput: { flex: 1, minHeight: 46, color: colors.text, fontSize: fs(14) },
  });
