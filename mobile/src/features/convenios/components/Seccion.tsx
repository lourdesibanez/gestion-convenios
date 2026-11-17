import { ReactNode, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useColoresConvenio, type ColoresConvenio } from './temas';
import { useTema } from '@/theme';

export function Seccion({ titulo, derecha, children }: { titulo: string; derecha?: ReactNode; children: ReactNode }) {
  const colores = useColoresConvenio();
  const { fs } = useTema();
  const s = useMemo(() => crearEstilos(colores, fs), [colores, fs]);
  return (
    <View style={s.tarjeta}>
      <View style={s.cabecera}>
        <Text style={s.titulo}>{titulo}</Text>
        {derecha}
      </View>
      {children}
    </View>
  );
}

const crearEstilos = (colores: ColoresConvenio, fs: (tamano: number) => number) =>
  StyleSheet.create({
    tarjeta: {
      backgroundColor: colores.tarjeta,
      borderColor: colores.borde,
      borderWidth: 1,
      borderRadius: 12,
      padding: 14,
      marginBottom: 12,
    },
    cabecera: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    titulo: { color: colores.azul, fontWeight: '700', fontSize: fs(14) },
  });