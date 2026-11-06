import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';

const roots = vi.hoisted(() => []);
vi.mock('react-dom/client', async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    createRoot: (container) => {
      const root = original.createRoot(container);
      roots.push(root);
      return root;
    },
  };
});

afterEach(() => {
  act(() => roots.forEach((root) => root.unmount()));
  document.getElementById('root')?.remove();
  window.history.replaceState(null, '', '/');
});

it('boots through the production entry point with the real store and hash router', async () => {
  const container = document.createElement('div');
  container.id = 'root';
  document.body.append(container);
  await act(async () => {
    await import('../../src/main.jsx');
  });
  expect(screen.getByRole('heading', { name: 'Today', level: 1 })).toBeInTheDocument();
  expect(screen.getByText(/No medicines scheduled today/)).toBeInTheDocument();
  const user = userEvent.setup();
  await user.click(screen.getByRole('link', { name: 'Medicines', exact: true }));
  expect(window.location.hash).toBe('#/medicines');
  expect(screen.getByRole('heading', { name: 'Your medicines', level: 1 })).toHaveFocus();
  await user.click(screen.getByRole('link', { name: 'Skip to content' }));
  expect(screen.getByRole('main')).toHaveFocus();
  expect(window.location.hash).toBe('#/medicines');
});
