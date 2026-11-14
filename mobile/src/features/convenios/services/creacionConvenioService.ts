import { api } from '@/services/api';
import { File } from 'expo-file-system';

export type OpcionConvenio = {
  id: number;
  nombre: string;
};

export type OpcionesCreacionConvenio = {
  puede_crear: boolean;
  tipos: OpcionConvenio[];
  instituciones: OpcionConvenio[];
};

export type NuevoConvenio = {
  titulo: string;
  id_tipo_instrumento: number;
  id_institucion: number;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  fecha_preaviso: string | null;
  numero_resolucion: string | null;
  referencia_expediente: string | null;
  notas: string | null;
  objeto: string | null;
  marco_legal: string | null;
  obligaciones: string | null;
  condiciones_terminacion: string | null;
  condiciones_renovacion: string | null;
  confidencialidad: string | null;
  alcance_actividades: string | null;
};

export type TipoDocumentoConvenio =
  | 'resolucion'
  | 'borrador'
  | 'anexo'
  | 'convenio_aprobado';

export const TAMANO_MAXIMO_DOCUMENTO = 20 * 1024 * 1024;

type OpcionesResponse = {
  data: OpcionesCreacionConvenio;
};

type CreacionResponse = {
  data: {
    id: number;
    uuid: string;
    codigo: string;
    titulo: string;
    estado: string;
  };
};

export const creacionConvenioService = {
  async opciones(): Promise<OpcionesCreacionConvenio> {
    const response = await api.get<OpcionesResponse>('/agreements/create-options');
    return response.data;
  },

  async crear(convenio: NuevoConvenio): Promise<CreacionResponse['data']> {
    const response = await api.post<CreacionResponse>('/agreements', convenio);
    return response.data;
  },

  async subirDocumento(
    idInstrumento: number,
    tipoDocumento: TipoDocumentoConvenio,
    archivo: File,
  ): Promise<void> {
    const formData = new FormData();
    formData.append('id_instrumento', String(idInstrumento));
    formData.append('tipo_documento', tipoDocumento);
    formData.append('archivo', archivo, archivo.name);
    await api.postForm('/documents', formData);
  },
};
