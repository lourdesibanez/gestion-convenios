import { View } from 'react-native';
import { Button, Divider, Input, Label } from '@/components/atoms';
import { colors, spacing } from '@/theme';

export default function Index() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: spacing.lg, gap: spacing.md, backgroundColor: colors.background }}>
      <View>
        <Label>Correo institucional</Label>
        <Input placeholder="nombre@unlpam.edu.ar" keyboardType="email-address" autoCapitalize="none" />
      </View>
      <View>
        <Label>Contraseña</Label>
        <Input placeholder="••••••••" secureTextEntry />
      </View>
      <Button title="Ingresar" onPress={() => {}} />
      <Divider text="o ingresá con" />
      <Button title="Huella" variant="outline" onPress={() => {}} />
    </View>
  );
}
