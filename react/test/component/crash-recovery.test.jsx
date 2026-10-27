import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';
import { createMedicineId, storageKey } from '../../src/store';
import { fresh } from '../support/fixtures';
import { renderApp } from '../support/render';

afterEach(() => {
  vi.unstubAllGlobals();
  window.history.replaceState(null, '', '/');
});

it('adds and saves a medicine when randomUUID is unavailable on an HTTP origin', async () => {
  const getRandomValues = crypto.getRandomValues.bind(crypto);
  vi.stubGlobal('crypto', { getRandomValues });
  const ids = new Set(Array.from({ length: 100 }, createMedicineId));
  expect(ids.size).toBe(100);
  expect([...ids].every((id) => /^[0-9a-f]{32}$/.test(id))).toBe(true);
  const store = fresh();
  const user = userEvent.setup();
  renderApp(store, '/medicines/new');
  await user.type(screen.getByLabelText('Medicine name'), 'HTTP sample');
  await user.type(screen.getByLabelText('Strength / dosage'), '5 mg');
  await user.click(screen.getByRole('button', { name: 'Review medicine' }));
  await user.click(screen.getByRole('button', { name: 'Save medicine' }));
  expect(store.active[0].id).toMatch(/^[0-9a-f]{32}$/);
  expect(fresh().active[0]).toMatchObject({ id: store.active[0].id, name: 'HTTP sample' });
});

it('keeps the platform UUID when available', () => {
  vi.spyOn(crypto, 'randomUUID').mockReturnValue('platform-id');
  expect(createMedicineId()).toBe('platform-id');
});

it('catches a page render error and recovers without clearing saved records', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  function Broken() { throw new Error('Test render failure'); }
  localStorage.setItem(storageKey, 'Original saved records');
  const user = userEvent.setup();
  const { rerender } = render(<ErrorBoundary><Broken /></ErrorBoundary>);
  expect(screen.getByRole('heading', { name: 'This page could not open' })).toHaveFocus();
  expect(screen.getByRole('alert')).toHaveTextContent('saved records have not been cleared');
  rerender(<ErrorBoundary><p>Recovered content</p></ErrorBoundary>);
  await user.click(screen.getByRole('button', { name: 'Return to Today' }));
  expect(screen.getByText('Recovered content')).toBeInTheDocument();
  expect(window.location.hash).toBe('#/');
  expect(localStorage.getItem(storageKey)).toBe('Original saved records');
});
