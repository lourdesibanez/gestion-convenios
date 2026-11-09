import { useEffect, useState, useRef } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, Modal, PanResponder, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Share, Fingerprint, Delete, Signature } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import * as Sharing from 'expo-sharing';
import type { File } from 'expo-file-system';
import { PdfJsViewer } from '@/features/firma/pdfViewer/PdfJsViewer';
import { firmaService } from '@/features/firma/services/firmaService';
import { colors } from '@/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { authenticate, getAvailableBiometrics } from '@/services/biometrics';


export default function SignatureScreen() {
  const { id, titulo, codigo } = useLocalSearchParams<{
    id: string;
    titulo: string;
    codigo: string;
    }>();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [shareError, setShareError] = useState<string>();
  const [attempt, setAttempt] = useState(0);
  const [acepta, setAcepta] = useState(false);
  const [firmaModalVisible, setFirmaModalVisible] = useState(false);
  const [firmaPath, setFirmaPath] = useState('');
  const firmaSvgRef = useRef<Svg | null>(null);
const firmaPathRef = useRef('');
const canvasSize = useRef({ width: 300, height: 100 });
const [registrando, setRegistrando] = useState(false);
const [firmaError, setFirmaError] = useState<string>();

    const dibujoResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: (event) => {
            const { locationX, locationY } = event.nativeEvent;
            const x = (locationX / canvasSize.current.width) * 300;
            const y = (locationY / canvasSize.current.height) * 100;

            firmaPathRef.current += ` M ${x} ${y}`;
            setFirmaPath(firmaPathRef.current);
            },
            onPanResponderMove: (event) => {
            const { locationX, locationY } = event.nativeEvent;
            const x = (locationX / canvasSize.current.width) * 300;
            const y = (locationY / canvasSize.current.height) * 100;

            firmaPathRef.current += ` L ${x} ${y}`;
            setFirmaPath(firmaPathRef.current);
            },
        }),
    ).current;

  useEffect(() => {
    let active = true;
    const idInstrumento = Number(id);

    if (!Number.isSafeInteger(idInstrumento) || idInstrumento <= 0) {
      setError('El identificador del convenio no es válido.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(undefined);
    setFile(null);

    firmaService.descargarPdfPendiente(idInstrumento)
      .then((downloadedFile) => {
        if (active) setFile(downloadedFile);
      })
      .catch((cause: unknown) => {
        if (active) {
          setError(cause instanceof Error ? cause.message : 'No se pudo cargar el PDF.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, attempt]);

  const exportarFirmaPng = (): Promise<string> =>
    new Promise((resolve, reject) => {
        const svg = firmaSvgRef.current;

        if (!svg) {
        reject(new Error('No se pudo acceder al área de firma.'));
        return;
        }

        svg.toDataURL(
        (base64) => {
            if (!base64) {
            reject(new Error('No se pudo convertir la firma.'));
            return;
            }

            resolve(`data:image/png;base64,${base64}`);
        },
        { width: 900, height: 300 },
        );
    });

    const confirmarFirma = async () => {
    setFirmaError(undefined);

    if (!acepta || !firmaPathRef.current.trim()) {
        setFirmaError('Dibujá tu firma y aceptá el documento para continuar.');
        return;
    }

    setRegistrando(true);

    try {
        const biometrías = await getAvailableBiometrics();

        if (!biometrías.includes('fingerprint')) {
        Alert.alert(
            'Huella no configurada',
            'Para firmar, configurá una huella en los ajustes de seguridad o biometría del dispositivo.',
            [{ text: 'Entendido' }],
        );
        return;
        }

        const permiso = await Location.requestForegroundPermissionsAsync();

        if (permiso.status !== 'granted') {
        throw new Error('Necesitamos permiso de ubicación para registrar la firma.');
        }

        const ubicación = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        });

        const autenticado = await authenticate('Confirmá la firma del convenio');

        if (!autenticado) return;

        const firma = await exportarFirmaPng();

        const resultado = await firmaService.registrarFirma(Number(id), {
            firma,
            acepta: true,
            latitud: ubicación.coords.latitude,
            longitud: ubicación.coords.longitude,
        });

        let direccionTexto = '';
        try {
            const [direccion] = await Location.reverseGeocodeAsync({
                latitude: resultado.latitud,
                longitude: resultado.longitud,
            });

            if (direccion) {
                direccionTexto = [
                    direccion.streetNumber,
                    direccion.street,
                    direccion.district,
                    direccion.city,
                    direccion.region,
                    direccion.country,
                ]
                    .filter(Boolean)
                    .join(', ');
            }
        } catch {
            // Si no se puede resolver la dirección, se muestran las coordenadas.
        }

        setFirmaModalVisible(false);

        Alert.alert(
        'Firma registrada',
        `Fecha: ${new Date(resultado.firmado_en).toLocaleString('es-AR')}\n` +
            `Ubicación: ${direccionTexto || `${resultado.latitud}, ${resultado.longitud}`}`,
        );
    } catch (cause) {
        setFirmaError(
        cause instanceof Error ? cause.message : 'No se pudo registrar la firma.',
        );
    } finally {
        setRegistrando(false);
    }
    };

  const compartir = async () => {
    if (!file) return;

    setShareError(undefined);

    try {
      if (!(await Sharing.isAvailableAsync())) {
        setShareError('Compartir no está disponible en este dispositivo.');
        return;
      }

      await Sharing.shareAsync(file.uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Compartir convenio',
      });
    } catch {
      setShareError('No se pudo compartir el PDF.');
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver"
          onPress={() => router.back()}
          style={styles.iconButton}
        >
          <ChevronLeft color={colors.text} size={24} />
        </Pressable>

        <View style={styles.headerText}>
            <Text numberOfLines={1} style={styles.title}>{titulo}</Text>
            <Text style={styles.code}>{codigo}</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Compartir PDF"
          disabled={!file}
          onPress={() => void compartir()}
          style={styles.iconButton}
        >
          <Share color={file ? colors.primary : colors.textMuted} size={22} />
        </Pressable>
      </View>

      {shareError ? <Text style={styles.shareError}>{shareError}</Text> : null}

    
    {loading ? (
        <View style={styles.message}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.messageText}>Descargando convenio…</Text>
        </View>
        ) : error ? (
        <View style={styles.message}>
            <Text style={styles.error}>{error}</Text>
            <Pressable onPress={() => setAttempt((value) => value + 1)}>
            <Text style={styles.retry}>Reintentar</Text>
            </Pressable>
        </View>
        ) : file ? (
        <>
            <View style={styles.pdfFrame}>
            <PdfJsViewer file={file} />
            </View>

            <View style={styles.footer}>
            <Pressable
                accessibilityRole="button"
                onPress={() => setFirmaModalVisible(true)}
                style={styles.confirmButton}
            >
                <Signature size={19} color="#FFFFFF" />
                <Text style={styles.confirmText}>Firmar convenio</Text>
            </Pressable>
            </View>

            <Modal
            visible={firmaModalVisible}
            transparent
            animationType="slide"
            onRequestClose={() => setFirmaModalVisible(false)}
            >
            <View style={styles.modalOverlay}>
                <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cerrar firma"
                onPress={() => setFirmaModalVisible(false)}
                style={StyleSheet.absoluteFill}
                />

                <View style={styles.signatureCard}>
                <View style={styles.signatureHeader}>
                    <Text style={styles.signatureTitle}>Tu firma</Text>
                    <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Borrar firma"
                    style={styles.clearButton}
                    onPress={() => {
                        firmaPathRef.current = '';
                        setFirmaPath('');
                    }} 
                    >
                    <Delete size={20} color="#DC2626"/>
                    </Pressable>
                </View>

                <View
                    {...dibujoResponder.panHandlers}
                    onLayout={(event) => {
                        canvasSize.current = {
                        width: event.nativeEvent.layout.width,
                        height: event.nativeEvent.layout.height,
                        };
                    }}
                    style={styles.signatureBox}
                    >
                    <View style={styles.signatureCanvas}>
                        <Svg
                        ref={firmaSvgRef}
                        width="100%"
                        height="100%"
                        viewBox="0 0 300 100"
                        preserveAspectRatio="none"
                        >
                        <Path
                            d={firmaPath}
                            fill="none"
                            stroke="#315B96"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        </Svg>
                    </View>

                    <Text style={styles.signatureHint}>
                        Firmá con el dedo dentro del recuadro
                    </Text>
                </View>

                <Pressable
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: acepta }}
                    style={styles.acceptRow}
                    onPress={() => setAcepta((actual) => !actual)}
                >
                    <View style={[styles.checkbox, acepta && styles.checkboxChecked]}>
                    {acepta ? <Text style={styles.checkmark}>✓</Text> : null}
                    </View>
                    <Text style={styles.acceptText}>
                    Leí el documento completo y acepto firmarlo.
                    </Text>
                </Pressable>

                <View style={styles.locationRow}>
                    <Text style={styles.locationText}>
                    Se registrará fecha, hora y ubicación del acto de firma.
                    </Text>
                </View>

                <Pressable
                    disabled={!acepta || !firmaPath.trim() || registrando}
                    onPress={() => void confirmarFirma()}
                    style={[
                        styles.confirmButton,
                        (!acepta || !firmaPath.trim() || registrando) &&
                        styles.confirmButtonDisabled,
                    ]}
                    >
                    {registrando ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Fingerprint size={19} color="#FFFFFF" />
                    )}
                    <Text style={styles.confirmText}>
                        {registrando ? 'Registrando firma…' : 'Confirmar firma con huella'}
                    </Text>
                </Pressable>
                {firmaError ? <Text style={styles.error}>{firmaError}</Text> : null}
                </View>
            </View>
            </Modal>
        </>
        ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { color: colors.text, fontSize: 14, fontWeight: '700' },
  message: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  messageText: { color: colors.textMuted },
  error: { color: colors.error, textAlign: 'center' },
  retry: { color: colors.primary, fontWeight: '700', padding: 8 },
  shareError: { color: colors.error, padding: 8, textAlign: 'center' },
  headerText: {
    flex: 1,
    marginLeft: 4,
    },
    code: {
    color: colors.textMuted,
    fontSize: 12,
    },
    content: {
  padding: 16,
  paddingBottom: 24,
},
pdfFrame: {
  flex: 1,
  overflow: 'hidden',
},
signatureHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
},
signatureTitle: {
  color: colors.primary,
  fontSize: 16,
  fontWeight: '700',
},
clearButton: {
  padding: 6,
},
signatureBox: {
  minHeight: 134,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: colors.surface,
  borderWidth: 1.5,
  borderColor: '#B9CBE5',
  borderStyle: 'dashed',
  borderRadius: 12,
  padding: 10,
},
signatureHint: {
  alignSelf: 'flex-start',
  color: colors.textMuted,
  fontSize: 12,
},
acceptRow: {
  flexDirection: 'row',
  alignItems: 'flex-start',
  gap: 10,
},
checkbox: {
  width: 21,
  height: 21,
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 2,
  borderColor: colors.primary,
  borderRadius: 4,
},
checkboxChecked: {
  backgroundColor: colors.primary,
},
checkmark: {
  color: '#FFFFFF',
  fontSize: 15,
  fontWeight: '700',
  lineHeight: 18,
},
acceptText: {
  flex: 1,
  color: colors.text,
  fontSize: 14,
  lineHeight: 20,
},
locationRow: {
  flexDirection: 'row',
  alignItems: 'flex-start',
  gap: 8,
},
locationText: {
  flex: 1,
  color: colors.textMuted,
  fontSize: 11,
  lineHeight: 19,
},
confirmButton: {
  minHeight: 54,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 10,
  backgroundColor: colors.primary,
  borderRadius: 12,
},
confirmButtonDisabled: {
  opacity: 0.5,
},
confirmText: {
  color: '#FFFFFF',
  fontSize: 15,
  fontWeight: '700',
},
modalOverlay: {
  flex: 1,
  justifyContent: 'flex-end',
  backgroundColor: 'rgba(0, 0, 0, 0.45)',
},
signatureCard: {
  maxHeight: '90%',
  padding: 16,
  backgroundColor: colors.background,
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  gap: 14,
},
footer: {
  padding: 12,
  backgroundColor: colors.background,
  borderTopWidth: 1,
  borderTopColor: colors.border,
},
signatureCanvas: {
  width: '100%',
  height: 100,
},
});