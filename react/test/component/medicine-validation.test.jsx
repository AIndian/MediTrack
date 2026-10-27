import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { expect, it } from 'vitest';
import App from '../../src/App';
import { StoreContext } from '../../src/StoreContext';
import { fresh } from '../support/fixtures';

it('shows a duplicate-time field error and accepts trimmed supply before review and save', async () => {
  const store = fresh();
  const user = userEvent.setup();
  render(<StoreContext.Provider value={store}><MemoryRouter initialEntries={['/medicines/new']}><App /></MemoryRouter></StoreContext.Provider>);
  await user.type(screen.getByLabelText('Medicine name'), 'Sample medicine');
  await user.type(screen.getByLabelText('Strength / dosage'), '5 mg');
  await user.clear(screen.getByLabelText(/Daily times/));
  await user.type(screen.getByLabelText(/Daily times/), ' 08:00, 08:00 ');
  await user.clear(screen.getByLabelText('Supply in doses'));
  await user.type(screen.getByLabelText('Supply in doses'), ' 5 ');
  await user.click(screen.getByRole('button', { name: 'Review medicine' }));
  expect(screen.getByLabelText(/Daily times/)).toHaveFocus();
  expect(screen.getByLabelText(/Daily times/)).toHaveAttribute('aria-invalid', 'true');
  expect(screen.getByText('Enter each daily time only once')).toBeInTheDocument();
  expect(store.active).toEqual([]);
  await user.clear(screen.getByLabelText(/Daily times/));
  await user.type(screen.getByLabelText(/Daily times/), '18:00, 08:00');
  await user.click(screen.getByRole('button', { name: 'Review medicine' }));
  await user.click(screen.getByRole('button', { name: 'Save medicine' }));
  expect(store.active[0]).toMatchObject({ supply: 5, times: ['08:00', '18:00'] });
});
