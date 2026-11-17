import {
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  ClipboardClock,
  ClipboardPenLine,
  ClipboardX,
  FilePlus2,
  Signature,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { ActivityIndicator, Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/atoms';
import { StatCard } from '@/components/molecules';
import { useAuth } from '@/features/auth/context/AuthContext';
import { spacing, useTema, type Colores, type Tipografia } from '@/theme';
import { useHome } from '../hooks/useHome';
import { useState, useMemo } from 'react';
import { SinConexion } from '@/components/molecules';
import { useOffline } from '@/services/useOffline';
import { EstadoBadge } from '@/components/atoms';

function fechaRelativa(fecha: string) {
  const diferencia = Date.now() - new Date(fecha).getTime();
  const horas = Math.floor(diferencia / 3_600_000);

  if (horas < 1) return 'hace 1 h';
  if (horas < 24) return `hace ${horas} h`;
  if (horas < 48) return 'ayer';

  const date = new Date(fecha);
  return `${date.getDate()}/${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function HomeScreen() {
  const { colors, typography, fs } = useTema();
  const styles = useMemo(() => crearEstilos(colors, typography, fs), [colors, typography, fs]);
  const { data, loading, refreshing, error, refresh } = useHome();
  const { tipoPerfil } = useAuth();
  const esConsulta = tipoPerfil === 'consulta';
  const [movimientosAbiertos, setMovimientosAbiertos] = useState(false);
  const offline = useOffline();
  const ultimosMovimientos = data?.ultimos_movimientos.filter(
    (movimiento) =>
      !esConsulta || movimiento.estado.trim().toLocaleLowerCase('es-AR') === 'firmado',
  ) ?? [];

  // Offline solo se permiten los pendientes de firma
  if (offline) {
    return (
      <SinConexion
        mensaje="El inicio necesita conexión. Mientras tanto, podés ver tus convenios pendientes de firma."
        accion={{ titulo: 'Ver pendientes', onPress: () => router.push('/sign') }}
      />
    );
  }


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
              <StatCard
                label="Vigentes"
                value={data.resumen.vigentes}
                color={colors.status.firmado}
                icon={<ClipboardCheck size={20} color={colors.status.firmado} />}
              />
              {!esConsulta && (
                <StatCard
                  label="En trámite"
                  value={data.resumen.en_tramite}
                  color={colors.status.revision}
                  icon={<ClipboardClock size={20} color={colors.status.revision} />}
                />
              )}
              <StatCard
                label="Vencen en 30 días"
                value={data.resumen.vencen_30_dias}
                color={colors.status.rescindido}
                icon={<ClipboardX size={20} color={colors.status.rescindido} />}
              />
              <StatCard
                label="Firmados último año"
                value={data.resumen.firmados_ultimo_anio}
                color={colors.primary}
                icon={<ClipboardPenLine size={20} color={colors.primary} />}
              />
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
              (ultimosMovimientos.length === 0 ? (
                <Text style={styles.unit}>Aún no hay movimientos.</Text>
              ) : (
                <View style={styles.list}>
                  {ultimosMovimientos.map((movimiento) => (
                    <Pressable
                      key={movimiento.uuid}
                      accessibilityRole="button"
                      accessibilityLabel={`Ver detalle de ${movimiento.titulo}`}
                      onPress={() => router.push({
                        pathname: '/agreement/[id]',
                        params: { id: String(movimiento.id) },
                      })}
                      style={styles.itemList}
                    >
                      <View style={styles.flex}>
                        <Text style={styles.titleList} numberOfLines={1}>
                          {movimiento.titulo}
                        </Text>
                        <Text style={styles.unit} numberOfLines={1}>
                          {movimiento.codigo} · {fechaRelativa(movimiento.fecha)}
                        </Text>
                      </View>

                      <EstadoBadge estado={movimiento.estado} />
                    </Pressable>
                  ))}
                </View>
              ))}

            {!esConsulta && (
              <>
                {/* -------- MIS PENDIENTES ------- */}
                <View style={styles.headerList}>
                  <Text style={styles.section}>Mis pendientes ({data.pendientes.total})</Text>
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
                      params: { 
                        id: String(item.id_instrumento),
                        titulo: item.titulo,
                        codigo: item.codigo,
                       },
                    })}
                    style={styles.signIconButton}
                  >
                    <Signature size={20} color={colors.primary} />
                  </Pressable>
                </View>
                    ))}
                  </View>
                )}
              </>
            )}
          </>
        )}

      </ScrollView>

      {!esConsulta && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Nuevo convenio"
            onPress={() => router.push('/agreement/create')}
            style={styles.floatingButton}
          >
            <FilePlus2 size={20} color={colors.background} />
            <Text style={styles.floatingButtonText}>Nuevo convenio</Text>
          </Pressable>
        )}
    </SafeAreaView>
  );
}

const crearEstilos = (colors: Colores, typography: Tipografia, fs: (tamano: number) => number) =>
  StyleSheet.create({
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
      paddingBottom: 100,
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
      fontSize: fs(20),
      fontWeight: '700',
      color: colors.background,
    },
    flex: {
      flex: 1,
    },
    hello: {
      fontSize: fs(22),
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
    floatingButton: {
      position: 'absolute',
      right: spacing.lg,
      bottom: spacing.lg,
      minHeight: 56,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: 18,
      backgroundColor: colors.primary,
      elevation: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.22,
      shadowRadius: 4,
    },
    floatingButtonText: {
      color: colors.background,
      fontSize: fs(14),
      fontWeight: '700',
    },
  });
