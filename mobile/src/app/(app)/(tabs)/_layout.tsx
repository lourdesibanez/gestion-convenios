import { Tabs } from 'expo-router';
import { House, Search, Signature, UserRound } from 'lucide-react-native';
import { useTema } from '@/theme';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/organisms/AppHeader';
import { BusquedaProvider } from '@/features/busqueda/context/BusquedaContext';
import { useAuth } from '@/features/auth/context/AuthContext';
import { OfflineBanner } from '@/components/molecules';

export default function AppLayout() {
  const insets = useSafeAreaInsets();
  const { tipoPerfil } = useAuth();
  const { colors, fs } = useTema();

  return (
      <BusquedaProvider>
        {/* Fondo gris claro: así se ven las esquinas redondeadas del header.
            La zona de la hora (inset superior) la pinta el propio header. */}
        <View style={{ flex: 1, backgroundColor: colors.surface }}>
          <AppHeader />
          <OfflineBanner />
          <View style={{ flex: 1 }}>
            <Tabs
              screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textMuted,
                tabBarStyle: {
                  height: 64 + insets.bottom,
                  paddingTop: 6,
                  paddingBottom: 6 + insets.bottom,
                  backgroundColor: colors.background,
                  borderTopColor: colors.border,
                },
                tabBarLabelStyle: { fontSize: fs(12) },
              }}
            >
            
            <Tabs.Screen
              name="home"
              options={{
                title: 'Inicio',
                tabBarAccessibilityLabel: 'Inicio',
                tabBarIcon: ({ color, size }) => <House color={String(color)} size={size} />,
              }}
            />
            <Tabs.Screen
              name="search"
              options={{
                title: 'Buscar',
                tabBarAccessibilityLabel: 'Buscar',
                tabBarIcon: ({ color, size }) => <Search color={String(color)} size={size} />,
              }}
            />
            <Tabs.Screen
              name="sign"
              options={{
                title: 'Firmar',
                href: tipoPerfil === 'consulta' ? null : '/sign',
                tabBarAccessibilityLabel: 'Firmar',
                tabBarIcon: ({ color, size }) => <Signature color={String(color)} size={size} />,
              }}
            />
            <Tabs.Screen
              name="profile"
              options={{
                title: 'Perfil',
                tabBarAccessibilityLabel: 'Perfil',
                tabBarIcon: ({ color, size }) => <UserRound color={String(color)} size={size} />,
              }}
            />
            </Tabs>
          </View>
        </View>
      </BusquedaProvider>

  );
}