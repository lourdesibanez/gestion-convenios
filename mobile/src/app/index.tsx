import { View } from 'react-native';
import { Button, Divider, TextLink } from '@/components/atoms';
import { BiometricButton, FormField } from '@/components/molecules';
import { colors, spacing } from '@/theme';

export default function Index() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: spacing.lg, gap: spacing.md, backgroundColor: colors.background }}>
      <FormField
        label="Correo institucional"
        placeholder="nombre@ing.unlpam.edu.ar"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <FormField
        label="Contraseña"
        secureTextEntry
        error="La contraseña es obligatoria"
      />
      <View style={{ alignItems: 'flex-end' }}>
        <TextLink title="¿Olvidaste tu contraseña?" onPress={() => {}} />
      </View>
      <Button title="Ingresar" onPress={() => {}} />
      <Divider text="o ingresá con" />
      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <BiometricButton type="fingerprint" onPress={() => {}} />
        <BiometricButton type="face" onPress={() => {}} />
      </View>
    </View>
  );
}

