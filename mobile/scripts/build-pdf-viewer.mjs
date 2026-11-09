import { build } from 'esbuild';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const mobileRoot = fileURLToPath(new URL('../', import.meta.url));

const [viewer, worker] = await Promise.all([
  build({
    entryPoints: [
      path.join(mobileRoot, 'src/features/firma/pdfViewer/pdfjs-entry.ts'),
    ],
    bundle: true,
    minify: true,
    platform: 'browser',
    format: 'iife',
    target: 'es2022',
    write: false,
  }),
  build({
    entryPoints: [
      path.join(mobileRoot, 'node_modules/pdfjs-dist/build/pdf.worker.mjs'),
    ],
    bundle: true,
    minify: true,
    platform: 'browser',
    format: 'esm',
    target: 'es2022',
    write: false,
  }),
]);

const generatedFile = path.join(
  mobileRoot,
  'src/features/firma/pdfViewer/generatedPdfJs.ts',
);

const output = [
  `export const pdfjsViewerBundle = ${JSON.stringify(viewer.outputFiles[0].text)};`,
  `export const pdfjsWorkerBundle = ${JSON.stringify(worker.outputFiles[0].text)};`,
  '',
].join('\n');

await writeFile(generatedFile, output, 'utf8');
console.log(`PDF.js generado en ${generatedFile}`);