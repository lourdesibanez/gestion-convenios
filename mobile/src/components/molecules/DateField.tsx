import { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { colors, radius, spacing, typography } from '@/theme';
import { Input, Label, Button } from '@/components/atoms';

type Props = {
  label: string;
  value: string;
  error?: string;
  editable?: boolean;
  placeholder?: string;
  required?: boolean;
  onChangeValue: (value: string) => void;
};

function parseDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day, 12);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function formatDate(value: string): string {
  const date = parseDate(value);

  return date
    ? new Intl.DateTimeFormat('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(date)
    : '';
}

function toLocalIso(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function DateField({
  label,
  value,
  error,
  editable = true,
  placeholder,
  onChangeValue,
  required = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => parseDate(value) ?? new Date());

  const fechaFormateada = formatDate(value);
  const textoFecha = fechaFormateada || placeholder || 'Seleccionar fecha';

  const openPicker = () => {
    const date = parseDate(value) ?? new Date();

    if (Platform.OS === 'android') {
        DateTimePickerAndroid.open({
        value: date,
        mode: 'date',
        display: 'default',
        onValueChange: (_, selectedDate) => {
            onChangeValue(toLocalIso(selectedDate));
        },
        });

        return;
    }

    setSelectedDate(date);
    setOpen(true);
    };

  return (
    <>
      <View style={styles.field}>
        <Label required={required}>{label}</Label>

        <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${label}: ${textoFecha}`}
            accessibilityState={{ disabled: !editable }}
            disabled={!editable}
            onPress={openPicker}
            style={!editable ? styles.disabled : undefined}
        >
            <Input
            value={fechaFormateada}
            placeholder={placeholder || 'Seleccionar fecha'}
            editable={false}
            showSoftInputOnFocus={false}
            pointerEvents="none"
            hasError={!!error}
            />
        </Pressable>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>

        {Platform.OS === 'android' && open ? (
            <DateTimePicker
  value={selectedDate}
  mode="date"
  display="inline"
  locale="es-AR"
  onValueChange={(_, date) => setSelectedDate(date)}
/>
) : null}
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: spacing.xs,
  },
  label: {
    ...typography.small,
    color: colors.text,
  },
  selector: {
    minHeight: 52,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  disabled: {
    opacity: 0.5,
  },
  value: {
    ...typography.body,
    color: colors.text,
  },
  placeholder: {
    ...typography.body,
    color: colors.textMuted,
  },
  error: {
    ...typography.small,
    color: colors.error,
  },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modal: {
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.md,
    borderTopRightRadius: radius.md,
  },
  modalTitle: {
    ...typography.label,
    color: colors.text,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  androidPickerContainer: {
    flex: 1,
    width: '100%',
    },
    androidPicker: {
    flex: 1,
    width: '100%',
    },
required: {
    color: colors.error,
},
});