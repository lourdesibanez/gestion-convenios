import { api } from '@/services/api';

export type Notificacion = {
  id: number;
  tipo: string;
  mensaje: string;
  leido: boolean;
  created_at: string;
  id_instrumento: number | null;
  convenio: {
    codigo: string;
    titulo: string;
    estado: string | null;
  } | null;
};

export type NotificacionesResponse = {
  data: Notificacion[];
  meta: {
    current_page: number;
    last_page: number;
  };
  unread_count: number;
};

export const notificationService = {
  get: (page = 1) => api.get<NotificacionesResponse>(`/notifications?page=${page}`),
  markRead: (id: number) => api.patch<void>(`/notifications/${id}/read`),
  markAllRead: () => api.patch<void>('/notifications/read-all'),
};
