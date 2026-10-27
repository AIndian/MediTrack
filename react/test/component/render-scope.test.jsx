import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { HeaderClock } from '../../src/components/HeaderClock';
import { fresh, medicine } from '../support/fixtures';
import { renderApp } from '../support/render';

vi.mock('../../src/components/HeaderClock', async (importOriginal) => {
  const original = await importOriginal();
  return { ...original, HeaderClock: vi.fn(original.HeaderClock) };
});

it('updates a dose without rendering the header, while preserving text-size and clock updates', async () => {
  let date = new Date(2026, 9, 8, 12);
  const store = fresh({ clock: () => date });
  store.put({ ...medicine, times: ['08:00'] });
  const user = userEvent.setup();
  renderApp(store);
  const initial = HeaderClock.mock.calls.length;
  await user.click(screen.getByRole('button', { name: 'Mark Taken' }));
  expect(screen.getByText('Status: Taken')).toBeInTheDocument();
  expect(HeaderClock).toHaveBeenCalledTimes(initial);
  await user.click(screen.getByRole('button', { name: 'Undo last change' }));
  expect(screen.getByText('Status: Due')).toBeInTheDocument();
  expect(HeaderClock).toHaveBeenCalledTimes(initial);
  act(() => store.setTextScale(2));
  expect(HeaderClock).toHaveBeenCalledTimes(initial + 1);
  expect(document.querySelector('.app')).toHaveStyle({ '--text-scale': '2' });
  date = new Date(2026, 9, 8, 12, 1);
  act(() => window.dispatchEvent(new Event('focus')));
  expect(HeaderClock).toHaveBeenCalledTimes(initial + 2);
  expect(document.querySelector('.header-clock')).toHaveAttribute('datetime', date.toISOString());
});
