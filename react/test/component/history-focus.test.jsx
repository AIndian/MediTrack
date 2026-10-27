import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { fresh, medicine } from '../support/fixtures';
import { renderApp } from '../support/render';

it('focuses Undo after a record disappears, restores it, then focuses the announcement', async () => {
  const store = fresh();
  store.put(medicine);
  const key = store.doseKey(medicine, '08:00');
  store.record(key, 'Taken');
  const user = userEvent.setup();
  renderApp(store, '/history');
  await user.click(screen.getByRole('button', { name: 'Due', exact: true }));
  expect(store.status(key)).toBe('Due');
  expect(screen.getByRole('button', { name: 'Undo last removal' })).toHaveFocus();
  expect(screen.getByRole('status')).toHaveTextContent('Undo is available.');
  await user.click(screen.getByRole('button', { name: 'Undo last removal' }));
  expect(store.status(key)).toBe('Taken');
  expect(screen.getByText('Removal undone.')).toHaveFocus();
  await user.tab();
  expect(screen.getByRole('button', { name: 'Taken', exact: true })).toHaveFocus();
});

it('keeps removal and Undo available in memory when persistence fails', async () => {
  const storage = { getItem: () => null, setItem: vi.fn() };
  const store = fresh({ storage });
  store.put(medicine);
  const key = store.doseKey(medicine, '08:00');
  store.record(key, 'Skipped');
  storage.setItem.mockImplementation(() => { throw new Error('full'); });
  const user = userEvent.setup();
  renderApp(store, '/history');
  await user.click(screen.getByRole('button', { name: 'Due', exact: true }));
  expect(screen.getByRole('status')).toHaveTextContent('Saving has failed. Undo is available.');
  await user.click(screen.getByRole('button', { name: 'Undo last removal' }));
  expect(store.status(key)).toBe('Skipped');
  expect(screen.getByText('Removal undone in this tab. Saving has failed.')).toHaveFocus();
});
