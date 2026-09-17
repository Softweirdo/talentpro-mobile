import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text as RNText,
  View,
} from 'react-native';
import { colors, fonts, radius, shadow, spacing, type } from '../theme/index';
import { useLocalizedStyle } from '../theme/text';

export interface Option {
  value: string;
  label: string;
}

/**
 * A bottom-sheet picker rather than a platform `<select>`.
 *
 * Native pickers render inconsistently across the low-end Android builds this
 * audience uses, and the sheet gives large, easily-tapped rows.
 */
export function Select({
  label,
  value,
  options,
  onChange,
  error,
  placeholder,
}: {
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const localize = useLocalizedStyle();
  const selected = options.find((o) => o.value === value);

  return (
    <View style={styles.field}>
      <RNText style={localize(type.micro)}>{label}</RNText>

      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${selected?.label ?? placeholder ?? ''}`}
        style={[styles.control, error ? styles.controlError : null]}
      >
        <RNText
          style={[
            localize({ fontFamily: fonts.semibold, fontSize: 15 }),
            { color: selected ? colors.navy : colors.textMute, flex: 1 },
          ]}
          numberOfLines={1}
        >
          {selected?.label ?? placeholder ?? '—'}
        </RNText>
        <RNText style={styles.chevron}>▾</RNText>
      </Pressable>

      {error ? (
        <RNText style={[localize(type.small), { color: colors.danger, marginTop: 5 }]}>{error}</RNText>
      ) : null}

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.grabber} />
            <RNText style={[localize(type.h3), { marginBottom: spacing.md }]}>{label}</RNText>

            <ScrollView style={{ maxHeight: 380 }}>
              {options.map((option) => {
                const on = option.value === value;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    style={[styles.option, on && styles.optionActive]}
                  >
                    <RNText
                      style={[
                        localize({ fontFamily: on ? fonts.bold : fonts.medium, fontSize: 15 }),
                        { color: on ? colors.navy : colors.text, flex: 1 },
                      ]}
                    >
                      {option.label}
                    </RNText>
                    {on ? <RNText style={styles.tick}>✓</RNText> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: spacing.lg },
  control: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.md,
    minHeight: 52,
    gap: spacing.sm,
  },
  controlError: { borderColor: colors.danger },
  chevron: { color: colors.textMute, fontSize: 14 },

  backdrop: { flex: 1, backgroundColor: 'rgba(11,37,64,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
    ...shadow.md,
  },
  grabber: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.line,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },

  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    // Generous rows: this is tapped with a thumb, often outdoors.
    minHeight: 54,
  },
  optionActive: { backgroundColor: colors.paperCool },
  tick: { color: colors.skyDeep, fontSize: 16, fontFamily: fonts.bold },
});
