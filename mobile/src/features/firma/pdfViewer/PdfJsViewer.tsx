import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import type { File } from 'expo-file-system';
import { useTema, type Colores } from '@/theme';
import {
  pdfjsViewerBundle,
  pdfjsWorkerBundle,
} from './generatedPdfJs';

type Props = {
  file: File;
};

export function PdfJsViewer({ file }: Props) {
  const { colors } = useTema();
  const styles = useMemo(() => crearEstilos(colors), [colors]);
  const [html, setHtml] = useState<string>();
  const [error, setError] = useState<string>();

  // Alrededor de las hojas sigue el tema; las hojas quedan blancas como el papel.
  const fondo = colors.surface;
  const colorError = colors.error;

  useEffect(() => {
    let activo = true;

    async function prepararVisor() {
      try {
        const pdfBase64 = await file.base64();

        const contenido = `
          <!doctype html>
          <html>
            <head>
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <style>
                * { box-sizing: border-box; }
                body { margin: 0; background: ${fondo}; font-family: sans-serif; }
                #pages { padding: 12px; }
                canvas { display: block; max-width: 100%; height: auto; margin: 0 auto 12px; background: white; }
                #error { padding: 20px; color: ${colorError}; }
              </style>
              <script>${pdfjsViewerBundle}</script>
            </head>
            <body>
              <div id="error"></div>
              <main id="pages"></main>
              <script>
                (async () => {
                  try {
                    const worker = new Blob(
                      [${JSON.stringify(pdfjsWorkerBundle)}],
                      { type: 'text/javascript' }
                    );
                    window.pdfjsLib.GlobalWorkerOptions.workerSrc =
                      URL.createObjectURL(worker);

                    const binary = atob('${pdfBase64}');
                    const data = new Uint8Array(binary.length);
                    for (let i = 0; i < binary.length; i++) {
                      data[i] = binary.charCodeAt(i);
                    }

                    const pdf = await window.pdfjsLib.getDocument({ data }).promise;
                    const pages = document.getElementById('pages');

                    for (let number = 1; number <= pdf.numPages; number++) {
                      const page = await pdf.getPage(number);
                      const viewport = page.getViewport({ scale: 1.25 });
                      const canvas = document.createElement('canvas');
                      const context = canvas.getContext('2d');

                      if (!context) throw new Error('No se pudo preparar el visor.');

                      canvas.width = viewport.width;
                      canvas.height = viewport.height;
                      pages.appendChild(canvas);

                      await page.render({ canvasContext: context, viewport }).promise;
                    }
                  } catch (error) {
                    document.getElementById('error').textContent =
                      error instanceof Error ? error.message : 'No se pudo mostrar el PDF.';
                  }
                })();
              </script>
            </body>
          </html>
        `;

        if (activo) setHtml(contenido);
      } catch {
        if (activo) setError('No se pudo preparar el PDF para verlo.');
      }
    }

    prepararVisor();

    return () => {
      activo = false;
    };
  }, [file, fondo, colorError]);

  if (error) {
    return <Text style={styles.error}>{error}</Text>;
  }

  if (!html) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.textoCarga}>Preparando PDF…</Text>
      </View>
    );
  }

  return (
    <WebView
      originWhitelist={['*']}
      source={{ html }}
      javaScriptEnabled
      // Evita el destello blanco mientras carga.
      style={[styles.webview, { backgroundColor: fondo }]}
    />
  );
}

const crearEstilos = (colors: Colores) =>
  StyleSheet.create({
    webview: { flex: 1 },
    loading: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      backgroundColor: colors.surface,
    },
    textoCarga: { color: colors.textMuted },
    error: { padding: 20, color: colors.error },
  });