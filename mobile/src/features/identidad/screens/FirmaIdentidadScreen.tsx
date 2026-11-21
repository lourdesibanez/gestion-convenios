import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Save } from 'lucide-react-native';
import { HeaderBack, OfflineBanner } from '@/components/molecules';
import { SignaturePad, type SignaturePadHandle } from '@/components/organisms';
import { ApiError } from '@/services/api';
import { useOffline } from '@/services/useOffline';
import { radius, spacing, useTema, type Colores, type Tipografia } from '@/theme';
import { BotonAyuda } from '@/features/ayuda/components/BotonAyuda';
import { identidadService } from '../services/identidadService';

// Pantalla para dibujar y guardar la firma del usuario (Perfil › Registrar mi identidad).
export function FirmaIdentidadScreen() {
  const { colors, typography } = useTema();
  const styles = useMemo(() => crearEstilos(colors, typography), [colors, typography]);
  const offline = useOffline();
  const padRef = useRef<SignaturePadHandle>(null);
  const [firmaVacia, setFirmaVacia] = useState(true);
  const [firmaActual, setFirmaActual] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // Trae la firma ya registrada (si hay) para mostrarla arriba.
  useEffect(() => {
    let activo = true;
    identidadService
      .obtener()
      .then((datos) => {
        if (activo) setFirmaActual(datos.firma);
      })
      .catch(() => {
        // Si falla no bloquea: igual puede dibujar una nueva.
      })
      .finally(() => {
        if (activo) setCargando(false);
      });
    return () => {
      activo = false;
    };
  }, []);

  const guardar = async () => {
    if (!padRef.current || padRef.current.isEmpty()) return;

    setGuardando(true);
    try {
      const png = await padRef.current.toPng();
      await identidadService.guardarFirma(png);
      Alert.alert('Firma guardada', 'Tu firma quedó registrada.', [
        { text: 'Listo', onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert('No se pudo guardar', e instanceof ApiError ? e.message : 'Intentá de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  const deshabilitado = offline || firmaVacia || guardando;

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safe}>
      <OfflineBanner mensaje="Necesitás conexión para guardar tu firma." />
      <HeaderBack
        titulo="Mi firma"
        acciones={<BotonAyuda seccion="identidad" color={colors.primary} />}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Firma actual: se reemplaza al guardar una nueva */}
        {cargando ? (
          <ActivityIndicator color={colors.primary} />
        ) : firmaActual ? (
          <View style={styles.actual}>
            <Text style={styles.label}>Firma registrada</Text>
            <View style={styles.papel}>
              <Image source={{ uri: firmaActual }} style={styles.imagen} resizeMode="contain" />
            </View>
            <Text style={styles.ayuda}>Si dibujás una nueva, reemplaza a esta.</Text>
          </View>
        ) : null}

        <SignaturePad
          ref={padRef}
          label={firmaActual ? 'Nueva firma' : 'Tu firma'}
          onChange={setFirmaVacia}
        />

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: deshabilitado }}
          disabled={deshabilitado}
          onPress={() => void guardar()}
          style={[styles.boton, deshabilitado && styles.botonDeshabilitado]}
        >
          {guardando ? (
            <ActivityIndicator color={colors.onPrimary} />
          ) : (
            <Save size={19} color={colors.onPrimary} />
          )}
          <Text style={styles.botonTxt}>{guardando ? 'Guardando…' : 'Guardar firma'}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const crearEstilos = (colors: Colores, typography: Tipografia) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.surface },
    content: { padding: spacing.md, gap: spacing.lg },
    actual: { gap: spacing.sm },
    label: { ...typography.label, color: colors.text },
    papel: {
      aspectRatio: 3, // misma proporción que el pad (300×100)
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: '#FFFFFF',
      overflow: 'hidden',
    },
    imagen: { width: '100%', height: '100%' },
    ayuda: { ...typography.small, color: colors.textMuted },
    boton: {
      minHeight: 54,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      borderRadius: radius.md,
      backgroundColor: colors.primary,
    },
    botonDeshabilitado: { opacity: 0.5 },
    botonTxt: { ...typography.button, color: colors.onPrimary },
  });
