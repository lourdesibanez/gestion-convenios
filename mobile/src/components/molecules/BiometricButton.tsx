import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { Button } from '@/components/atoms';
import { colors } from '@/theme';

type Props = {
  type: 'fingerprint' | 'face';
  onPress: () => void;
};

const config = {
  fingerprint: { title: 'Huella', icon: 'fingerprint' },
  face: { title: 'Rostro', icon: 'face-recognition' },
} as const;

export function BiometricButton({ type, onPress }: Props) {
  const { title, icon } = config[type];

  return (
    <View style={styles.container}>
      <Button
        title={title}
        variant="outline"
        onPress={onPress}
        icon={<MaterialCommunityIcons name={icon} size={20} color={colors.emphasis} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
