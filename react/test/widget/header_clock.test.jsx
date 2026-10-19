import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { HeaderClock } from '../../src/components';
import App from '../../src/App';
import { fresh, med } from '../support/fixtures';

afterEach(() => vi.useRealTimers());

it('ports clock minute, midnight, resume, 12/24-hour format and disposal checks', () => {
  vi.useFakeTimers();
  let current = new Date(2026, 9, 8, 23, 59, 59);
  const now = () => current;
  const onDayChange = vi.fn();
  const { rerender, unmount } = render(<HeaderClock now={now} onDayChange={onDayChange} locale="en-GB" hour12={false} />);
  expect(screen.getByLabelText('Current time: 23:59')).toBeVisible();
  current = new Date(2026, 9, 9, 0, 0);
  act(() => vi.advanceTimersByTime(1000));
  expect(screen.getByLabelText('Current time: 00:00')).toBeVisible();
  expect(onDayChange).toHaveBeenLastCalledWith('2026-10-09');
  current = new Date(2026, 9, 9, 14, 35);
  fireEvent.focus(window);
  expect(screen.getByLabelText('Current time: 14:35')).toBeVisible();
  current = new Date(2026, 9, 9, 14, 36);
  fireEvent(document, new Event('visibilitychange'));
  expect(screen.getByLabelText('Current time: 14:36')).toBeVisible();
  rerender(<HeaderClock now={now} locale="en-US" hour12 />);
  expect(screen.getByLabelText('Current time: 02:36 PM')).toBeVisible();
  unmount();
  expect(vi.getTimerCount()).toBe(0);
});

it('rolls Today to the next local date and resets day-specific status at midnight', () => {
  vi.useFakeTimers();
  let current = new Date(2026, 9, 8, 23, 59, 59);
  const store = fresh({ now: () => current });
  store.put(med);
  store.record(store.doseKey(med, '08:00'), 'Taken');
  render(<App store={store} />);
  expect(screen.getByText('1 of 2 doses recorded Taken')).toBeVisible();
  current = new Date(2026, 9, 9, 0, 0);
  act(() => vi.advanceTimersByTime(1000));
  expect(screen.getByText('2026-10-09')).toBeVisible();
  expect(screen.getByText('0 of 2 doses recorded Taken')).toBeVisible();
});
