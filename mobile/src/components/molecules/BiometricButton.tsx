import { useMemo } from 'react';
import { Fingerprint, ScanFace } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { Button } from '@/components/atoms';
import { useTema, type Colores } from '@/theme';
import type { BiometricType } from '@/services/biometrics';

type Props = {
  type: BiometricType;
  onPress: () => void;
};

export function BiometricButton({ type, onPress }: Props) {
  const { colors } = useTema();
  const styles = useMemo(() => crearEstilos(colors), [colors]);
  return (
    <View style={styles.container}>
      <Button
        title={type === 'facial' ? 'Rostro' : 'Huella'}
        variant="outline"
        onPress={onPress}
        icon={
          type === 'facial' ? (
            <ScanFace size={20} color={colors.primary} />
          ) : (
            <Fingerprint size={20} color={colors.primary} />
          )
        }
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
