import * as pdfjsLib from 'pdfjs-dist';

declare global {
  interface Window {
    pdfjsLib: typeof pdfjsLib;
  }
}

window.pdfjsLib = pdfjsLib;