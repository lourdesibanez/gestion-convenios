import { useCallback, useEffect, useState } from 'react';
import {ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ApiError } from '@/services/api';
import { colors, spacing, typography } from '@/theme';
import {FirmaPendiente, firmaService,} from '../services/firmaService';

export function FirmarScreen() {
  const [items, setItems] = useState<FirmaPendiente[]>([]);
  const [pagina, setPagina] = useState(1);
  const [ultimaPagina, setUltimaPagina] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string>();
  const [errorMas, setErrorMas] = useState<string>();

  const cargarPrimeraPagina = useCallback(async () => {
    setLoading(true);
    setError(undefined);

    try {
      const respuesta = await firmaService.listarPendientes(1);
      setItems(respuesta.data);
      setPagina(respuesta.current_page);
      setUltimaPagina(respuesta.last_page);
      setTotal(respuesta.total);
    } catch (e) {
      setError(
        e instanceof ApiError
          ? e.message
          : 'Ocurrió un error inesperado.',
      );
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
      ) : error ? (
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
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.list}>
            {items.map((item) => (
              <View key={item.id} style={styles.row}>
                <View style={styles.rowContent}>
                  <Text style={styles.code}>{item.codigo}</Text>
                  <Text style={styles.name}>{item.titulo}</Text>
                  <Text style={styles.meta}>
                    {item.tipo} · Asignado el{' '}
                    {new Date(item.asignado_en).toLocaleDateString('es-AR')}
                  </Text>
                </View>
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
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    justifyContent: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowContent: {
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