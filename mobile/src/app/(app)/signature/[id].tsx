import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Share2 } from 'lucide-react-native';
import * as Sharing from 'expo-sharing';
import type { File } from 'expo-file-system';
import { PdfJsViewer } from '@/features/firma/pdfViewer/PdfJsViewer';
import { firmaService } from '@/features/firma/services/firmaService';
import { colors } from '@/theme';

export default function SignatureScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [shareError, setShareError] = useState<string>();
  const [attempt, setAttempt] = useState(0);

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
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver"
          onPress={() => router.back()}
          style={styles.iconButton}
        >
          <ChevronLeft color={colors.text} size={24} />
        </Pressable>

        <Text style={styles.title}>Leer convenio</Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Compartir PDF"
          disabled={!file}
          onPress={() => void compartir()}
          style={styles.iconButton}
        >
          <Share2 color={file ? colors.primary : colors.textMuted} size={22} />
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
        <PdfJsViewer file={file} />
      ) : null}
    </View>
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
  title: { color: colors.text, fontSize: 17, fontWeight: '700' },
  message: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  messageText: { color: colors.textMuted },
  error: { color: colors.error, textAlign: 'center' },
  retry: { color: colors.primary, fontWeight: '700', padding: 8 },
  shareError: { color: colors.error, padding: 8, textAlign: 'center' },
});