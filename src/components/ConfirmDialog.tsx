import { Modal, Pressable, StyleSheet, Text as RNText, View } from 'react-native';
import { colors, fonts, radius, shadow, spacing, type } from '../theme/index';
import { useLocalizedStyle } from '../theme/text';

/**
 * A two-button confirmation, rendered in-app.
 *
 * This exists instead of `Alert.alert` because `Alert` is a stub on
 * react-native-web — `static alert() {}`, an empty function — so every
 * confirmation silently did nothing when the app ran in a browser, and the
 * action behind it never fired. A `Modal` renders on web and native alike.
 */
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel,
  destructive = false,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const localize = useLocalizedStyle();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      {/* Tapping outside cancels, matching the platform dialogs this replaces. */}
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <RNText style={localize(type.h2)}>{title}</RNText>
          <RNText style={[localize(type.body), styles.message]}>{message}</RNText>

          <View style={styles.actions}>
            <Pressable
              onPress={onCancel}
              accessibilityRole="button"
              style={({ pressed }) => [styles.btn, styles.btnGhost, pressed && styles.btnPressed]}
            >
              <RNText style={[localize(styles.btnLabel), { color: colors.navy }]}>
                {cancelLabel}
              </RNText>
            </Pressable>

            <Pressable
              onPress={onConfirm}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.btn,
                destructive ? styles.btnDanger : styles.btnPrimary,
                pressed && styles.btnPressed,
              ]}
            >
              <RNText style={[localize(styles.btnLabel), { color: colors.white }]}>
                {confirmLabel}
              </RNText>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(11,37,64,0.45)',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.xl,
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
    ...shadow.md,
  },
  message: { marginTop: spacing.sm, marginBottom: spacing.xl },
  actions: { flexDirection: 'row', gap: spacing.md },
  btn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: radius.md,
    // Thumb-sized, same as the primary Button — this is tapped outdoors.
    minHeight: 52,
  },
  btnLabel: { fontFamily: fonts.extrabold, fontSize: 14, letterSpacing: 0.5 },
  btnGhost: { backgroundColor: colors.paperCool },
  btnPrimary: { backgroundColor: colors.navy },
  btnDanger: { backgroundColor: colors.danger },
  btnPressed: { opacity: 0.75 },
});
