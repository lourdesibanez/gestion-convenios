import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ConvenioDetalle } from '../Tipos';
import { Seccion } from './Seccion';
import { colores, fechaCorta } from './temas';

function Fila({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <View style={s.fila}>
      <Text style={s.etiqueta}>{etiqueta}</Text>
      {children}
    </View>
  );
}

export function Datos({ c, onAbrirPadre }: { c: ConvenioDetalle; onAbrirPadre: (id: number) => void }) {
  return (
    <Seccion titulo="Datos">
      <Fila etiqueta="Procedencia">
        <Text style={s.valor}>{c.procedencia}</Text>
      </Fila>
      {c.convenioPadre && (
        <Fila etiqueta="Convenio padre">
          <Pressable onPress={() => onAbrirPadre(c.convenioPadre!.id)} accessibilityRole="link">
            <Text style={[s.valor, { color: colores.azul }]}>{c.convenioPadre.codigo}</Text>
          </Pressable>
        </Fila>
      )}
      <Fila etiqueta="Inicio">
        <Text style={s.valor}>{fechaCorta(c.inicio)}</Text>
      </Fila>
      <Fila etiqueta="Vencimiento">
        <Text style={s.valor}>{fechaCorta(c.vencimiento)}</Text>
      </Fila>
      <Fila etiqueta="Preaviso">
        <Text style={[s.valor, { color: colores.naranja }]}>
          {fechaCorta(c.preaviso)} · {c.diasParaPreaviso} días
        </Text>
      </Fila>
    </Seccion>
  );
}

const s = StyleSheet.create({
  fila: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 7 },
  etiqueta: { color: colores.textoSuave, fontSize: 13 },
  valor: { color: colores.texto, fontSize: 13, fontWeight: '700', flexShrink: 1, textAlign: 'right', marginLeft: 12 },
});