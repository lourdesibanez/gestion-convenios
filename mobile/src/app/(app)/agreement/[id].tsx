import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, Share, StyleSheet, Text, View, RefreshControl } from 'react-native';
import { useState, useMemo } from 'react';
import { File, type File as ExpoFile } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowDownToLine, EllipsisVertical, Pencil, Send, Share as ShareIcon, Trash2 } from 'lucide-react-native';
import { Circuito } from '@/features/convenios/components/Circuito';
import { ComentariosConvenio } from '@/features/convenios/components/ComentariosConvenio';
import { Datos } from '@/features/convenios/components/Dato';
import { Documentos, type OpcionSubidaDocumento } from '@/features/convenios/components/Documento';
import { Firmantes } from '@/features/convenios/components/Firmante';
import { BotonFirmarConvenio } from '@/features/convenios/components/BotonFirmarConvenio';
import { useColoresConvenio, type ColoresConvenio } from '@/features/convenios/components/temas';
import { spacing, useTema } from '@/theme';
import { useConvenio } from '@/features/convenios/hooks/useConvenio';
import { conveniosService } from '@/features/convenios/services/convenioService';
import { busquedaService } from '@/features/busqueda/services/busquedaService';
import { PdfJsViewer } from '@/features/firma/pdfViewer/PdfJsViewer';
import { useAuth } from '@/features/auth/context/AuthContext';
import { ApiError } from '@/services/api';
import { creacionConvenioService, TAMANO_MAXIMO_DOCUMENTO, type TipoDocumentoConvenio } from '@/features/convenios/services/creacionConvenioService';
import {
  BotonFlotante,
  HeaderBack,
  HojaAcciones,
  OfflineBanner,
  type AccionHoja,
} from '@/components/molecules';
import { useOffline } from '@/services/useOffline';
import { EstadoBadge } from '@/components/atoms';
import { BotonAyuda } from '@/features/ayuda/components/BotonAyuda';

export default function FichaConvenio() {
  const colores = useColoresConvenio();
  const { fs } = useTema();
  const s = useMemo(() => crearEstilos(colores, fs), [colores, fs]);
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { tipoPerfil } = useAuth();
  const { convenio, cargando, error, recargar } = useConvenio(id);
  const [subiendoArchivo, setSubiendoArchivo] = useState(false);
  const [enviandoARevision, setEnviandoARevision] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [descargandoDocumentoId, setDescargandoDocumentoId] = useState<number | null>(null);
  const [pdfDescargado, setPdfDescargado] = useState<{ archivo: ExpoFile; nombre: string; descripcion: string } | null>(null);
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
  const offline = useOffline();
  const [refreshing, setRefreshing] = useState(false);
  const [claveComentarios, setClaveComentarios] = useState(0);
  // Sin permiso (o sin conexión) el botón no se muestra.
  const mostrarEnviarARevision =
    !!convenio?.puedeEnviarRevision && !esPerfilConsulta && !offline;
  const puedeSubir = !!convenio?.puedeSubirArchivo && !offline;

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

  const abrirDocumento = async (documento: { id: number; nombre: string; descripcion: string }) => {
    if (offline) {
      Alert.alert('Sin conexión', 'Para abrir documentos necesitás conexión.');
      return;
    }

    if (descargandoDocumentoId !== null) return;

    setDescargandoDocumentoId(documento.id);
    try {
      const archivo = await busquedaService.descargarPdf(documento.id);
      setPdfDescargado({ archivo, nombre: documento.nombre, descripcion: documento.descripcion });
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

  const compartirConvenio = async () => {
    if (!convenio) return;
    try {
      await Share.share({
        message: `${convenio.titulo}\n${convenio.expediente} · ${convenio.unidadAcademica}\nEstado: ${convenio.estado}`,
      });
    } catch {
      Alert.alert('No se pudo compartir', 'Intentá nuevamente.');
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

  // Cada opción aparece solo si el usuario tiene permiso para hacerla.
  const accionesMenu: AccionHoja[] = convenio
    ? [
        ...(convenio.puedeEditar
          ? [{
              clave: 'editar',
              etiqueta: 'Editar datos',
              icono: (color: string) => <Pencil size={20} color={color} />,
              onPress: () =>
                router.push({ pathname: '/agreement/create', params: { id: String(convenio.id) } }),
            }]
          : []),
        {
          clave: 'compartir',
          etiqueta: 'Compartir',
          icono: (color: string) => <ShareIcon size={20} color={color} />,
          onPress: () => void compartirConvenio(),
        },
        ...(convenio.puedeEliminar
          ? [{
              clave: 'eliminar',
              etiqueta: 'Eliminar borrador',
              ayuda: 'Solo se puede mientras esté en Borrador',
              peligro: true,
              icono: (color: string) => <Trash2 size={20} color={color} />,
              onPress: confirmarEliminacion,
            }]
          : []),
      ]
    : [];

  const mostrarMenu = !cargando && !!convenio && puedeVerConvenio;

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await recargar();
      setClaveComentarios((actual) => actual + 1);
    } finally {
      setRefreshing(false);
    }
  };
  return (
  <SafeAreaView style={s.pantalla} edges={['top']}>
    <HeaderBack
      titulo="Detalle del convenio"
      acciones={
        <>
          <BotonAyuda seccion="ficha" color={colores.azul} />
          {mostrarMenu ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Más acciones"
              hitSlop={8}
              disabled={eliminando || enviandoARevision}
              onPress={() => setMenuAbierto(true)}
            >
              <EllipsisVertical size={22} color={colores.texto} />
            </Pressable>
          ) : null}
        </>
      }
    />
    <OfflineBanner />

    {cargando && !convenio && (
      <ActivityIndicator style={s.centro} size="large" color={colores.azul} />
    )}

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

    {convenio && puedeVerConvenio && (
      <ScrollView
        contentContainerStyle={[s.contenido, mostrarEnviarARevision && s.contenidoConBoton]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colores.azul]}
          />
        }
      >
        <View style={s.encabezado}>
          <View style={s.etiquetas}>
            <Text style={s.tipo}>{convenio.tipoInstrumento}</Text>
            <EstadoBadge estado={convenio.estado} />
          </View>
          <Text style={s.titulo}>{convenio.titulo}</Text>
          <Text style={s.expediente}>
            {convenio.expediente} · {convenio.unidadAcademica}
          </Text>
        </View>

        <Circuito etapaActual={convenio.etapaActual} resumen={convenio.resumenCircuito} />
        {!esPerfilConsulta && convenio.etapaActual === 'aprobado' && convenio.puedeFirmar && (
          <BotonFirmarConvenio
            motivoDeshabilitado={offline ? 'Para firmar necesitás conexión.' : undefined}
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
          puedeSubir={puedeSubir}
          subiendo={subiendoArchivo}
        />
        <ComentariosConvenio key={claveComentarios} idConvenio={Number(id)} />
      </ScrollView>
    )}

    {convenio && puedeVerConvenio && mostrarEnviarARevision && (
      <BotonFlotante
        titulo={enviandoARevision ? 'Enviando...' : 'Enviar a revisión'}
        accessibilityLabel="Enviar convenio a revisión"
        icono={(color) => <Send size={20} color={color} />}
        disabled={enviandoARevision || eliminando}
        onPress={confirmarEnvioARevision}
        style={{ bottom: spacing.lg + insets.bottom }}
      />
    )}

    <HojaAcciones
      visible={menuAbierto}
      subtitulo={convenio ? `${convenio.expediente} · ${convenio.estado}` : undefined}
      acciones={accionesMenu}
      onCerrar={() => setMenuAbierto(false)}
    />

    <Modal
      animationType="slide"
      onRequestClose={() => setPdfDescargado(null)}
      visible={pdfDescargado !== null}
    >
      <SafeAreaView style={s.pdfModal}>
        <HeaderBack
          titulo={pdfDescargado?.nombre}
          subtitulo={pdfDescargado?.descripcion}
          onVolver={() => setPdfDescargado(null)}
          acciones={
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Guardar o compartir documento"
              hitSlop={8}
              onPress={() => void compartirDocumento()}
            >
              <ArrowDownToLine size={22} color={colores.azul} />
            </Pressable>
          }
        />
        {pdfDescargado ? <PdfJsViewer file={pdfDescargado.archivo} /> : null}
      </SafeAreaView>
    </Modal>
  </SafeAreaView>
);
}
const crearEstilos = (colores: ColoresConvenio, fs: (tamano: number) => number) =>
  StyleSheet.create({
    pantalla: { flex: 1, backgroundColor: colores.fondo },
    contenido: { padding: 16, paddingTop: 4 },
    // Espacio para que el botón flotante no tape lo último de la lista.
    contenidoConBoton: { paddingBottom: 100 },
    centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
    encabezado: { marginBottom: 14 },
    etiquetas: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
    tipo: { color: colores.azul, fontWeight: '700', fontSize: fs(12) },
    titulo: { color: colores.texto, fontSize: fs(22), fontWeight: '800', lineHeight: fs(28) },
    expediente: { color: colores.textoSuave, fontSize: fs(12), marginTop: 4 },
    pdfModal: { flex: 1, backgroundColor: colores.fondo },
    error: { color: colores.rojo, textAlign: 'center', marginBottom: 12 },
    reintentar: { borderColor: colores.azul, borderWidth: 1, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 },
    reintentarTxt: { color: colores.azul, fontWeight: '700' },
  });
