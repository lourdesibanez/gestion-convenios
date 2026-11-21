import { useState, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Divider, TextLink } from '@/components/atoms';
import { BiometricButton, FormField } from '@/components/molecules';
import { spacing, useTema, type Colores, type Tipografia } from '@/theme';
import type { BiometricType } from '@/services/biometrics';

export type LoginData = {
  email: string;
  password: string;
};

type Props = {
  onSubmit: (data: LoginData) => void;
  onForgotPassword: () => void;
  biometricTypes?: BiometricType[];
  onBiometric: () => void;
  loading?: boolean;
  serverError?: string;
};

type Errors = Partial<Record<keyof LoginData, string>>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate({ email, password }: LoginData): Errors {
  const errors: Errors = {};

  if (!email.trim()) {
    errors.email = 'Ingresá tu correo';
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.email = 'El correo no es válido';
  }

  if (!password) {
    errors.password = 'Ingresá tu contraseña';
  }

  return errors;
}

export function LoginForm({
  onSubmit,
  onForgotPassword,
  onBiometric,
  biometricTypes = [],
  loading = false,
  serverError,
}: Props) {
  const { colors, typography } = useTema();
  const styles = useMemo(() => crearEstilos(colors, typography), [colors, typography]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});

  const handleSubmit = () => {
    const data = { email: email.trim(), password };
    const newErrors = validate(data);
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSubmit(data);
    }
  };

  return (
    <View style={styles.container}>
      <FormField
        label="Correo institucional"
        placeholder="nombre@unlpam.edu.ar"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setErrors((e) => ({ ...e, email: undefined }));
        }}
        error={errors.email}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="next"
      />

      <FormField
        label="Contraseña"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          setErrors((e) => ({ ...e, password: undefined }));
        }}
        error={errors.password}
        secureTextEntry
        autoComplete="password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={handleSubmit}
      />

      <View style={styles.forgot}>
        <TextLink title="¿Olvidaste tu contraseña?" onPress={onForgotPassword} />
      </View>

      {serverError && <Text style={styles.serverError}>{serverError}</Text>}

      <Button title="Ingresar" onPress={handleSubmit} loading={loading} />

            {biometricTypes.length > 0 && (
        <>
          <Divider text="o ingresá con" />
          <View style={styles.biometricRow}>
            {biometricTypes.map((type) => (
              <BiometricButton key={type} type={type} onPress={onBiometric} />
            ))}
          </View>
        </>
      )}

    </View>
  );
}

const crearEstilos = (colors: Colores, typography: Tipografia) =>
  StyleSheet.create({
    container: {
      gap: spacing.md,
    },
    forgot: {
      alignItems: 'flex-end',
    },
    serverError: {
      ...typography.small,
      color: colors.error,
      textAlign: 'center',
    },
    biometricRow: {
      flexDirection: 'row',
      gap: spacing.md,
    },
  });
