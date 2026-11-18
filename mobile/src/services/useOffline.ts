import { useNetInfo } from '@react-native-community/netinfo';

// true solo si estamos seguros de que no hay red
export function useOffline(): boolean {
  const { isConnected } = useNetInfo();
  return isConnected === false;
}
