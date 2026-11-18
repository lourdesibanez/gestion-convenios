import { useRef, useState, useMemo } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, TextInputInstance } from 'react-native';
import { radius, spacing, useTema, type Colores } from '@/theme';

const LENGTH = 6;

type Props = {
  value: string;
  onChange: (value: string) => void;
  hasError?: boolean;
};

//Son las 6 cajitas del código. Por detrás hay un solo TextInput invisible: el usuario escribe ahí y las cajitas solo muestran cada dígito. 
// Así el celular puede autocompletar el código desde el SMS o el mail, y borrar funciona normal.
export function CodeInput({ value, onChange, hasError = false }: Props) {
  const { colors, fs } = useTema();
  const styles = useMemo(() => crearEstilos(colors, fs), [colors, fs]);
  const inputRef = useRef<TextInputInstance>(null);
  const [focused, setFocused] = useState(false);

  return (
    <Pressable style={styles.row} onPress={() => inputRef.current?.focus()}>
      {Array.from({ length: LENGTH }, (_, i) => {
        const isCurrent = focused && i === Math.min(value.length, LENGTH - 1);

        return (
          <View key={i} style={[styles.box, isCurrent && styles.current, hasError && styles.error]}>
            <Text style={styles.digit}>{value[i] ?? ''}</Text>
          </View>
        );
      })}

      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(text) => onChange(text.replace(/\D/g, '').slice(0, LENGTH))}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        maxLength={LENGTH}
        autoFocus
        caretHidden
        style={styles.hiddenInput}
      />
    </Pressable>
  );
}

const crearEstilos = (colors: Colores, fs: (tamano: number) => number) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    box: {
      flex: 1,
      height: 56,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    current: {
      borderWidth: 2,
      borderColor: colors.primary,
    },
    error: {
      borderColor: colors.error,
    },
    digit: {
      fontSize: fs(24),
      fontWeight: '700',
      color: colors.text,
    },
    hiddenInput: {
      position: 'absolute',
      width: 1,
      height: 1,
      opacity: 0,
    },
  });
