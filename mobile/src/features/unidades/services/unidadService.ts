import { api } from '@/services/api';

export type Unidad = { id: number; nombre: string; roles: string[] };

export const unidadService = {
  misUnidades: () => api.get<{ data: Unidad[] }>('/auth/me/units').then((r) => r.data),
};
