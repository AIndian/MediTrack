import { expect, it } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import App from '../../src/App';
import { fresh } from '../support/fixtures';

it('boots with empty local records', () => {
  render(<App store={fresh()} />);
  expect(screen.getByRole('heading', { name: 'Today', level: 1 })).toBeVisible();
  expect(screen.getByText(/No medicines scheduled today/)).toBeVisible();
});

it('shows unreadable-storage errors accessibly', () => {
  render(<App store={fresh({ storage: { getItem: () => '{bad' } })} />);
  expect(screen.getByRole('alert')).toHaveTextContent('Could not load data');
});

it('boots through the production entry point and disposes the clock', async () => {
  const container = document.createElement('div');
  container.id = 'root';
  document.body.append(container);
  let entry;
  await act(async () => { entry = await import('../../src/main'); });
  expect(screen.getByRole('heading', { level: 1, name: 'Today' })).toBeVisible();
  await act(async () => entry.root.unmount());
  container.remove();
});
