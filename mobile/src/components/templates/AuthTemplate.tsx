//import { FilePenLine } from 'lucide-react-native';
import { Image } from 'react-native';
import { ReactNode, useMemo } from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { radius, spacing, useTema, type Colores, type Tipografia } from '@/theme';

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function AuthTemplate({ title, subtitle, children }: Props) {
  const { colors, typography, fs } = useTema();
  const styles = useMemo(() => crearEstilos(colors, typography, fs), [colors, typography, fs]);
  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.logo}>
              <Image source={require('../../../assets/images/Logo.png')} style={{ width: 150, height: 150 }} />
            </View>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>

          <View style={styles.card}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const crearEstilos = (colors: Colores, typography: Tipografia, fs: (tamano: number) => number) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    flex: {
      flex: 1,
    },
    scroll: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: spacing.lg,
      gap: spacing.xl,
    },
    header: {
      alignItems: 'center',
      gap: spacing.sm,
    },
    logo: {
      width: 200,
      height: 200,
      borderRadius: radius.md * 2,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.sm,
    },
    title: {
      fontSize: fs(24),
      fontWeight: '700',
      color: colors.primary,
      textAlign: 'center',
    },
    subtitle: {
      ...typography.body,
      color: colors.textMuted,
      textAlign: 'center',
    },
    card: {
      backgroundColor: colors.background,
      borderRadius: radius.md * 1.5,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
  });
