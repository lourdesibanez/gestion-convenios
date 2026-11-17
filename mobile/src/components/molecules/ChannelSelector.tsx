import { useMemo } from 'react';
import { Bell, Mail, MessageSquareText } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { radius, spacing, useTema, type Colores } from '@/theme';

export type Canal = 'mail' | 'sms' | 'push';

const OPTIONS = [
  { canal: 'mail', label: 'Email', icon: Mail },
  { canal: 'sms', label: 'SMS', icon: MessageSquareText },
  { canal: 'push', label: 'Push', icon: Bell },
] as const;

type Props = {
  selected: Canal;
  available: string[];
  disabled?: boolean;
  onSelect: (canal: Canal) => void;
};

export function ChannelSelector({ selected, available, disabled = false, onSelect }: Props) {
  const { colors, fs } = useTema();
  const styles = useMemo(() => crearEstilos(colors, fs), [colors, fs]);
  return (
    <View style={styles.row}>
      {OPTIONS.map(({ canal, label, icon: Icon }) => {
        const isSelected = canal === selected;
        const isAvailable = available.includes(canal);
        const isDisabled = disabled || !isAvailable || isSelected;

        return (
          <Pressable
            key={canal}
            onPress={() => onSelect(canal)}
            disabled={isDisabled}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected, disabled: isDisabled }}
            style={[
              styles.chip,
              isSelected && styles.selected,
              !isAvailable && styles.unavailable,
            ]}
          >
            <Icon
              size={14}
              color={isSelected ? colors.primary : colors.text}
            />
            <Text style={[styles.label, isSelected && styles.labelSelected]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const crearEstilos = (colors: Colores, fs: (tamano: number) => number) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    chip: {
      flex: 1,
      height: 48,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    selected: {
      backgroundColor: colors.primarySoft,
      borderColor: colors.primary,
      borderWidth: 2,
    },
    unavailable: {
      opacity: 0.4,
    },
    label: {
      fontSize: fs(15),
      fontWeight: '500',
      color: colors.text,
    },
    labelSelected: {
      color: colors.primary,
      fontWeight: '500',
    },
  });
