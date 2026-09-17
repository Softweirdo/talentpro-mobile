import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text as RNText,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { colors, fonts, radius, shadow, spacing, statusColor, type } from '../theme/index';
import { useLocalizedStyle } from '../theme/text';

// ── Text ───────────────────────────────────────────────────────────────────

type Variant = keyof typeof type;

/**
 * Every string in the app goes through here, so the Gujarati face is swapped
 * in automatically — and monospace numerics are deliberately left alone.
 */
export function Text({
  variant = 'body',
  style,
  children,
  numberOfLines,
  ...rest
}: {
  variant?: Variant;
  style?: StyleProp<TextStyle>;
  children: React.ReactNode;
  numberOfLines?: number;
}) {
  const localize = useLocalizedStyle();
  return (
    <RNText
      style={[localize(type[variant] as TextStyle), style]}
      numberOfLines={numberOfLines}
      {...rest}
    >
      {children}
    </RNText>
  );
}

/** Numerics: codes, salaries, dates, counts. Never localised. */
export const Mono = ({
  style,
  bold,
  children,
}: {
  style?: StyleProp<TextStyle>;
  bold?: boolean;
  children: React.ReactNode;
}) => (
  <RNText style={[bold ? type.monoBold : type.mono, style]}>{children}</RNText>
);

// ── Buttons ────────────────────────────────────────────────────────────────

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading,
  disabled,
  style,
}: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'sky';
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const localize = useLocalizedStyle();
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.btn,
        variant === 'secondary' && styles.btnSecondary,
        variant === 'sky' && styles.btnSky,
        // A large, obvious pressed state matters on cheap handsets where the
        // ripple is unreliable.
        pressed && !isDisabled && styles.btnPressed,
        isDisabled && styles.btnDisabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' ? colors.navy : colors.white} />
      ) : (
        <RNText
          style={[
            localize({ fontFamily: fonts.extrabold, fontSize: 14, letterSpacing: 0.5 }),
            { color: variant === 'secondary' ? colors.navy : colors.white, textAlign: 'center' },
          ]}
        >
          {title}
        </RNText>
      )}
    </Pressable>
  );
}

// ── Inputs ─────────────────────────────────────────────────────────────────

export function Field({
  label,
  error,
  hint,
  mono,
  style,
  ...rest
}: TextInputProps & { label: string; error?: string | null; hint?: string; mono?: boolean }) {
  const localize = useLocalizedStyle();
  return (
    <View style={styles.field}>
      <RNText style={localize(type.micro)}>{label}</RNText>
      <TextInput
        placeholderTextColor={colors.textMute}
        style={[
          styles.input,
          mono && { fontFamily: fonts.mono },
          error ? styles.inputError : null,
          style,
        ]}
        {...rest}
      />
      {error ? (
        <RNText style={[localize(type.small), { color: colors.danger, marginTop: 5 }]}>{error}</RNText>
      ) : hint ? (
        <RNText style={[localize(type.small), { marginTop: 5 }]}>{hint}</RNText>
      ) : null}
    </View>
  );
}

/** A read-only value styled like an input — the auto-filled employee code. */
export const ReadonlyPill = ({ children }: { children: React.ReactNode }) => (
  <View style={styles.readonlyPill}>
    <RNText style={type.monoBold}>{children}</RNText>
  </View>
);

// ── Chips, badges, tags ────────────────────────────────────────────────────

export function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  const localize = useLocalizedStyle();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[styles.chip, active && styles.chipActive]}
    >
      <RNText
        style={[
          localize({ fontFamily: fonts.bold, fontSize: 12 }),
          { color: active ? colors.white : colors.text },
        ]}
      >
        {label}
      </RNText>
    </Pressable>
  );
}

export function StatusBadge({ status, label }: { status: string; label: string }) {
  const { bg, fg } = statusColor(status);
  const localize = useLocalizedStyle();
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <View style={[styles.badgeDot, { backgroundColor: fg }]} />
      <RNText
        style={[
          localize({ fontFamily: fonts.extrabold, fontSize: 10, letterSpacing: 0.8 }),
          { color: fg, textTransform: 'uppercase' },
        ]}
      >
        {label}
      </RNText>
    </View>
  );
}

export const CompanyTag = ({ children }: { children: React.ReactNode }) => (
  <View style={styles.companyTag}>
    <RNText
      style={{
        fontFamily: fonts.extrabold,
        fontSize: 9,
        letterSpacing: 1.4,
        color: colors.skyDeep,
        textTransform: 'uppercase',
      }}
    >
      {children}
    </RNText>
  </View>
);

// ── Containers ─────────────────────────────────────────────────────────────

export const Card = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) => <View style={[styles.card, style]}>{children}</View>;

export function InfoNote({ children, tone = 'info' }: { children: React.ReactNode; tone?: 'info' | 'warn' }) {
  return (
    <View
      style={[
        styles.infoNote,
        tone === 'warn' && { backgroundColor: '#FFF4E0', borderLeftColor: colors.warning },
      ]}
    >
      {children}
    </View>
  );
}

export function SectionLabel({ title, action }: { title: string; action?: React.ReactNode }) {
  const localize = useLocalizedStyle();
  return (
    <View style={styles.sectionLabel}>
      <RNText style={localize(type.micro)}>{title}</RNText>
      {action}
    </View>
  );
}

export const Row = ({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) => {
  const localize = useLocalizedStyle();
  return (
    <View style={styles.row}>
      <RNText style={localize(type.bodyMute)}>{label}</RNText>
      {mono ? (
        <RNText style={type.monoBold}>{value}</RNText>
      ) : (
        <RNText style={localize({ ...type.body, fontFamily: fonts.bold })}>{value}</RNText>
      )}
    </View>
  );
};

// ── Feedback ───────────────────────────────────────────────────────────────

export const Loading = ({ label }: { label?: string }) => {
  const { t } = useTranslation();
  const localize = useLocalizedStyle();
  return (
    <View style={styles.centered}>
      <ActivityIndicator color={colors.skyDeep} size="large" />
      <RNText style={[localize(type.bodyMute), { marginTop: spacing.md }]}>
        {label ?? t('common.loading')}
      </RNText>
    </View>
  );
};

export function EmptyState({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: React.ReactNode;
}) {
  const localize = useLocalizedStyle();
  return (
    <View style={styles.centered}>
      <RNText style={[localize(type.h3), { textAlign: 'center' }]}>{title}</RNText>
      {hint ? (
        <RNText
          style={[localize(type.bodyMute), { textAlign: 'center', marginTop: 6, maxWidth: 280 }]}
        >
          {hint}
        </RNText>
      ) : null}
      {action ? <View style={{ marginTop: spacing.lg }}>{action}</View> : null}
    </View>
  );
}

export function ErrorState({ onRetry, message }: { onRetry: () => void; message?: string }) {
  const { t } = useTranslation();
  return (
    <EmptyState
      title={message ?? t('common.genericError')}
      action={<Button title={t('common.retry')} onPress={onRetry} variant="secondary" />}
    />
  );
}

export const Screen = ({
  children,
  scroll = true,
  style,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
}) =>
  scroll ? (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.screenContent, style]}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.screen, styles.screenContent, style]}>{children}</View>
  );

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  screenContent: { padding: spacing.xl, paddingBottom: spacing.xxl * 2 },

  btn: {
    paddingVertical: 16,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.navy,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    // A comfortable target: this app is used one-handed, often outdoors.
    minHeight: 52,
    ...shadow.sm,
  },
  btnSecondary: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.navy,
  },
  btnSky: { backgroundColor: colors.skyDeep },
  btnPressed: { opacity: 0.85, transform: [{ scale: 0.985 }] },
  btnDisabled: { opacity: 0.45 },

  field: { marginBottom: spacing.lg },
  input: {
    marginTop: 6,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.md,
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.navy,
    minHeight: 52,
  },
  inputError: { borderColor: colors.danger },

  readonlyPill: {
    marginTop: 6,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    backgroundColor: colors.paperCool,
    borderRadius: radius.md,
    minHeight: 52,
    justifyContent: 'center',
  },

  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 9,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.pill,
    marginRight: spacing.sm,
  },
  chipActive: { backgroundColor: colors.navy, borderColor: colors.navy },

  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },

  companyTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: colors.paperCool,
    borderRadius: radius.sm,
  },

  card: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },

  infoNote: {
    backgroundColor: colors.skySoft,
    borderLeftWidth: 3,
    borderLeftColor: colors.sky,
    padding: 14,
    borderRadius: radius.md,
  },

  sectionLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    gap: spacing.md,
  },

  centered: { padding: spacing.xxl, alignItems: 'center', justifyContent: 'center', flex: 1, minHeight: 240 },
});

export { styles as uiStyles };
