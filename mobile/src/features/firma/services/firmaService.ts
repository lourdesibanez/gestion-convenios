import { api } from '@/services/api';

export type FirmaPendiente = {
  id: number;
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

export const firmaService = {
  listarPendientes: (pagina = 1) =>
    api.get<PaginaFirmasPendientes>(`/signatures/pending?page=${pagina}`),
};