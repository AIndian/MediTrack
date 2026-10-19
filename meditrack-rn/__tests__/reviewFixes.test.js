import React from 'react';
import { AccessibilityInfo, Platform, Text } from 'react-native';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { AppStore, STORAGE_KEY } from '../src/state/AppStore';
import { AppStoreProvider, useCurrentDay } from '../src/state/AppStoreContext';
import { createMedicine } from '../src/models/medicine';
import { AppPage, StatusBadge } from '../src/components/DesignWidgets';
import DoseControls from '../src/components/DoseControls';
import { seedIfEmpty } from '../src/state/sampleData';
import { fakeStorage, fixedClock, makeStore } from '../test-utils/store';

const med = createMedicine({
  id: 'm1', name: 'Metformin', strength: '500 mg', instructions: '', times: ['08:00'],
});

test('a later successful save clears the save error', async () => {
  const storage = fakeStorage();
  const realSet = storage.setItem;
  let fail = true;
  storage.setItem = jest.fn(async (k, v) => {
    if (fail) throw new Error('disk full');
    return realSet(k, v);
  });
  const s = await AppStore.load(storage, { clock: fixedClock });
  s.put(med);
  await s.pending;
  expect(s.error).toBe('Could not save. Keep the app open.');
  fail = false;
  s.record('k', 'Taken');
  await s.pending;
  expect(s.error).toBeNull();
  expect(JSON.parse(storage.data[STORAGE_KEY]).doses.k).toBe('Taken');
});

test('createMedicine rejects times that are not a list of strings', () => {
  expect(() => createMedicine({ ...med, times: '08:00' })).toThrow('list of time strings');
  expect(() => createMedicine({ ...med, times: [8] })).toThrow('list of time strings');
});

test('malformed saved schedules cause a load error instead of fake slots', async () => {
  const saved = {
    medicines: [{ ...med, times: '08:00', supply: 30, archived: false }],
    doses: {},
    symptoms: [],
  };
  const s = await AppStore.load(fakeStorage({ [STORAGE_KEY]: JSON.stringify(saved) }), { clock: fixedClock });
  expect(s.error).toBe('Could not load data. Restart the app.');
  expect(s.medicines).toEqual([]);
});

test('AppPage shows storage errors to the user', async () => {
  const store = await makeStore();
  store.error = 'Could not save. Keep the app open.';
  await render(
    <AppStoreProvider store={store}>
      <AppPage title="Today"><Text>x</Text></AppPage>
    </AppStoreProvider>
  );
  expect(screen.getByText('Could not save. Keep the app open.')).toBeTruthy();
});

test('StatusBadge announces changes on iOS but not on first render', async () => {
  const spy = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});
  const view = await render(<StatusBadge status="Due" />);
  expect(spy).not.toHaveBeenCalled();
  await view.rerender(<StatusBadge status="Taken" />);
  if (Platform.OS === 'ios') {
    expect(spy).toHaveBeenCalledWith('Status: Taken');
  }
  spy.mockRestore();
});

test('Undo does not overwrite a newer change made elsewhere', async () => {
  const store = await makeStore();
  const key = '2026-10-19|m1|08:00';
  await render(
    <AppStoreProvider store={store}>
      <DoseControls doseKey={key} />
    </AppStoreProvider>
  );
  await fireEvent.press(screen.getByLabelText('Mark Taken'));
  await act(async () => {
    store.record(key, 'Skipped'); // e.g. changed from another screen
  });
  await fireEvent.press(screen.getByLabelText('Undo last change'));
  expect(store.status(key)).toBe('Skipped');
  expect(screen.queryByLabelText('Undo last change')).toBeNull();
});

test('useCurrentDay updates after midnight', async () => {
  jest.useFakeTimers();
  let current = new Date(2026, 9, 19, 23, 59, 30);
  const clock = () => current;
  function Day() {
    return <Text>{useCurrentDay(clock)}</Text>;
  }
  await render(<Day />);
  expect(screen.getByText('2026-10-19')).toBeTruthy();
  current = new Date(2026, 9, 20, 0, 0, 30);
  await act(async () => {
    jest.advanceTimersByTime(60 * 1000);
  });
  expect(screen.getByText('2026-10-20')).toBeTruthy();
  jest.useRealTimers();
});

test('sample data is labeled and saved in a single write', async () => {
  const storage = fakeStorage();
  const store = await AppStore.load(storage, { clock: fixedClock });
  expect(seedIfEmpty(store)).toBe(true);
  await store.pending;
  expect(storage.setItem).toHaveBeenCalledTimes(1);
  expect(store.medicines.every((m) => m.name.startsWith('Sample:'))).toBe(true);
});

test('archive and dose status survive an app restart', async () => {
  const storage = fakeStorage();
  const first = await AppStore.load(storage, { clock: fixedClock });
  first.put(med);
  first.archive(first.medicines[0]);
  first.record('2026-10-19|m1|08:00', 'Taken');
  await first.pending;

  // "Restart": a brand-new store reading the same storage
  const second = await AppStore.load(storage, { clock: fixedClock });
  expect(second.medicines[0].archived).toBe(true);
  expect(second.status('2026-10-19|m1|08:00')).toBe('Taken');
  expect(second.error).toBeNull();
});