import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it } from 'vitest';
import { fresh, medicine } from '../support/fixtures';
import { renderApp } from '../support/render';

it('separates recorded activity from the current-schedule estimate without an adherence ratio', async () => {
  const store = fresh();
  store.put(medicine);
  store.put({ ...medicine, id: 'archived', archived: true });
  for (const day of ['2026-10-06', '2026-10-07', '2026-10-08']) store.record(`${day}|1|08:00`, 'Taken');
  const user = userEvent.setup();
  renderApp(store, '/summary');
  expect(screen.getByText('3 recorded Taken · 0 recorded Skipped')).toBeInTheDocument();
  expect(screen.getByText('Current schedule estimate: 14 doses over 7 days')).toBeInTheDocument();
  expect(screen.getByText(/Past schedule changes and medicine start dates are not tracked/)).toBeInTheDocument();
  expect(screen.queryByText(/3 taken of 3/)).not.toBeInTheDocument();
  await user.selectOptions(screen.getByLabelText('Date range'), '30');
  expect(screen.getByText('Current schedule estimate: 60 doses over 30 days')).toBeInTheDocument();
});

it('handles no current schedule and a skipped historical record without computing a percentage', () => {
  const store = fresh();
  store.record('2026-10-08|gone|08:00', 'Skipped');
  renderApp(store, '/summary');
  expect(screen.getByText('0 recorded Taken · 1 recorded Skipped')).toBeInTheDocument();
  expect(screen.getByText('Current schedule estimate: 0 doses over 7 days')).toBeInTheDocument();
});
