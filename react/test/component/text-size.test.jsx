import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it } from 'vitest';
import { fresh } from '../support/fixtures';
import { renderApp } from '../support/render';

it('offers every text size, persists it, and synchronizes the quick switch', async () => {
  const store = fresh();
  const user = userEvent.setup();
  renderApp(store, '/settings');
  const slider = screen.getByRole('slider');
  const toggle = screen.getByRole('checkbox', { name: /Larger text/ });
  for (const scale of [1.25, 1.5, 1.75, 2]) {
    fireEvent.change(slider, { target: { value: String(scale) } });
    expect(screen.getByText(`Text size: ${scale * 100}%`)).toBeInTheDocument();
    expect(slider).toHaveAttribute('aria-valuetext', `${scale * 100}%`);
    expect(toggle).toBeChecked();
    expect(document.querySelector('.app')).toHaveStyle({ '--text-scale': String(scale) });
    expect(fresh().state.textScale).toBe(scale);
  }
  await user.click(toggle);
  expect(store.state.textScale).toBe(1);
  expect(slider).toHaveValue('1');
  await user.click(toggle);
  expect(store.state.textScale).toBe(2);
  expect(slider).toHaveValue('2');
});
