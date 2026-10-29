import React, { useEffect, useState } from 'react';
import { AppState, StyleSheet } from 'react-native';
import AppText from './AppText';
import { colors } from '../theme';

const defaultNow = () => new Date();

export function formatTime(date, use24Hour = false) {
  const h = date.getHours();
  const m = String(date.getMinutes()).padStart(2, '0');
  if (use24Hour) {
    return `${String(h).padStart(2, '0')}:${m}`;
  }
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m} ${h < 12 ? 'AM' : 'PM'}`;
}

export default function HeaderClock({ now = defaultNow, use24Hour = false }) {
  const [label, setLabel] = useState(() => formatTime(now(), use24Hour));

  useEffect(() => {
    // Checks every second; React only re-renders when the text actually changes
    const refresh = () => setLabel(formatTime(now(), use24Hour));
    const timer = setInterval(refresh, 1000);
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    return () => {
      clearInterval(timer);
      sub.remove();
    };
  }, [now, use24Hour]);

  // One label for screen readers so the time isn't announced every minute
  return (
    <AppText accessible accessibilityLabel={`Current time: ${label}`} style={styles.clock}>
      {label}
    </AppText>
  );
}

const styles = StyleSheet.create({
  clock: { fontSize: 16, lineHeight: 24, fontWeight: '600', color: colors.primary, textAlign: 'right' },
});