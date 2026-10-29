import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { AppStoreProvider } from '../src/state/AppStoreContext';
import { STORAGE_KEY } from '../src/state/AppStore';
import TodayScreen, { todaySlots } from '../src/screens/TodayScreen';
import MedicineDetailsScreen from '../src/screens/MedicineDetailsScreen';
import DoseScreen from '../src/screens/DoseScreen';
import { seedIfEmpty } from '../src/state/sampleData';
import { createMedicine } from '../src/models/medicine';
import { makeStore } from '../test-utils/store';

const lisinopril = createMedicine({
  id: 'a', name: 'Lisinopril', strength: '10 mg', instructions: 'Take in the morning', times: ['08:00'],
});
const metformin = createMedicine({
  id: 'b', name: 'Metformin', strength: '500 mg', instructions: '', times: ['20:00', '12:00'], supply: 12,
});
const oldMed = createMedicine({
  id: 'c', name: 'Old Med', strength: '1 mg', instructions: '', times: ['09:00'], archived: true,
});

async function storeWith(...meds) {
  const store = await makeStore();
  meds.forEach((m) => store.put(m));
  return store;
}
const mockNav = (canGoBack = true) => ({
  navigate: jest.fn(),
  goBack: jest.fn(),
  canGoBack: jest.fn(() => canGoBack),
});
const show = (ui, store) => render(<AppStoreProvider store={store}>{ui}</AppStoreProvider>);

describe('TodayScreen', () => {
  test('shows an empty state when nothing is scheduled', async () => {
    const store = await storeWith();
    await show(<TodayScreen navigation={mockNav()} />, store);
    expect(screen.getByText('No medicines scheduled today. Add your first medicine to get started.')).toBeTruthy();
    expect(screen.getByText('0 of 0 doses recorded Taken')).toBeTruthy();
    expect(screen.queryByRole('header', { name: 'Next dose' })).toBeNull();
  });

  test('todaySlots sorts by time and skips archived medicines', async () => {
    const store = await storeWith(metformin, lisinopril, oldMed);
    expect(todaySlots(store).map((s) => `${s.medicine.name} ${s.time}`)).toEqual([
      'Lisinopril 08:00',
      'Metformin 12:00',
      'Metformin 20:00',
    ]);
  });

  test('shows Next dose and Later today, with controls only on the next dose', async () => {
    const store = await storeWith(metformin, lisinopril, oldMed);
    await show(<TodayScreen navigation={mockNav()} />, store);
    expect(screen.getByText('2026-10-19')).toBeTruthy();
    expect(screen.getByRole('header', { name: 'Next dose' })).toBeTruthy();
    expect(screen.getByRole('header', { name: 'Later today' })).toBeTruthy();
    expect(screen.getAllByLabelText('Mark Taken')).toHaveLength(1);
    expect(screen.queryByText('Old Med')).toBeNull();
    expect(screen.getByLabelText('Doses recorded today')).toBeTruthy();
  });

  test('marking the next dose Taken updates the badge and progress', async () => {
    const store = await storeWith(metformin, lisinopril);
    await show(<TodayScreen navigation={mockNav()} />, store);
    await fireEvent.press(screen.getByLabelText('Mark Taken'));
    expect(screen.getByText('Status: Taken')).toBeTruthy();
    expect(screen.getByText('1 of 3 doses recorded Taken')).toBeTruthy();
  });

  test('opening a dose navigates with its medicine and time', async () => {
    const store = await storeWith(metformin, lisinopril);
    const nav = mockNav();
    await show(<TodayScreen navigation={nav} />, store);
    await fireEvent.press(screen.getByLabelText('Open Metformin dose at 12:00'));
    expect(nav.navigate).toHaveBeenCalledWith('Dose', { medicineId: 'b', time: '12:00' });
  });
});

describe('MedicineDetailsScreen', () => {
  test('shows schedule, refill, and empty instructions', async () => {
    const store = await storeWith(metformin);
    await show(<MedicineDetailsScreen navigation={mockNav()} route={{ params: { id: 'b' } }} />, store);
    expect(screen.getByRole('header', { name: 'Medicine details' })).toBeTruthy();
    expect(screen.getByText('None entered')).toBeTruthy();
    expect(screen.getByText('Daily at 20:00, 12:00')).toBeTruthy();
    expect(screen.getByText('Active')).toBeTruthy();
    expect(screen.getByText('Recorded supply: 12 doses')).toBeTruthy();
  });

  test('shows instructions when entered', async () => {
    const store = await storeWith(lisinopril);
    await show(<MedicineDetailsScreen navigation={mockNav()} route={{ params: { id: 'a' } }} />, store);
    expect(screen.getByText('Take in the morning')).toBeTruthy();
  });

  test('archive and restore toggle the status', async () => {
    const store = await storeWith(lisinopril);
    await show(<MedicineDetailsScreen navigation={mockNav()} route={{ params: { id: 'a' } }} />, store);
    await fireEvent.press(screen.getByLabelText('Archive medicine'));
    expect(store.medicines[0].archived).toBe(true);
    expect(screen.getByText('Archived — no longer scheduled')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Restore medicine'));
    expect(screen.getByText('Active')).toBeTruthy();
  });

  test('back button navigates back', async () => {
    const store = await storeWith(lisinopril);
    const nav = mockNav();
    await show(<MedicineDetailsScreen navigation={nav} route={{ params: { id: 'a' } }} />, store);
    await fireEvent.press(screen.getByLabelText('Go back'));
    expect(nav.goBack).toHaveBeenCalled();
  });

  test('handles a removed medicine without crashing', async () => {
    const store = await storeWith();
    await show(<MedicineDetailsScreen navigation={mockNav(false)} route={{ params: { id: 'zzz' } }} />, store);
    expect(screen.getByText('This medicine is no longer saved.')).toBeTruthy();
    expect(screen.queryByLabelText('Go back')).toBeNull();
  });
});

describe('DoseScreen', () => {
  const route = { params: { medicineId: 'a', time: '08:00' } };

  test('shows the reminder and records Taken with Undo', async () => {
    const store = await storeWith(lisinopril);
    await show(<DoseScreen navigation={mockNav()} route={route} />, store);
    expect(screen.getByRole('header', { name: 'Medication reminder' })).toBeTruthy();
    expect(screen.getByText('2026-10-19 at 08:00')).toBeTruthy();
    expect(screen.getByText('Status: Due')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Mark Taken'));
    expect(screen.getByText('Status: Taken')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Undo last change'));
    expect(screen.getByText('Status: Due')).toBeTruthy();
  });

  test('links to medicine details', async () => {
    const store = await storeWith(lisinopril);
    const nav = mockNav();
    await show(<DoseScreen navigation={nav} route={route} />, store);
    await fireEvent.press(screen.getByLabelText('View medicine details'));
    expect(nav.navigate).toHaveBeenCalledWith('MedicineDetails', { id: 'a' });
  });

  test('handles a missing medicine', async () => {
    const store = await storeWith();
    await show(<DoseScreen navigation={mockNav(false)} route={{}} />, store);
    expect(screen.getByText('This medicine is no longer saved.')).toBeTruthy();
  });
});

describe('seedIfEmpty', () => {
  test('adds sample medicines to an empty store', async () => {
    const store = await makeStore();
    expect(seedIfEmpty(store)).toBe(true);
    expect(store.medicines).toHaveLength(2);
  });

  test('leaves existing data alone', async () => {
    const store = await storeWith(lisinopril);
    expect(seedIfEmpty(store)).toBe(false);
    expect(store.medicines).toHaveLength(1);
  });

  test('does nothing after a load error', async () => {
    const store = await makeStore({ [STORAGE_KEY]: 'bad' });
    expect(seedIfEmpty(store)).toBe(false);
  });
});