import { Redirect } from 'expo-router';
import { useAuth } from '@/features/auth/context/AuthContext';

// Punto de entrada: siempre existe y decide a dónde ir según la sesión.
export default function Index() {
  const { status } = useAuth();

  return <Redirect href={status === 'signedIn' ? '/home' : '/login'} />;
}
