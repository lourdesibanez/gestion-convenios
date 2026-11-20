import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="signature/[id]" />
      <Stack.Screen name="agreement/[id]" />
      <Stack.Screen name="agreement/create" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="manual" />
      <Stack.Screen name="identidad/firma" />
    </Stack>
  );
}