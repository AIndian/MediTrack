import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { fresh, medicine } from '../support/fixtures';
import { renderApp } from '../support/render';

it('continues to saved details after a Review write failure is successfully retried', async () => {
  const storage = {
    getItem: () => null,
    setItem: vi.fn(() => {
      throw new Error('full');
    }),
  };
  const store = fresh({ storage });
  const user = userEvent.setup();
  renderApp(store, { pathname: '/medicines/review', state: { draft: medicine } });
  await user.click(screen.getByRole('button', { name: 'Save medicine' }));
  expect(store.active).toEqual([medicine]);
  expect(screen.getByRole('status')).toHaveTextContent('recorded in this tab');
  await user.click(screen.getByRole('button', { name: 'Retry saving' }));
  expect(screen.getByRole('heading', { level: 1, name: 'Review medicine' })).toBeInTheDocument();
  storage.setItem.mockImplementation(() => {});
  await user.click(screen.getByRole('button', { name: 'Retry saving' }));
  expect(await screen.findByRole('heading', { level: 1, name: 'Medicine details' })).toHaveFocus();
  expect(screen.getByText('Changes saved on this device.')).toHaveAttribute('role', 'status');
  expect(JSON.parse(storage.setItem.mock.lastCall[1]).medicines).toEqual([medicine]);
});
