import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ComentariosConvenio } from '@/features/convenios/components/ComentariosConvenio';
import { colors } from '@/theme';

export default function AgreementScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View>
        <Text style={styles.text}>Detalle de convenio.</Text>
      </View>

      <ComentariosConvenio idConvenio={Number(id)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    gap: 16,
    padding: 16,
    backgroundColor: colors.background,
  },
  text: {
    color: colors.text,
    textAlign: 'center',
  },
});