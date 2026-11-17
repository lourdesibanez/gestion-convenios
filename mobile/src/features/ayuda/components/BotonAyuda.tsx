import { useState } from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import { CircleHelp } from 'lucide-react-native';
import { AyudaSheet } from '@/components/organisms';
import { AYUDAS, type SeccionAyuda } from '../contenidoAyuda';
import { router } from 'expo-router';

type Props = {
  seccion: SeccionAyuda;
  color: string; // cambia según el fondo: blanco en el header azul, azul en HeaderBack
  style?: StyleProp<ViewStyle>;
};

// Ícono "?" que abre la ayuda puntual de la sección.
export function BotonAyuda({ seccion, color, style }: Props) {
  const [visible, setVisible] = useState(false);
  const ayuda = AYUDAS[seccion];

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Ayuda: ${ayuda.seccion}`}
        hitSlop={8}
        onPress={() => setVisible(true)}
        style={style}
      >
        <CircleHelp size={22} color={color} />
      </Pressable>

      <AyudaSheet
        visible={visible}
        seccion={ayuda.seccion}
        titulo={ayuda.titulo}
        texto={ayuda.texto}
        onCerrar={() => setVisible(false)}
        onVerManual={() => {
          setVisible(false);
          router.push('/manual');
        }}

      />
    </>
  );
}
