import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Check } from 'lucide-react-native';
import type { Documento } from '../Tipos';
import type { TipoDocumentoConvenio } from '../services/creacionConvenioService';
import { Seccion } from './Seccion';
import { colores, fechaHora } from './temas';

export type OpcionSubidaDocumento = {
  tipo: TipoDocumentoConvenio;
  etiqueta: string;
};

interface Props {
  documentos: Documento[];
  onAbrir: (doc: Documento) => void; // descarga + visor PDF.js
  onSubir: (tipo: TipoDocumentoConvenio) => void;
  tiposSubida: OpcionSubidaDocumento[];
  subiendo?: boolean;
}

export function Documentos({
  documentos,
  onAbrir,
  onSubir,
  tiposSubida,
  subiendo = false,
}: Props) {
  const [selectorAbierto, setSelectorAbierto] = useState(false);

  return (
    <>
      <Seccion
        titulo={`Documentos · ${documentos.length}`}
        derecha={
          <Pressable
            onPress={() => setSelectorAbierto(true)}
            style={[s.botonSubir, subiendo && s.botonDeshabilitado]}
            accessibilityRole="button"
            accessibilityState={{ disabled: subiendo }}
            disabled={subiendo}
          >
            <Text style={s.botonSubirTxt}>{subiendo ? 'Subiendo…' : '+ Subir PDF'}</Text>
          </Pressable>
        }
      >
        {documentos.map((d) => (
          <Pressable key={d.id} onPress={() => onAbrir(d)} style={s.fila} accessibilityRole="button">
            <View style={s.icono}>
              <Text style={s.iconoTxt}>PDF</Text>
            </View>
            <View style={s.info}>
              <Text style={s.nombre}>{d.nombre}</Text>
              <Text style={s.detalle}>{d.descripcion}</Text>
              {d.selladoPor && d.selladoEn && (
                <Text style={s.sello}>
                  <Check size={11} /> Sellado por la app · {d.selladoPor} · {fechaHora(d.selladoEn)}
                </Text>
              )}
            </View>
          </Pressable>
        ))}
      </Seccion>
      <Modal
        visible={selectorAbierto}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectorAbierto(false)}
      >
        <View style={s.modalFondo}>
          <View style={s.modal}>
            <Text style={s.modalTitulo}>Tipo de documento</Text>
            {tiposSubida.map((opcion) => (
              <Pressable
                key={opcion.tipo}
                accessibilityRole="button"
                onPress={() => {
                  setSelectorAbierto(false);
                  onSubir(opcion.tipo);
                }}
                style={s.opcion}
              >
                <Text style={s.opcionTexto}>{opcion.etiqueta}</Text>
              </Pressable>
            ))}
            <Pressable
              accessibilityRole="button"
              onPress={() => setSelectorAbierto(false)}
              style={s.opcion}
            >
              <Text style={s.cancelar}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const s = StyleSheet.create({
  botonSubir: { borderColor: colores.azul, borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  botonDeshabilitado: { opacity: 0.5 },
  botonSubirTxt: { color: colores.azul, fontWeight: '700', fontSize: 12 },
  modalFondo: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: 'rgba(0, 0, 0, 0.4)' },
  modal: { backgroundColor: colores.fondo, borderRadius: 14, padding: 16 },
  modalTitulo: { color: colores.texto, fontWeight: '800', fontSize: 16, marginBottom: 8 },
  opcion: { minHeight: 48, justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: colores.borde },
  opcionTexto: { color: colores.texto, fontWeight: '600', fontSize: 15 },
  cancelar: { color: colores.azul, fontWeight: '700', fontSize: 15 },
  fila: {
    flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, marginTop: 6,
    borderRadius: 10, borderWidth: 1, borderColor: colores.borde, backgroundColor: '#FAFBFD',
  },
  icono: { backgroundColor: colores.rojoClaro, borderRadius: 6, paddingVertical: 8, paddingHorizontal: 6 },
  iconoTxt: { color: colores.pdf, fontWeight: '800', fontSize: 10 },
  info: { flex: 1 },
  nombre: { color: colores.texto, fontWeight: '700', fontSize: 13 },
  detalle: { color: colores.textoSuave, fontSize: 12 },
  sello: { color: colores.verde, fontSize: 11, marginTop: 2 },
});