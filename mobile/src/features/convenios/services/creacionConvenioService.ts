import { ApiError, api } from '@/services/api';
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

type EdicionResponse = {
  puede_editar: boolean;
  convenio: {
    titulo: string;
    id_tipo_instrumento: number;
    id_unidad: number;
    version: number;
    fecha_inicio: string | null;
    vencimiento: string | null;
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

  async obtenerParaEdicion(
    id: number | string,
  ): Promise<{ convenio: NuevoConvenio; version: number }> {
    const response = await api.get<EdicionResponse>(`/agreements/${id}`);
    if (!response.puede_editar) {
      throw new ApiError('No tenés permiso para editar este borrador.', 403);
    }

    return {
      version: response.convenio.version,
      convenio: {
        titulo: response.convenio.titulo,
        id_tipo_instrumento: response.convenio.id_tipo_instrumento,
        id_institucion: response.convenio.id_unidad,
        fecha_inicio: response.convenio.fecha_inicio,
        fecha_fin: response.convenio.vencimiento,
        fecha_preaviso: response.convenio.fecha_preaviso,
        numero_resolucion: response.convenio.numero_resolucion,
        referencia_expediente: response.convenio.referencia_expediente,
        notas: response.convenio.notas,
        objeto: response.convenio.objeto,
        marco_legal: response.convenio.marco_legal,
        obligaciones: response.convenio.obligaciones,
        condiciones_terminacion: response.convenio.condiciones_terminacion,
        condiciones_renovacion: response.convenio.condiciones_renovacion,
        confidencialidad: response.convenio.confidencialidad,
        alcance_actividades: response.convenio.alcance_actividades,
      },
    };
  },

  async actualizar(
    id: number | string,
    convenio: NuevoConvenio,
    version: number,
  ): Promise<void> {
    await api.patch(`/agreements/${id}`, { ...convenio, version });
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
