import { ReactNode, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { spacing, useTema, type Colores } from '@/theme';

type Props = {
  titulo?: string;
  subtitulo?: string;
  /** Por defecto vuelve a la pantalla anterior. */
  onVolver?: () => void;
  volverDeshabilitado?: boolean;
  /** Botones opcionales a la derecha (compartir, ayuda, marcar leídas...). */
  acciones?: ReactNode;
};

/** Encabezado único de las pantallas con "volver": misma flecha y mismo estilo de título. */
export function HeaderBack({
  titulo,
  subtitulo,
  onVolver = () => router.back(),
  volverDeshabilitado = false,
  acciones,
}: Props) {
  const { colors, fs } = useTema();
  const styles = useMemo(() => crearEstilos(colors, fs), [colors, fs]);

  return (
    <View style={styles.header}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Volver"
        hitSlop={8}
        disabled={volverDeshabilitado}
        onPress={onVolver}
        style={styles.volver}
      >
        <ArrowLeft size={22} color={colors.text} />
      </Pressable>

      <View style={styles.textos}>
        {!!titulo && (
          <Text accessibilityRole="header" numberOfLines={1} style={styles.titulo}>
            {titulo}
          </Text>
        )}
        {!!subtitulo && (
          <Text numberOfLines={1} style={styles.subtitulo}>
            {subtitulo}
          </Text>
        )}
      </View>

      {acciones ? <View style={styles.acciones}>{acciones}</View> : null}
    </View>
  );
}

const crearEstilos = (colors: Colores, fs: (tamano: number) => number) =>
  StyleSheet.create({
    header: {
      minHeight: 58,
      paddingHorizontal: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    volver: { width: 36, height: 44, justifyContent: 'center' },
    textos: { flex: 1 },
    titulo: { color: colors.text, fontSize: fs(18), fontWeight: '700' },
    subtitulo: { color: colors.textMuted, fontSize: fs(12) },
    acciones: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  });
