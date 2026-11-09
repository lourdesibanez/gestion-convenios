import { api } from '@/services/api';
import { File, Paths } from 'expo-file-system';
import { ApiError } from '@/services/api';
import { tokenStorage } from '@/services/tokenStorage';

export type FirmaPendiente = {
  id_instrumento: number;
  uuid: string;
  codigo: string;
  titulo: string;
  tipo: string;
  asignado_en: string;
};

export type PaginaFirmasPendientes = {
  data: FirmaPendiente[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
};

export type RegistrarFirmaRespuesta = {
  mensaje: string;
  firmado_en: string;
  latitud: number;
  longitud: number;
  hash_documento: string;
  documento: string;
  convenio_completo: boolean;
};

export const firmaService = {
  listarPendientes: (pagina = 1) =>
    api.get<PaginaFirmasPendientes>(`/signatures/pending?page=${pagina}`),

  descargarPdfPendiente: async (id_instrumento: number): Promise<File> => {
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
        `${baseUrl.replace(/\/+$/, '')}/signatures/pending/${id_instrumento}/document`,
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
              ? 'No se encontró el PDF aprobado para este convenio.'
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

    const archivo = new File(
      Paths.cache,
      `convenio-${id_instrumento}-${Date.now()}.pdf`,
    );

    await archivo.write(contenido);

    return archivo;
  },
  
  registrarFirma: (
    idInstrumento: number,
    datos: {
      firma: string;
      acepta: true;
      latitud: number;
      longitud: number;
    },
  ) =>
    api.post<RegistrarFirmaRespuesta>(
      `/signatures/pending/${idInstrumento}/sign`,
      datos,
    ),
};