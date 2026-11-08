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

export type Usuario = {
  id: number;
  nombre_usuario: string;
  nombre: string;
  apellido: string;
  email: string;
};

export type VerifyCodeResponse = {
  token: string;
  usuario: Usuario;
};

export const authService = {
  login: (data: LoginData) => api.post<LoginChallenge>('/auth/login', data),

  verifyCode: (id_desafio: number, codigo: string, dispositivo: string) =>
    api.post<VerifyCodeResponse>('/auth/verify-code', { id_desafio, codigo, dispositivo }),

  resendCode: (id_desafio: number, canal: LoginChallenge['canal']) =>
    api.post<LoginChallenge>('/auth/resend-code', { id_desafio, canal }),

  me: () => api.get<Usuario>('/auth/me'),
  logout: () => api.post<void>('/auth/logout'),
  savePushToken: (push_token: string) => api.post<void>('/auth/push-token', { push_token }),

};
