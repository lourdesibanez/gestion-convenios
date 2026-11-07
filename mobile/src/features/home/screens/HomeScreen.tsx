import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/atoms';
import { StatCard } from '@/components/molecules';
import { useAuth } from '@/features/auth/context/AuthContext';
import { colors, spacing, typography } from '@/theme';
import { useHome } from '../hooks/useHome';

export function HomeScreen() {
  const { signOut } = useAuth();
  const { data, loading, refreshing, error, refresh } = useHome();

  const confirmSignOut = () =>
    Alert.alert('Cerrar sesión', '¿Querés cerrar la sesión en este dispositivo?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: signOut },
    ]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} colors={[colors.primary]} />
        }
      >
        {error || !data ? (
          <View style={styles.errorBox}>
            <Text style={styles.error}>{error}</Text>
            <Button title="Reintentar" variant="outline" onPress={refresh} />
          </View>
        ) : (
          <>
            <View style={styles.header}>
              <View style={styles.avatar}>
                <Text style={styles.initials}>{data.usuario.iniciales}</Text>
              </View>
              <View style={styles.flex}>
                <Text style={styles.hello}>Hola, {data.usuario.nombre}</Text>
                <Text style={styles.unit}>{data.usuario.unidad}</Text>
              </View>
            </View>

            <Text style={styles.section}>Resumen de convenios</Text>

            <View style={styles.grid}>
              <StatCard label="Vigentes" value={data.resumen.vigentes} color={colors.status.firmado} />
              <StatCard label="En trámite" value={data.resumen.en_tramite} color={colors.status.revision} />
              <StatCard label="Vencen en 30 días" value={data.resumen.vencen_30_dias} color={colors.status.rescindido} />
              <StatCard label="Firmados último año" value={data.resumen.firmados_ultimo_anio} color={colors.primary} />
            </View>
          </>
        )}

        <Button title="Cerrar sesión" variant="outline" onPress={confirmSignOut} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.background,
  },
  flex: {
    flex: 1,
  },
  hello: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary,
  },
  unit: {
    ...typography.small,
    color: colors.textMuted,
  },
  section: {
    ...typography.label,
    color: colors.text,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  errorBox: {
    gap: spacing.md,
  },
  error: {
    ...typography.body,
    color: colors.error,
    textAlign: 'center',
  },
});
