import { useMemo } from 'react';
import { Fingerprint } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { Button } from '@/components/atoms';
import { useTema, type Colores } from '@/theme';

type Props = {
  type: 'fingerprint';
  onPress: () => void;
};

export function BiometricButton({ type, onPress }: Props) {
  const { colors } = useTema();
  const styles = useMemo(() => crearEstilos(colors), [colors]);
  return (
    <View style={styles.container}>
      <Button
        title="Huella"
        variant="outline"
        onPress={onPress}
        icon={<Fingerprint size={20} color={colors.primary} />}
      />
    </View>
  );
}

const crearEstilos = (colors: Colores) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
  });
