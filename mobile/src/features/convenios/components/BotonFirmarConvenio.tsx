import { Pressable, StyleSheet, Text } from 'react-native';
import { Signature } from 'lucide-react-native';
import { colores } from './temas';

type Props = {
  onPress: () => void;
};

export function BotonFirmarConvenio({ onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Firmar convenio"
      onPress={onPress}
      style={styles.button}
    >
      <Signature size={20} color="#FFFFFF" />
      <Text style={styles.label}>Firmar convenio</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: colores.azul,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
