import { useMemo, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { ChevronRight, type LucideIcon } from 'lucide-react-native';
import { radius, spacing, useTema, type Colores, type Tipografia } from '@/theme';

type Props = {
  title: string;
  subtitle?: string;
  subtitleColor?: string; // ej. el color del estado
  icon?: LucideIcon;
  iconColor?: string; // también tiñe el fondo del ícono
  /** Lo de la derecha. Si no se pasa y la fila es tocable, va un chevron. */
  trailing?: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean; // reemplaza lo de la derecha por un spinner
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>; // bordes/padding según la lista donde se use
};

// Fila de lista genérica: ícono opcional, título, subtítulo y algo a la derecha.
export function ListItem({
  title,
  subtitle,
  subtitleColor,
  icon: Icon,
  iconColor,
  trailing,
  onPress,
  disabled = false,
  loading = false,
  accessibilityLabel,
  style,
}: Props) {
  const { colors, typography } = useTema();
  const styles = useMemo(() => crearEstilos(colors, typography), [colors, typography]);
  const tono = iconColor ?? colors.primary;
  const inactivo = disabled || loading;

  const derecha = loading ? (
    <ActivityIndicator size="small" color={colors.primary} />
  ) : trailing !== undefined ? (
    trailing
  ) : onPress && !disabled ? (
    <ChevronRight size={20} color={colors.textMuted} />
  ) : null;

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={accessibilityLabel ?? (subtitle ? `${title}: ${subtitle}` : title)}
      accessibilityState={{ disabled: inactivo, busy: loading }}
      disabled={!onPress || inactivo}
      onPress={onPress}
      style={[styles.fila, style]}
    >
      {Icon ? (
        <View style={[styles.icono, { backgroundColor: `${tono}1F` }]}>
          <Icon size={20} color={tono} />
        </View>
      ) : null}

      <View style={styles.textos}>
        <Text style={styles.titulo} numberOfLines={1}>{title}</Text>
        {subtitle ? (
          <Text
            style={[styles.subtitulo, subtitleColor ? { color: subtitleColor, fontWeight: '600' } : null]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      {derecha}
    </Pressable>
  );
}

const crearEstilos = (colors: Colores, typography: Tipografia) =>
  StyleSheet.create({
    fila: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 52 },
    icono: {
      width: 40,
      height: 40,
      borderRadius: radius.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },
    textos: { flex: 1, gap: 2 },
    titulo: { ...typography.label, color: colors.text },
    subtitulo: { ...typography.small, color: colors.textMuted },
  });
