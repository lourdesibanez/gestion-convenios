import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, CircleHelp } from 'lucide-react-native';
import { Circuito } from '@/features/convenios/components/Circuito';
import { ComentariosConvenio } from '@/features/convenios/components/ComentariosConvenio';
import { Datos } from '@/features/convenios/components/Dato';
import { Documentos } from '@/features/convenios/components/Documento';
import { Firmantes } from '@/features/convenios/components/Firmante';
import { BotonFirmarConvenio } from '@/features/convenios/components/BotonFirmarConvenio';
import { colores } from '@/features/convenios/components/temas';
import { useConvenio } from '@/features/convenios/hooks/useConvenio';
import { useAuth } from '@/features/auth/context/AuthContext';

export default function FichaConvenio() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { tipoPerfil } = useAuth();
  const { convenio, cargando, error, recargar } = useConvenio(id);
  const esPerfilConsulta =
    tipoPerfil?.trim().toLocaleLowerCase('es-AR') === 'consulta';
  const puedeVerConvenio =
    !esPerfilConsulta ||
    convenio?.estado.trim().toLocaleLowerCase('es-AR') === 'firmado';

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
            onSubir={() => {
              /* TODO: expo-document-picker + subida */
            }}
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
  error: { color: colores.rojo, textAlign: 'center', marginBottom: 12 },
  reintentar: { borderColor: colores.azul, borderWidth: 1, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 },
  reintentarTxt: { color: colores.azul, fontWeight: '700' },
});