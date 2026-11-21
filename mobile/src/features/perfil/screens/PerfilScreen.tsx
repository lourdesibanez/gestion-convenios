import { useMemo } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut, BookOpen, ChevronRight } from 'lucide-react-native';
import { SegmentedControl, type SegmentedOption } from '@/components/molecules';
import { useAuth } from '@/features/auth/context/AuthContext';
import { radius, spacing, useTema, type Colores, type TamanoLetra, type Tipografia } from '@/theme';
import { router } from 'expo-router';
import { TarjetaIdentidad } from '@/features/identidad/components/TarjetaIdentidad';

// Cada opción se muestra con su propio tamaño, así se ve la diferencia antes de elegir.
const OPCIONES_LETRA: SegmentedOption<TamanoLetra>[] = [
  { value: 'chica', label: 'Chica', labelStyle: { fontSize: 13 } },
  { value: 'mediana', label: 'Mediana', labelStyle: { fontSize: 16 } },
  { value: 'grande', label: 'Grande', labelStyle: { fontSize: 19 } },
];

export function PerfilScreen() {
  const { signOut } = useAuth();
  const { colors, typography, esOscuro, tamanoLetra, setModo, setTamanoLetra } = useTema();
  const styles = useMemo(() => crearEstilos(colors, typography), [colors, typography]);

  const confirmSignOut = () =>
    Alert.alert('Cerrar sesión', '¿Querés cerrar la sesión en este dispositivo?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: signOut },
    ]);

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>

        {/* Apariencia: se guarda en el celular y aplica a toda la app */}
        <View style={styles.tarjeta}>
          <Text style={styles.tituloSeccion}>Apariencia</Text>

          <SegmentedControl
            label="Tamaño de letra"
            options={OPCIONES_LETRA}
            value={tamanoLetra}
            onValueChange={setTamanoLetra}
          />
          <Text style={styles.ayuda}>Así se verán los textos en toda la app.</Text>

          <View style={styles.separador} />

          <View style={styles.fila}>
            <View style={styles.filaTextos}>
              <Text style={styles.filaTitulo}>Modo oscuro</Text>
              <Text style={styles.filaSubtitulo}>Mantiene contraste AA</Text>
            </View>
            <Switch
              accessibilityLabel="Modo oscuro"
              value={esOscuro}
              onValueChange={(activo) => setModo(activo ? 'oscuro' : 'claro')}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.background}
            />
          </View>
        </View>

        <TarjetaIdentidad />

        {/* Ayuda y cuenta */}
        <View style={styles.tarjeta}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/manual')}
            style={styles.filaAccion}
          >
            <BookOpen size={20} color={colors.text} />
            <Text style={styles.filaTexto}>Manual de uso</Text>
            <ChevronRight size={20} color={colors.textMuted} />
          </Pressable>

          <View style={styles.separador} />

          <Pressable
            accessibilityRole="button"
            onPress={confirmSignOut}
            style={styles.filaAccion}
          >
            <LogOut size={20} color={colors.error} />
            <Text style={styles.cerrarSesion}>Cerrar sesión</Text>
          </Pressable>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const crearEstilos = (colors: Colores, typography: Tipografia) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.surface },
    content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.lg },
    tarjeta: {
      gap: spacing.md,
      padding: spacing.md,
      borderRadius: radius.md,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    tituloSeccion: { ...typography.label, fontSize: typography.body.fontSize, color: colors.primary },
    ayuda: { ...typography.small, color: colors.textMuted },
    separador: { height: 1, backgroundColor: colors.border },
    fila: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    filaTextos: { flex: 1, gap: 2 },
    filaTitulo: { ...typography.label, color: colors.text },
    filaSubtitulo: { ...typography.small, color: colors.textMuted },
    filaAccion: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, minHeight: 44 },
    filaTexto: { ...typography.body, flex: 1, color: colors.text },
    cerrarSesion: { ...typography.body, color: colors.error, fontWeight: '600' },
  });
