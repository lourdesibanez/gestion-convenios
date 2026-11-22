import { api } from '@/services/api';

type RespuestaFoto = { data: { foto_url: string | null } };

export const perfilService = {
  guardarFoto: (fotoBase64: string) => api.post<RespuestaFoto>('/perfil/foto', { foto: fotoBase64 }),
  quitarFoto: () => api.post<RespuestaFoto>('/perfil/foto/quitar', {}),
};

