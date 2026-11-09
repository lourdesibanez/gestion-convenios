import { api } from '@/services/api';

export type HomeData = {
  usuario: {
    nombre: string;
    apellido: string;
    iniciales: string;
    unidad: string;
  };
  notificaciones_sin_leer: number;
  resumen: {
    firmados_ultimo_anio: number;
    vigentes: number;
    en_tramite: number;
    vencen_30_dias: number;
  };
  pendientes: {
    total: number;
    items: {
      uuid: string;
      codigo: string;
      titulo: string;
      tipo: string;
      asignado_en: string;
    }[];
  };
  ultimos_movimientos: {
    uuid: string;
    codigo: string;
    titulo: string;
    estado: string;
    fecha: string;
  }[];
};

export const homeService = {
  get: () => api.get<HomeData>('/home'),
};
