export type EtapaCircuito = 'borrador' | 'revision' | 'aprobado' | 'firmado';

export interface Firmante {
  id: number;
  nombre: string;
  cargo: string;
  estado: 'pendiente' | 'firmado';
  esUsuarioActual: boolean;
}

export interface Documento {
  id: number;
  nombre: string;
  descripcion: string; // "Principal · 1,2 MB"
  selladoPor?: string; // "L. I."
  selladoEn?: string; // ISO
}

export interface Comentario {
  id: number;
  iniciales: string;
  autor: string;
  rol: string;
  fecha: string; // ISO
  texto: string;
  marcadoOfensivo: boolean;
}

export interface ConvenioDetalle {
  id: number;
  tipoInstrumento: string; // "Específico de pasantía"
  estado: string; // "Aprobado"
  titulo: string;
  expediente: string; // "CE-2026-0142"
  unidadAcademica: string;
  etapaActual: EtapaCircuito;
  resumenCircuito: string;
  procedencia: string;
  convenioPadre?: { id: number; codigo: string };
  inicio: string | null; // ISO
  vencimiento: string | null; // ISO
  preaviso: string | null; // ISO
  diasParaPreaviso: number;
  firmantes: Firmante[];
  documentos: Documento[];
  comentarios: Comentario[];
}