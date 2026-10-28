import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import App from '../../src/App';
import { HeaderClock } from '../../src/components';
import { fresh, med } from '../support/fixtures';

afterEach(() => vi.useRealTimers());

it('keeps the day current while clock updates are paused and resumes the display', () => {
  vi.useFakeTimers();
  let time = new Date(2026, 9, 8, 23, 59);
  const onDayChange = vi.fn();
  render(<HeaderClock now={() => time} onDayChange={onDayChange} locale="en-GB" hour12={false} />);
  fireEvent.click(screen.getByRole('button', { name: 'Pause clock updates' }));
  time = new Date(2026, 9, 9, 0, 1);
  act(() => vi.advanceTimersByTime(2000));
  expect(screen.getByLabelText('Paused time: 23:59')).toBeVisible();
  expect(onDayChange).toHaveBeenLastCalledWith('2026-10-09');
  expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  fireEvent.click(screen.getByRole('button'));
  act(() => vi.advanceTimersByTime(1000));
  expect(screen.getByLabelText('Current time: 00:01')).toBeVisible();
});

it('keeps Undo and removed-history focus on surviving controls and announces corrections', async () => {
  const store = fresh();
  store.put(med);
  window.history.replaceState(null, '', '/#/dose/1/08:00');
  const user = userEvent.setup();
  render(<App store={store} />);
  await user.click(screen.getByRole('button', { name: 'Mark Taken' }));
  await user.click(screen.getByRole('button', { name: 'Undo last change' }));
  expect(screen.getByRole('button', { name: 'Mark Taken' })).toHaveFocus();
  await user.click(screen.getByRole('button', { name: 'Mark Taken' }));
  window.location.hash = '#/history';
  const heading = await screen.findByRole('heading', { name: 'Dose history', level: 1 });
  const entry = screen.getByRole('region', { name: store.doseLabel(store.doseKey(med, '08:00')) });
  await user.click(within(entry).getByRole('button', { name: 'Due' }));
  expect(heading).toHaveFocus();
  expect(screen.getByRole('status')).toHaveTextContent(`${store.doseLabel(store.doseKey(med, '08:00'))}: Due`);
  expect(fresh({ storage: store.storage }).history(30)).toEqual([]);
});

it('exposes required fields, keeps invalid drafts and allows keyboard error recovery', async () => {
  window.history.replaceState(null, '', '/#/medicines/new');
  const store = fresh();
  const user = userEvent.setup();
  render(<App store={store} />);
  await user.click(screen.getByRole('button', { name: 'Review medicine' }));
  expect(screen.getByRole('alert')).toHaveFocus();
  await user.tab();
  expect(screen.getByRole('link', { name: 'Enter a medicine name' })).toHaveFocus();
  await user.keyboard('{Enter}');
  const name = screen.getByLabelText('Medicine name');
  expect(name).toHaveFocus();
  expect(name).toBeRequired();
  expect(name).toHaveAccessibleDescription('Enter a medicine name');
  expect(screen.getByLabelText('Instructions (optional)')).not.toBeRequired();
  await user.type(name, med.name);
  expect(store.active).toEqual([]);
});
