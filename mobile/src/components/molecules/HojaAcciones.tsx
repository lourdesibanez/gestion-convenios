import { useMemo, type ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing, useTema, type Colores } from '@/theme';

export type AccionHoja = {
  clave: string;
  etiqueta: string;
  icono: (color: string) => ReactNode;
  onPress: () => void;
  /** Texto chico debajo de la etiqueta. */
  ayuda?: string;
  /** Acción destructiva: va en rojo y separada. */
  peligro?: boolean;
};

type Props = {
  visible: boolean;
  subtitulo?: string;
  acciones: AccionHoja[];
  onCerrar: () => void;
};

// Espera a que el menú termine de cerrarse antes de abrir otra cosa (alerta o selector);
// en iOS no se puede abrir un modal mientras otro se está cerrando.
const ESPERA_CIERRE_MS = 300;

/** Hoja inferior con las acciones de una pantalla (menú ⋮). */
export function HojaAcciones({ visible, subtitulo, acciones, onCerrar }: Props) {
  const { colors, fs } = useTema();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => crearEstilos(colors, fs), [colors, fs]);

  const elegir = (accion: AccionHoja) => {
    onCerrar();
    setTimeout(accion.onPress, ESPERA_CIERRE_MS);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCerrar}>
      <View style={styles.contenedor}>
        <Pressable
          style={styles.fondo}
          onPress={onCerrar}
          accessibilityRole="button"
          accessibilityLabel="Cerrar menú"
        />

        <Animated.View
          entering={SlideInDown.duration(250)}
          accessibilityViewIsModal
          style={[styles.hoja, { paddingBottom: spacing.lg + insets.bottom }]}
        >
          <View style={styles.manija} />
          {subtitulo ? <Text style={styles.subtitulo}>{subtitulo}</Text> : null}

          {acciones.map((accion) => {
            const color = accion.peligro ? colors.error : colors.text;
            const colorIcono = accion.peligro ? colors.error : colors.primary;
            return (
              <Pressable
                key={accion.clave}
                accessibilityRole="button"
                accessibilityLabel={accion.etiqueta}
                accessibilityHint={accion.ayuda}
                onPress={() => elegir(accion)}
                style={[styles.fila, accion.peligro && styles.filaPeligro]}
              >
                {accion.icono(colorIcono)}
                <View style={styles.textos}>
                  <Text style={[styles.etiqueta, { color }]}>{accion.etiqueta}</Text>
                  {accion.ayuda ? <Text style={styles.ayuda}>{accion.ayuda}</Text> : null}
                </View>
              </Pressable>
            );
          })}

          <Pressable accessibilityRole="button" onPress={onCerrar} style={styles.cancelar}>
            <Text style={styles.cancelarTxt}>Cancelar</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const crearEstilos = (colors: Colores, fs: (tamano: number) => number) =>
  StyleSheet.create({
    contenedor: { flex: 1, justifyContent: 'flex-end' },
    fondo: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: colors.overlay },
    hoja: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
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
      marginBottom: spacing.md,
    },
    subtitulo: { color: colors.textMuted, fontSize: fs(12), marginBottom: spacing.sm },
    fila: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 14 },
    filaPeligro: {
      marginTop: spacing.xs,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    textos: { flex: 1 },
    etiqueta: { fontSize: fs(15), fontWeight: '600' },
    ayuda: { color: colors.textMuted, fontSize: fs(11), marginTop: 2 },
    cancelar: {
      marginTop: spacing.md,
      minHeight: 48,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
    },
    cancelarTxt: { color: colors.text, fontSize: fs(15), fontWeight: '600' },
  });
