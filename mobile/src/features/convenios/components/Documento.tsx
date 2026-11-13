import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Check } from 'lucide-react-native';
import type { Documento } from '../Tipos';
import { Seccion } from './Seccion';
import { colores, fechaHora } from './temas';

interface Props {
  documentos: Documento[];
  onAbrir: (doc: Documento) => void; // descarga + visor PDF.js
  onSubir: () => void;
}

export function Documentos({ documentos, onAbrir, onSubir }: Props) {
  return (
    <Seccion
      titulo={`Documentos · ${documentos.length}`}
      derecha={
        <Pressable onPress={onSubir} style={s.botonSubir} accessibilityRole="button">
          <Text style={s.botonSubirTxt}>+ Subir PDF</Text>
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
  );
}

const s = StyleSheet.create({
  botonSubir: { borderColor: colores.azul, borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  botonSubirTxt: { color: colores.azul, fontWeight: '700', fontSize: 12 },
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