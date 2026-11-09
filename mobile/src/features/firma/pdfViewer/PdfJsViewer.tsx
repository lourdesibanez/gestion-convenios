import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import type { File } from 'expo-file-system';
import {
  pdfjsViewerBundle,
  pdfjsWorkerBundle,
} from './generatedPdfJs';

type Props = {
  file: File;
};

export function PdfJsViewer({ file }: Props) {
  const [html, setHtml] = useState<string>();
  const [error, setError] = useState<string>();

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
                body { margin: 0; background: #e8ebef; font-family: sans-serif; }
                #pages { padding: 12px; }
                canvas { display: block; max-width: 100%; height: auto; margin: 0 auto 12px; background: white; }
                #error { padding: 20px; color: #a11; }
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
  }, [file]);

  if (error) {
    return <Text style={styles.error}>{error}</Text>;
  }

  if (!html) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator />
        <Text>Preparando PDF…</Text>
      </View>
    );
  }

  return (
    <WebView
      originWhitelist={['*']}
      source={{ html }}
      javaScriptEnabled
      style={styles.webview}
    />
  );
}

const styles = StyleSheet.create({
  webview: { flex: 1 },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  error: { padding: 20, color: '#a11' },
});