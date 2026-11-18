import { StyleSheet, Text, View } from 'react-native';
import { useTema } from '@/theme';

type Props = {
  name: string; // nombre completo; se usan las iniciales
  size?: number;
  bordered?: boolean; // borde para cuando va sobre un fondo de color
};

// Foto de perfil. Por ahora muestra iniciales; en el paso 4 se suma la imagen.
export function Avatar({ name, size = 40, bordered = false }: Props) {
  const { colors } = useTema();
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join('');

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
      <Text style={{ color: colors.onPrimary, fontSize: size * 0.38, fontWeight: '700' }}>
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
});
