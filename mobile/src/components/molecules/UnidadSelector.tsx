import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Check, ChevronDown } from 'lucide-react-native';
import { spacing, useTema, type Colores } from '@/theme';

type Opcion = { id: number; nombre: string; roles: string[] };

type Props = {
  unidades: Opcion[];
  idActiva: number | null; // null = todas
  onCambiar: (id: number | null) => void;
};

const ROLES: Record<string, string> = {
  administracion: 'Administración',
  gestion: 'Gestión',
  revision: 'Revisión',
  consulta: 'Consulta',
};

export function UnidadSelector({ unidades, idActiva, onCambiar }: Props) {
  const { colors, fs } = useTema();
  const styles = useMemo(() => crearEstilos(colors, fs), [colors, fs]);
  const [abierto, setAbierto] = useState(false);

  const activa = unidades.find((u) => u.id === idActiva);
  const opciones: (Opcion | null)[] = [null, ...unidades]; // null = "Todas mis unidades"

  const elegir = (id: number | null) => {
    onCambiar(id);
    setAbierto(false);
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Unidad: ${activa?.nombre ?? 'Todas mis unidades'}. Cambiar unidad`}
        hitSlop={6}
        onPress={() => setAbierto(true)}
        style={styles.disparador}
      >
        <Text numberOfLines={1} style={styles.textoDisparador}>
          {activa?.nombre ?? 'Todas mis unidades'}
        </Text>
        <ChevronDown size={14} color={colors.onPrimary} />
      </Pressable>

      <Modal animationType="fade" transparent visible={abierto} onRequestClose={() => setAbierto(false)}>
        <Pressable style={styles.fondo} onPress={() => setAbierto(false)}>
          <Pressable style={styles.tarjeta} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.titulo}>Ver convenios de</Text>
            <ScrollView>
              {opciones.map((opcion) => {
                const id = opcion?.id ?? null;
                const seleccionada = id === idActiva;
                return (
                  <Pressable
                    key={id ?? 'todas'}
                    accessibilityRole="button"
                    accessibilityState={{ selected: seleccionada }}
                    onPress={() => elegir(id)}
                    style={styles.opcion}
                  >
                    <View style={styles.opcionTextos}>
                      <Text style={[styles.nombre, seleccionada && styles.nombreActivo]}>
                        {opcion?.nombre ?? 'Todas mis unidades'}
                      </Text>
                      {opcion && (
                        <Text style={styles.roles}>
                          {opcion.roles.map((r) => ROLES[r] ?? r).join(' · ')}
                        </Text>
                      )}
                    </View>
                    {seleccionada && <Check size={18} color={colors.primary} />}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const crearEstilos = (colors: Colores, fs: (tamano: number) => number) =>
  StyleSheet.create({
    disparador: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', maxWidth: '100%' },
    textoDisparador: { color: colors.onPrimary, opacity: 0.85, fontSize: fs(12), flexShrink: 1 },
    fondo: { flex: 1, justifyContent: 'center', padding: spacing.lg, backgroundColor: colors.overlay },
    tarjeta: {
      maxHeight: '75%', padding: spacing.md, borderRadius: 16,
      backgroundColor: colors.elevated, borderWidth: 1, borderColor: colors.border,
    },
    titulo: { color: colors.text, fontSize: fs(17), fontWeight: '700', marginBottom: spacing.sm },
    opcion: {
      flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border,
    },
    opcionTextos: { flex: 1 },
    nombre: { color: colors.text, fontSize: fs(15) },
    nombreActivo: { color: colors.primary, fontWeight: '700' },
    roles: { color: colors.textMuted, fontSize: fs(12), marginTop: 2 },
  });
