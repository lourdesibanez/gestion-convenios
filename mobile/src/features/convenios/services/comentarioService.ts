import { api } from '@/services/api';

export type ComentarioConvenio = {
  id: number;
  comentario: string;
  es_ofensivo: boolean;
  usuario: {
    id: number;
    nombre: string;
    apellido: string;
  };
  created_at: string;
};

export const comentarioService = {
  listar: (idConvenio: number) =>
    api.get<ComentarioConvenio[]>(`/agreements/${idConvenio}/comments`),

  crear: (idConvenio: number, comentario: string) =>
    api.post<ComentarioConvenio>(`/agreements/${idConvenio}/comments`, {
      comentario,
    }),
};