import { Camera } from 'lucide-react-native';
import { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '@/components/atoms/Avatar';
import { useAuth } from '@/features/auth/context/AuthContext';
import { spacing, useTema, type Colores, type Tipografia } from '@/theme';
import { useFotoPerfil } from '../hooks/useFotoPerfil';

export function PerfilCabecera() {
  const { usuario, tipoPerfil } = useAuth();
  const { colors, typography } = useTema();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => crearEstilos(colors, typography, insets.top), [colors, typography, insets.top]);
  const { subiendo, abrirMenu } = useFotoPerfil();

  const nombre = `${usuario?.nombre ?? ''} ${usuario?.apellido ?? ''}`.trim();

  return (
    <View style={styles.cabecera}>
      <View style={styles.marco}>
        <Avatar name='' size={84} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cambiar foto de perfil"
          disabled={subiendo}
          onPress={abrirMenu}
          style={styles.camara}
        >
          {subiendo ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Camera size={14} color={colors.primary} />
          )}
        </Pressable>
      </View>
      <Text style={styles.nombre}>{nombre}</Text>
      {!!tipoPerfil && <Text style={styles.subtitulo}>{tipoPerfil}</Text>}
    </View>
  );
}

const crearEstilos = (colors: Colores, typography: Tipografia, top: number) =>
  StyleSheet.create({
    cabecera: {
      alignItems: 'center',
      gap: spacing.sm,
      paddingTop: top + spacing.lg,
      paddingBottom: spacing.lg,
      backgroundColor: colors.primary,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
    },
    marco: {
      padding: 3,
      borderRadius: 999,
      borderWidth: 2,
      borderColor: 'rgba(255,255,255,0.7)',
    },
    camara: {
      position: 'absolute',
      right: -2,
      bottom: -2,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center',
    },
    nombre: { ...typography.label, fontSize: 20, color: '#FFFFFF' },
    subtitulo: { ...typography.small, color: '#FFFFFF' },
  });