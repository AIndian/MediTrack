import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { storageKey } from '../../src/store';
import { fresh, medicine } from '../support/fixtures';
import { renderApp } from '../support/render';

it.each([
  ['/unknown', 'Page not found'],
  ['/medicines/missing', 'Medicine details'],
  ['/medicines/missing/edit', 'Edit medicine'],
  ['/medicines/review', 'Review medicine'],
  ['/dose/missing/08:00', 'Dose details'],
  ['/dose/1/25:00', 'Dose details'],
])('handles unavailable links: %s', (route, title) => {
  renderApp(fresh(), route);
  expect(screen.getByRole('heading', { level: 1, name: title })).toHaveFocus();
  expect(document.title).toBe(`${title} · MediTrack`);
});

it('rejects a previously valid dose link after the medicine is archived', () => {
  const store = fresh();
  store.put(medicine);
  renderApp(store, '/dose/1/08:00');
  expect(screen.getByRole('button', { name: 'Mark Taken' })).toBeInTheDocument();
  act(() => store.archive(medicine));
  expect(screen.getByText(/This dose is no longer scheduled/)).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Mark Taken' })).not.toBeInTheDocument();
});

it('protects unreadable saved data and disables editing', async () => {
  const raw = '{bad';
  localStorage.setItem(storageKey, raw);
  const user = userEvent.setup();
  renderApp(fresh());
  expect(screen.getByRole('alert')).toHaveTextContent('Could not load data.');
  await user.click(screen.getByRole('link', { name: 'Add medicine' }));
  expect(screen.getByLabelText('Medicine name')).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Review medicine' })).toBeDisabled();
  expect(localStorage.getItem(storageKey)).toBe(raw);
});

it('announces a failed write and retries without losing the dose change', async () => {
  const storage = { getItem: () => null, setItem: vi.fn() };
  const store = fresh({ storage });
  store.put({ ...medicine, times: ['08:00'] });
  storage.setItem.mockImplementation(() => { throw new Error('full'); });
  const user = userEvent.setup();
  renderApp(store, '/dose/1/08:00');
  await user.click(screen.getByRole('button', { name: 'Mark Taken' }));
  expect(screen.getByRole('alert')).toHaveTextContent('Could not save.');
  expect(screen.getByRole('status')).toHaveTextContent('Saving has failed.');
  expect(store.status(store.doseKey(medicine, '08:00'))).toBe('Taken');
  storage.setItem.mockImplementation(() => {});
  await user.click(screen.getByRole('button', { name: 'Retry saving' }));
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(JSON.parse(storage.setItem.mock.lastCall[1]).doses).toEqual({ '2026-10-08|1|08:00': 'Taken' });
});
