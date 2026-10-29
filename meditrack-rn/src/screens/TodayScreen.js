import React from 'react';
import { StyleSheet, View } from 'react-native';
import AppText from '../components/AppText';
import DoseControls from '../components/DoseControls';
import { ActionButton, AppPage, Heading, MedicineHeading, Panel, StatusBadge } from '../components/DesignWidgets';
import { useAppStore, useCurrentDay } from '../state/AppStoreContext';
import { colors } from '../theme';

// Every (medicine, time) pair for active medicines, earliest first
export function todaySlots(store) {
  return store.active
    .flatMap((medicine) => medicine.times.map((time) => ({ medicine, time })))
    .sort((a, b) => (a.time < b.time ? -1 : a.time > b.time ? 1 : 0));
}

export default function TodayScreen({ navigation }) {
  const store = useAppStore();
  useCurrentDay(store.now); // re-render after midnight so dose keys use today's date
  const slots = todaySlots(store);
  const taken = slots.filter((s) => store.status(store.doseKey(s.medicine, s.time)) === 'Taken').length;
  const progress = slots.length === 0 ? 0 : taken / slots.length;

  const side = (
    <View>
      <Panel>
        <Heading>Your day, at a glance</Heading>
        <AppText>{`${taken} of ${slots.length} doses recorded Taken`}</AppText>
        <View
          accessible
          accessibilityRole="progressbar"
          accessibilityLabel="Doses recorded today"
          accessibilityValue={{ min: 0, max: slots.length, now: taken }}
          style={styles.track}
        >
          <View style={[styles.fill, { width: `${progress * 100}%` }]} />
        </View>
      </Panel>
      <Panel>
        <AppText>No connection</AppText>
        <AppText style={styles.note}>
          Prototype: your information is saved only on this device and is not encrypted. Do not enter real health information.
        </AppText>
      </Panel>
    </View>
  );

  return (
    <AppPage title="Today" side={side}>
      <AppText>{store.day}</AppText>
      {slots.length === 0 && (
        <AppText>No medicines scheduled today. Add your first medicine to get started.</AppText>
      )}
      {slots.map(({ medicine, time }, i) => {
        const key = store.doseKey(medicine, time);
        return (
          <View key={key}>
            {i === 0 && <Heading>Next dose</Heading>}
            {i === 1 && <Heading>Later today</Heading>}
            <View style={[styles.card, i === 0 && styles.cardNext]}>
              <MedicineHeading medicine={medicine} />
              <StatusBadge status={store.status(key)} />
              <AppText style={styles.time}>{time}</AppText>
              <AppText>{medicine.instructions}</AppText>
              {i === 0 && <DoseControls key={key} doseKey={key} />}
              <ActionButton
                label={`Open ${medicine.name} dose at ${time}`}
                onPress={() => navigation.navigate('Dose', { medicineId: medicine.id, time })}
              />
            </View>
          </View>
        );
      })}
    </AppPage>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    marginVertical: 8,
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardNext: { borderWidth: 2, borderColor: colors.primary },
  time: { fontWeight: '700' },
  note: { marginTop: 8, color: colors.muted },
  track: {
    height: 12,
    marginTop: 12,
    borderRadius: 6,
    backgroundColor: colors.dueBg,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: colors.primary },
});