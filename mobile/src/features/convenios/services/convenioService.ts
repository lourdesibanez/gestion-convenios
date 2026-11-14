import { api } from '@/services/api';
import type { ConvenioDetalle, EtapaCircuito } from '../Tipos';

type DetalleApi = {
  puede_firmar: boolean;
  puede_editar: boolean;
  convenio: {
    id: number;
    codigo: string;
    titulo: string;
    tipo: string;
    categoria: string | null;
    ambito: string | null;
    unidad: string;
    estado: string;
    fecha_inicio: string | null;
    vencimiento: string | null;
    fecha_preaviso: string | null;
    referencia_expediente: string | null;
    notas: string | null;
  };
  partes: {
    id: number;
    nombre: string;
    es_interna: boolean | number;
    fecha_firma: string | null;
  }[];
  archivos: {
    id: number;
    nombre: string;
    tipo_documento: string;
    tamanio_bytes: number;
    created_at: string;
  }[];
  historial: {
    estado_anterior: string | null;
    estado_nuevo: string;
    usuario: string;
    fundamento: string | null;
  }[];
  vinculos: {
    tipo_vinculo: string;
    origen_id: number;
    destino_id: number;
    destino_codigo: string;
  }[];
};

function etapaDesdeEstado(estado: string): EtapaCircuito {
  const normalizado = estado.toLocaleLowerCase('es-AR');

  if (normalizado.includes('borrador')) return 'borrador';
  if (normalizado.includes('revision')) return 'revision';
  if (normalizado.includes('aprobado')) return 'aprobado';
  if (
    ['firmado', 'vigente', 'vencido', 'rescindido', 'archivado'].some((etapa) =>
      normalizado.includes(etapa),
    )
  ) {
    return 'firmado';
  }

  throw new Error(`Estado de convenio no soportado: ${estado}`);
}

function describirTamano(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const conveniosService = {
  async detalle(id: number | string): Promise<ConvenioDetalle> {
    const data = await api.get<DetalleApi>(`/agreements/${id}`);
    const convenio = data.convenio;

    const ultimoMovimiento = data.historial[0];
    const convenioPadre = data.vinculos.find(
      (vinculo) =>
        vinculo.origen_id === convenio.id && vinculo.tipo_vinculo === 'especifico_de',
    );
    const fechaPreaviso = convenio.fecha_preaviso;
    const diasParaPreaviso = fechaPreaviso
      ? Math.ceil((new Date(fechaPreaviso).getTime() - Date.now()) / 86_400_000)
      : 0;

    return {
      id: convenio.id,
      puedeFirmar: data.puede_firmar,
      puedeEditar: data.puede_editar,
      codigo: convenio.codigo,
      tipoInstrumento: convenio.tipo,
      estado: convenio.estado,
      titulo: convenio.titulo,
      expediente: convenio.referencia_expediente || convenio.codigo,
      unidadAcademica: convenio.unidad,
      etapaActual: etapaDesdeEstado(convenio.estado),
      resumenCircuito: ultimoMovimiento
        ? `${ultimoMovimiento.estado_anterior ? `${ultimoMovimiento.estado_anterior} → ` : ''}${ultimoMovimiento.estado_nuevo} · ${ultimoMovimiento.usuario}`
        : convenio.notas || 'Sin movimientos registrados.',
      procedencia: convenio.ambito || convenio.categoria || 'No especificada',
      ...(convenioPadre && {
        convenioPadre: {
          id: convenioPadre.destino_id,
          codigo: convenioPadre.destino_codigo,
        },
      }),
      inicio: convenio.fecha_inicio,
      vencimiento: convenio.vencimiento,
      preaviso: fechaPreaviso,
      diasParaPreaviso,
      firmantes: data.partes.map((parte) => ({
        id: parte.id,
        nombre: parte.nombre,
        cargo: parte.es_interna ? 'Institución interna' : 'Institución externa',
        estado: parte.fecha_firma ? 'firmado' : 'pendiente',
        esUsuarioActual: false,
      })),
      documentos: data.archivos.map((archivo) => ({
        id: archivo.id,
        nombre: archivo.nombre,
        descripcion: `${archivo.tipo_documento} · ${describirTamano(archivo.tamanio_bytes)}`,
      })),
      comentarios: [],
    };
  },
};