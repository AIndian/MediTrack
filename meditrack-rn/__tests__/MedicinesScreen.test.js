import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { AppStoreProvider } from '../src/state/AppStoreContext';
import { createMedicine } from '../src/models/medicine';
import { makeStore } from '../test-utils/store';
import MedicinesScreen from '../src/screens/MedicinesScreen';
const medicine = (id, name, archived = false, times = ['08:00']) =>
  createMedicine({
    id,
    name,
    strength: '10 mg',
    instructions: '',
    times,
    supply: 20,
    archived,
  });
const show = (store, navigation) =>
  render(
    <AppStoreProvider store={store}>
      <MedicinesScreen navigation={navigation} />
    </AppStoreProvider>
  );
const mockNav = (canGoBack = true) => ({
  navigate: jest.fn(),
  goBack: jest.fn(),
  canGoBack: jest.fn(() => canGoBack),
});
test('shows an empty message when no medicines exist', async () => {
  const store = await makeStore();
  await show(store, mockNav());
  expect(screen.getByText('No active medicines saved yet.')).toBeTruthy();
  expect(screen.queryByText('Archived medicines')).toBeNull();
});
test('displays active medicine details', async () => {
  const store = await makeStore();
  store.put(medicine('a', 'Vitamin B12'));
  await show(store, mockNav());
  expect(screen.getByText('Vitamin B12')).toBeTruthy();
  expect(screen.getByText('Schedule: 08:00')).toBeTruthy();
  expect(screen.getByText('Supply: 20 doses')).toBeTruthy();
});
test('separates archived medicines from active medicines', async () => {
  const store = await makeStore();
  store.put(medicine('a', 'Vitamin B12'));
  store.put(medicine('b', 'Old Medicine', true));
  await show(store, mockNav());
  expect(screen.getByText('Active medicines')).toBeTruthy();
  expect(screen.getByText('Archived medicines')).toBeTruthy();
  expect(screen.getByText('Old Medicine')).toBeTruthy();
});
test('opens the correct medicine details', async () => {
  const store = await makeStore();
  store.put(medicine('a', 'Vitamin B12'));
  const nav = mockNav();
  await show(store, nav);
  fireEvent.press(screen.getByLabelText('View details for Vitamin B12'));
  expect(nav.navigate).toHaveBeenCalledWith('MedicineDetails', { id: 'a' });
});
test('shows None when a medicine has no schedule', async () => {
  const store = await makeStore();
  store.put(medicine('a', 'Vitamin B12', false, []));
  await show(store, mockNav());
  expect(screen.getByText('Schedule: None')).toBeTruthy();
});

