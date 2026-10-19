import React, { useState } from 'react';
import { View } from 'react-native';
import { ActionButton } from './DesignWidgets';
import { useAppStore } from '../state/AppStoreContext';

export default function DoseControls({ doseKey }) {
  const store = useAppStore();
  const [previous, setPrevious] = useState(null);

  const record = (status) => {
    setPrevious(store.status(doseKey));
    store.record(doseKey, status);
  };

  const undo = () => {
    store.record(doseKey, previous);
    setPrevious(null);
  };

  return (
    <View>
      <ActionButton label="Mark Taken" onPress={() => record('Taken')} />
      <ActionButton label="Skip dose" variant="outlined" onPress={() => record('Skipped')} />
      {previous !== null && <ActionButton label="Undo last change" onPress={undo} />}
    </View>
  );
}