import { useMemo } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CircleHelp } from 'lucide-react-native';
import { Button, TextLink } from '@/components/atoms';
import { radius, spacing, useTema, type Colores, type Tipografia } from '@/theme';

type Props = {
  visible: boolean;
  seccion: string; // etiqueta corta: "Buscador"
  titulo: string;
  texto: string;
  onCerrar: () => void;
  onVerManual?: () => void;
};

// Hoja inferior con una ayuda corta sobre la sección actual.
export function AyudaSheet({ visible, seccion, titulo, texto, onCerrar, onVerManual }: Props) {
  const { colors, typography } = useTema();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => crearEstilos(colors, typography), [colors, typography]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCerrar}>
      <View style={styles.contenedor}>
        {/* Tocar afuera de la hoja la cierra */}
        <Pressable
          style={styles.fondo}
          onPress={onCerrar}
          accessibilityRole="button"
          accessibilityLabel="Cerrar ayuda"
        />

        {/* La hoja sube desde abajo mientras el fondo aparece */}
        <Animated.View
          entering={SlideInDown.duration(250)}
          accessibilityViewIsModal
          style={[styles.hoja, { paddingBottom: spacing.lg + insets.bottom }]}
        >
          <View style={styles.manija} />

          <View style={styles.etiquetaFila}>
            <View style={styles.icono}>
              <CircleHelp size={18} color={colors.primary} />
            </View>
            <Text style={styles.etiqueta}>AYUDA · {seccion.toLocaleUpperCase('es-AR')}</Text>
          </View>

          <Text style={styles.titulo} accessibilityRole="header">
            {titulo}
          </Text>
          <Text style={styles.texto}>{texto}</Text>

          <Button title="Entendido" onPress={onCerrar} />
            {onVerManual && (
                <View style={styles.link}>
                <TextLink title="Ver manual completo" onPress={onVerManual} />
                </View>
            )}

        </Animated.View>
      </View>
    </Modal>
  );
}

const crearEstilos = (colors: Colores, typography: Tipografia) =>
  StyleSheet.create({
    contenedor: { flex: 1, justifyContent: 'flex-end' },
        fondo: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      backgroundColor: 'rgba(0,0,0,0.4)',
    },
    link: { alignItems: 'center' },
    hoja: {
      gap: spacing.md,
      padding: spacing.lg,
      backgroundColor: colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
    },
    manija: {
      alignSelf: 'center',
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
    },
    etiquetaFila: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    icono: {
      width: 32,
      height: 32,
      borderRadius: radius.sm,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primarySoft,
    },
    etiqueta: { ...typography.small, fontWeight: '700', color: colors.textMuted, letterSpacing: 0.5 },
    titulo: { ...typography.button, fontSize: typography.body.fontSize + 4, color: colors.text },
    texto: { ...typography.body, color: colors.textMuted, lineHeight: typography.body.fontSize * 1.4 },
  });
