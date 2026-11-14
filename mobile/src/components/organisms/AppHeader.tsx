import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View, Keyboard, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, QrCode, Search, X } from 'lucide-react-native';
import { router, useFocusEffect, usePathname } from 'expo-router';
import { useAuth } from '@/features/auth/context/AuthContext';
import { homeService } from '@/features/home/services/homeService';
import { colors, spacing } from '@/theme';
import { useBusqueda } from '@/features/busqueda/context/BusquedaContext';

export function AppHeader() {
  const { usuario } = useAuth();
  const [unidad, setUnidad] = useState('');
  const [notificacionesSinLeer, setNotificacionesSinLeer] = useState(0);

  const pathname = usePathname();
  const enBusqueda = pathname.endsWith('/search');
  const { query, setQuery } = useBusqueda();

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

  const nombre = usuario?.nombre ?? '';
  const iniciales = `${nombre.charAt(0)}${usuario?.apellido.charAt(0) ?? ''}`.toUpperCase();

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.safe}>
      <View style={styles.topRow}>
        <View style={styles.avatar}>
          <Text style={styles.initials}>{iniciales}</Text>
        </View>

        <View style={styles.userInfo}>
          {!!unidad && (
            <Text numberOfLines={1} style={styles.unit}>
              {unidad}
            </Text>
          )}
          <Text numberOfLines={1} style={styles.greeting}>
            Hola, {nombre}
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessible
          accessibilityLabel={
            notificacionesSinLeer > 0
              ? `${notificacionesSinLeer} notificaciones sin leer`
              : 'Notificaciones'
          }
          onPress={() => router.push('/notifications')}
          style={styles.notificationButton}
        >
          <Bell size={22} color={colors.background} />
          {notificacionesSinLeer > 0 && <View style={styles.notificationDot} />}
        </Pressable>
      </View>

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
            Buscar convenio, código o parte...
          </Text>
          <QrCode size={21} color={colors.primary} />
        </Pressable>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  topRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
  },
  unit: {
    color: '#DCE7F5',
    fontSize: 12,
  },
  greeting: {
    color: colors.background,
    fontSize: 17,
    fontWeight: '700',
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.14)',
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
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  searchText: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 14,
  },
  searchInput: {
    flex: 1,
    height: 46,
    color: colors.text,
    fontSize: 14,
  },
});