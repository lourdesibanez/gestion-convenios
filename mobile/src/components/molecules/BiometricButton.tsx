import { Fingerprint } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { Button } from '@/components/atoms';
import { colors } from '@/theme';

type Props = {
  type: 'fingerprint';
  onPress: () => void;
};

export function BiometricButton({ type, onPress }: Props) {
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
