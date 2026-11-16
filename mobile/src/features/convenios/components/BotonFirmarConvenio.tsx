import { Pressable, StyleSheet, Text } from 'react-native';
import { Signature } from 'lucide-react-native';
import { colores } from './temas';

type Props = {
  onPress: () => void;
  motivoDeshabilitado?: string; // si viene, el botón se deshabilita y muestra el motivo
};

export function BotonFirmarConvenio({ onPress, motivoDeshabilitado }: Props) {
  const deshabilitado = Boolean(motivoDeshabilitado);

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Firmar convenio"
        accessibilityState={{ disabled: deshabilitado }}
        accessibilityHint={motivoDeshabilitado}
        disabled={deshabilitado}
        onPress={onPress}
        style={[styles.button, deshabilitado && styles.disabled]}
      >
        <Signature size={20} color="#FFFFFF" />
        <Text style={styles.label}>Firmar convenio</Text>
      </Pressable>
      {motivoDeshabilitado && <Text style={styles.motivo}>{motivoDeshabilitado}</Text>}
    </>
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
    disabled: {
    opacity: 0.5,
  },
  motivo: {
    marginTop: -4,
    marginBottom: 12,
    color: colores.textoSuave,
    fontSize: 13,
    textAlign: 'center',
  },

});
