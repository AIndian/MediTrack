import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import { StorageNotice } from '../../src/components/StorageNotice';
import { StoreContext } from '../../src/StoreContext';
import { storageKey } from '../../src/store';
import { fresh, medicine } from '../support/fixtures';

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

function renderNotice(store) {
  return render(<StoreContext.Provider value={store}><StorageNotice /></StoreContext.Provider>);
}

it('downloads the exact original JSON without changing the corrupt record', async () => {
  vi.useFakeTimers();
  const raw = JSON.stringify({ medicines: [medicine], doses: { bad: 'Taken' }, symptoms: [] });
  localStorage.setItem(storageKey, raw);
  const store = fresh();
  const create = vi.fn(() => 'blob:backup');
  const revoke = vi.fn();
  vi.stubGlobal('URL', class extends URL {
    static createObjectURL = create;
    static revokeObjectURL = revoke;
  });
  const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function () {
    expect(this.download).toBe('meditrack-react-backup.json');
    expect(this.getAttribute('href')).toBe('blob:backup');
  });
  renderNotice(store);
  fireEvent.click(screen.getByRole('button', { name: 'Download saved JSON' }));
  expect(click).toHaveBeenCalledOnce();
  const blob = create.mock.calls[0][0];
  const downloaded = new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsText(blob);
  });
  await vi.runAllTimersAsync();
  expect(await downloaded).toBe(raw);
  expect(localStorage.getItem(storageKey)).toBe(raw);
  expect(store.state.readOnly).toBe(true);
  expect(revoke).toHaveBeenCalledWith('blob:backup');
  expect(document.querySelector('a[download]')).toBeNull();
});

it('keeps data when reset is canceled, then exits read-only mode after confirmation', async () => {
  localStorage.setItem(storageKey, '{bad');
  const store = fresh();
  const confirm = vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true);
  const user = userEvent.setup();
  renderNotice(store);
  await user.click(screen.getByRole('button', { name: 'Reset saved data' }));
  expect(confirm).toHaveBeenCalledWith(expect.stringContaining('permanently deletes'));
  expect(localStorage.getItem(storageKey)).toBe('{bad');
  expect(store.state.readOnly).toBe(true);
  await user.click(screen.getByRole('button', { name: 'Reset saved data' }));
  expect(store.state.readOnly).toBe(false);
  expect(localStorage.getItem(storageKey)).toBeNull();
  expect(screen.queryByRole('region', { name: 'Saved data recovery' })).not.toBeInTheDocument();
});

it('explains a download failure while preserving saved data', async () => {
  localStorage.setItem(storageKey, '{bad');
  vi.stubGlobal('URL', class extends URL {
    static createObjectURL() { throw new Error('unavailable'); }
  });
  const user = userEvent.setup();
  renderNotice(fresh());
  await user.click(screen.getByRole('button', { name: 'Download saved JSON' }));
  expect(screen.getByText(/Could not download the backup/)).toBeInTheDocument();
  expect(localStorage.getItem(storageKey)).toBe('{bad');
});

it('disables reset and download if storage is inaccessible', () => {
  const store = fresh({ storage: { getItem: () => { throw new Error('blocked'); } } });
  renderNotice(store);
  expect(screen.getByRole('button', { name: 'Download saved JSON' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Reset saved data' })).toBeDisabled();
  expect(screen.getByText(/Browser storage could not be read/)).toBeInTheDocument();
});

it('surfaces a failed reset and keeps the recovery controls available', async () => {
  vi.spyOn(window, 'confirm').mockReturnValue(true);
  const store = fresh({ storage: { getItem: () => '{bad', removeItem: () => { throw new Error('blocked'); } } });
  const user = userEvent.setup();
  renderNotice(store);
  await user.click(screen.getByRole('button', { name: 'Reset saved data' }));
  expect(screen.getByRole('alert')).toHaveTextContent('Could not reset saved data');
  expect(screen.getByRole('button', { name: 'Download saved JSON' })).toBeEnabled();
});

it('retries a failed write from the shared notice', async () => {
  const storage = { getItem: () => null, setItem: vi.fn(() => { throw new Error('full'); }) };
  const store = fresh({ storage });
  store.put(medicine);
  const user = userEvent.setup();
  renderNotice(store);
  expect(screen.getByRole('alert')).toHaveTextContent('Could not save');
  storage.setItem.mockImplementation(() => {});
  await user.click(screen.getByRole('button', { name: 'Retry saving' }));
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(store.active).toEqual([medicine]);
});
