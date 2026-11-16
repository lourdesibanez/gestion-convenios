import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useState } from 'react';
import { File, type File as ExpoFile } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, CircleHelp, Pencil, Share2, Trash2, X } from 'lucide-react-native';
import { Circuito } from '@/features/convenios/components/Circuito';
import { ComentariosConvenio } from '@/features/convenios/components/ComentariosConvenio';
import { Datos } from '@/features/convenios/components/Dato';
import { Documentos, type OpcionSubidaDocumento } from '@/features/convenios/components/Documento';
import { Firmantes } from '@/features/convenios/components/Firmante';
import { BotonFirmarConvenio } from '@/features/convenios/components/BotonFirmarConvenio';
import { colores } from '@/features/convenios/components/temas';
import { useConvenio } from '@/features/convenios/hooks/useConvenio';
import { conveniosService } from '@/features/convenios/services/convenioService';
import { busquedaService } from '@/features/busqueda/services/busquedaService';
import { PdfJsViewer } from '@/features/firma/pdfViewer/PdfJsViewer';
import { useAuth } from '@/features/auth/context/AuthContext';
import { ApiError } from '@/services/api';
import {
  creacionConvenioService,
  TAMANO_MAXIMO_DOCUMENTO,
  type TipoDocumentoConvenio,
} from '@/features/convenios/services/creacionConvenioService';
import { OfflineBanner } from '@/components/molecules';

export default function FichaConvenio() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { tipoPerfil } = useAuth();
  const { convenio, cargando, error, recargar } = useConvenio(id);
  const [subiendoArchivo, setSubiendoArchivo] = useState(false);
  const [enviandoARevision, setEnviandoARevision] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [descargandoDocumentoId, setDescargandoDocumentoId] = useState<number | null>(null);
  const [pdfDescargado, setPdfDescargado] = useState<{ archivo: ExpoFile; nombre: string } | null>(null);
  const esPerfilConsulta =
    tipoPerfil?.trim().toLocaleLowerCase('es-AR') === 'consulta';
  const puedeVerConvenio =
    !esPerfilConsulta ||
    convenio?.estado.trim().toLocaleLowerCase('es-AR') === 'firmado';
  const tiposSubida: OpcionSubidaDocumento[] = [
    { tipo: 'resolucion', etiqueta: 'Resolución' },
    { tipo: 'borrador', etiqueta: 'Borrador' },
    { tipo: 'anexo', etiqueta: 'Anexo' },
    ...(convenio?.estado.trim().toLocaleLowerCase('es-AR').includes('aprobado')
      ? [{ tipo: 'convenio_aprobado' as const, etiqueta: 'Convenio aprobado' }]
      : []),
  ];

  const subirArchivo = async (tipoDocumento: TipoDocumentoConvenio) => {
    if (!convenio || subiendoArchivo) return;

    setSubiendoArchivo(true);
    try {
      const resultado = await File.pickFileAsync({ mimeTypes: ['application/pdf'] });
      if (resultado.canceled) return;

      const archivo = resultado.result;
      const esPdf =
        archivo.type === 'application/pdf' || archivo.name.toLocaleLowerCase().endsWith('.pdf');
      if (!esPdf) {
        Alert.alert('Archivo no válido', 'Seleccioná un archivo PDF.');
        return;
      }
      if (archivo.size > TAMANO_MAXIMO_DOCUMENTO) {
        Alert.alert('Archivo demasiado grande', 'El tamaño máximo permitido es 20 MB.');
        return;
      }

      await creacionConvenioService.subirDocumento(convenio.id, tipoDocumento, archivo);
      await recargar();
      Alert.alert('Archivo cargado', 'El documento se adjuntó al convenio.');
    } catch (cause) {
      const mensaje =
        cause instanceof ApiError && cause.status === 403
          ? 'Tu perfil no tiene permiso para subir archivos a este convenio.'
          : cause instanceof Error
            ? cause.message
            : 'No se pudo cargar el archivo. Intentá nuevamente.';
      Alert.alert('No se pudo subir el archivo', mensaje);
    } finally {
      setSubiendoArchivo(false);
    }
  };

  const abrirDocumento = async (documento: { id: number; nombre: string }) => {
    if (descargandoDocumentoId !== null) return;

    setDescargandoDocumentoId(documento.id);
    try {
      const archivo = await busquedaService.descargarPdf(documento.id);
      setPdfDescargado({ archivo, nombre: documento.nombre });
    } catch (cause) {
      Alert.alert(
        'No se pudo descargar el documento',
        cause instanceof Error ? cause.message : 'Intentá nuevamente.',
      );
    } finally {
      setDescargandoDocumentoId(null);
    }
  };

  const compartirDocumento = async () => {
    if (!pdfDescargado) return;

    try {
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert('Guardar no disponible', 'Este dispositivo no ofrece opciones para guardar o compartir el PDF.');
        return;
      }

      await Sharing.shareAsync(pdfDescargado.archivo.uri, {
        mimeType: 'application/pdf',
        dialogTitle: `Guardar o compartir ${pdfDescargado.nombre}`,
      });
    } catch (cause) {
      Alert.alert(
        'No se pudo compartir el documento',
        cause instanceof Error ? cause.message : 'Intentá nuevamente.',
      );
    }
  };

  const enviarARevision = async () => {
    if (!convenio || enviandoARevision) return;

    setEnviandoARevision(true);
    try {
      await conveniosService.enviarARevision(convenio.id);
      await recargar();
      Alert.alert('Convenio enviado', 'El convenio pasó a revisión.');
    } catch (cause) {
      const mensaje =
        cause instanceof ApiError && cause.status === 403
          ? 'Tu perfil no tiene permiso para enviar este convenio a revisión.'
          : cause instanceof Error
            ? cause.message
            : 'No se pudo enviar el convenio a revisión. Intentá nuevamente.';
      Alert.alert('No se pudo enviar a revisión', mensaje);
    } finally {
      setEnviandoARevision(false);
    }
  };

  const confirmarEnvioARevision = () =>
    Alert.alert(
      'Enviar a revisión',
      'El convenio dejará de estar en borrador. ¿Querés continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Enviar', onPress: () => void enviarARevision() },
      ],
    );

  const eliminarBorrador = async () => {
    if (!convenio || eliminando || enviandoARevision) return;

    setEliminando(true);
    try {
      await conveniosService.eliminarBorrador(convenio.id);
      Alert.alert('Borrador eliminado', 'El convenio se eliminó.', [
        { text: 'Aceptar', onPress: () => router.back() },
      ]);
    } catch (cause) {
      const mensaje =
        cause instanceof ApiError && cause.status === 403
          ? 'No tenés permiso para eliminar este borrador.'
          : cause instanceof Error
            ? cause.message
            : 'No se pudo eliminar el borrador. Intentá nuevamente.';
      Alert.alert('No se pudo eliminar', mensaje);
    } finally {
      setEliminando(false);
    }
  };

  const confirmarEliminacion = () =>
    Alert.alert(
      'Eliminar borrador',
      'El borrador se quitará de la lista de convenios. ¿Querés continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => void eliminarBorrador() },
      ],
    );

  return (
    <SafeAreaView style={s.pantalla} edges={['top']}>
      <View style={s.barra}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Volver"
        >
          <ChevronLeft size={24} color={colores.texto} />
        </Pressable>
        <Pressable
          onPress={() => Alert.alert('Ayuda', 'Acá ves el estado, los firmantes y los documentos del convenio.')}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Ayuda"
        >
          <CircleHelp size={24} color={colores.azul} />
        </Pressable>
      </View>
      <OfflineBanner />

      {cargando && <ActivityIndicator style={s.centro} size="large" color={colores.azul} />}

      {!cargando && error && (
        <View style={s.centro}>
          <Text style={s.error}>{error}</Text>
          <Pressable onPress={recargar} style={s.reintentar}>
            <Text style={s.reintentarTxt}>Reintentar</Text>
          </Pressable>
        </View>
      )}

      {!cargando && convenio && !puedeVerConvenio && (
        <View style={s.centro}>
          <Text style={s.error}>Tu perfil solo permite ver convenios firmados.</Text>
        </View>
      )}

      {!cargando && convenio && puedeVerConvenio && (
        <ScrollView contentContainerStyle={s.contenido}>
          <View style={s.encabezado}>
            <View style={s.etiquetas}>
              <Text style={s.tipo}>{convenio.tipoInstrumento}</Text>
              <View style={s.estado}>
                <Text style={s.estadoTxt}>{convenio.estado}</Text>
              </View>
            </View>
            <Text style={s.titulo}>{convenio.titulo}</Text>
            <Text style={s.expediente}>
              {convenio.expediente} · {convenio.unidadAcademica}
            </Text>
            {convenio.puedeEditar || convenio.puedeEnviarRevision || convenio.puedeEliminar ? (
              <View style={s.accionesConvenio}>
                {convenio.puedeEditar ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Editar convenio"
                    disabled={eliminando || enviandoARevision}
                    onPress={() =>
                      router.push({
                        pathname: '/agreement/create',
                        params: { id: String(convenio.id) },
                      })
                    }
                    style={s.botonEditar}
                  >
                    <Pencil size={18} color={colores.azul} />
                    <Text style={s.botonEditarTxt}>Editar convenio</Text>
                  </Pressable>
                ) : null}
                {convenio.puedeEnviarRevision ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Enviar convenio a revisión"
                    accessibilityState={{ disabled: enviandoARevision || eliminando }}
                    disabled={enviandoARevision || eliminando}
                    onPress={confirmarEnvioARevision}
                    style={[
                      s.botonRevision,
                      (enviandoARevision || eliminando) && s.botonDeshabilitado,
                    ]}
                  >
                    <Text style={s.botonRevisionTxt}>
                      {enviandoARevision ? 'Enviando...' : 'Enviar a revisión'}
                    </Text>
                  </Pressable>
                ) : null}
                {convenio.puedeEliminar ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Eliminar borrador"
                    accessibilityState={{ disabled: eliminando || enviandoARevision }}
                    disabled={eliminando || enviandoARevision}
                    onPress={confirmarEliminacion}
                    style={[s.botonEliminar, (eliminando || enviandoARevision) && s.botonDeshabilitado]}
                  >
                    <Trash2 size={16} color={colores.rojo} />
                    <Text style={s.botonEliminarTxt}>
                      {eliminando ? 'Eliminando...' : 'Eliminar borrador'}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            ) : null}
          </View>

          <Circuito etapaActual={convenio.etapaActual} resumen={convenio.resumenCircuito} />
          {!esPerfilConsulta && convenio.etapaActual === 'aprobado' && convenio.puedeFirmar && (
            <BotonFirmarConvenio
              onPress={() =>
                router.push({
                  pathname: '/signature/[id]',
                  params: {
                    id: String(convenio.id),
                    titulo: convenio.titulo,
                    codigo: convenio.codigo,
                  },
                })
              }
            />
          )}
          <Datos
            c={convenio}
            onAbrirPadre={(padreId) =>
              router.push({
                pathname: '/agreement/[id]',
                params: { id: String(padreId) },
              })
            }
          />
          <Firmantes firmantes={convenio.firmantes} />
          <Documentos
            documentos={convenio.documentos}
            onAbrir={(doc) => void abrirDocumento(doc)}
            onSubir={(tipoDocumento) => void subirArchivo(tipoDocumento)}
            descargandoDocumentoId={descargandoDocumentoId}
            tiposSubida={tiposSubida}
            puedeSubir={convenio.puedeSubirArchivo}
            subiendo={subiendoArchivo}
          />
          <ComentariosConvenio idConvenio={Number(id)} />
        </ScrollView>
      )}
      <Modal
        animationType="slide"
        onRequestClose={() => setPdfDescargado(null)}
        visible={pdfDescargado !== null}
      >
        <SafeAreaView style={s.pdfModal}>
          <View style={s.pdfHeader}>
            <Text numberOfLines={1} style={s.pdfTitulo}>
              {pdfDescargado?.nombre}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Guardar o compartir documento"
              hitSlop={8}
              onPress={() => void compartirDocumento()}
              style={s.pdfAccion}
            >
              <Share2 size={20} color={colores.azul} />
              <Text style={s.pdfGuardarTxt}>Guardar</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cerrar documento"
              hitSlop={8}
              onPress={() => setPdfDescargado(null)}
              style={s.pdfAccion}
            >
              <X size={22} color={colores.textoSuave} />
            </Pressable>
          </View>
          {pdfDescargado ? <PdfJsViewer file={pdfDescargado.archivo} /> : null}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
  barra: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8 },
  contenido: { padding: 16, paddingTop: 4 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  encabezado: { marginBottom: 14 },
  etiquetas: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  tipo: { color: colores.azul, fontWeight: '700', fontSize: 12 },
  estado: { backgroundColor: colores.azulClaro, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  estadoTxt: { color: colores.azul, fontSize: 11, fontWeight: '700' },
  titulo: { color: colores.texto, fontSize: 22, fontWeight: '800', lineHeight: 28 },
  expediente: { color: colores.textoSuave, fontSize: 12, marginTop: 4 },
  accionesConvenio: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  botonEditar: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colores.azul,
    borderRadius: 10,
  },
  botonEditarTxt: { color: colores.azul, fontWeight: '700' },
  botonRevision: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: colores.azul,
  },
  botonDeshabilitado: { opacity: 0.6 },
  botonRevisionTxt: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  botonEliminar: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colores.rojo,
    borderRadius: 10,
    backgroundColor: colores.rojoClaro,
  },
  botonEliminarTxt: { color: colores.rojo, fontSize: 14, fontWeight: '700' },
  pdfModal: { flex: 1, backgroundColor: colores.fondo },
  pdfHeader: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colores.borde,
    backgroundColor: colores.tarjeta,
  },
  pdfTitulo: { flex: 1, color: colores.texto, fontSize: 16, fontWeight: '700' },
  pdfAccion: { flexDirection: 'row', alignItems: 'center', gap: 5, padding: 4 },
  pdfGuardarTxt: { color: colores.azul, fontSize: 13, fontWeight: '700' },
  error: { color: colores.rojo, textAlign: 'center', marginBottom: 12 },
  reintentar: { borderColor: colores.azul, borderWidth: 1, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 },
  reintentarTxt: { color: colores.azul, fontWeight: '700' },
});