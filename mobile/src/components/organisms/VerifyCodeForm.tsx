import { useEffect, useState, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, TextLink, Label } from '@/components/atoms';
import { Canal, ChannelSelector, CodeInput } from '@/components/molecules';
import { spacing, useTema, type Colores, type Tipografia } from '@/theme';

const CODE_LENGTH = 6;

type Props = {
  destino: string;
  canal: Canal;
  canalesDisponibles: string[];
  onChangeChannel: (canal: Canal) => void;
  onSubmit: (codigo: string) => void;
  onResend: () => void;
  onBack: () => void;
  resendIn: number;
  loading?: boolean;
  resending?: boolean;
  serverError?: string;
  debugCode?: string;
};

function formatTime(seconds: number) {
  const min = Math.floor(seconds / 60);
  const sec = String(seconds % 60).padStart(2, '0');
  return `${min}:${sec}`;
}

//maneja lo que escribe el usuario y avisa hacia afuera, pero no llama a la API
export function VerifyCodeForm({
  destino,
  canal,
  canalesDisponibles,
  onChangeChannel,
  onSubmit,
  onResend,
  onBack,
  resendIn,
  loading = false,
  resending = false,
  serverError,
  debugCode,
}: Props) {
  const { colors, typography } = useTema();
  const styles = useMemo(() => crearEstilos(colors, typography), [colors, typography]);
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState<string>();

  // Si el servidor rechaza el código, se vacían las cajitas para escribirlo de nuevo.
  useEffect(() => {
    if (serverError) setCodigo('');
  }, [serverError]);

  const submit = (value: string) => {
    if (value.length < CODE_LENGTH) {
      setError('Ingresá los 6 dígitos del código');
      return;
    }
    onSubmit(value);
  };

  const handleChange = (value: string) => {
    setCodigo(value);
    setError(undefined);

    // Al completar el sexto dígito se envía solo, sin tocar "Verificar".
    if (value.length === CODE_LENGTH) submit(value);
  };

  const shownError = error ?? serverError;

  return (
    <View style={styles.container}>
      <Text style={styles.info}>
        Te enviamos un código de 6 dígitos a{'\n'}
        <Text style={styles.destino}>{destino}</Text>
      </Text>

      <CodeInput value={codigo} onChange={handleChange} hasError={!!shownError} />

      {shownError && <Text style={styles.error}>{shownError}</Text>}

      {__DEV__ && debugCode ? (
        <Text style={styles.muted}>Código de prueba: {debugCode}</Text>
      ) : null}

      <Button title="Verificar" onPress={() => submit(codigo)} loading={loading} />

        <View>
        <Label>¿No te llegó? Recibilo por:</Label>

        <ChannelSelector
          selected={canal}
          available={canalesDisponibles}
          disabled={resendIn > 0 || resending}
          onSelect={onChangeChannel}
        />
      </View>


      <View style={styles.center}>
        {resendIn > 0 ? (
          <Text style={styles.muted}>Podés pedir otro código en {formatTime(resendIn)}</Text>
        ) : (
          <TextLink title={resending ? 'Enviando…' : 'Reenviar código'} onPress={onResend} />
        )}
      </View>

      <View style={styles.center}>
        <TextLink title="Volver al inicio de sesión" onPress={onBack} />
      </View>
    </View>
  );
}

const crearEstilos = (colors: Colores, typography: Tipografia) =>
  StyleSheet.create({
    container: {
      gap: spacing.md,
    },
    info: {
      ...typography.body,
      color: colors.textMuted,
      textAlign: 'center',
    },
    destino: {
      fontWeight: '700',
      color: colors.text,
    },
    error: {
      ...typography.small,
      color: colors.error,
      textAlign: 'center',
    },
    muted: {
      ...typography.small,
      color: colors.textMuted,
      textAlign: 'center',
    },
    center: {
      alignItems: 'center',
    },
  });
