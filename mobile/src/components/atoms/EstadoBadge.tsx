import { StyleSheet, Text, View } from 'react-native';
import { useTema, type Colores } from '@/theme';

type ClaveEstado = keyof Colores['status'];

// Minúsculas y sin tildes, para comparar ("Revisión" → "revision").
function normalizar(estado: string) {
  return estado
    .trim()
    .toLocaleLowerCase('es-AR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

// Color del estado según la paleta del tema. Si no se reconoce, gris.
export function colorEstado(colors: Colores, estado: string): string {
  const clave = normalizar(estado);
  const encontrado = (Object.keys(colors.status) as ClaveEstado[]).find((k) => clave.includes(k));
  return encontrado ? colors.status[encontrado] : colors.textMuted;
}

// Primera letra en mayúscula: "firmado" → "Firmado", "en_revision" → "En revision".
export function formatearEstado(estado: string): string {
  const texto = estado.trim().replace(/_/g, ' ');
  return texto.charAt(0).toLocaleUpperCase('es-AR') + texto.slice(1);
}

// Etiqueta de estado: mismo color y formato en toda la app.
export function EstadoBadge({ estado }: { estado: string }) {
  const { colors, fs } = useTema();
  const color = colorEstado(colors, estado);

  return (
    <View style={[styles.badge, { backgroundColor: `${color}1F` }]}>
      <Text style={[styles.texto, { color, fontSize: fs(12) }]}>{formatearEstado(estado)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', borderRadius: 16, paddingHorizontal: 8, paddingVertical: 4 },
  texto: { fontWeight: '600' },
});
