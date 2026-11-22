import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useTema } from '@/theme';

type Props = {
  name: string; // nombre completo; se usan las iniciales
  uri?: string | null; // foto; si falta o no carga, se muestran las iniciales
  size?: number;
  bordered?: boolean; // borde para cuando va sobre un fondo de color
};

// Foto de perfil: muestra la imagen si existe y, si no, las iniciales.
export function Avatar({ name, uri, size = 40, bordered = false }: Props) {
  const { colors } = useTema();
  const [fallo, setFallo] = useState(false);

  // Si cambia la foto, se vuelve a intentar cargarla.
  useEffect(() => setFallo(false), [uri]);

  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join('');

  const mostrarFoto = !!uri && !fallo;

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={`Foto de perfil de ${name}`}
      style={[
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.secondary,
        },
        bordered && { borderWidth: 3, borderColor: colors.onPrimary },
      ]}
    >
      {mostrarFoto ? (
        <Image source={{ uri }} style={styles.foto} onError={() => setFallo(true)} />
      ) : (
        <Text style={{ color: colors.onPrimary, fontSize: size * 0.38, fontWeight: '700' }}>
          {initials}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  foto: { width: '100%', height: '100%' },
});