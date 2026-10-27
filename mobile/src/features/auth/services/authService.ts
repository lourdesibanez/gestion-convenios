import { api } from '@/services/api';
import { LoginData } from '@/components/organisms';

export type LoginChallenge = {
  id_desafio: number;
  canal: 'mail' | 'sms' | 'push';
  destino: string;
  canales_disponibles: string[];
  expira_en: string;
  reenviar_en_segundos: number;
  codigo_debug: string | null;
};

export const authService = {
  login: (data: LoginData) => api.post<LoginChallenge>('/auth/login', data),
};
