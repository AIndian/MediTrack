import React from 'react';
import { Text, AppState } from 'react-native';
import { act, render, screen } from '@testing-library/react-native';
import {
  useCurrentDay,
  useOptionalStore,
  useTextScale,
} from '../src/state/AppStoreContext';
function DayDisplay({ now }) {
  const day = useCurrentDay(now);
  return <Text>{day}</Text>;
}
function OptionalStoreDisplay() {
  const store = useOptionalStore();
  const scale = useTextScale();
  return <Text>{`${store === null ? 'No store' : 'Store'}: ${scale}`}</Text>;
}
describe('AppStoreContext additional coverage', () => {
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });
  test('optional store works without a provider', async () => {
    await render(<OptionalStoreDisplay />);
    expect(screen.getByText('No store: 1')).toBeTruthy();
  });
  test('updates the date when midnight passes', async () => {
    jest.useFakeTimers();
    let current = new Date(2026, 9, 20, 23, 59);
    const now = () => current;
    await render(<DayDisplay now={now} />);
    expect(screen.getByText('2026-10-20')).toBeTruthy();
    current = new Date(2026, 9, 21, 0, 1);
    await act(async () => {
      jest.advanceTimersByTime(60000);
    });
    expect(screen.getByText('2026-10-21')).toBeTruthy();
  });
  test('updates the date when the app becomes active', async () => {
    let current = new Date(2026, 9, 20, 12);
    const now = () => current;
    let appStateListener;
    jest.spyOn(AppState, 'addEventListener').mockImplementation(
      (event, callback) => {
        appStateListener = callback;
        return { remove: jest.fn() };
      }
    );
    await render(<DayDisplay now={now} />);
    expect(screen.getByText('2026-10-20')).toBeTruthy();
    current = new Date(2026, 9, 21, 12);
    await act(async () => {
      appStateListener('background');
    });
    expect(screen.getByText('2026-10-20')).toBeTruthy();
    await act(async () => {
      appStateListener('active');
    });
    expect(screen.getByText('2026-10-21')).toBeTruthy();
  });
});




