import { api } from '@/services/api';
import { ApiError } from '@/services/api';
import { File, Paths } from 'expo-file-system';
import { tokenStorage } from '@/services/tokenStorage';

export type OpcionCatalogo = {
  valor: string;
  etiqueta: string;
};

export type CatalogosBusqueda = {
  tipos: OpcionCatalogo[];
  categorias: OpcionCatalogo[];
};

export type UnidadBusqueda = {
  id: number;
  nombre: string;
};

export type ArchivoBusqueda = {
  id: number;
  nombre: string;
  tipo_documento: string;
  tipo_mime: string;
  tamanio_bytes: number;
  descarga_url: string;
};

export type NodoConvenio = {
  id: number;
  codigo: string;
  titulo: string;
  tipo: string;
  ambito: string | null;
  categoria: string;
  unidad: string;
  estado: string;
  numero_resolucion: string | null;
  fecha_firma: string | null;
  vence: string | null;
  hijos_count: number;
  documentos_count: number;
  archivos: ArchivoBusqueda[];
  hijos: {
    tipo_vinculo: string;
    convenio: NodoConvenio;
  }[];
};

export type Pagina<T> = {
  data: T[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

export type FiltrosBusqueda = {
  q?: string;
  anio?: string;
  tipo?: string;
  categoria?: string;
  unidad?: string;
  orden?: 'recientes' | 'antiguos' | 'titulo';
  page?: number;
};

export const busquedaService = {
  async descargarPdf(idArchivo: number): Promise<File> {
    const baseUrl = process.env.EXPO_PUBLIC_API_URL;

    if (!baseUrl) {
      throw new Error('Falta configurar EXPO_PUBLIC_API_URL.');
    }

    const token = await tokenStorage.get();
    if (!token) {
      throw new ApiError('La sesión expiró. Volvé a iniciar sesión.', 401);
    }

    let response: Response;
    try {
      response = await fetch(
        `${baseUrl.replace(/\/+$/, '')}/documents/${idArchivo}/download`,
        {
          headers: {
            Accept: 'application/pdf',
            Authorization: `Bearer ${token}`,
          },
        },
      );
    } catch {
      throw new ApiError('No se pudo conectar con el servidor. Revisá tu conexión.', 0);
    }

    if (!response.ok) {
      const body = await response.json().catch(() => null) as {
        message?: string;
        errors?: Record<string, string[]>;
      } | null;
      const message =
        response.status === 401
          ? 'La sesión expiró. Volvé a iniciar sesión.'
          : response.status === 403
            ? 'No tenés permiso para ver este documento.'
            : response.status === 404
              ? 'No se encontró el documento.'
              : response.status >= 500
                ? 'Ocurrió un error en el servidor. Intentá más tarde.'
                : body?.message ?? 'No se pudo descargar el PDF.';

      throw new ApiError(message, response.status, body?.errors ?? {});
    }

    const contentType = response.headers.get('content-type')?.split(';')[0].trim();
    if (contentType !== 'application/pdf') {
      throw new ApiError('El servidor no devolvió un PDF válido.', response.status);
    }

    const contenido = await response.arrayBuffer();
    const firmaPdf = new Uint8Array(contenido, 0, Math.min(5, contenido.byteLength));
    if (String.fromCharCode(...firmaPdf) !== '%PDF-') {
      throw new ApiError('El archivo recibido no parece ser un PDF válido.', response.status);
    }

    const archivo = new File(Paths.cache, `documento-${idArchivo}-${Date.now()}.pdf`);
    await archivo.write(contenido);
    return archivo;
  },

  async obtenerCatalogos(): Promise<CatalogosBusqueda> {
    const respuesta = await api.get<{ data: CatalogosBusqueda }>('/types');
    return respuesta.data;
  },

  async obtenerUnidades(): Promise<UnidadBusqueda[]> {
    const respuesta = await api.get<{ data: UnidadBusqueda[] }>(
      '/units?contexto=busqueda',
    );
    return respuesta.data;
  },

  buscar(filtros: FiltrosBusqueda): Promise<Pagina<NodoConvenio>> {
    const params = new URLSearchParams();

    if (filtros.q?.trim()) params.set('q', filtros.q.trim());
    if (filtros.anio) params.set('anio', filtros.anio);
    if (filtros.tipo) params.set('tipo', filtros.tipo);
    if (filtros.categoria) params.set('categoria', filtros.categoria);
    if (filtros.unidad) params.set('unidad', filtros.unidad);
    if (filtros.orden) params.set('orden', filtros.orden);
    if (filtros.page) params.set('page', String(filtros.page));

    const query = params.toString();
    return api.get<Pagina<NodoConvenio>>(
      `/agreements${query ? `?${query}` : ''}`,
    );
  },
};