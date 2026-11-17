import { useMemo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Signature } from 'lucide-react-native';
import { useTema } from '@/theme';
import { useColoresConvenio, type ColoresConvenio } from './temas';

type Props = {
  onPress: () => void;
  motivoDeshabilitado?: string; // si viene, el botón se deshabilita y muestra el motivo
};

export function BotonFirmarConvenio({ onPress, motivoDeshabilitado }: Props) {
  const colores = useColoresConvenio();
  const { fs } = useTema();
  const styles = useMemo(() => crearEstilos(colores, fs), [colores, fs]);
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
        <Signature size={20} color={colores.sobreAzul} />
        <Text style={styles.label}>Firmar convenio</Text>
      </Pressable>
      {motivoDeshabilitado && <Text style={styles.motivo}>{motivoDeshabilitado}</Text>}
    </>
  );
}


const crearEstilos = (colores: ColoresConvenio, fs: (tamano: number) => number) =>
  StyleSheet.create({
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
      color: colores.sobreAzul,
      fontSize: fs(15),
      fontWeight: '700',
    },
      disabled: {
      opacity: 0.5,
    },
    motivo: {
      marginTop: -4,
      marginBottom: 12,
      color: colores.textoSuave,
      fontSize: fs(13),
      textAlign: 'center',
    },

  });
