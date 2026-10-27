import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { expect, it } from 'vitest';
import App from '../../src/App';
import { StoreContext } from '../../src/StoreContext';
import { fresh } from '../support/fixtures';

it('adds only after review, navigates to details and archives/restores a medicine', async () => {
  const store = fresh();
  const user = userEvent.setup();
  render(<StoreContext.Provider value={store}><MemoryRouter><App /></MemoryRouter></StoreContext.Provider>);
  expect(screen.getByText(/No medicines scheduled today/)).toBeInTheDocument();
  await user.click(screen.getByRole('link', { name: 'Add medicine' }));
  await user.click(screen.getByRole('button', { name: 'Review medicine' }));
  expect(screen.getByLabelText('Medicine name')).toHaveFocus();
  await user.type(screen.getByLabelText('Medicine name'), 'Sample medicine');
  await user.type(screen.getByLabelText('Strength / dosage'), '5 mg');
  await user.click(screen.getByRole('button', { name: 'Review medicine' }));
  expect(screen.getByRole('heading', { name: 'Review medicine', level: 1 })).toHaveFocus();
  expect(store.active).toEqual([]);
  await user.click(screen.getByRole('button', { name: 'Save medicine' }));
  expect(screen.getByRole('heading', { name: 'Medicine details', level: 1 })).toHaveFocus();
  expect(store.active).toHaveLength(1);
  await user.click(screen.getByRole('button', { name: 'Archive medicine' }));
  expect(store.active).toEqual([]);
  await user.click(screen.getByRole('button', { name: 'Restore medicine' }));
  expect(store.active).toHaveLength(1);
});
