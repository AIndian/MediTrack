import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import App from '../../src/App';
import { fresh, med } from '../support/fixtures';

const link = name => screen.getByRole('link', { name, exact: true });
const button = name => screen.getByRole('button', { name, exact: true });
async function replace(user, label, value) {
  const field = screen.getByLabelText(label, { exact: true });
  await user.clear(field);
  await user.type(field, value);
}
function start(store = fresh(), path = '/') {
  window.history.replaceState(null, '', `/#${path}`);
  render(<App store={store} />);
  return { store, user: userEvent.setup() };
}

it('ports the empty, add, validate, review, edit, archive and restore workflow', async () => {
  const { store, user } = start();
  await user.click(link('History'));
  expect(screen.getByText('No doses recorded yet.')).toBeVisible();
  await user.click(link('Medicines'));
  expect(screen.getByText('Your medicine list is empty.')).toBeVisible();
  await user.click(link('Add medicine'));
  expect(screen.getByRole('heading', { level: 1 })).toHaveFocus();
  await user.click(button('Review medicine'));
  expect(screen.getByRole('alert')).toHaveFocus();
  await user.click(link('Enter a medicine name'));
  expect(screen.getByLabelText('Medicine name')).toHaveFocus();
  await user.type(screen.getByLabelText('Medicine name'), med.name);
  await user.type(screen.getByLabelText('Strength / dosage'), '5 mg');
  await replace(user, 'Daily times (HH:mm, separated by commas)', '25:00');
  await replace(user, 'Supply in doses', '-1');
  await user.click(button('Review medicine'));
  expect(screen.getByLabelText('Supply in doses')).toHaveAttribute('aria-invalid', 'true');
  expect(screen.getByLabelText('Daily times (HH:mm, separated by commas)')).toHaveAccessibleDescription('Use times such as 08:00, 18:00');
  await replace(user, 'Daily times (HH:mm, separated by commas)', '18:00, 08:00, 08:00');
  await replace(user, 'Supply in doses', '8');
  await user.click(button('Review medicine'));
  expect(store.active).toEqual([]);
  expect(screen.getByText('Every day at 08:00, 18:00')).toBeVisible();
  await user.click(link('Edit details'));
  expect(screen.getByLabelText('Medicine name')).toHaveValue(med.name);
  await user.click(button('Review medicine'));
  await user.click(button('Save medicine'));
  expect(store.active[0].times).toEqual(['08:00', '18:00']);
  expect(screen.getByText(/Low supply/)).toBeVisible();
  await user.click(link(`Open ${med.name}`));
  expect(screen.getByText('None entered')).toBeVisible();
  await user.click(link('Edit medicine'));
  await replace(user, 'Strength / dosage', '10 mg');
  await user.type(screen.getByLabelText('Instructions (optional)'), med.instructions);
  await user.click(button('Review medicine'));
  await user.click(button('Save medicine'));
  expect(store.active[0].strength).toBe('10 mg');
  expect(screen.getByText(med.instructions)).toBeVisible();
  await user.click(button('Archive medicine'));
  expect(store.active).toEqual([]);
  await user.click(button('Restore medicine'));
  expect(store.active).toHaveLength(1);
});

it('records doses, preserves Undo and corrects only the selected medicine in History', async () => {
  const store = fresh();
  store.put(med);
  store.put({ ...med, id: '2', name: 'Other medicine', times: ['09:00'] });
  const { user } = start(store);
  await user.click(button('Mark Taken'));
  expect(screen.getByText('1 of 3 doses recorded Taken')).toBeVisible();
  await user.click(button('Undo last change'));
  await user.click(link(`Open ${med.name} dose at 08:00`));
  await user.click(button('Mark Taken'));
  expect(screen.getByRole('status')).toHaveTextContent('Status: Taken');
  await user.click(button('Skip dose'));
  await user.click(button('Undo last change'));
  expect(screen.getByRole('status')).toHaveTextContent('Status: Taken');
  await user.click(link('View medicine details'));
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Medicine details');
  await user.click(button('Back'));
  await screen.findByRole('heading', { name: 'Medication reminder', level: 1 });
  await user.click(button('Back'));
  await screen.findByRole('heading', { name: 'Today', level: 1 });
  await user.click(link('History'));
  act(() => store.record(store.doseKey(store.active[1], '09:00'), 'Skipped'));
  const entry = screen.getByRole('region', { name: `${med.name} • 2026-10-08 • 08:00` });
  await user.click(within(entry).getByRole('button', { name: 'Skipped' }));
  expect(store.status(store.doseKey(med, '08:00'))).toBe('Skipped');
  expect(store.status('2026-10-08|2|09:00')).toBe('Skipped');
  await user.click(within(entry).getByRole('button', { name: 'Due' }));
  expect(store.status(store.doseKey(med, '08:00'))).toBe('Due');
  expect(store.history(30)).toHaveLength(1);
});

it('logs symptoms and filters summary doses and symptoms by 7 or 30 local days', async () => {
  const store = fresh();
  store.put(med);
  store.record(store.doseKey(med, '08:00'), 'Taken');
  store.record('2026-09-20|1|08:00', 'Skipped');
  store.state.symptoms.push({ name: 'Older symptom', severity: 'Mild', notes: '', date: new Date(2026, 8, 20, 12).toISOString() });
  const { user } = start(store);
  await user.click(link('More'));
  await user.click(link('Symptoms'));
  await user.click(button('Save symptom'));
  expect(screen.getByRole('alert')).toHaveFocus();
  await user.type(screen.getByLabelText('Symptom', { exact: true }), 'Headache');
  await user.type(screen.getByLabelText('Notes (optional)'), 'After lunch');
  await user.selectOptions(screen.getByLabelText('Severity'), 'Moderate');
  await user.click(button('Save symptom'));
  expect(store.state.symptoms[0]).toMatchObject({ name: 'Headache', severity: 'Moderate', notes: 'After lunch' });
  expect(screen.getByRole('status')).toHaveTextContent('Symptom saved');
  expect(screen.getByLabelText('Symptom', { exact: true })).toHaveValue('');
  await user.click(button('Back'));
  await screen.findByRole('heading', { name: 'Settings & sharing', level: 1 });
  await user.click(link('Appointment summary'));
  expect(screen.getByText('1 taken of 1 recorded doses')).toBeVisible();
  expect(screen.queryByText(/Older symptom/)).not.toBeInTheDocument();
  await user.selectOptions(screen.getByLabelText('Date range'), '30');
  expect(screen.getByText('1 taken of 2 recorded doses')).toBeVisible();
  expect(screen.getByText(/Older symptom/)).toBeVisible();
  expect(screen.getByText(/Headache · Moderate · After lunch/)).toBeVisible();
});

it('ports the text-size slider, quick toggle and saved preference tests', async () => {
  const { store, user } = start(fresh(), '/more');
  const slider = screen.getByRole('slider');
  for (const scale of [1, 1.25, 1.5, 1.75, 2]) {
    fireEvent.change(slider, { target: { value: scale } });
    expect(slider).toHaveAttribute('aria-valuetext', `${scale * 100}%`);
    expect(document.querySelector('.app')).toHaveStyle({ fontSize: `${scale}rem` });
    expect(screen.getByRole('checkbox')).toHaveProperty('checked', scale > 1);
    expect(fresh({ storage: store.storage }).state.textScale).toBe(scale);
  }
  await user.click(screen.getByRole('checkbox'));
  expect(slider).toHaveValue('1');
  await user.click(screen.getByRole('checkbox'));
  expect(slider).toHaveValue('2');
});

it('supports keyboard navigation, a skip link, page focus and selected destinations', async () => {
  const { user } = start();
  await user.click(link('Skip to content'));
  expect(screen.getByRole('main')).toHaveFocus();
  expect(window.location.hash).toBe('#/');
  await user.click(link('Medicines'));
  expect(link('Medicines')).toHaveAttribute('aria-current', 'page');
  expect(screen.getByRole('heading', { level: 1 })).toHaveFocus();
  await user.tab();
  expect(link('Add medicine')).toHaveFocus();
  await user.keyboard('{Enter}');
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Add medicine');
});

it('keeps review visible after a failed save, shows the error and allows retry', async () => {
  const store = fresh();
  store.put(med);
  const { user } = start(store, '/medicines/1/edit');
  await user.click(button('Review medicine'));
  vi.spyOn(store.storage, 'setItem').mockImplementationOnce(() => { throw new Error('full'); });
  await user.click(button('Save medicine'));
  expect(screen.getByRole('alert')).toHaveTextContent('Could not save');
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Review medicine');
  await user.click(button('Save medicine'));
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Medicine details');
});

it('retries an unsaved symptom without adding a duplicate record', async () => {
  const store = fresh();
  const { user } = start(store, '/symptoms');
  vi.spyOn(store.storage, 'setItem').mockImplementationOnce(() => { throw new Error('full'); });
  await user.type(screen.getByLabelText('Symptom', { exact: true }), 'Sample symptom');
  await user.click(button('Save symptom'));
  expect(screen.getByRole('status')).toHaveTextContent('Symptom kept in memory');
  expect(screen.getByLabelText('Symptom', { exact: true })).toHaveValue('');
  await user.click(button('Retry save'));
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(fresh({ storage: store.storage }).state.symptoms).toHaveLength(1);
});

it('preserves the symptom form when unreadable storage blocks all edits', async () => {
  const { user } = start(fresh({ storage: { getItem: () => '{bad' } }), '/symptoms');
  await user.type(screen.getByLabelText('Symptom', { exact: true }), 'Sample symptom');
  await user.click(button('Save symptom'));
  expect(screen.getByLabelText('Symptom', { exact: true })).toHaveValue('Sample symptom');
  expect(screen.queryByRole('button', { name: 'Retry save' })).not.toBeInTheDocument();
});

it.each([
  ['/medicines/missing', 'Your medicines'], ['/medicines/missing/edit', 'Your medicines'],
  ['/dose/missing/08:00', 'Today'], ['/medicines/new/review', 'Add medicine'],
  ['/unknown', 'Page not found'], ['/summary', 'Appointment summary'],
])('handles a fresh link to %s', async (path, title) => {
  start(fresh(), path);
  expect(await screen.findByRole('heading', { name: title, level: 1 })).toBeVisible();
});

it('returns from a directly opened secondary screen without leaving the app', async () => {
  const { user } = start(fresh(), '/symptoms');
  await user.click(button('Back'));
  expect(await screen.findByRole('heading', { name: 'Today', level: 1 })).toBeVisible();
});
