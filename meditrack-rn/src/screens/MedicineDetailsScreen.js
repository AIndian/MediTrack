import React from 'react';
import { StyleSheet, View } from 'react-native';
import AppText from '../components/AppText';
import { ActionButton, AppPage, Heading, MedicineHeading, Panel } from '../components/DesignWidgets';
import { useAppStore } from '../state/AppStoreContext';

export default function MedicineDetailsScreen({ navigation, route }) {
  const store = useAppStore();
  const medicine = store.medicines.find((m) => m.id === route.params?.id);
  const onBack = navigation.canGoBack() ? () => navigation.goBack() : undefined;

  if (!medicine) {
    return (
      <AppPage title="Medicine details" onBack={onBack}>
        <AppText>This medicine is no longer saved.</AppText>
      </AppPage>
    );
  }

  return (
    <AppPage title="Medicine details" onBack={onBack}>
      <Panel>
        <MedicineHeading medicine={medicine} />
        <View style={styles.gap} />
        <AppText>Instructions you entered</AppText>
        <AppText>{medicine.instructions === '' ? 'None entered' : medicine.instructions}</AppText>
        <View style={styles.gap} />
        <Heading>Schedule</Heading>
        <AppText>{`Daily at ${medicine.times.join(', ')}`}</AppText>
        <AppText>{medicine.archived ? 'Archived — no longer scheduled' : 'Active'}</AppText>
      </Panel>
      <Panel>
        <Heading>Refill details</Heading>
        <AppText>{`Recorded supply: ${medicine.supply} doses`}</AppText>
        <AppText>Low-supply threshold: 10 doses</AppText>
      </Panel>
      <ActionButton
        label={medicine.archived ? 'Restore medicine' : 'Archive medicine'}
        onPress={() => store.archive(medicine)}
      />
    </AppPage>
  );
}

const styles = StyleSheet.create({
  gap: { height: 16 },
});