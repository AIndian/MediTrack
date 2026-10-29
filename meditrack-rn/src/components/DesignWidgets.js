import React, { useEffect, useRef } from 'react';
import {
  AccessibilityInfo,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import AppText from './AppText';
import HeaderClock from './HeaderClock';
import { colors } from '../theme';
import { useOptionalStore } from '../state/AppStoreContext';

export const SUBTITLES = {
  Today: 'Your daily medication plan',
  'Your medicines': 'All your information, in one place',
  'Medicine details': 'Review your saved information',
  'Add medicine': 'Step 1 of 2 · Enter details',
  'Edit medicine': 'Step 1 of 2 · Enter details',
  'Review medicine': 'Step 2 of 2 · Check before saving',
  'Medication reminder': 'Name, dose, and saved instructions',
  'Dose history': 'Review or correct a record',
  Symptoms: 'Keep a note for your next visit',
  'Appointment summary': 'A clear view of your recent health',
  'Settings & sharing': 'Your preferences and privacy',
};

export function Heading({ children }) {
  return (
    <AppText accessibilityRole="header" style={styles.heading}>
      {children}
    </AppText>
  );
}

export function ActionButton({ label, onPress, variant = 'filled' }) {
  const outlined = variant === 'outlined';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        outlined ? styles.buttonOutlined : styles.buttonFilled,
        pressed && styles.pressed,
      ]}
    >
      <AppText style={[styles.buttonText, outlined && styles.buttonTextOutlined]}>{label}</AppText>
    </Pressable>
  );
}

export function Panel({ children }) {
  return <View style={styles.panel}>{children}</View>;
}

const BADGE = {
  Taken: { text: colors.takenText, bg: colors.takenBg, icon: 'check-circle-outline' },
  Skipped: { text: colors.skippedText, bg: colors.skippedBg, icon: 'remove-circle-outline' },
  Due: { text: colors.primary, bg: colors.dueBg, icon: 'schedule' },
};

export function StatusBadge({ status }) {
  const look = BADGE[status] ?? BADGE.Due;
  const firstRender = useRef(true);

  // Android reads live regions automatically; iOS VoiceOver needs an explicit announcement
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (Platform.OS === 'ios') {
      AccessibilityInfo.announceForAccessibility(`Status: ${status}`);
    }
  }, [status]);

  return (
    <View
      accessibilityLiveRegion="polite"
      style={[styles.badge, { backgroundColor: look.bg, borderColor: look.text }]}
    >
      <MaterialIcons
        name={look.icon}
        size={20}
        color={look.text}
        accessibilityElementsHidden
        importantForAccessibility="no"
      />
      <AppText style={[styles.badgeText, { color: look.text }]}>{`Status: ${status}`}</AppText>
    </View>
  );
}

export function MedicineHeading({ medicine }) {
  return (
    <View>
      <View style={styles.medIcon}>
        <MaterialIcons name="medication" size={24} color={colors.primary} />
      </View>
      <Heading>{medicine.name}</Heading>
      <AppText style={styles.muted}>{medicine.strength}</AppText>
    </View>
  );
}

export function AppPage({ title, children, side = null, onBack }) {
  const store = useOptionalStore();
  const { width, fontScale } = useWindowDimensions();
  const scale = Math.max(store ? store.textScale : 1, fontScale);
  const wide = width >= 700 && scale < 1.5;
  const stacked = width < 310 * scale;
  const hasSide = React.Children.count(side) > 0;

  const brand = (
    <View style={styles.brandRow}>
      {onBack && (
        <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={onBack} style={styles.back}>
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
        </Pressable>
      )}
      <MaterialIcons name="health-and-safety" size={26} color={colors.primary} />
      <AppText style={styles.brandText}>MediTrack</AppText>
    </View>
  );

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        {stacked ? (
          <View>
            <HeaderClock />
            {brand}
          </View>
        ) : (
          <View style={styles.headerRow}>
            <View style={styles.flex}>{brand}</View>
            <HeaderClock />
          </View>
        )}
      </View>
      <ScrollView contentContainerStyle={[styles.body, { padding: wide ? 32 : 20 }]}>
        {store?.error ? (
          <AppText accessibilityRole="alert" style={styles.error}>{store.error}</AppText>
        ) : null}
        <AppText accessibilityRole="header" style={styles.title}>{title}</AppText>
        <AppText style={styles.muted}>{SUBTITLES[title] ?? ''}</AppText>
        <View style={styles.spacer} />
        {wide && hasSide ? (
          <View style={styles.wideRow}>
            <View style={{ flex: 6 }}>{children}</View>
            <View style={{ width: 24 }} />
            <View style={{ flex: 4 }}>{side}</View>
          </View>
        ) : (
          <View>
            {children}
            {side}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 20,
    paddingVertical: 11,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandText: { fontSize: 18, fontWeight: '700' },
  back: { minWidth: 48, minHeight: 48, justifyContent: 'center' },
  body: { width: '100%', maxWidth: 1120, alignSelf: 'center' },
  error: {
    color: '#B3261E',
    fontWeight: '600',
    backgroundColor: '#FDECEA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  title: { fontSize: 32, lineHeight: 48, fontWeight: '700', letterSpacing: -1 },
  heading: { fontSize: 26, lineHeight: 39, fontWeight: '700' },
  muted: { color: colors.muted },
  spacer: { height: 24 },
  wideRow: { flexDirection: 'row', alignItems: 'flex-start' },
  button: {
    marginTop: 12,
    minHeight: 48, // large touch target
    borderRadius: 24,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonFilled: { backgroundColor: colors.primary },
  buttonOutlined: { borderWidth: 1, borderColor: colors.primary, backgroundColor: colors.surface },
  pressed: { opacity: 0.8 },
  buttonText: { color: '#FFFFFF', fontWeight: '600', textAlign: 'center' },
  buttonTextOutlined: { color: colors.primary },
  panel: {
    backgroundColor: colors.surface,
    marginVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    marginVertical: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgeText: { fontWeight: '600' },
  medIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.dueBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
});