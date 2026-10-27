import { act, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { HeaderClock, useCurrentTime } from '../../src/components/HeaderClock';
import { fresh, medicine } from '../support/fixtures';
import { renderApp } from '../support/render';

afterEach(() => vi.useRealTimers());

function Clock({ now }) {
  return <HeaderClock date={useCurrentTime(now)} />;
}

it('updates at minute/midnight boundaries and on resume, then disposes the timer', () => {
  vi.useFakeTimers();
  let date = new Date(2026, 9, 8, 23, 59, 59);
  const now = () => date;
  const { unmount } = render(<Clock now={now} />);
  const format = (date) => date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  expect(screen.getByLabelText(`Current time: ${format(date)}`)).toBeInTheDocument();
  date = new Date(2026, 9, 9, 0, 0);
  act(() => vi.advanceTimersByTime(1000));
  expect(screen.getByLabelText(`Current time: ${format(date)}`)).toHaveAttribute('datetime', date.toISOString());
  date = new Date(2026, 9, 9, 14, 35);
  act(() => window.dispatchEvent(new Event('focus')));
  expect(screen.getByLabelText(`Current time: ${format(date)}`)).toBeInTheDocument();
  date = new Date(2026, 9, 9, 15, 40);
  act(() => document.dispatchEvent(new Event('visibilitychange')));
  expect(screen.getByLabelText(`Current time: ${format(date)}`)).toBeInTheDocument();
  expect(document.querySelector('time')).not.toHaveAttribute('aria-live');
  unmount();
  expect(vi.getTimerCount()).toBe(0);
});

it('refreshes Today and clears the prior day Undo when midnight passes', () => {
  vi.useFakeTimers();
  let date = new Date(2026, 9, 8, 23, 59, 59);
  const store = fresh({ clock: () => date });
  store.put({ ...medicine, times: ['08:00'] });
  store.record(store.doseKey(medicine, '08:00'), 'Taken');
  renderApp(store);
  expect(screen.getByText('Status: Taken')).toBeInTheDocument();
  date = new Date(2026, 9, 9, 0, 0);
  act(() => vi.advanceTimersByTime(1000));
  expect(screen.getByText('Status: Due')).toBeInTheDocument();
  expect(screen.getByText(/Your daily routine/).querySelector('time')).toHaveAttribute('datetime', '2026-10-09');
  expect(screen.queryByRole('button', { name: 'Undo last change' })).not.toBeInTheDocument();
});
