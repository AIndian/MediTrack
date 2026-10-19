import React, { useState } from 'react';
import { View } from 'react-native';
import { ActionButton } from './DesignWidgets';
import { useAppStore } from '../state/AppStoreContext';

export default function DoseControls({ doseKey }) {
  const store = useAppStore();
  // What we changed, so Undo can tell whether a newer change has happened since
  const [last, setLast] = useState(null);

  const record = (status) => {
    setLast({ previous: store.status(doseKey), applied: status });
    store.record(doseKey, status);
  };

  const undo = () => {
    if (last && store.status(doseKey) === last.applied) {
      store.record(doseKey, last.previous);
    }
    setLast(null);
  };

  return (
    <View>
      <ActionButton label="Mark Taken" onPress={() => record('Taken')} />
      <ActionButton label="Skip dose" variant="outlined" onPress={() => record('Skipped')} />
      {last !== null && <ActionButton label="Undo last change" onPress={undo} />}
    </View>
  );
}