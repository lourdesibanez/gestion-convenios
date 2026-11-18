import { useEffect, useImperativeHandle, useMemo, useRef, useState, type Ref } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Eraser } from 'lucide-react-native';
import { radius, spacing, useTema, type Colores, type Tipografia } from '@/theme';

// Tamaño "lógico" del dibujo: el trazo se guarda en estas coordenadas
// y se escala al exportar, sin importar el tamaño de la pantalla.
const ANCHO = 300;
const ALTO = 100;
// Tinta oscura fija: la firma va sobre documentos blancos, aunque la app esté en modo oscuro.
const TINTA = '#1F3A68';

export type SignaturePadHandle = {
  toPng: () => Promise<string>; // "data:image/png;base64,..."
  clear: () => void;
  isEmpty: () => boolean;
};

type Props = {
  ref?: Ref<SignaturePadHandle>;
  label?: string;
  onChange?: (isEmpty: boolean) => void; // avisa si quedó vacío, para habilitar botones
};

// Recuadro para firmar con el dedo. Se usa al firmar convenios y al registrar la identidad.
export function SignaturePad({ ref, label = 'Tu firma', onChange }: Props) {
  const { colors, typography } = useTema();
  const styles = useMemo(() => crearEstilos(colors, typography), [colors, typography]);
  const [trazo, setTrazo] = useState('');
  const trazoRef = useRef('');
  const svgRef = useRef<Svg | null>(null);
  const tamano = useRef({ width: ANCHO, height: ALTO });

  // Guarda siempre el último onChange, así el PanResponder (creado una sola vez) no usa uno viejo.
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  const actualizar = (nuevo: string) => {
    trazoRef.current = nuevo;
    setTrazo(nuevo);
    onChangeRef.current?.(nuevo.trim() === '');
  };

  // Se crea una sola vez. Convierte la posición del dedo a las coordenadas lógicas.
  // Los refs se leen dentro de los callbacks del gesto (al tocar), no durante el render;
  // el lint no puede distinguirlo porque el PanResponder se crea en el inicializador.
  // eslint-disable-next-line react-hooks/refs
  const [responder] = useState(() => {
    const punto = (x: number, y: number) =>
      `${(x / tamano.current.width) * ANCHO} ${(y / tamano.current.height) * ALTO}`;

    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false, // que un ScrollView no "robe" el trazo
      onPanResponderGrant: (e) => {
        const { locationX, locationY } = e.nativeEvent;
        actualizar(`${trazoRef.current} M ${punto(locationX, locationY)}`);
      },
      onPanResponderMove: (e) => {
        const { locationX, locationY } = e.nativeEvent;
        actualizar(`${trazoRef.current} L ${punto(locationX, locationY)}`);
      },
    });
  });

  // Lo que la pantalla puede pedirle al pad.
  useImperativeHandle(ref, () => ({
    toPng: () =>
      new Promise((resolve, reject) => {
        const svg = svgRef.current;
        if (!svg) {
          reject(new Error('No se pudo acceder al área de firma.'));
          return;
        }
        svg.toDataURL(
          (base64) =>
            base64
              ? resolve(`data:image/png;base64,${base64}`)
              : reject(new Error('No se pudo convertir la firma.')),
          { width: 900, height: 300 },
        );
      }),
    clear: () => actualizar(''),
    isEmpty: () => trazoRef.current.trim() === '',
  }));

  const vacio = trazo.trim() === '';

  return (
    <View style={styles.contenedor}>
      <View style={styles.encabezado}>
        <Text style={styles.label}>{label}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Borrar firma"
          accessibilityState={{ disabled: vacio }}
          disabled={vacio}
          hitSlop={8}
          onPress={() => actualizar('')}
          style={styles.borrar}
        >
          <Eraser size={18} color={vacio ? colors.textMuted : colors.error} />
          <Text style={[styles.borrarTxt, vacio && styles.borrarDeshabilitado]}>Borrar</Text>
        </Pressable>
      </View>

      <View
        {...responder.panHandlers}
        accessibilityLabel="Recuadro para firmar con el dedo"
        onLayout={(e) => {
          tamano.current = {
            width: e.nativeEvent.layout.width,
            height: e.nativeEvent.layout.height,
          };
        }}
        style={styles.recuadro}
      >
        <Svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox={`0 0 ${ANCHO} ${ALTO}`}
          preserveAspectRatio="none"
        >
          <Path
            d={trazo}
            fill="none"
            stroke={TINTA}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>

        {vacio && (
          <Text pointerEvents="none" style={styles.indicacion}>
            Firmá con el dedo dentro del recuadro
          </Text>
        )}
      </View>
    </View>
  );
}

const crearEstilos = (colors: Colores, typography: Tipografia) =>
  StyleSheet.create({
    contenedor: { gap: spacing.sm },
    encabezado: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    label: { ...typography.label, color: colors.text },
    borrar: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, minHeight: 44 },
    borrarTxt: { ...typography.small, fontWeight: '600', color: colors.error },
    borrarDeshabilitado: { color: colors.textMuted },
    recuadro: {
      aspectRatio: ANCHO / ALTO, // mantiene la proporción del dibujo
      borderRadius: radius.md,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: colors.border,
      backgroundColor: '#FFFFFF', // "papel" blanco siempre, también en modo oscuro
      overflow: 'hidden',
      justifyContent: 'center',
    },
    indicacion: {
      ...typography.small,
      position: 'absolute',
      alignSelf: 'center',
      color: '#9CA3AF',
    },
  });
