import { act, screen, within } from '@testing-library/react';
import { expect, it } from 'vitest';
import { fresh, medicine } from '../support/fixtures';
import { renderApp } from '../support/render';

it('labels past unrecorded doses honestly and reserves Next dose for an upcoming slot', () => {
  let date = new Date(2026, 9, 8, 12);
  const store = fresh({ clock: () => date });
  store.put(medicine);
  renderApp(store);
  const morning = screen.getByRole('article', { name: 'Sample medicine at 08:00' });
  const evening = screen.getByRole('article', { name: 'Sample medicine at 18:00' });
  expect(within(morning).getByText('Not recorded yet')).toBeInTheDocument();
  expect(within(morning).queryByText('Next dose')).not.toBeInTheDocument();
  expect(within(evening).getByText('Next dose')).toBeInTheDocument();
  date = new Date(2026, 9, 8, 18, 1);
  act(() => window.dispatchEvent(new Event('focus')));
  expect(screen.queryByText('Next dose')).not.toBeInTheDocument();
  expect(screen.getAllByText('Not recorded yet')).toHaveLength(2);
});
