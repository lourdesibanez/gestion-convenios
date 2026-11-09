import { Tabs } from 'expo-router';
import { House, Search, Signature, UserRound } from 'lucide-react-native';
import { colors } from '@/theme';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/organisms/AppHeader';

export default function AppLayout() {
  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <AppHeader />
      <View style={styles.tabs}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.textMuted,
            tabBarStyle: {
              height: 64,
              paddingTop: 6,
              paddingBottom: 6,
              backgroundColor: colors.background,
              borderTopColor: colors.border,
            },
            tabBarLabelStyle: { fontSize: 12 },
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  tabs: {
    flex: 1,
    backgroundColor: colors.surface,
  },
});