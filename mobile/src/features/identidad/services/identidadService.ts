import { api } from '@/services/api';

// Lo que devuelve la API en /auth/identity (IdentidadResource).
export type Identidad = {
  firma: string | null; // "data:image/png;base64,..." o null si no la registró
  firma_registrada_en: string | null;
  facial_registrado_en: string | null;
  huella_registrada_en: string | null;
};

export type TipoBiometria = 'facial' | 'huella';

// Laravel envuelve los Resources en { data: ... }.
type Respuesta = { data: Identidad };

export const identidadService = {
  // Estado actual de la identidad del usuario logueado.
  obtener: async () => (await api.get<Respuesta>('/auth/identity')).data,

  // Guarda (o reemplaza) la firma dibujada en el pad.
  guardarFirma: async (firma: string) =>
    (await api.post<Respuesta>('/auth/identity/signature', { firma })).data,

  // Solo avisa que se registró: el rostro y la huella nunca salen del celular.
  registrarBiometria: async (tipo: TipoBiometria) =>
    (await api.post<Respuesta>('/auth/identity/biometrics', { tipo })).data,
};
