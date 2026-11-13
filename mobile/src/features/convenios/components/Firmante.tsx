import { StyleSheet, Text, View } from 'react-native';
import type { Firmante } from '../Tipos';
import { Seccion } from './Seccion';
import { colores } from './temas';

const iniciales = (nombre: string) =>
  nombre.replace(/[\[\]()]/g, '').split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('');

export function Firmantes({ firmantes }: { firmantes: Firmante[] }) {
  return (
    <Seccion titulo="Firmantes">
      {firmantes.map((f) => (
        <View key={f.id} style={s.fila}>
          <View style={s.avatar}>
            <Text style={s.avatarTxt}>{iniciales(f.nombre)}</Text>
          </View>
          <View style={s.info}>
            <Text style={s.nombre}>
              {f.nombre}
              {f.esUsuarioActual ? ' (vos)' : ''}
            </Text>
            <Text style={s.cargo}>{f.cargo}</Text>
          </View>
          <Text style={[s.estado, { color: f.estado === 'firmado' ? colores.verde : colores.naranja }]}>
            {f.estado === 'firmado' ? 'Firmado' : 'Pendiente'}
          </Text>
        </View>
      ))}
    </Seccion>
  );
}

const s = StyleSheet.create({
  fila: { flexDirection: 'row', alignItems: 'center', paddingVertical: 7, gap: 10 },
  avatar: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: colores.azulClaro,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarTxt: { color: colores.azul, fontWeight: '700', fontSize: 12 },
  info: { flex: 1 },
  nombre: { color: colores.texto, fontSize: 13, fontWeight: '600' },
  cargo: { color: colores.textoSuave, fontSize: 12 },
  estado: { fontSize: 12, fontWeight: '700' },
});