import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {Bell, CheckCheck, ChevronRight, FileText, MessageCircle, PenLine, Signature} from 'lucide-react-native';
import { spacing, useTema, type Colores } from '@/theme';
import { EstadoBadge } from '@/components/atoms';
import { useAuth } from '@/features/auth/context/AuthContext';
import {
  notificationService,
  type Notificacion,
  type NotificacionesResponse,
} from '@/features/notifications/services/notificationService';
import { HeaderBack } from '@/components/molecules';

type Filtro = 'todas' | 'por_firmar' | 'convenios';

const filtros: { id: Filtro; label: string }[] = [
  { id: 'todas', label: 'Todas' },
  { id: 'por_firmar', label: 'Por firmar' },
  { id: 'convenios', label: 'Convenios' },
];

function tituloNotificacion(tipo: string): string {
  const titulos: Record<string, string> = {
    firma_pendiente: 'Tenés un convenio por firmar',
    firma_registrada: 'Firma registrada',
    convenio_firmado: 'Convenio firmado',
    revision_asignada: 'Convenio pendiente de revisión',
    cambio_estado: 'Cambio de estado',
    vencimiento_proximo: 'Aviso de vencimiento',
    observacion_nueva: 'Nueva observación',
    comentario_nuevo: 'Nuevo comentario',
  };

  return titulos[tipo] ?? 'Notificación';
}

function horaNotificacion(fecha: string): string {
  const date = new Date(fecha);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function esDeHoy(fecha: string): boolean {
  const date = new Date(fecha);
  const hoy = new Date();

  return date.getFullYear() === hoy.getFullYear()
    && date.getMonth() === hoy.getMonth()
    && date.getDate() === hoy.getDate();
}

function IconoNotificacion({ tipo }: { tipo: string }) {
  const { colors } = useTema();
  const iconProps = { size: 20, color: colors.primary };

  if (tipo === 'firma_pendiente' || tipo === 'firma_registrada') {
    return <Signature {...iconProps} />;
  }
  if (tipo === 'comentario_nuevo' || tipo === 'observacion_nueva') {
    return <MessageCircle {...iconProps} />;
  }
  if (tipo === 'revision_asignada') return <PenLine {...iconProps} />;
  if (tipo === 'vencimiento_proximo') return <Bell {...iconProps} />;
  return <FileText {...iconProps} />;
}

export function NotificationsScreen() {
  const { colors, fs } = useTema();
  const styles = useMemo(() => crearEstilos(colors, fs), [colors, fs]);
  const { tipoPerfil } = useAuth();
  const esConsulta = tipoPerfil?.trim().toLocaleLowerCase('es-AR') === 'consulta';
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [filtro, setFiltro] = useState<Filtro>('todas');
  const [sinLeer, setSinLeer] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [ultimaPagina, setUltimaPagina] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;

    notificationService.get(1)
      .then((resultado) => {
        if (!activo) return;
        setNotificaciones(resultado.data);
        setSinLeer(resultado.unread_count);
        setPagina(resultado.meta.current_page);
        setUltimaPagina(resultado.meta.last_page);
      })
      .catch((cause) => {
        if (activo) {
          setError(cause instanceof Error ? cause.message : 'No se pudieron cargar las notificaciones.');
        }
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  const cargar = useCallback(async (refrescar = false) => {
    if (refrescar) setActualizando(true);
    else setCargando(true);
    setError(null);

    try {
      const resultado = await notificationService.get(1);
      setNotificaciones(resultado.data);
      setSinLeer(resultado.unread_count);
      setPagina(resultado.meta.current_page);
      setUltimaPagina(resultado.meta.last_page);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudieron cargar las notificaciones.');
    } finally {
      setCargando(false);
      setActualizando(false);
    }
  }, []);

  const visibles = useMemo(() => notificaciones.filter((notificacion) => {
    if (filtro === 'por_firmar') return notificacion.tipo === 'firma_pendiente';
    if (filtro === 'convenios') return notificacion.tipo !== 'firma_pendiente';
    return true;
  }), [filtro, notificaciones]);

  const deHoy = visibles.filter((notificacion) => esDeHoy(notificacion.created_at));
  const anteriores = visibles.filter((notificacion) => !esDeHoy(notificacion.created_at));

  const cargarMas = async () => {
    if (cargandoMas || pagina >= ultimaPagina) return;

    setCargandoMas(true);
    try {
      const resultado: NotificacionesResponse = await notificationService.get(pagina + 1);
      setNotificaciones((actuales) => [...actuales, ...resultado.data]);
      setPagina(resultado.meta.current_page);
      setUltimaPagina(resultado.meta.last_page);
    } catch (cause) {
      Alert.alert(
        'No se pudo cargar más',
        cause instanceof Error ? cause.message : 'Intentá nuevamente.',
      );
    } finally {
      setCargandoMas(false);
    }
  };

  const marcarTodasLeidas = async () => {
    try {
      await notificationService.markAllRead();
      setNotificaciones((actuales) => actuales.map((item) => ({ ...item, leido: true })));
      setSinLeer(0);
    } catch (cause) {
      Alert.alert(
        'No se pudieron marcar como leídas',
        cause instanceof Error ? cause.message : 'Intentá nuevamente.',
      );
    }
  };

  const abrirNotificacion = async (notificacion: Notificacion) => {
    try {
      if (!notificacion.leido) {
        await notificationService.markRead(notificacion.id);
        setNotificaciones((actuales) => actuales.map((item) => (
          item.id === notificacion.id ? { ...item, leido: true } : item
        )));
        setSinLeer((actual) => Math.max(0, actual - 1));
      }

      if (notificacion.id_instrumento !== null) {
        router.push(`/agreement/${notificacion.id_instrumento}`);
      }
    } catch (cause) {
      Alert.alert(
        'No se pudo abrir la notificación',
        cause instanceof Error ? cause.message : 'Intentá nuevamente.',
      );
    }
  };

  const renderGrupo = (titulo: string, items: Notificacion[]) => {
    if (items.length === 0) return null;

    return (
      <View style={styles.group} key={titulo}>
        <Text style={styles.groupTitle}>{titulo}</Text>
        {items.map((notificacion) => (
          <Pressable
            accessibilityRole="button"
            key={notificacion.id}
            onPress={() => void abrirNotificacion(notificacion)}
            style={[styles.card, !notificacion.leido && styles.unreadCard]}
          >
            <View style={styles.iconBox}>
              <IconoNotificacion tipo={notificacion.tipo} />
            </View>
            <View style={styles.cardContent}>
              <View style={styles.cardHeading}>
                <Text numberOfLines={1} style={styles.cardTitle}>
                  {tituloNotificacion(notificacion.tipo)}
                </Text>
                <Text style={styles.cardTime}>{horaNotificacion(notificacion.created_at)}</Text>
              </View>
              <Text style={styles.message}>{notificacion.mensaje}</Text>
              {notificacion.convenio && (
                <View style={styles.agreementRow}>
                  <Text style={styles.agreementCode}>{notificacion.convenio.codigo}</Text>
                  {!!notificacion.convenio.estado && (
                    <EstadoBadge estado={notificacion.convenio.estado} />
                  )}
                </View>
              )}
            </View>
            {!notificacion.leido && <View style={styles.unreadDot} />}
            <ChevronRight size={18} color={colors.textMuted} />
          </Pressable>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safe}>
      <HeaderBack
        titulo="Notificaciones"
        acciones={
          <Pressable
            accessibilityRole="button"
            disabled={sinLeer === 0}
            onPress={() => void marcarTodasLeidas()}
            style={styles.markReadButton}
          >
            <CheckCheck size={17} color={sinLeer > 0 ? colors.primary : colors.textMuted} />
            <Text style={[styles.markReadText, sinLeer === 0 && styles.disabledText]}>Marcar leídas</Text>
          </Pressable>
        }
      />


      {esConsulta ? (
        <View style={styles.consultaNotice}>
          <CheckCheck size={18} color={colors.primary} />
          <Text style={styles.consultaNoticeText}>
            Solo se muestran notificaciones de convenios firmados.
          </Text>
        </View>
      ) : (
        <View style={styles.filterRow}>
          {filtros.map((opcion) => (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: filtro === opcion.id }}
              key={opcion.id}
              onPress={() => setFiltro(opcion.id)}
              style={[styles.filterChip, filtro === opcion.id && styles.selectedFilter]}
            >
              <Text style={[styles.filterText, filtro === opcion.id && styles.selectedFilterText]}>
                {opcion.label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {cargando ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.helperText}>Cargando notificaciones...</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable accessibilityRole="button" onPress={() => void cargar()} style={styles.retryButton}>
            <Text style={styles.retryText}>Reintentar</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              onRefresh={() => void cargar(true)}
              refreshing={actualizando}
              tintColor={colors.primary}
            />
          }
        >
          {visibles.length === 0 ? (
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <CheckCheck size={28} color={colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>Estás al día</Text>
              <Text style={styles.helperText}>No hay notificaciones para este filtro.</Text>
            </View>
          ) : (
            <>
              {renderGrupo('Hoy', deHoy)}
              {renderGrupo('Anteriores', anteriores)}
              {pagina < ultimaPagina && (
                <Pressable
                  accessibilityRole="button"
                  disabled={cargandoMas}
                  onPress={() => void cargarMas()}
                  style={styles.loadMoreButton}
                >
                  {cargandoMas ? (
                    <ActivityIndicator color={colors.primary} />
                  ) : (
                    <Text style={styles.loadMoreText}>Cargar más</Text>
                  )}
                </Pressable>
              )}
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const crearEstilos = (colors: Colores, fs: (tamano: number) => number) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    markReadButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    markReadText: {
      color: colors.primary,
      fontSize: fs(12),
      fontWeight: '600',
    },
    disabledText: {
      color: colors.textMuted,
    },
    filterRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      backgroundColor: colors.background,
    },
    consultaNotice: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      backgroundColor: colors.background,
    },
    consultaNoticeText: {
      flex: 1,
      color: colors.primary,
      fontSize: fs(13),
      fontWeight: '600',
    },
    filterChip: {
      paddingHorizontal: 15,
      paddingVertical: 8,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
    },
    selectedFilter: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterText: {
      color: colors.textMuted,
      fontSize: fs(13),
      fontWeight: '600',
    },
    selectedFilterText: {
      color: colors.background,
    },
    content: {
      padding: spacing.md,
      paddingBottom: spacing.xl,
    },
    group: {
      gap: spacing.sm,
      marginBottom: spacing.lg,
    },
    groupTitle: {
      marginBottom: 2,
      color: colors.textMuted,
      fontSize: fs(13),
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      padding: spacing.md,
      borderRadius: 16,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    unreadCard: {
      borderColor: colors.primarySoft,
      backgroundColor: '#F8FAFD',
    },
    iconBox: {
      width: 42,
      height: 42,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 13,
      backgroundColor: colors.primarySoft,
    },
    cardContent: {
      flex: 1,
      gap: 4,
    },
    cardHeading: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    cardTitle: {
      flex: 1,
      color: colors.text,
      fontSize: fs(14),
      fontWeight: '700',
    },
    cardTime: {
      color: colors.textMuted,
      fontSize: fs(11),
    },
    message: {
      color: colors.textMuted,
      fontSize: fs(13),
      lineHeight: fs(18),
    },
    agreementRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginTop: 2,
    },
    agreementCode: {
      color: colors.primary,
      fontSize: fs(12),
      fontWeight: '700',
    },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#F59E0B',
    },
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.md,
      padding: spacing.lg,
    },
    helperText: {
      color: colors.textMuted,
      fontSize: fs(14),
      textAlign: 'center',
    },
    errorText: {
      color: colors.error,
      fontSize: fs(14),
      textAlign: 'center',
    },
    retryButton: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: 10,
      backgroundColor: colors.primary,
    },
    retryText: {
      color: colors.background,
      fontWeight: '700',
    },
    empty: {
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: 64,
    },
    emptyIcon: {
      width: 60,
      height: 60,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 30,
      backgroundColor: colors.primarySoft,
    },
    emptyTitle: {
      color: colors.text,
      fontSize: fs(18),
      fontWeight: '700',
    },
    loadMoreButton: {
      alignItems: 'center',
      padding: spacing.md,
    },
    loadMoreText: {
      color: colors.primary,
      fontSize: fs(14),
      fontWeight: '700',
    },
  });
