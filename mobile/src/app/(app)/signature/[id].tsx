import { useEffect, useState, useRef, useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, Modal, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Share, Fingerprint, Signature } from 'lucide-react-native';
import * as Sharing from 'expo-sharing';
import type { File } from 'expo-file-system';
import { PdfJsViewer } from '@/features/firma/pdfViewer/PdfJsViewer';
import { firmaService, type RegistrarFirmaRespuesta } from '@/features/firma/services/firmaService';
import { useTema, type Colores } from '@/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { authenticate, getAvailableBiometrics } from '@/services/biometrics';
import { useAuth } from '@/features/auth/context/AuthContext';
import { FirmaExitosa } from '@/features/convenios/components/FirmaExitosa';
import { HeaderBack, OfflineBanner } from '@/components/molecules';
import { SignaturePad, type SignaturePadHandle } from '@/components/organisms';
import { BotonAyuda } from '@/features/ayuda/components/BotonAyuda';
import { ApiError } from '@/services/api';
import { pendientesCache } from '@/features/firma/services/pendientesCache';
import { useOffline } from '@/services/useOffline';

export default function SignatureScreen() {
  const { colors, fs } = useTema();
  const styles = useMemo(() => crearEstilos(colors, fs), [colors, fs]);
  const { id, titulo, codigo } = useLocalSearchParams<{
    id: string;
    titulo: string;
    codigo: string;
    }>();
  const router = useRouter();
  const { tipoPerfil } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [shareError, setShareError] = useState<string>();
  const [attempt, setAttempt] = useState(0);
  const [acepta, setAcepta] = useState(false);
  const [firmaModalVisible, setFirmaModalVisible] = useState(false);
  const padRef = useRef<SignaturePadHandle>(null);
  const [firmaVacia, setFirmaVacia] = useState(true); // para habilitar el botón de confirmar

  const [registrando, setRegistrando] = useState(false);
  const [firmaError, setFirmaError] = useState<string>();
  const [resultadoFirma, setResultadoFirma] = useState<RegistrarFirmaRespuesta | null>(null);
  const [firmaRegistradaPng, setFirmaRegistradaPng] = useState<string | null>(null);
  const offline = useOffline();
  const [desdeCache, setDesdeCache] = useState(false); // mostrando el PDF guardado

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

    if (tipoPerfil === 'consulta') {
      setError('Tu perfil no tiene permiso para firmar convenios.');
      setLoading(false);
      return;
    }

        setDesdeCache(false);

    firmaService.descargarPdfPendiente(idInstrumento)
      .then((downloadedFile) => {
        if (active) setFile(downloadedFile);
      })
      .catch((cause: unknown) => {
        if (!active) return;

        // Sin conexión: se muestra la copia guardada desde la pestaña Firmar.
        const guardado =
          cause instanceof ApiError && cause.status === 0
            ? pendientesCache.leerPdf(idInstrumento)
            : null;

        if (guardado) {
          setFile(guardado);
          setDesdeCache(true);
          return;
        }

        setError(
          cause instanceof ApiError && cause.status === 0
            ? 'Sin conexión. Este PDF todavía no se guardó para verlo offline: abrí la pestaña Firmar con conexión.'
            : cause instanceof Error ? cause.message : 'No se pudo cargar el PDF.',
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, attempt, tipoPerfil]);

  

    const confirmarFirma = async () => {
    setFirmaError(undefined);

      if (tipoPerfil === 'consulta') {
        setFirmaError('Tu perfil no tiene permiso para firmar convenios.');
        return;
      }

      if (!acepta || (padRef.current?.isEmpty() ?? true)) {
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

        const firma = await padRef.current!.toPng();

        const resultado = await firmaService.registrarFirma(Number(id), {
            firma,
            acepta: true,
            latitud: ubicación.coords.latitude,
            longitud: ubicación.coords.longitude,
        });

        setFirmaModalVisible(false);
        setFirmaRegistradaPng(firma);
        setResultadoFirma(resultado);

    } catch (cause) {
        setFirmaError(
        cause instanceof Error ? cause.message : 'No se pudo registrar la firma.',
        );
    } finally {
        setRegistrando(false);
    }
    };

  const compartir = async () => {
    if (!resultadoFirma && !file) return;

    setShareError(undefined);

    try {
      if (!(await Sharing.isAvailableAsync())) {
        setShareError('Compartir no está disponible en este dispositivo.');
        return;
      }

      const archivo = resultadoFirma
        ? await firmaService.descargarPdfFirmado(Number(id))
        : file;

      if (!archivo) return;

      await Sharing.shareAsync(archivo.uri, {
        mimeType: 'application/pdf',
        dialogTitle: resultadoFirma
          ? 'Compartir PDF firmado'
          : 'Compartir convenio',
      });
    } catch (cause) {
      setShareError(
        cause instanceof Error ? cause.message : 'No se pudo compartir el PDF.',
      );
    }
  };

  if (resultadoFirma) {
    return (
      <FirmaExitosa
        codigo={codigo}
        resultado={resultadoFirma}
        firmaPng={firmaRegistradaPng}
        shareError={shareError}
        onVolver={() => router.replace('/home')}
        onCompartir={() => void compartir()}
      />
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <OfflineBanner />
      <HeaderBack
        titulo={titulo}
        subtitulo={codigo}
        acciones={
          <>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Compartir PDF"
              disabled={!file}
              onPress={() => void compartir()}
              style={styles.iconButton}
            >
              <Share color={file ? colors.primary : colors.textMuted} size={22} />
            </Pressable>
            <BotonAyuda seccion="firma" color={colors.primary} />
          </>
        }

      />


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
            {(offline || desdeCache) && (
                <Text style={styles.offlineAviso}>
                Sin conexión: podés leer el convenio, pero para firmarlo necesitás conexión.
                </Text>
            )}
            <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: offline || desdeCache }}
                disabled={offline || desdeCache}
                onPress={() => setFirmaModalVisible(true)}
                style={[styles.confirmButton, (offline || desdeCache) && styles.confirmDisabled]}
            >
                <Signature size={19} color={colors.onPrimary} />
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
                  <SignaturePad ref={padRef} onChange={setFirmaVacia} />

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
                      disabled={!acepta || firmaVacia || registrando}
                      onPress={() => void confirmarFirma()}
                      style={[
                          styles.confirmButton,
                          (!acepta || firmaVacia || registrando) &&
                          styles.confirmButtonDisabled,
                      ]}
                      >
                      {registrando ? (
                          <ActivityIndicator color={colors.onPrimary} />
                      ) : (
                          <Fingerprint size={19} color={colors.onPrimary} />
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

const crearEstilos = (colors: Colores, fs: (tamano: number) => number) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.surface },
    iconButton: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    message: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
    messageText: { color: colors.textMuted },
    error: { color: colors.error, textAlign: 'center' },
    retry: { color: colors.primary, fontWeight: '700', padding: 8 },
    shareError: { color: colors.error, padding: 8, textAlign: 'center' },
    content: {
      padding: 16,
      paddingBottom: 24,
    },
    pdfFrame: {
      flex: 1,
      overflow: 'hidden',
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
      color: colors.onPrimary,
      fontSize: fs(15),
      fontWeight: '700',
      lineHeight: fs(18),
    },
    acceptText: {
      flex: 1,
      color: colors.text,
      fontSize: fs(14),
      lineHeight: fs(20),
    },
    locationRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
    },
    locationText: {
      flex: 1,
      color: colors.textMuted,
      fontSize: fs(11),
      lineHeight: fs(19),
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
      color: colors.onPrimary,
      fontSize: fs(15),
      fontWeight: '700',
    },
    modalOverlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: colors.overlay,
    },
    signatureCard: {
      maxHeight: '90%',
      padding: 16,
      backgroundColor: colors.elevated,
      borderWidth: 1,
      borderColor: colors.border,
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
    offlineAviso: {
      color: colors.textMuted,
      fontSize: fs(13),
      textAlign: 'center',
      marginBottom: 8,
    },
    confirmDisabled: {
      opacity: 0.5,
    },

  });