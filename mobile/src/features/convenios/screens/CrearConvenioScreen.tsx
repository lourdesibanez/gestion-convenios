import { useEffect, useState, useRef } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Keyboard,
  type ScrollViewInstance,
} from 'react-native';
import { File } from 'expo-file-system';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, FilePlus2 } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/atoms';
import { DateField, FormField, SelectField } from '@/components/molecules';
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

function fechaDesdeIso(valor: string): Date | null {
  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor);
  if (!partes) return null;

  const anio = Number(partes[1]);
  const mes = Number(partes[2]);
  const dia = Number(partes[3]);
  const fecha = new Date(anio, mes - 1, dia, 12);

  if (
    fecha.getFullYear() !== anio ||
    fecha.getMonth() !== mes - 1 ||
    fecha.getDate() !== dia
  ) {
    return null;
  }

  return fecha;
}

function fechaAisoLocal(fecha: Date): string {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');

  return `${anio}-${mes}-${dia}`;
}

function mostrarFecha(valor: string): string {
  const fecha = fechaDesdeIso(valor);

  return fecha
    ? new Intl.DateTimeFormat('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(fecha)
    : '';
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

export function CrearConvenioScreen() {
  const { id: idConvenio } = useLocalSearchParams<{ id?: string }>();
  const modoEdicion = typeof idConvenio === 'string' && idConvenio.length > 0;
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
  const [versionEdicion, setVersionEdicion] = useState<number | null>(null);
  const [pasoActual, setPasoActual] = useState(0);
  const scrollViewRef = useRef<ScrollViewInstance | null>(null);

  const volverAlInicioDelPaso = () => {
    Keyboard.dismiss();
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };
  
  const pasos = [
    'Datos',
    'Vigencia y referencia',
    'Cláusulas',
    'Resoluciones y documentos',
  ];

  const camposPorPaso = [
    ['titulo', 'id_tipo_instrumento', 'id_institucion'],
    ['fecha_inicio', 'fecha_fin', 'fecha_preaviso', 'referencia_expediente', 'notas'],
    [
      'objeto',
      'marco_legal',
      'obligaciones',
      'condiciones_terminacion',
      'condiciones_renovacion',
      'confidencialidad',
      'alcance_actividades',
    ],
    ['numero_resolucion', 'documentos'],
  ];

  useEffect(() => {
    const cargarFormulario = async () => {
      try {
        const [opcionesCargadas, edicion] = await Promise.all([
          creacionConvenioService.opciones(),
          modoEdicion
            ? creacionConvenioService.obtenerParaEdicion(idConvenio)
            : Promise.resolve(null),
        ]);
        setOpciones(opcionesCargadas);

        if (edicion) {
          const datos = edicion.convenio;
          setCampos({
            titulo: datos.titulo,
            fecha_inicio: datos.fecha_inicio ?? '',
            fecha_fin: datos.fecha_fin ?? '',
            fecha_preaviso: datos.fecha_preaviso ?? '',
            numero_resolucion: datos.numero_resolucion ?? '',
            referencia_expediente: datos.referencia_expediente ?? '',
            notas: datos.notas ?? '',
            objeto: datos.objeto ?? '',
            marco_legal: datos.marco_legal ?? '',
            obligaciones: datos.obligaciones ?? '',
            condiciones_terminacion: datos.condiciones_terminacion ?? '',
            condiciones_renovacion: datos.condiciones_renovacion ?? '',
            confidencialidad: datos.confidencialidad ?? '',
            alcance_actividades: datos.alcance_actividades ?? '',
          });
          setTipo(opcionesCargadas.tipos.find((opcion) => opcion.id === datos.id_tipo_instrumento) ?? null);
          setInstitucion(
            opcionesCargadas.instituciones.find((opcion) => opcion.id === datos.id_institucion) ?? null,
          );
          setVersionEdicion(edicion.version);
        }
      } catch (error) {
        setErrorCarga(error instanceof Error ? error.message : 'No se pudieron cargar las opciones.');
      } finally {
        setCargando(false);
      }
    };

    void cargarFormulario();
  }, [idConvenio, modoEdicion]);

  const actualizarCampo = (campo: CampoTexto, valor: string) => {
    setCampos((actuales) => ({ ...actuales, [campo]: valor }));
    setErrores((actuales) => ({ ...actuales, [campo]: '' }));
  };

  const validarDatosBasicos = (): boolean => {
    const nuevosErrores: Record<string, string> = {};

    if (!campos.titulo.trim()) {
      nuevosErrores.titulo = 'Ingresá el título del convenio.';
    }
    if (!tipo) {
      nuevosErrores.id_tipo_instrumento = 'Seleccioná el tipo de convenio.';
    }
    if (!institucion) {
      nuevosErrores.id_institucion = 'Seleccioná la unidad responsable.';
    }

    setErrores((actuales) => {
      const siguientes = { ...actuales };
      delete siguientes.titulo;
      delete siguientes.id_tipo_instrumento;
      delete siguientes.id_institucion;

      return { ...siguientes, ...nuevosErrores };
    });

    return Object.keys(nuevosErrores).length === 0;
  };

  const avanzarPaso = () => {
    const debeValidarDatosBasicos = modoEdicion || instrumentoCreadoId === null;

    if (pasoActual === 0 && debeValidarDatosBasicos && !validarDatosBasicos() ) {
      return;
    }
    volverAlInicioDelPaso();
    setPasoActual((actual) => Math.min(actual + 1, pasos.length - 1));
  };

  const retrocederPaso = () => {
    volverAlInicioDelPaso();
    setPasoActual((actual) => Math.max(actual - 1, 0));
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

    if (modoEdicion || instrumentoCreadoId === null) {
      if (!validarDatosBasicos() || !tipo || !institucion) return;

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
      if (modoEdicion) {
        if (versionEdicion === null || !payload) {
          throw new Error('No se pudieron cargar los datos actuales del convenio.');
        }
        await creacionConvenioService.actualizar(idConvenio, payload, versionEdicion);
        router.replace({ pathname: '/agreement/[id]', params: { id: idConvenio } });
        return;
      }

      if (idInstrumento === null) {
        if (!payload) throw new Error('Faltan datos obligatorios del convenio.');
        const creado = await creacionConvenioService.crear(payload);
        idInstrumento = creado.id;
        setInstrumentoCreadoId(idInstrumento);
      }

      if (idInstrumento === null) throw new Error('No se pudo identificar el convenio guardado.');
      for (const adjunto of adjuntos) {
        await creacionConvenioService.subirDocumento(idInstrumento, adjunto.tipo, adjunto.archivo);
        setAdjuntos((actuales) => actuales.filter((item) => item.key !== adjunto.key));
      }

      router.replace({ pathname: '/agreement/[id]', params: { id: String(idInstrumento) } });
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorEnvio(modoEdicion
          ? error.status === 403
            ? 'No tenés permiso para editar este borrador.'
            : error.message
          : idInstrumento !== null
            ? `El borrador ya se guardó, pero no se completó la carga de documentos. ${error.message}`
            : error.status === 403
              ? 'Tu perfil no tiene permiso para crear convenios.'
              : error.message);
        const erroresApi = Object.fromEntries(
          Object.entries(error.errors).map(([campo, mensajes]) => [campo, mensajes[0] ?? 'Dato inválido.']),
        );
        setErrores((actuales) => ({ ...actuales, ...erroresApi }));
        //si el servidor rechaza un campo de un paso anterior, volvemos a ese paso para que el usuario pueda corregirlo
        const pasoConError = camposPorPaso.findIndex((camposDelPaso) =>
          Object.keys(erroresApi).some((campo) => camposDelPaso.includes(campo)),
        );

        if (pasoConError !== -1) {
          setPasoActual(pasoConError);
          volverAlInicioDelPaso();
        }
      } else {
        setErrorEnvio(modoEdicion
          ? error instanceof Error ? error.message : 'No se pudieron guardar los cambios.'
          : idInstrumento !== null
            ? 'El borrador ya se guardó, pero no se completó la carga de documentos. Podés reintentar.'
            : 'No se pudo guardar el convenio.');
      }
    } finally {
      setGuardando(false);
    }
  };

  const formularioBloqueado = guardando || (!modoEdicion && instrumentoCreadoId !== null);

  if (cargando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safe}>
      <ScrollView ref={scrollViewRef} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.titleRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Volver"
            disabled={guardando}
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ChevronLeft size={24} color={colors.primary} />
          </Pressable>

          <Text style={styles.title}>
            {modoEdicion ? 'Editar convenio' : 'Nuevo convenio'}
          </Text>
        </View>
        {errorCarga ? (
          <Text style={styles.error}>{errorCarga}</Text>
        ) : !opciones ? (
          <Text style={styles.error}>No se pudieron cargar las opciones del formulario.</Text>
        ) : !modoEdicion && !opciones.puede_crear ? (
          <Text style={styles.info}>
            Tu perfil puede consultar convenios, pero no tiene permiso para crear uno.
          </Text>
        ) : (
          <>
          <View style={styles.stepper}>
            <View style={styles.stepperHeader}>
              <Text style={styles.stepperCount}>
                Paso {pasoActual + 1} de {pasos.length}
              </Text>
              <Text style={styles.stepperTitle}>{pasos[pasoActual]}</Text>
            </View>

            <View
              style={styles.stepperProgress}
              accessibilityRole="progressbar"
              accessibilityLabel="Progreso del formulario"
              accessibilityValue={{
                min: 1,
                max: pasos.length,
                now: pasoActual + 1,
                text: `Paso ${pasoActual + 1} de ${pasos.length}: ${pasos[pasoActual]}`,
              }}
            >
              {pasos.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.stepSegment,
                    index <= pasoActual && styles.stepSegmentActive,
                  ]}
                />
              ))}
            </View>
          </View>
            {instrumentoCreadoId !== null ? (
              <Text style={styles.info}>
                El borrador ya está guardado. Podés cargar los documentos pendientes.
              </Text>
            ) : null}
            {pasoActual === 0 ? (
            <View style={styles.stepFields}>
              <FormField
                label="Título"
                value={campos.titulo}
                onChangeText={(valor) => actualizarCampo('titulo', valor)}
                error={errores.titulo}
                editable={!formularioBloqueado}
                maxLength={255}
                returnKeyType="next"
                placeholder="Pasantias 2027 - Cooperativa Agricola"
                required
              />
              <SelectField
                label="Tipo de convenio"
                required
                value={tipo ? String(tipo.id) : ''}
                options={opciones.tipos.map((opcion) => ({
                  value: String(opcion.id),
                  label: opcion.nombre,
                }))}
                onValueChange={(valor) => {
                  const opcion = opciones.tipos.find(
                    (actual) => String(actual.id) === valor,
                  );
                  if (opcion) setTipo(opcion);
                  setErrores((actuales) => ({ ...actuales, id_tipo_instrumento: '' }));
                }}
                disabled={formularioBloqueado || opciones.tipos.length === 0}
              />
              {errores.id_tipo_instrumento ? <Text style={styles.error}>{errores.id_tipo_instrumento}</Text> : null}
              <SelectField
                label="Unidad responsable"
                required
                value={institucion ? String(institucion.id) : ''}
                options={opciones.instituciones.map((opcion) => ({
                  value: String(opcion.id),
                  label: opcion.nombre,
                }))}
                onValueChange={(valor) => {
                  const opcion = opciones.instituciones.find(
                    (actual) => String(actual.id) === valor,
                  );
                  if (opcion) setInstitucion(opcion);
                  setErrores((actuales) => ({ ...actuales, id_institucion: '' }));
                }}
                disabled={formularioBloqueado || opciones.instituciones.length === 0}
              />
              {errores.id_institucion ? <Text style={styles.error}>{errores.id_institucion}</Text> : null}
              {opciones.tipos.length === 0 || opciones.instituciones.length === 0 ? (
                <Text style={styles.error}>No hay tipos de convenio o unidades disponibles para cargar.</Text>
              ) : null}
            </View> ) : null}
            
            {pasoActual === 1 ? (
            <View style={styles.stepFields}>
              <View style={styles.dateFieldsRow}>
                <View style={styles.dateFieldColumn}>
                  <DateField
                    label="Inicio"
                    value={campos.fecha_inicio}
                    onChangeValue={(valor) => actualizarCampo('fecha_inicio', valor)}
                    error={errores.fecha_inicio}
                    editable={!formularioBloqueado}
                    placeholder="01/06/2026"
                    required
                  />
                </View>

                <View style={styles.dateFieldColumn}>
                  <DateField
                    label="Vencimiento"
                    value={campos.fecha_fin}
                    onChangeValue={(valor) => actualizarCampo('fecha_fin', valor)}
                    error={errores.fecha_fin}
                    editable={!formularioBloqueado}
                    placeholder="01/03/2027"
                  />
                </View>
              </View>
              <FormField
                label="Dias de preaviso"
                value={campos.fecha_preaviso}
                onChangeText={(valor) => actualizarCampo('fecha_preaviso', valor)}
                error={errores.fecha_preaviso}
                editable={!formularioBloqueado}
                placeholder="30"
              />
              <FormField
                label="Referencia de expediente"
                value={campos.referencia_expediente}
                onChangeText={(valor) => actualizarCampo('referencia_expediente', valor)}
                error={errores.referencia_expediente}
                editable={!formularioBloqueado}
                maxLength={255}
                placeholder="Res. CD 214/2026"
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
            </View> ) : null}
            {pasoActual === 2 ? (
            <View style={styles.stepFields}>
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
            </View> ) : null}
            {pasoActual === 3 ? (
            <View style={styles.stepFields}>
              <FormField
                label="Número de resolución"
                value={campos.numero_resolucion}
                onChangeText={(valor) => actualizarCampo('numero_resolucion', valor)}
                error={errores.numero_resolucion}
                editable={!formularioBloqueado}
                maxLength={255}
              />
              {!modoEdicion ? (
                <>
                  <SelectField
                    label="Tipo de documento para los próximos archivos"
                    value={String(tipoDocumento.id)}
                    options={tiposDocumento.map((opcion) => ({
                      value: String(opcion.id),
                      label: opcion.nombre,
                    }))}
                    onValueChange={(valor) => {
                      const opcion = tiposDocumento.find(
                        (actual) => String(actual.id) === valor,
                      );
                      if (opcion) setTipoDocumento(opcion);
                    }}
                    disabled={guardando}
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
                </>
              ) : null}
            </View> ) : null}

            {errorEnvio ? <Text style={styles.error}>{errorEnvio}</Text> : null}
            {!modoEdicion && instrumentoCreadoId === null ? (
              <Text style={styles.helper}>El convenio se guardará como borrador.</Text>
            ) : null}

            <View style={styles.stepActions}>
              {pasoActual > 0 ? (
                <Button
                  title="Anterior"
                  variant="outline"
                  onPress={retrocederPaso}
                  disabled={guardando}
                />
              ) : (
                <View style={styles.stepActionSpacer} />
              )}

              {pasoActual < pasos.length - 1 ? (
                <Button
                  title="Siguiente"
                  onPress={avanzarPaso}
                  disabled={guardando}
                />
              ) : (
                <Button
                  title={
                    modoEdicion
                      ? 'Guardar cambios'
                      : instrumentoCreadoId === null
                        ? 'Guardar borrador'
                        : adjuntos.length > 0
                          ? 'Reintentar carga'
                          : 'Ver borrador'
                  }
                  onPress={() => void enviar()}
                  loading={guardando}
                  disabled={
                    modoEdicion
                      ? versionEdicion === null
                      : instrumentoCreadoId === null &&
                        (opciones.tipos.length === 0 || opciones.instituciones.length === 0)
                  }
                />
              )}
            </View> 
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
  stepper: {
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  stepperHeader: {
    gap: spacing.xs,
  },
  stepperCount: {
    ...typography.small,
    color: colors.textMuted,
  },
  stepperTitle: {
    ...typography.label,
    color: colors.primary,
  },
  stepperProgress: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  stepSegment: {
    flex: 1,
    height: 4,
    borderRadius: radius.md,
    backgroundColor: colors.border,
  },
  stepSegmentActive: {
    backgroundColor: colors.primary,
  },
  stepFields: {
    gap: spacing.md,
  },
  stepActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  stepActionSpacer: {
    flex: 1,
  },
  dateFieldsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dateFieldColumn: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
