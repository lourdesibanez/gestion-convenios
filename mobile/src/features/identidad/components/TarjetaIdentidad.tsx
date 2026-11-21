import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import {
  Fingerprint,
  PenLine,
  ScanFace
} from 'lucide-react-native';
import { ApiError } from '@/services/api';
import { authenticate, getAvailableBiometrics } from '@/services/biometrics';
import { useOffline } from '@/services/useOffline';
import { radius, spacing, useTema, type Colores, type Tipografia } from '@/theme';
import { BotonAyuda } from '@/features/ayuda/components/BotonAyuda';
import { identidadService, type Identidad, type TipoBiometria } from '../services/identidadService';
import { ListItem } from '@/components/molecules';

// Texto y color del estado de cada fila (verde registrado, naranja pendiente, gris no disponible).
function estadoFila(colors: Colores, registrado: boolean, textoRegistrado: string, noDisponible?: string) {
  if (noDisponible) return { texto: noDisponible, color: colors.textMuted };
  return registrado
    ? { texto: textoRegistrado, color: colors.status.firmado }
    : { texto: 'Pendiente de registrar', color: colors.status.revision };
}


// Tarjeta "Registrar mi identidad" de Perfil: firma, rostro y huella.
export function TarjetaIdentidad() {
  const { colors, typography } = useTema();
  const styles = useMemo(() => crearEstilos(colors, typography), [colors, typography]);
  const offline = useOffline();
  const [identidad, setIdentidad] = useState<Identidad | null>(null);
  const [soporte, setSoporte] = useState({ facial: false, huella: false });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string>();
  const [intento, setIntento] = useState(0);
  const [registrando, setRegistrando] = useState<TipoBiometria | null>(null);

  // Se recarga cada vez que se vuelve a Perfil (por ejemplo, después de guardar la firma).
  useFocusEffect(
    useCallback(() => {
      if (offline) {
        setCargando(false);
        return;
      }

      let activo = true;
      setCargando(true);
      setError(undefined);

      // Misma detección de biometría que usa el login.
      Promise.all([identidadService.obtener(), getAvailableBiometrics()])
        .then(([datos, biometrias]) => {
          if (!activo) return;
          setIdentidad(datos);
          setSoporte({
            facial: biometrias.includes('facial'),
            huella: biometrias.includes('fingerprint'),
          });
        })
        .catch((e: unknown) => {
          if (activo) setError(e instanceof ApiError ? e.message : 'No se pudo cargar tu identidad.');
        })
        .finally(() => {
          if (activo) setCargando(false);
        });

      return () => {
        activo = false;
      };
    }, [offline, intento]),
  );

  const registrar = async (tipo: TipoBiometria) => {
    // El celular valida el rostro o la huella; a la API solo llega que se registró y cuándo.
    const ok = await authenticate(tipo === 'facial' ? 'Registrá tu rostro' : 'Registrá tu huella');
    if (!ok) return;

    setRegistrando(tipo);
    try {
      setIdentidad(await identidadService.registrarBiometria(tipo));
    } catch (e) {
      Alert.alert('No se pudo registrar', e instanceof ApiError ? e.message : 'Intentá de nuevo.');
    } finally {
      setRegistrando(null);
    }
  };

    const firma = estadoFila(colors, Boolean(identidad?.firma_registrada_en), 'Guardada');
    const facial = estadoFila(
        colors,
        Boolean(identidad?.facial_registrado_en),
        'Registrado',
        soporte.facial ? undefined : 'Tu celular no tiene reconocimiento facial',
    );
    const huella = estadoFila(
        colors,
        Boolean(identidad?.huella_registrada_en),
        'Registrada',
        soporte.huella ? undefined : 'Configurá una huella en los ajustes del celular',
    );

  return (
    <View style={styles.tarjeta}>
      <View style={styles.encabezado}>
        <Text style={styles.tituloSeccion}>Registrar mi identidad</Text>
        <BotonAyuda seccion="identidad" color={colors.primary} />
      </View>

      {/* Consigna Modo Off: el registro de identidad indica que no hay conexión */}
      {offline ? (
        <Text style={styles.aviso}>Necesitás conexión para registrar tu identidad.</Text>
      ) : cargando ? (
        <ActivityIndicator color={colors.primary} />
      ) : error ? (
        <View style={styles.errorBox}>
          <Text style={styles.error}>{error}</Text>
          <Pressable accessibilityRole="button" onPress={() => setIntento((n) => n + 1)}>
            <Text style={styles.reintentar}>Reintentar</Text>
          </Pressable>
        </View>
      ) : (
        <>
        <ListItem
            icon={PenLine}
            title="Mi firma"
            subtitle={firma.texto}
            subtitleColor={firma.color}
            iconColor={firma.color}
            onPress={() => router.push('/identidad/firma')}
        />
        <ListItem
            icon={ScanFace}
            title="Reconocimiento facial"
            subtitle={facial.texto}
            subtitleColor={facial.color}
            iconColor={facial.color}
            disabled={!soporte.facial}
            loading={registrando === 'facial'}
            onPress={() => void registrar('facial')}
        />
        <ListItem
            icon={Fingerprint}
            title="Huella digital"
            subtitle={huella.texto}
            subtitleColor={huella.color}
            iconColor={huella.color}
            disabled={!soporte.huella}
            loading={registrando === 'huella'}
            onPress={() => void registrar('huella')}
        />

        </>
      )}
    </View>
  );
}


const crearEstilos = (colors: Colores, typography: Tipografia) =>
  StyleSheet.create({
    tarjeta: {
      gap: spacing.md,
      padding: spacing.md,
      borderRadius: radius.md,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    encabezado: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    tituloSeccion: { ...typography.label, fontSize: typography.body.fontSize, color: colors.primary },
    aviso: { ...typography.body, color: colors.textMuted },
    errorBox: { gap: spacing.xs },
    error: { ...typography.small, color: colors.error },
    reintentar: { ...typography.label, color: colors.primary },
  });
