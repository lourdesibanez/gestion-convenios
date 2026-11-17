import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check } from 'lucide-react-native';
import type { RegistrarFirmaRespuesta } from '@/features/firma/services/firmaService';
import { useTema, type Colores } from '@/theme';
import { useEffect, useState, useMemo } from 'react';
import * as Location from 'expo-location';


type Props = {
  codigo: string;
  resultado: RegistrarFirmaRespuesta;
  firmaPng: string | null;
  shareError?: string;
  onVolver: () => void;
  onCompartir: () => void;
};

const dosDigitos = (n: number) => String(n).padStart(2, '0');

export function FirmaExitosa({
  codigo,
  resultado,
  firmaPng,
  shareError,
  onVolver,
  onCompartir,
}: Props) {
  const { colors, fs } = useTema();
  const styles = useMemo(() => crearEstilos(colors, fs), [colors, fs]);
    const coordenadas = `${resultado.latitud.toFixed(4)}, ${resultado.longitud.toFixed(4)}`;
    const [ubicacion, setUbicacion] = useState(coordenadas);

    useEffect(() => {
    let activo = true;

    Location.reverseGeocodeAsync({
        latitude: resultado.latitud,
        longitude: resultado.longitud,
    })
        .then(([lugar]) => {
        if (!activo || !lugar) return;
        const texto = [lugar.city ?? lugar.subregion, lugar.region]
            .filter(Boolean)
            .join(', ');
        if (texto) setUbicacion(texto);
        })
        .catch(() => {
        // Si falla, quedan las coordenadas
        });

    return () => {
        activo = false;
    };
    }, [resultado.latitud, resultado.longitud]);

  const fecha = new Date(resultado.firmado_en);
  const fechaTexto = `${dosDigitos(fecha.getDate())}/${dosDigitos(fecha.getMonth() + 1)}/${fecha.getFullYear()}`;
  const horaTexto = `${dosDigitos(fecha.getHours())}:${dosDigitos(fecha.getMinutes())} (UTC-3)`;

  const filas = [
    { label: 'Fecha', valor: fechaTexto },
    { label: 'Hora', valor: horaTexto },
    { label: 'Ubicación', valor: ubicacion },
    { label: 'Verificación', valor: 'Huella + firma manuscrita' },
  ];

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
      <View style={styles.contenido}>
        <View style={styles.iconoAro}>
          <View style={styles.icono}>
            <Check color={colors.background} size={32} strokeWidth={3} />
          </View>
        </View>

        <Text style={styles.titulo}>Convenio firmado</Text>
        <Text style={styles.subtitulo}>
          Tu firma quedó registrada en {codigo}.{'\n'}Avisamos a la contraparte.
        </Text>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            {firmaPng ? (
              <Image source={{ uri: firmaPng }} style={styles.firma} resizeMode="contain" />
            ) : (
              <View />
            )}
            <View style={styles.badge}>
              <Text style={styles.badgeTexto}>Firmado</Text>
            </View>
          </View>

          {filas.map((fila, index) => (
            <View
              key={fila.label}
              style={[styles.fila, index === filas.length - 1 && styles.filaUltima]}
            >
              <Text style={styles.filaLabel}>{fila.label}</Text>
              <Text style={styles.filaValor}>{fila.valor}</Text>
            </View>
          ))}
        </View>
      </View>

      {shareError ? <Text style={styles.error}>{shareError}</Text> : null}

      <View style={styles.acciones}>
        <Pressable accessibilityRole="button" onPress={onVolver} style={styles.botonPrimario}>
          <Text style={styles.botonPrimarioTexto}>Volver al inicio</Text>
        </Pressable>

        <Pressable accessibilityRole="button" onPress={onCompartir} style={styles.botonSecundario}>
          <Text style={styles.botonSecundarioTexto}>Compartir PDF firmado</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const crearEstilos = (colors: Colores, fs: (tamano: number) => number) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 20,
    },
    contenido: {
      flex: 1,
      alignItems: 'center',
      paddingTop: 24,
    },
    iconoAro: {
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor: `${colors.status.firmado}26`, // verde suave (≈15% de opacidad)
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    icono: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.status.firmado,
      alignItems: 'center',
      justifyContent: 'center',
    },
    titulo: {
      color: colors.primary,
      fontSize: fs(24),
      fontWeight: '700',
      marginBottom: 8,
    },
    subtitulo: {
      color: colors.textMuted,
      fontSize: fs(14),
      lineHeight: fs(20),
      textAlign: 'center',
      marginBottom: 24,
    },
    card: {
      width: '100%',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      overflow: 'hidden',
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.surface,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    firma: {
      width: 120,
      height: 40,
    },
    badge: {
      backgroundColor: `${colors.status.firmado}26`, // verde suave (≈15% de opacidad)
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 3,
    },
    badgeTexto: {
      color: colors.status.firmado,
      fontSize: fs(12),
      fontWeight: '700',
    },
    fila: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#EEF0F3',
    },
    filaUltima: {
      borderBottomWidth: 0,
    },
    filaLabel: {
      color: colors.textMuted,
      fontSize: fs(13),
    },
    filaValor: {
      color: colors.text,
      fontSize: fs(13),
      fontWeight: '700',
    },
    error: {
      color: colors.error,
      textAlign: 'center',
      padding: 8,
    },
    acciones: {
      gap: 10,
    },
    botonPrimario: {
      minHeight: 54,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      borderRadius: 12,
    },
    botonPrimarioTexto: {
      color: colors.onPrimary,
      fontSize: fs(15),
      fontWeight: '700',
    },
    botonSecundario: {
      minHeight: 50,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
    },
    botonSecundarioTexto: {
      color: colors.primary,
      fontSize: fs(15),
      fontWeight: '700',
    },
  });
