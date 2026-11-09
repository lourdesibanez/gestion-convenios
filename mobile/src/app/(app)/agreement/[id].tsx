import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme';

export default function AgreementScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Detalle de convenio.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.background,
  },
  text: {
    color: colors.text,
    textAlign: 'center',
  },
});