import { StyleSheet, Text, View } from 'react-native';
import type { EtapaCircuito } from '../Tipos';
import { Seccion } from './Seccion';
import { colores } from './temas';

const ETAPAS: { clave: EtapaCircuito; etiqueta: string; color: string }[] = [
  { clave: 'borrador', etiqueta: 'Borrador', color: '#7A8398' },
  { clave: 'revision', etiqueta: 'Revisión', color: colores.naranja },
  { clave: 'aprobado', etiqueta: 'Aprobado', color: colores.azul },
  { clave: 'firmado', etiqueta: 'Firmado', color: colores.verde },
];

export function Circuito({ etapaActual, resumen }: { etapaActual: EtapaCircuito; resumen: string }) {
  const indiceActual = ETAPAS.findIndex((e) => e.clave === etapaActual);
  return (
    <Seccion titulo="Circuito">
      <View style={s.fila}>
        {ETAPAS.map((e, i) => (
          <View key={e.clave} style={s.etapa}>
            <View style={[s.barra, { backgroundColor: i <= indiceActual ? e.color : colores.borde }]} />
            <Text style={[s.etiqueta, i === indiceActual && { color: colores.texto, fontWeight: '700' }]}>
              {e.etiqueta}
            </Text>
          </View>
        ))}
      </View>
      <Text style={s.resumen}>{resumen}</Text>
    </Seccion>
  );
}

const s = StyleSheet.create({
  fila: { flexDirection: 'row', gap: 4, marginBottom: 10 },
  etapa: { flex: 1 },
  barra: { height: 4, borderRadius: 2, marginBottom: 6 },
  etiqueta: { fontSize: 11, color: colores.textoSuave },
  resumen: { fontSize: 12, color: colores.textoSuave, lineHeight: 17 },
});