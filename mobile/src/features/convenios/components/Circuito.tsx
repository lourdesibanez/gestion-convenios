import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTema, type Colores } from '@/theme';
import type { EtapaCircuito } from '../Tipos';
import { Seccion } from './Seccion';

const ETAPAS: { clave: EtapaCircuito; etiqueta: string }[] = [
  { clave: 'borrador', etiqueta: 'Borrador' },
  { clave: 'revision', etiqueta: 'Revisión' },
  { clave: 'aprobado', etiqueta: 'Aprobado' },
  { clave: 'firmado', etiqueta: 'Firmado' },
];

export function Circuito({ etapaActual, resumen }: { etapaActual: EtapaCircuito; resumen: string }) {
  const { colors, fs } = useTema();
  const s = useMemo(() => crearEstilos(colors, fs), [colors, fs]);
  const indiceActual = ETAPAS.findIndex((e) => e.clave === etapaActual);

  return (
    <Seccion titulo="Circuito">
      <View style={s.fila}>
        {ETAPAS.map((e, i) => (
          <View key={e.clave} style={s.etapa}>
            {/* Mismo color que el estado en los badges de toda la app */}
            <View
              style={[
                s.barra,
                { backgroundColor: i <= indiceActual ? colors.status[e.clave] : colors.border },
              ]}
            />
            <Text style={[s.etiqueta, i === indiceActual && s.etiquetaActual]}>{e.etiqueta}</Text>
          </View>
        ))}
      </View>
      <Text style={s.resumen}>{resumen}</Text>
    </Seccion>
  );
}

const crearEstilos = (colors: Colores, fs: (tamano: number) => number) =>
  StyleSheet.create({
    fila: { flexDirection: 'row', gap: 4, marginBottom: 10 },
    etapa: { flex: 1 },
    barra: { height: 4, borderRadius: 2, marginBottom: 6 },
    etiqueta: { fontSize: fs(11), color: colors.textMuted },
    etiquetaActual: { color: colors.text, fontWeight: '700' },
    resumen: { fontSize: fs(12), color: colors.textMuted, lineHeight: fs(17) },
  });
