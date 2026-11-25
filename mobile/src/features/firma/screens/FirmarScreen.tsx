import { useCallback, useEffect, useState, useMemo } from 'react';
import {ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ApiError } from '@/services/api';
import { spacing, useTema, type Colores, type Tipografia } from '@/theme';
import {FirmaPendiente, firmaService,} from '../services/firmaService';
import { router } from 'expo-router';
import { pendientesCache } from '../services/pendientesCache';
import { conveniosService } from '@/features/convenios/services/convenioService';
import { useHome } from '@/features/home/hooks/useHome';

// Descarga el detalle de cada pendiente para poder abrirlo sin conexión.
async function guardarDetallesOffline(pendientes: FirmaPendiente[]) {
  try {
    const detalles = await Promise.all(
      pendientes.map((p) => conveniosService.detalle(p.id_instrumento)),
    );
    await pendientesCache.guardarDetalles(detalles);
  } catch (e) {
    console.warn('No se pudieron guardar los detalles para offline:', e);
  }
}


export function FirmarScreen() {
  const { colors, typography } = useTema();
  const styles = useMemo(() => crearEstilos(colors, typography), [colors, typography]);
  const [items, setItems] = useState<FirmaPendiente[]>([]);
  const [pagina, setPagina] = useState(1);
  const [ultimaPagina, setUltimaPagina] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string>();
  const [errorMas, setErrorMas] = useState<string>();
  const [guardadoEn, setGuardadoEn] = useState<string>(); // con valor = mostrando datos offline
  const { refreshing, refresh } = useHome();
  

  const cargarPrimeraPagina = useCallback(async () => {
    setLoading(true);
    setError(undefined);

    try {
      const respuesta = await firmaService.listarPendientes(1);
      setItems(respuesta.data);
      setPagina(respuesta.current_page);
      setUltimaPagina(respuesta.last_page);
      setTotal(respuesta.total);
      setGuardadoEn(undefined);
      void pendientesCache.guardar(respuesta); // copia para usar sin conexión
      void guardarDetallesOffline(respuesta.data);
    } catch (e) {
      // Sin conexión: se muestra la última lista guardada.
      if (e instanceof ApiError && e.status === 0) {
        const guardado = await pendientesCache.leer();
        if (guardado) {
          setItems(guardado.pagina.data);
          setPagina(1);
          setUltimaPagina(1); // offline no hay "Cargar más"
          setTotal(guardado.pagina.total);
          setGuardadoEn(guardado.guardadoEn);
          return;
        }
      }

      setError(e instanceof ApiError ? e.message : 'Ocurrió un error inesperado.');
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    void cargarPrimeraPagina();
  }, [cargarPrimeraPagina]);

  const cargarMas = async () => {
    if (loadingMore || pagina >= ultimaPagina) return;

    setLoadingMore(true);
    setErrorMas(undefined);

    try {
      const respuesta = await firmaService.listarPendientes(pagina + 1);
      setItems((actuales) => [...actuales, ...respuesta.data]);
      setPagina(respuesta.current_page);
      setUltimaPagina(respuesta.last_page);
      setTotal(respuesta.total);
    } catch (e) {
      setErrorMas(
        e instanceof ApiError
          ? e.message
          : 'No se pudieron cargar más convenios.',
      );
    } finally {
      setLoadingMore(false);
    }
  };

return (
  <SafeAreaView style={styles.safe}>
    <View style={styles.header}>
      <Text style={styles.title}>Convenios por firmar</Text>
      <Text style={styles.subtitle}>{total} pendientes</Text>
    </View>

    {loading ? (
      <ActivityIndicator
        style={styles.loader}
        size="large"
        color={colors.primary}
      />
    ) : (
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} colors={[colors.primary]} />
        }
      >
        {error ? (
          <View style={styles.messageBox}>
            <Text style={styles.error}>{error}</Text>
            <Pressable onPress={() => void cargarPrimeraPagina()}>
              <Text style={styles.action}>Reintentar</Text>
            </Pressable>
          </View>
        ) : items.length === 0 ? (
          <Text style={styles.empty}>
            No tenés convenios pendientes de firma.
          </Text>
        ) : (
          <>
            <View style={styles.list}>
              {items.map((item) => (
                <View key={item.id_instrumento} style={styles.row}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Ver detalle de ${item.titulo}`}
                    onPress={() =>
                      router.push({
                        pathname: '/agreement/[id]',
                        params: { id: String(item.id_instrumento) },
                      })
                    }
                    style={styles.rowContent}
                  >
                    <Text style={styles.name} numberOfLines={1}>
                      {item.titulo}
                    </Text>
                    <Text style={styles.meta}>
                      {item.codigo} · {new Date(item.asignado_en).toLocaleDateString('es-AR')}
                    </Text>
                  </Pressable>
                </View>
              ))}
            </View>

            {errorMas && <Text style={styles.error}>{errorMas}</Text>}

            {pagina < ultimaPagina && (
              <Pressable
                accessibilityRole="button"
                disabled={loadingMore}
                onPress={() => void cargarMas()}
                style={styles.loadMore}
              >
                {loadingMore ? (
                  <ActivityIndicator color={colors.primary} />
                ) : (
                  <Text style={styles.action}>Cargar más</Text>
                )}
              </Pressable>
            )}
          </>
        )}
      </ScrollView>
    )}

    {guardadoEn && (
      <Text style={[styles.subtitle, styles.actualizado]}>
        Actualizado el {new Date(guardadoEn).toLocaleString('es-AR')}
      </Text>
    )}
  </SafeAreaView>
);
}

const crearEstilos = (colors: Colores, typography: Tipografia) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    header: {
      padding: spacing.lg,
      gap: spacing.xs,
    },
    title: {
      ...typography.label,
      color: colors.text,
    },
    subtitle: {
      ...typography.small,
      color: colors.textMuted,
    },
    actualizado: {
      textAlign: 'right',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
    },
    content: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.lg,
    },
    list: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      overflow: 'hidden',
    },
    row: {
      minHeight: 88,
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    rowContent: {
      flex: 1,
      justifyContent: 'center',
      gap: spacing.xs,
    },
    code: {
      ...typography.small,
      color: colors.primary,
      fontWeight: '600',
    },
    name: {
      ...typography.label,
      color: colors.text,
    },
    meta: {
      ...typography.small,
      color: colors.textMuted,
    },
    loader: {
      marginTop: spacing.xl,
    },
    messageBox: {
      padding: spacing.lg,
      alignItems: 'center',
      gap: spacing.md,
    },
    empty: {
      ...typography.body,
      padding: spacing.lg,
      color: colors.textMuted,
      textAlign: 'center',
    },
    error: {
      ...typography.body,
      color: colors.error,
      textAlign: 'center',
    },
    action: {
      ...typography.label,
      color: colors.primary,
    },
    loadMore: {
      alignItems: 'center',
      padding: spacing.lg,
    },
  });