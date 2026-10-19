import React from 'react';
import AppText from '../components/AppText';
import DoseControls from '../components/DoseControls';
import { ActionButton, AppPage, MedicineHeading, Panel, StatusBadge } from '../components/DesignWidgets';
import { useAppStore } from '../state/AppStoreContext';

export default function DoseScreen({ navigation, route }) {
  const store = useAppStore();
  const { medicineId, time } = route.params ?? {};
  const medicine = store.medicines.find((m) => m.id === medicineId);
  const onBack = navigation.canGoBack() ? () => navigation.goBack() : undefined;

  if (!medicine) {
    return (
      <AppPage title="Medication reminder" onBack={onBack}>
        <AppText>This medicine is no longer saved.</AppText>
      </AppPage>
    );
  }

  const key = store.doseKey(medicine, time);
  return (
    <AppPage title="Medication reminder" onBack={onBack}>
      <Panel>
        <MedicineHeading medicine={medicine} />
        <StatusBadge status={store.status(key)} />
        <AppText>{`${store.day} at ${time}`}</AppText>
        <AppText>{medicine.instructions}</AppText>
        <DoseControls key={key} doseKey={key} />
        <ActionButton
          label="View medicine details"
          variant="outlined"
          onPress={() => navigation.navigate('MedicineDetails', { id: medicine.id })}
        />
      </Panel>
      <AppText>You can also correct this record later in History.</AppText>
    </AppPage>
  );
}