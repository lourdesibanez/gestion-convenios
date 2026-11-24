import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, X } from 'lucide-react-native';
import { HeaderBack } from '@/components/molecules';
import { radius, spacing, useTema, type Colores, type Tipografia } from '@/theme';
import { PasoGuia } from '../components/PasoGuia';
import { PreguntaFrecuente } from '../components/PreguntaFrecuente';
import { buscarEnManual, GUIAS, type Guia } from '../contenidoAyuda';

export function ManualScreen() {
  const { colors, typography } = useTema();
  const styles = useMemo(() => crearEstilos(colors, typography), [colors, typography]);
  const [consulta, setConsulta] = useState('');
  const [guiaElegida, setGuiaElegida] = useState<Guia['id']>('firmar');

  const { guias, preguntas } = buscarEnManual(consulta);
  // Si la búsqueda deja afuera la guía elegida, se muestra la primera que coincida.
  const guia = guias.find((g) => g.id === guiaElegida) ?? guias[0];
  const sinResultados = guias.length === 0 && preguntas.length === 0;

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = () => {
    setRefreshing(true);
    setConsulta(''); // limpia el buscador
    setTimeout(() => setRefreshing(false), 600);
  };
  return (
    <SafeAreaView edges={['top']} style={styles.pantalla}>
      <HeaderBack titulo="Manual de uso" />

      <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
      }
      >
        {/* Buscador: filtra guías y preguntas mientras escribís */}
        <View style={styles.buscador}>
          <Search size={20} color={colors.textMuted} />
          <TextInput
            accessibilityLabel="Buscar en el manual"
            placeholder="¿En qué te ayudamos?"
            placeholderTextColor={colors.textMuted}
            value={consulta}
            onChangeText={setConsulta}
            returnKeyType="search"
            style={styles.input}
          />
          {consulta ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Limpiar búsqueda"
              hitSlop={8}
              onPress={() => setConsulta('')}
            >
              <X size={18} color={colors.textMuted} />
            </Pressable>
          ) : null}
        </View>

        {sinResultados && (
          <Text style={styles.vacio}>
            No encontramos nada para “{consulta}”. Probá con otra palabra.
          </Text>
        )}

        {/* Guías: la elegida muestra sus pasos abajo */}
        {guias.length > 0 && (
          <View style={styles.guias}>
            {guias.map((g) => {
              const activa = g.id === guia?.id;
              return (
                <Pressable
                  key={g.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected: activa }}
                  onPress={() => setGuiaElegida(g.id)}
                  style={[styles.tarjetaGuia, activa && styles.tarjetaGuiaActiva]}
                >
                  <View style={[styles.numeroGuia, activa && styles.numeroGuiaActivo]}>
                    <Text style={[styles.numeroGuiaTxt, activa && styles.numeroGuiaTxtActivo]}>
                      {GUIAS.indexOf(g) + 1}
                    </Text>
                  </View>
                  <Text style={styles.tituloGuia}>{g.titulo}</Text>
                  <Text style={styles.metaGuia}>
                    {g.pasos.length} pasos · {g.duracion}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {guia && (
          <View style={styles.tarjeta}>
            <Text style={styles.tituloSeccion}>{guia.titulo}</Text>
            <View>
              {guia.pasos.map((paso, i) => (
                <PasoGuia
                  key={paso.titulo}
                  numero={i + 1}
                  titulo={paso.titulo}
                  detalle={paso.detalle}
                  ultimo={i === guia.pasos.length - 1}
                />
              ))}
            </View>
          </View>
        )}

        {preguntas.length > 0 && (
          <View style={styles.tarjeta}>
            <Text style={styles.tituloSeccion}>Preguntas frecuentes</Text>
            <View>
              {preguntas.map((p, i) => (
                <PreguntaFrecuente
                  key={p.pregunta}
                  pregunta={p.pregunta}
                  respuesta={p.respuesta}
                  ultima={i === preguntas.length - 1}
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const crearEstilos = (colors: Colores, typography: Tipografia) =>
  StyleSheet.create({
    pantalla: { flex: 1, backgroundColor: colors.surface },
    contenido: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xl },
    buscador: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      minHeight: 48,
      paddingHorizontal: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    input: { ...typography.body, flex: 1, color: colors.text, paddingVertical: spacing.sm },
    vacio: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
    guias: { flexDirection: 'row', gap: spacing.md },
    tarjetaGuia: {
      flex: 1,
      gap: spacing.xs,
      padding: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    tarjetaGuiaActiva: { borderColor: colors.primary, borderWidth: 2 },
    numeroGuia: {
      width: 32,
      height: 32,
      borderRadius: radius.sm,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primarySoft,
      marginBottom: spacing.xs,
    },
    numeroGuiaActivo: { backgroundColor: colors.primary },
    numeroGuiaTxt: { ...typography.label, color: colors.primary },
    numeroGuiaTxtActivo: { color: colors.onPrimary },
    tituloGuia: { ...typography.label, color: colors.text },
    metaGuia: { ...typography.small, color: colors.textMuted },
    tarjeta: {
      gap: spacing.md,
      padding: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    tituloSeccion: { ...typography.label, fontSize: typography.body.fontSize, color: colors.primary },
  });
