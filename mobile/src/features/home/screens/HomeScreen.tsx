import { ChevronDown, ChevronUp, ClipboardPenLine } from 'lucide-react-native';
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/atoms';
import { StatCard } from '@/components/molecules';
import { colors, spacing, typography } from '@/theme';
import { useHome } from '../hooks/useHome';
import { useState } from 'react';

function fechaRelativa(fecha: string) {
  const diferencia = Date.now() - new Date(fecha).getTime();
  const horas = Math.floor(diferencia / 3_600_000);

  if (horas < 1) return 'hace 1 h';
  if (horas < 24) return `hace ${horas} h`;
  if (horas < 48) return 'ayer';

  const date = new Date(fecha);
  return `${date.getDate()}/${String(date.getMonth() + 1).padStart(2, '0')}`;
}

const coloresEstado: Record<string, string> = { ...colors.status };

export function HomeScreen() {
  const { data, loading, refreshing, error, refresh } = useHome();
  const [movimientosAbiertos, setMovimientosAbiertos] = useState(false);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safe}>
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
            <Text style={styles.section}>Resumen de convenios</Text>

            {/* -------- BOX ------- */}
            <View style={styles.grid}>
              <StatCard label="Vigentes" value={data.resumen.vigentes} color={colors.status.firmado} />
              <StatCard label="En trámite" value={data.resumen.en_tramite} color={colors.status.revision} />
              <StatCard label="Vencen en 30 días" value={data.resumen.vencen_30_dias} color={colors.status.rescindido} />
              <StatCard label="Firmados último año" value={data.resumen.firmados_ultimo_anio} color={colors.primary} />
            </View>

            {/* -------- ÚLTIMOS MOVIMIENTOS ------- */}
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded: movimientosAbiertos }}
              onPress={() => setMovimientosAbiertos((abiertos) => !abiertos)}
              style={styles.headerList}
            >
              <Text style={styles.section}>Últimos movimientos</Text>
              {movimientosAbiertos ? (
                <ChevronUp size={20} color={colors.textMuted} />
              ) : (
                <ChevronDown size={20} color={colors.textMuted} />
              )}
            </Pressable>

            {movimientosAbiertos &&
              (data.ultimos_movimientos.length === 0 ? (
                <Text style={styles.unit}>Aún no hay movimientos.</Text>
              ) : (
                <View style={styles.list}>
                  {data.ultimos_movimientos.map((movimiento) => (
                    <View key={movimiento.uuid} style={styles.itemList}>
                      <View style={styles.flex}>
                        <Text style={styles.titleList} numberOfLines={1}>
                          {movimiento.titulo}
                        </Text>
                        <Text style={styles.unit} numberOfLines={1}>
                          {movimiento.codigo} · {fechaRelativa(movimiento.fecha)}
                        </Text>
                      </View>

                      <View style={[styles.statusBadge, { backgroundColor: '#E8EEF7' }]}>
                        <Text
                          style={[
                            styles.statusText,
                            { color: coloresEstado[movimiento.estado] ?? colors.textMuted },
                          ]}
                        >
                          {movimiento.estado}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              ))}

          {/* -------- MIS PENDIENTES ------- */}
            <View style={styles.headerList}>
              <Text style={styles.section}>Mis pendientes  ({data.pendientes.total})</Text>
            </View>

            {data.pendientes.items.length === 0 ? (
              <Text style={styles.unit}>No tenés firmas pendientes.</Text>
            ) : (
              <View style={styles.list}>
                {data.pendientes.items.map((item) => (
                  <View key={item.uuid} style={styles.itemList}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Ver detalle de ${item.titulo}`}
                    onPress={() => router.push({
                      pathname: '/agreement/[id]',
                      params: { id: String(item.id_instrumento) },
                    })}
                    style={styles.flex}
                  >
                    <Text style={styles.titleList} numberOfLines={1}>
                      {item.titulo}
                    </Text>
                    <Text style={styles.unit}>
                      {item.codigo} · {new Date(item.asignado_en).toLocaleDateString('es-AR')}
                    </Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Ir a firmar ${item.titulo}`}
                    hitSlop={8}
                    onPress={() => router.push({
                      pathname: '/signature/[id]',
                      params: { id: String(item.id_instrumento) },
                    })}
                    style={styles.signIconButton}
                  >
                    <ClipboardPenLine size={20} color={colors.primary} />
                  </Pressable>
                </View>
              ))}
              </View>
            )}
          </>
        )}

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
  headerList: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  list: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    overflow: 'hidden',
  },
  itemList: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  signIconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  titleList: {
    ...typography.label,
    color: colors.text,
  },
  statusBadge: {
    borderRadius: 16,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
