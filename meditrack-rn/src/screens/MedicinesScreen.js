import React from 'react';
import { View } from 'react-native';
import AppText from '../components/AppText';
import {
  ActionButton,
  AppPage,
  Heading,
  MedicineHeading,
  Panel,
} from '../components/DesignWidgets';
import { useAppStore } from '../state/AppStoreContext';
export default function MedicinesScreen({ navigation }) {
  const store = useAppStore();
  const active = store.medicines.filter((m) => !m.archived);
  const archived = store.medicines.filter((m) => m.archived);
  function renderMedicine(medicine) {
    return (
      <Panel key={medicine.id}>
        <MedicineHeading medicine={medicine} />
        <AppText>
          {`Schedule: ${medicine.times.join(', ') || 'None'}`}
        </AppText>
        <AppText>
          {`Supply: ${medicine.supply} doses`}
        </AppText>
        <ActionButton
          label={`View details for ${medicine.name}`}
          onPress={() =>
            navigation.navigate('MedicineDetails', { id: medicine.id })
          }
        />
      </Panel>
    );
  }
  return (
    <AppPage title="Your medicines">
      <Heading>Active medicines</Heading>
      {active.length === 0 ? (
        <AppText>No active medicines saved yet.</AppText>
      ) : (
        active.map(renderMedicine)
      )}
      {archived.length > 0 && (
        <View>
          <Heading>Archived medicines</Heading>
          {archived.map(renderMedicine)}
        </View>
      )}
    </AppPage>
  );
}
