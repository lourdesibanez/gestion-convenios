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
};

export const homeService = {
  get: () => api.get<HomeData>('/home'),
};
