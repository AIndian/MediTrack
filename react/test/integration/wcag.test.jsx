import { act, fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import { fresh, medicine } from '../support/fixtures';
import { renderApp } from '../support/render';

afterEach(() => vi.useRealTimers());

it('keeps the day current while clock updates are paused and resumes the display', () => {
  vi.useFakeTimers();
  let date = new Date(2026, 9, 8, 23, 59);
  const store = fresh({ clock: () => date });
  renderApp(store);
  const before = date.toISOString();
  fireEvent.click(screen.getByRole('button', { name: 'Pause clock updates' }));
  date = new Date(2026, 9, 9, 0, 1);
  act(() => vi.advanceTimersByTime(2000));
  expect(screen.getByLabelText(/Paused time:/)).toHaveAttribute('datetime', before);
  expect(store.day).toBe('2026-10-09');
  expect(screen.getByText(/Your daily routine/).querySelector('time')).toHaveAttribute('datetime', '2026-10-09');
  expect(screen.getByRole('button', { name: 'Pause clock updates' })).toHaveAttribute('aria-pressed', 'true');
  fireEvent.click(screen.getByRole('button', { name: 'Pause clock updates' }));
  expect(screen.getByLabelText(/Current time:/)).toHaveAttribute('datetime', date.toISOString());
});

it('keeps Undo focus on surviving controls and preserves the newer history removal recovery', async () => {
  const store = fresh();
  store.put(medicine);
  const user = userEvent.setup();
  renderApp(store, '/dose/1/08:00');
  await user.click(screen.getByRole('button', { name: 'Mark Taken' }));
  await user.click(screen.getByRole('button', { name: 'Undo last change' }));
  expect(screen.getByRole('button', { name: 'Mark Taken' })).toHaveFocus();
  await user.click(screen.getByRole('button', { name: 'Mark Taken' }));
  await user.click(screen.getByRole('link', { name: 'History', exact: true }));
  const entry = screen.getByRole('article', { name: store.doseLabel(store.doseKey(medicine, '08:00')) });
  await user.click(within(entry).getByRole('button', { name: 'Due' }));
  expect(screen.getByRole('button', { name: 'Undo last removal' })).toHaveFocus();
  expect(screen.getByRole('status')).toHaveTextContent('Record cleared');
  expect(fresh().history(30)).toEqual([]);
});

it('exposes required fields, focuses invalid input and preserves unsaved drafts', async () => {
  const store = fresh();
  const user = userEvent.setup();
  renderApp(store, '/medicines/new');
  await user.click(screen.getByRole('button', { name: 'Review medicine' }));
  const name = screen.getByLabelText('Medicine name', { exact: true });
  expect(name).toHaveFocus();
  expect(name).toBeRequired();
  expect(name).toHaveAccessibleDescription('Please enter a medicine name');
  expect(screen.getByLabelText('Instructions (optional)')).not.toBeRequired();
  await user.type(name, medicine.name);
  await user.click(screen.getByRole('button', { name: 'Review medicine' }));
  expect(screen.getByLabelText('Strength / dosage', { exact: true })).toHaveFocus();
  expect(name).toHaveValue(medicine.name);
  expect(store.active).toEqual([]);
});
