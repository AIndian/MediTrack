import { expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../../src/App';
import { fresh } from '../support/fixtures';

it('boots with empty local records', () => {
  render(<App store={fresh()} />);
  expect(screen.getByRole('heading', { name: 'MediTrack' })).toBeVisible();
  expect(screen.getByText('0 medicines saved.')).toBeVisible();
});

it('shows unreadable-storage errors accessibly', () => {
  render(<App store={fresh({ storage: { getItem: () => '{bad' } })} />);
  expect(screen.getByRole('alert')).toHaveTextContent('Could not load data');
});
