import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { File } from 'expo-file-system';
import { router } from 'expo-router';
import { FilePlus2 } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/atoms';
import { FormField } from '@/components/molecules/FormField';
import { ApiError } from '@/services/api';
import { colors, radius, spacing, typography } from '@/theme';
import {
  creacionConvenioService,
  TAMANO_MAXIMO_DOCUMENTO,
  type NuevoConvenio,
  type OpcionConvenio,
  type OpcionesCreacionConvenio,
  type TipoDocumentoConvenio,
} from '../services/creacionConvenioService';

type CampoTexto =
  | 'titulo'
  | 'fecha_inicio'
  | 'fecha_fin'
  | 'fecha_preaviso'
  | 'numero_resolucion'
  | 'referencia_expediente'
  | 'notas'
  | 'objeto'
  | 'marco_legal'
  | 'obligaciones'
  | 'condiciones_terminacion'
  | 'condiciones_renovacion'
  | 'confidencialidad'
  | 'alcance_actividades';

type CamposFormulario = Record<CampoTexto, string>;
type OpcionSelector = { id: number | string; nombre: string };
type OpcionDocumento = OpcionSelector & { tipo: TipoDocumentoConvenio };
type AdjuntoDocumento = {
  key: string;
  archivo: File;
  tipo: TipoDocumentoConvenio;
};
type SelectorProps<T extends OpcionSelector> = {
  etiqueta: string;
  opciones: T[];
  seleccionado: T | null;
  alSeleccionar: (opcion: T) => void;
  deshabilitado: boolean;
};

const tiposDocumento: OpcionDocumento[] = [
  { id: 1, nombre: 'Resolución', tipo: 'resolucion' },
  { id: 2, nombre: 'Borrador', tipo: 'borrador' },
  { id: 3, nombre: 'Anexo', tipo: 'anexo' },
];
const etiquetasTipoDocumento: Record<TipoDocumentoConvenio, string> = {
  resolucion: 'Resolución',
  borrador: 'Borrador',
  anexo: 'Anexo',
  convenio_aprobado: 'Convenio aprobado',
};

function formatearTamano(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const camposIniciales: CamposFormulario = {
  titulo: '',
  fecha_inicio: '',
  fecha_fin: '',
  fecha_preaviso: '',
  numero_resolucion: '',
  referencia_expediente: '',
  notas: '',
  objeto: '',
  marco_legal: '',
  obligaciones: '',
  condiciones_terminacion: '',
  condiciones_renovacion: '',
  confidencialidad: '',
  alcance_actividades: '',
};

function Selector<T extends OpcionSelector>({
  etiqueta,
  opciones,
  seleccionado,
  alSeleccionar,
  deshabilitado,
}: SelectorProps<T>) {
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      <View style={styles.field}>
        <Text style={styles.label}>{etiqueta}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${etiqueta}: ${seleccionado?.nombre ?? 'Seleccionar'}`}
          accessibilityState={{ disabled: deshabilitado }}
          disabled={deshabilitado}
          onPress={() => setAbierto(true)}
          style={[styles.selector, deshabilitado && styles.selectorDisabled]}
        >
          <Text style={seleccionado ? styles.selectorText : styles.placeholder}>
            {seleccionado?.nombre ?? 'Seleccionar'}
          </Text>
        </Pressable>
      </View>
      <Modal
        visible={abierto}
        animationType="slide"
        transparent
        onRequestClose={() => setAbierto(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{etiqueta}</Text>
            <ScrollView>
              {opciones.map((opcion) => (
                <Pressable
                  key={opcion.id}
                  accessibilityRole="button"
                  onPress={() => {
                    alSeleccionar(opcion);
                    setAbierto(false);
                  }}
                  style={styles.option}
                >
                  <Text style={styles.optionText}>{opcion.nombre}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Button title="Cancelar" variant="outline" onPress={() => setAbierto(false)} />
          </View>
        </View>
      </Modal>
    </>
  );
}

export function CrearConvenioScreen() {
  const [opciones, setOpciones] = useState<OpcionesCreacionConvenio | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [errorCarga, setErrorCarga] = useState('');
  const [errorEnvio, setErrorEnvio] = useState('');
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [campos, setCampos] = useState<CamposFormulario>(camposIniciales);
  const [tipo, setTipo] = useState<OpcionConvenio | null>(null);
  const [institucion, setInstitucion] = useState<OpcionConvenio | null>(null);
  const [tipoDocumento, setTipoDocumento] = useState<OpcionDocumento>(tiposDocumento[0]);
  const [adjuntos, setAdjuntos] = useState<AdjuntoDocumento[]>([]);
  const [errorAdjuntos, setErrorAdjuntos] = useState('');
  const [instrumentoCreadoId, setInstrumentoCreadoId] = useState<number | null>(null);

  useEffect(() => {
    const cargarOpciones = async () => {
      try {
        setOpciones(await creacionConvenioService.opciones());
      } catch (error) {
        setErrorCarga(error instanceof Error ? error.message : 'No se pudieron cargar las opciones.');
      } finally {
        setCargando(false);
      }
    };

    void cargarOpciones();
  }, []);

  const actualizarCampo = (campo: CampoTexto, valor: string) => {
    setCampos((actuales) => ({ ...actuales, [campo]: valor }));
    setErrores((actuales) => ({ ...actuales, [campo]: '' }));
  };

  const quitarAdjunto = (key: string) => {
    setAdjuntos((actuales) => actuales.filter((adjunto) => adjunto.key !== key));
    setErrorAdjuntos('');
  };

  const seleccionarDocumentos = async () => {
    setErrorAdjuntos('');

    try {
      const resultado = await File.pickFileAsync({
        multipleFiles: true,
        mimeTypes: ['application/pdf'],
      });

      if (resultado.canceled) return;

      const validos = resultado.result.filter((archivo) => {
        const esPdf = archivo.type === 'application/pdf' || archivo.name.toLocaleLowerCase().endsWith('.pdf');
        return esPdf && archivo.size <= TAMANO_MAXIMO_DOCUMENTO;
      });

      if (validos.length < resultado.result.length) {
        setErrorAdjuntos('Solo se aceptan archivos PDF de hasta 20 MB.');
      }

      setAdjuntos((actuales) => {
        const existentes = new Set(actuales.map((adjunto) => adjunto.archivo.uri));
        return [
          ...actuales,
          ...validos
            .filter((archivo) => !existentes.has(archivo.uri))
            .map((archivo) => ({
              key: archivo.uri,
              archivo,
              tipo: tipoDocumento.tipo,
            })),
        ];
      });
    } catch (error) {
      setErrorAdjuntos(
        error instanceof Error ? error.message : 'No se pudieron seleccionar los documentos.',
      );
    }
  };

  const enviar = async () => {
    setErrorEnvio('');
    let payload: NuevoConvenio | null = null;

    if (instrumentoCreadoId === null) {
      const nuevosErrores: Record<string, string> = {};
      if (!campos.titulo.trim()) nuevosErrores.titulo = 'Ingresá el título del convenio.';
      if (!tipo) nuevosErrores.id_tipo_instrumento = 'Seleccioná el tipo de convenio.';
      if (!institucion) nuevosErrores.id_institucion = 'Seleccioná la unidad responsable.';
      setErrores(nuevosErrores);

      if (Object.keys(nuevosErrores).length > 0 || !tipo || !institucion) return;

      const textoOpcional = (valor: string) => valor.trim() || null;
      payload = {
        titulo: campos.titulo.trim(),
        id_tipo_instrumento: tipo.id,
        id_institucion: institucion.id,
        fecha_inicio: textoOpcional(campos.fecha_inicio),
        fecha_fin: textoOpcional(campos.fecha_fin),
        fecha_preaviso: textoOpcional(campos.fecha_preaviso),
        numero_resolucion: textoOpcional(campos.numero_resolucion),
        referencia_expediente: textoOpcional(campos.referencia_expediente),
        notas: textoOpcional(campos.notas),
        objeto: textoOpcional(campos.objeto),
        marco_legal: textoOpcional(campos.marco_legal),
        obligaciones: textoOpcional(campos.obligaciones),
        condiciones_terminacion: textoOpcional(campos.condiciones_terminacion),
        condiciones_renovacion: textoOpcional(campos.condiciones_renovacion),
        confidencialidad: textoOpcional(campos.confidencialidad),
        alcance_actividades: textoOpcional(campos.alcance_actividades),
      };
    }

    setGuardando(true);
    let idInstrumento = instrumentoCreadoId;

    try {
      if (idInstrumento === null) {
        if (!payload) throw new Error('Faltan datos obligatorios del convenio.');
        const creado = await creacionConvenioService.crear(payload);
        idInstrumento = creado.id;
        setInstrumentoCreadoId(idInstrumento);
      }

      for (const adjunto of adjuntos) {
        await creacionConvenioService.subirDocumento(
          idInstrumento,
          adjunto.tipo,
          adjunto.archivo,
        );
        setAdjuntos((actuales) => actuales.filter((item) => item.key !== adjunto.key));
      }

      router.replace({ pathname: '/agreement/[id]', params: { id: String(idInstrumento) } });
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorEnvio(idInstrumento !== null
          ? `El borrador ya se guardó, pero no se completó la carga de documentos. ${error.message}`
          : error.status === 403
            ? 'Tu perfil no tiene permiso para crear convenios.'
            : error.message);
        const erroresApi = Object.fromEntries(
          Object.entries(error.errors).map(([campo, mensajes]) => [campo, mensajes[0] ?? 'Dato inválido.']),
        );
        setErrores((actuales) => ({ ...actuales, ...erroresApi }));
      } else {
        setErrorEnvio(idInstrumento !== null
          ? 'El borrador ya se guardó, pero no se completó la carga de documentos. Podés reintentar.'
          : 'No se pudo guardar el convenio.');
      }
    } finally {
      setGuardando(false);
    }
  };

  const formularioBloqueado = guardando || instrumentoCreadoId !== null;

  if (cargando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Cargar convenio</Text>
        <Button title="Volver" variant="outline" onPress={() => router.back()} disabled={guardando} />
        {errorCarga ? (
          <Text style={styles.error}>{errorCarga}</Text>
        ) : !opciones?.puede_crear ? (
          <Text style={styles.info}>
            Tu perfil puede consultar convenios, pero no tiene permiso para crear uno.
          </Text>
        ) : (
          <>
            {instrumentoCreadoId !== null ? (
              <Text style={styles.info}>
                El borrador ya está guardado. Podés cargar los documentos pendientes.
              </Text>
            ) : null}
            <Text style={styles.section}>Datos del convenio</Text>
            <FormField
              label="Título *"
              value={campos.titulo}
              onChangeText={(valor) => actualizarCampo('titulo', valor)}
              error={errores.titulo}
              editable={!formularioBloqueado}
              maxLength={255}
              returnKeyType="next"
            />
            <Selector
              etiqueta="Tipo de convenio *"
              opciones={opciones.tipos}
              seleccionado={tipo}
              alSeleccionar={(opcion) => {
                setTipo(opcion);
                setErrores((actuales) => ({ ...actuales, id_tipo_instrumento: '' }));
              }}
              deshabilitado={formularioBloqueado || opciones.tipos.length === 0}
            />
            {errores.id_tipo_instrumento ? <Text style={styles.error}>{errores.id_tipo_instrumento}</Text> : null}
            <Selector
              etiqueta="Unidad responsable *"
              opciones={opciones.instituciones}
              seleccionado={institucion}
              alSeleccionar={(opcion) => {
                setInstitucion(opcion);
                setErrores((actuales) => ({ ...actuales, id_institucion: '' }));
              }}
              deshabilitado={formularioBloqueado || opciones.instituciones.length === 0}
            />
            {errores.id_institucion ? <Text style={styles.error}>{errores.id_institucion}</Text> : null}
            {opciones.tipos.length === 0 || opciones.instituciones.length === 0 ? (
              <Text style={styles.error}>No hay tipos de convenio o unidades disponibles para cargar.</Text>
            ) : null}

            <Text style={styles.section}>Vigencia y referencia</Text>
            <FormField
              label="Fecha de inicio (AAAA-MM-DD)"
              value={campos.fecha_inicio}
              onChangeText={(valor) => actualizarCampo('fecha_inicio', valor)}
              error={errores.fecha_inicio}
              editable={!formularioBloqueado}
              placeholder="2027-01-31"
            />
            <FormField
              label="Fecha de finalización (AAAA-MM-DD)"
              value={campos.fecha_fin}
              onChangeText={(valor) => actualizarCampo('fecha_fin', valor)}
              error={errores.fecha_fin}
              editable={!formularioBloqueado}
              placeholder="2028-01-31"
            />
            <FormField
              label="Fecha de preaviso (AAAA-MM-DD)"
              value={campos.fecha_preaviso}
              onChangeText={(valor) => actualizarCampo('fecha_preaviso', valor)}
              error={errores.fecha_preaviso}
              editable={!formularioBloqueado}
              placeholder="2027-11-01"
            />
            <FormField
              label="Referencia de expediente"
              value={campos.referencia_expediente}
              onChangeText={(valor) => actualizarCampo('referencia_expediente', valor)}
              error={errores.referencia_expediente}
              editable={!formularioBloqueado}
              maxLength={255}
            />
            <FormField
              label="Notas"
              value={campos.notas}
              onChangeText={(valor) => actualizarCampo('notas', valor)}
              error={errores.notas}
              editable={!formularioBloqueado}
              multiline
              style={styles.multiline}
            />

            <Text style={styles.section}>Cláusulas</Text>
            <FormField
              label="Objeto"
              value={campos.objeto}
              onChangeText={(valor) => actualizarCampo('objeto', valor)}
              editable={!formularioBloqueado}
              multiline
              style={styles.multiline}
            />
            <FormField
              label="Marco legal"
              value={campos.marco_legal}
              onChangeText={(valor) => actualizarCampo('marco_legal', valor)}
              editable={!formularioBloqueado}
              multiline
              style={styles.multiline}
            />
            <FormField
              label="Obligaciones"
              value={campos.obligaciones}
              onChangeText={(valor) => actualizarCampo('obligaciones', valor)}
              editable={!formularioBloqueado}
              multiline
              style={styles.multiline}
            />
            <FormField
              label="Condiciones de terminación"
              value={campos.condiciones_terminacion}
              onChangeText={(valor) => actualizarCampo('condiciones_terminacion', valor)}
              editable={!formularioBloqueado}
              multiline
              style={styles.multiline}
            />
            <FormField
              label="Condiciones de renovación"
              value={campos.condiciones_renovacion}
              onChangeText={(valor) => actualizarCampo('condiciones_renovacion', valor)}
              editable={!formularioBloqueado}
              multiline
              style={styles.multiline}
            />
            <FormField
              label="Confidencialidad"
              value={campos.confidencialidad}
              onChangeText={(valor) => actualizarCampo('confidencialidad', valor)}
              editable={!formularioBloqueado}
              multiline
              style={styles.multiline}
            />
            <FormField
              label="Alcance de actividades"
              value={campos.alcance_actividades}
              onChangeText={(valor) => actualizarCampo('alcance_actividades', valor)}
              editable={!formularioBloqueado}
              multiline
              style={styles.multiline}
            />

            <Text style={styles.section}>Resoluciones y documentos</Text>
            <FormField
              label="Número de resolución"
              value={campos.numero_resolucion}
              onChangeText={(valor) => actualizarCampo('numero_resolucion', valor)}
              error={errores.numero_resolucion}
              editable={!formularioBloqueado}
              maxLength={255}
            />
            <Selector
              etiqueta="Tipo de documento para los próximos archivos"
              opciones={tiposDocumento}
              seleccionado={tipoDocumento}
              alSeleccionar={setTipoDocumento}
              deshabilitado={guardando}
            />
            <Text style={styles.helper}>
              Podés adjuntar resoluciones, borradores y anexos en PDF de hasta 20 MB cada uno.
            </Text>
            <Button
              title="Seleccionar documentos PDF"
              variant="outline"
              icon={<FilePlus2 size={20} color={colors.primary} />}
              onPress={() => void seleccionarDocumentos()}
              disabled={guardando}
            />
            {adjuntos.map((adjunto) => (
              <View key={adjunto.key} style={styles.adjunto}>
                <View style={styles.adjuntoInfo}>
                  <Text style={styles.adjuntoNombre} numberOfLines={1}>
                    {adjunto.archivo.name}
                  </Text>
                  <Text style={styles.helper}>
                    {etiquetasTipoDocumento[adjunto.tipo]} · {formatearTamano(adjunto.archivo.size)}
                  </Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Quitar ${adjunto.archivo.name}`}
                  disabled={guardando}
                  onPress={() => quitarAdjunto(adjunto.key)}
                >
                  <Text style={styles.quitarAdjunto}>Quitar</Text>
                </Pressable>
              </View>
            ))}
            {errorAdjuntos ? <Text style={styles.error}>{errorAdjuntos}</Text> : null}

            {errorEnvio ? <Text style={styles.error}>{errorEnvio}</Text> : null}
            {instrumentoCreadoId === null ? (
              <Text style={styles.helper}>El convenio se guardará como borrador.</Text>
            ) : null}
            <Button
              title={instrumentoCreadoId === null
                ? 'Guardar borrador'
                : adjuntos.length > 0
                  ? 'Reintentar carga'
                  : 'Ver borrador'}
              onPress={() => void enviar()}
              loading={guardando}
              disabled={instrumentoCreadoId === null
                && (opciones.tipos.length === 0 || opciones.instituciones.length === 0)}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    ...typography.label,
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary,
  },
  section: {
    ...typography.label,
    color: colors.text,
    marginTop: spacing.md,
  },
  field: {
    gap: spacing.xs,
  },
  label: {
    ...typography.small,
    color: colors.text,
  },
  selector: {
    minHeight: 52,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  selectorDisabled: {
    opacity: 0.5,
  },
  selectorText: {
    ...typography.body,
    color: colors.text,
  },
  placeholder: {
    ...typography.body,
    color: colors.textMuted,
  },
  multiline: {
    minHeight: 100,
    height: 100,
    paddingTop: spacing.md,
    textAlignVertical: 'top',
  },
  helper: {
    ...typography.small,
    color: colors.textMuted,
  },
  error: {
    ...typography.small,
    color: colors.error,
  },
  info: {
    ...typography.body,
    color: colors.textMuted,
  },
  adjunto: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  adjuntoInfo: {
    flex: 1,
  },
  adjuntoNombre: {
    ...typography.body,
    color: colors.text,
  },
  quitarAdjunto: {
    ...typography.small,
    color: colors.primary,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalCard: {
    maxHeight: '80%',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.md,
    borderTopRightRadius: radius.md,
  },
  modalTitle: {
    ...typography.label,
    color: colors.text,
  },
  option: {
    minHeight: 48,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionText: {
    ...typography.body,
    color: colors.text,
  },
});
