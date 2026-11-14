import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import { File } from 'expo-file-system';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, CircleHelp, Pencil } from 'lucide-react-native';
import { Circuito } from '@/features/convenios/components/Circuito';
import { ComentariosConvenio } from '@/features/convenios/components/ComentariosConvenio';
import { Datos } from '@/features/convenios/components/Dato';
import { Documentos, type OpcionSubidaDocumento } from '@/features/convenios/components/Documento';
import { Firmantes } from '@/features/convenios/components/Firmante';
import { BotonFirmarConvenio } from '@/features/convenios/components/BotonFirmarConvenio';
import { colores } from '@/features/convenios/components/temas';
import { useConvenio } from '@/features/convenios/hooks/useConvenio';
import { useAuth } from '@/features/auth/context/AuthContext';
import { ApiError } from '@/services/api';
import {
  creacionConvenioService,
  TAMANO_MAXIMO_DOCUMENTO,
  type TipoDocumentoConvenio,
} from '@/features/convenios/services/creacionConvenioService';

export default function FichaConvenio() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { tipoPerfil } = useAuth();
  const { convenio, cargando, error, recargar } = useConvenio(id);
  const [subiendoArchivo, setSubiendoArchivo] = useState(false);
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
            {convenio.puedeEditar ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Editar convenio"
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
            onAbrir={(doc) => {
              /* TODO: descargar a archivo temporal y abrir en el visor PDF.js */
            }}
            onSubir={(tipoDocumento) => void subirArchivo(tipoDocumento)}
            tiposSubida={tiposSubida}
            subiendo={subiendoArchivo}
          />
          <ComentariosConvenio idConvenio={Number(id)} />
        </ScrollView>
      )}
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
  botonEditar: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: colores.azul,
    borderRadius: 8,
  },
  botonEditarTxt: { color: colores.azul, fontWeight: '700' },
  error: { color: colores.rojo, textAlign: 'center', marginBottom: 12 },
  reintentar: { borderColor: colores.azul, borderWidth: 1, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 },
  reintentarTxt: { color: colores.azul, fontWeight: '700' },
});