import { Alert, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/atoms';
import { useAuth } from '@/features/auth/context/AuthContext';
import { colors, spacing } from '@/theme';

export function PerfilScreen() {
  const { signOut } = useAuth();

  const confirmSignOut = () =>
    Alert.alert('Cerrar sesión', '¿Querés cerrar la sesión en este dispositivo?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: signOut },
    ]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <Button
          title="Cerrar sesión"
          variant="outline"
          onPress={confirmSignOut}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.lg,
  },
});