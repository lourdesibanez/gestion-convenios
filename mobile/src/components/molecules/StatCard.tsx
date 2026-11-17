import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { radius, spacing, useTema, type Colores, type Tipografia } from '@/theme';

type Props = {
  label: string;
  value: number;
  color: string;
  icon?: ReactNode;
};

export function StatCard({ label, value, color, icon }: Props) {
  const { colors, typography, fs } = useTema();
  const styles = useMemo(() => crearEstilos(colors, typography, fs), [colors, typography, fs]);
  return (
    <View style={[styles.card, icon && styles.iconCard, { borderLeftColor: color }]}>
      {icon ? (
        <>
          <View style={styles.iconValueRow}>
            <Text style={[styles.value, { color }]}>{value}</Text>
            <View style={styles.iconSlot}>{icon}</View>
          </View>
          <Text style={styles.label}>{label}</Text>
        </>
      ) : (
        <>
          <Text style={[styles.value, { color }]}>{value}</Text>
          <Text style={styles.label}>{label}</Text>
        </>
      )}
    </View>
  );
}

const crearEstilos = (colors: Colores, typography: Tipografia, fs: (tamano: number) => number) =>
  StyleSheet.create({
    card: {
      flexBasis: '47%',
      flexGrow: 1,
      backgroundColor: colors.background,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      borderLeftWidth: 4,
      padding: spacing.md,
      gap: spacing.xs,
    },
    iconCard: {
      justifyContent: 'space-between',
    },
    iconValueRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    iconSlot: {
      alignItems: 'flex-end',
    },
    value: {
      fontSize: fs(28),
      fontWeight: '700',
    },
    label: {
      ...typography.small,
      color: colors.textMuted,
    },
  });
