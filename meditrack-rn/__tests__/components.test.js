import React from 'react';
import { Dimensions, StyleSheet, Text } from 'react-native';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { AppStoreProvider, useAppStore } from '../src/state/AppStoreContext';
import AppText from '../src/components/AppText';
import HeaderClock, { formatTime } from '../src/components/HeaderClock';
import DoseControls from '../src/components/DoseControls';
import { AppPage, Heading, MedicineHeading, Panel, StatusBadge } from '../src/components/DesignWidgets';
import { createMedicine } from '../src/models/medicine';
import { makeStore } from '../test-utils/store';

const withStore = (ui, store) => render(<AppStoreProvider store={store}>{ui}</AppStoreProvider>);
const fontSizeOf = (el) => StyleSheet.flatten(el.props.style).fontSize;

describe('formatTime', () => {
  test('12-hour format', () => {
    expect(formatTime(new Date(2026, 9, 19, 0, 5))).toBe('12:05 AM');
    expect(formatTime(new Date(2026, 9, 19, 12, 0))).toBe('12:00 PM');
    expect(formatTime(new Date(2026, 9, 19, 15, 30))).toBe('3:30 PM');
  });
  test('24-hour format', () => {
    expect(formatTime(new Date(2026, 9, 19, 7, 5), true)).toBe('07:05');
  });
});

describe('HeaderClock', () => {
  afterEach(() => jest.useRealTimers());

  test('shows the time with a screen-reader label', async () => {
    await render(<HeaderClock now={() => new Date(2026, 9, 19, 9, 0)} />);
    expect(screen.getByLabelText('Current time: 9:00 AM')).toBeTruthy();
  });

  test('updates when the minute changes', async () => {
    jest.useFakeTimers();
    let current = new Date(2026, 9, 19, 9, 0, 30);
    await render(<HeaderClock now={() => current} />);
    expect(screen.getByText('9:00 AM')).toBeTruthy();
    current = new Date(2026, 9, 19, 9, 1, 0);
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    expect(screen.getByText('9:01 AM')).toBeTruthy();
  });
});

describe('AppText', () => {
  const phoneScale = () => Dimensions.get('window').fontScale;

  test('uses normal size outside the app store', async () => {
    await render(<AppText>Hello</AppText>);
    expect(fontSizeOf(screen.getByText('Hello'))).toBe(16 * Math.max(1, phoneScale()));
  });

  test('uses the larger of app and phone text size, not both multiplied', async () => {
    const store = await makeStore();
    store.setTextScale(2.0);
    await withStore(<AppText style={{ fontSize: 20 }}>Big</AppText>, store);
    expect(fontSizeOf(screen.getByText('Big'))).toBe(20 * Math.max(2, phoneScale()));
  });
});

describe('design widgets', () => {
  test('Heading is announced as a header', async () => {
    await render(<Heading>Today</Heading>);
    expect(screen.getByRole('header', { name: 'Today' })).toBeTruthy();
  });

  test.each(['Taken', 'Skipped', 'Due'])('StatusBadge shows %s', async (status) => {
    await render(<StatusBadge status={status} />);
    expect(screen.getByText(`Status: ${status}`)).toBeTruthy();
  });

  test('MedicineHeading shows name and strength', async () => {
    const med = createMedicine({ id: 'm1', name: 'Metformin', strength: '500 mg', instructions: '', times: [] });
    await render(<MedicineHeading medicine={med} />);
    expect(screen.getByRole('header', { name: 'Metformin' })).toBeTruthy();
    expect(screen.getByText('500 mg')).toBeTruthy();
  });

  test('Panel renders its children', async () => {
    await render(<Panel><Text>Inside</Text></Panel>);
    expect(screen.getByText('Inside')).toBeTruthy();
  });

  test('AppPage shows title, subtitle, content, and side content', async () => {
    await render(
      <AppPage title="Today" side={<Text>Side</Text>}>
        <Text>Main</Text>
      </AppPage>
    );
    expect(screen.getByRole('header', { name: 'Today' })).toBeTruthy();
    expect(screen.getByText('Your daily medication plan')).toBeTruthy();
    expect(screen.getByText('Main')).toBeTruthy();
    expect(screen.getByText('Side')).toBeTruthy();
    expect(screen.queryByLabelText('Go back')).toBeNull();
  });

  test('AppPage back button calls onBack', async () => {
    const onBack = jest.fn();
    await render(<AppPage title="Medicine details" onBack={onBack}><Text>x</Text></AppPage>);
    await fireEvent.press(screen.getByLabelText('Go back'));
    expect(onBack).toHaveBeenCalled();
  });
});

describe('DoseControls', () => {
  const key = '2026-10-19|m1|08:00';

  test('Mark Taken records the dose and offers Undo', async () => {
    const store = await makeStore();
    await withStore(<DoseControls doseKey={key} />, store);
    expect(screen.queryByLabelText('Undo last change')).toBeNull();
    await fireEvent.press(screen.getByLabelText('Mark Taken'));
    expect(store.status(key)).toBe('Taken');
    expect(screen.getByLabelText('Undo last change')).toBeTruthy();
  });

  test('Undo restores the previous status and hides itself', async () => {
    const store = await makeStore();
    await withStore(<DoseControls doseKey={key} />, store);
    await fireEvent.press(screen.getByLabelText('Mark Taken'));
    await fireEvent.press(screen.getByLabelText('Undo last change'));
    expect(store.status(key)).toBe('Due');
    expect(screen.queryByLabelText('Undo last change')).toBeNull();
  });

  test('Skip, then Undo, returns to the earlier Taken status', async () => {
    const store = await makeStore();
    await withStore(<DoseControls doseKey={key} />, store);
    await fireEvent.press(screen.getByLabelText('Mark Taken'));
    await fireEvent.press(screen.getByLabelText('Skip dose'));
    expect(store.status(key)).toBe('Skipped');
    await fireEvent.press(screen.getByLabelText('Undo last change'));
    expect(store.status(key)).toBe('Taken');
  });
});

test('useAppStore outside the provider gives a clear error', async () => {
  const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
  function Broken() {
    useAppStore();
    return null;
  }
  await expect(async () => {
    await render(<Broken />);
  }).rejects.toThrow('useAppStore must be used inside AppStoreProvider');
  spy.mockRestore();
});