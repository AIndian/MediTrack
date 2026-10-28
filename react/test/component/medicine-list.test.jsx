import { act, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { fresh, medicine } from '../support/fixtures';
import { renderApp } from '../support/render';

it('shows low supply only for active medicines and restores the notice when reactivated', () => {
  const store = fresh();
  store.put({ ...medicine, archived: true });
  renderApp(store, '/medicines');
  expect(screen.getByText('Archived')).toBeInTheDocument();
  expect(screen.queryByText('Low supply · Check your refill')).not.toBeInTheDocument();
  act(() => store.archive(store.state.medicines[0]));
  expect(screen.getByText('Low supply · Check your refill')).toBeInTheDocument();
});
