import { AppStore, STORAGE_KEY, localDate } from '../src/state/AppStore';
import { createMedicine } from '../src/models/medicine';

function fakeStorage(initial = {}) {
  const data = { ...initial };
  return {
    data,
    getItem: jest.fn(async (k) => (k in data ? data[k] : null)),
    setItem: jest.fn(async (k, v) => {
      data[k] = v;
    }),
  };
}

const clock = () => new Date(2026, 9, 19, 9, 0); // Oct 19 2026, 9:00 local
const med = createMedicine({
  id: 'm1',
  name: 'Metformin',
  strength: '500 mg',
  instructions: 'Take with food',
  times: ['08:00'],
});

async function emptyStore() {
  return AppStore.load(fakeStorage(), { clock });
}

test('starts empty when nothing is saved', async () => {
  const s = await emptyStore();
  expect(s.medicines).toEqual([]);
  expect(s.textScale).toBe(1.0);
  expect(s.error).toBeNull();
});

test('loads saved data', async () => {
  const saved = {
    medicines: [{ ...med, times: [...med.times] }],
    doses: { '2026-10-19|m1|08:00': 'Taken' },
    symptoms: [],
    textScale: 1.5,
  };
  const s = await AppStore.load(fakeStorage({ [STORAGE_KEY]: JSON.stringify(saved) }), { clock });
  expect(s.medicines[0].name).toBe('Metformin');
  expect(s.status('2026-10-19|m1|08:00')).toBe('Taken');
  expect(s.textScale).toBe(1.5);
});

test('old largeText setting becomes 200% text', async () => {
  const saved = { medicines: [], doses: {}, symptoms: [], largeText: true };
  const s = await AppStore.load(fakeStorage({ [STORAGE_KEY]: JSON.stringify(saved) }), { clock });
  expect(s.textScale).toBe(2.0);
  expect(s.largeText).toBe(true);
});

test('corrupt saved data sets a load error', async () => {
  const s = await AppStore.load(fakeStorage({ [STORAGE_KEY]: 'not json' }), { clock });
  expect(s.error).toBe('Could not load data. Restart the app.');
});

test('localDate uses local time, not UTC', () => {
  expect(localDate(new Date(2026, 9, 19, 23, 30))).toBe('2026-10-19');
});

test('doseKey combines day, medicine id, and time', async () => {
  const s = await emptyStore();
  expect(s.doseKey(med, '08:00')).toBe('2026-10-19|m1|08:00');
});

test('record Taken, then Undo back to Due', async () => {
  const s = await emptyStore();
  const key = s.doseKey(med, '08:00');
  expect(s.status(key)).toBe('Due');
  s.record(key, 'Taken');
  expect(s.status(key)).toBe('Taken');
  s.record(key, 'Due');
  expect(s.status(key)).toBe('Due');
  expect(key in s.doses).toBe(false);
});

test('record Skipped', async () => {
  const s = await emptyStore();
  s.record('k', 'Skipped');
  expect(s.status('k')).toBe('Skipped');
});

test('record rejects an invalid status', async () => {
  const s = await emptyStore();
  expect(() => s.record('k', 'Maybe')).toThrow('Invalid dose status');
});

test('put adds a new medicine and updates an existing one', async () => {
  const s = await emptyStore();
  s.put(med);
  expect(s.medicines).toHaveLength(1);
  s.put(createMedicine({ ...med, strength: '1000 mg' }));
  expect(s.medicines).toHaveLength(1);
  expect(s.medicines[0].strength).toBe('1000 mg');
});

test('archive toggles and hides from active list', async () => {
  const s = await emptyStore();
  s.put(med);
  s.archive(s.medicines[0]);
  expect(s.medicines[0].archived).toBe(true);
  expect(s.active).toHaveLength(0);
  s.archive(s.medicines[0]);
  expect(s.active).toHaveLength(1);
});

test('save writes everything to storage', async () => {
  const storage = fakeStorage();
  const s = await AppStore.load(storage, { clock });
  s.put(med);
  s.record('2026-10-19|m1|08:00', 'Taken');
  await s.pending;
  const written = JSON.parse(storage.data[STORAGE_KEY]);
  expect(written.medicines[0].id).toBe('m1');
  expect(written.doses['2026-10-19|m1|08:00']).toBe('Taken');
});

test('a failed save sets an error', async () => {
  const storage = fakeStorage();
  storage.setItem = jest.fn(async () => {
    throw new Error('disk full');
  });
  const s = await AppStore.load(storage, { clock });
  s.put(med);
  await s.pending;
  expect(s.error).toBe('Could not save. Keep the app open.');
});

test('does not save after a load error', async () => {
  const storage = fakeStorage({ [STORAGE_KEY]: 'not json' });
  const s = await AppStore.load(storage, { clock });
  s.put(med);
  await s.pending;
  expect(storage.setItem).not.toHaveBeenCalled();
});

test('text scale accepts valid steps and rejects others', async () => {
  const s = await emptyStore();
  s.setTextScale(1.75);
  expect(s.textScale).toBe(1.75);
  expect(() => s.setTextScale(3)).toThrow('25% steps');
  s.setLargeText(false);
  expect(s.textScale).toBe(1.0);
});

test('symptom is trimmed, added first, and required', async () => {
  const s = await emptyStore();
  s.symptom('  Headache ', 'Mild', ' after lunch ');
  s.symptom('Dizzy', 'Moderate');
  expect(s.symptoms[0].name).toBe('Dizzy');
  expect(s.symptoms[1]).toMatchObject({ name: 'Headache', notes: 'after lunch' });
  expect(() => s.symptom('   ', 'Mild', '')).toThrow('Symptom is required');
});

test('history keeps only recent days, newest first', async () => {
  const s = await emptyStore();
  s.record('2026-10-19|m1|08:00', 'Taken');
  s.record('2026-10-17|m1|08:00', 'Skipped');
  s.record('2026-10-10|m1|08:00', 'Taken');
  const keys = s.history(7).map(([k]) => k);
  expect(keys).toEqual(['2026-10-19|m1|08:00', '2026-10-17|m1|08:00']);
});

test('doseLabel names the medicine or marks it removed', async () => {
  const s = await emptyStore();
  s.put(med);
  expect(s.doseLabel('2026-10-19|m1|08:00')).toBe('Metformin • 2026-10-19 • 08:00');
  expect(s.doseLabel('2026-10-19|gone|08:00')).toBe('Removed medicine • 2026-10-19 • 08:00');
});

test('listeners are notified on changes and can unsubscribe', async () => {
  const s = await emptyStore();
  const listener = jest.fn();
  const unsubscribe = s.subscribe(listener);
  s.put(med);
  expect(listener).toHaveBeenCalledTimes(1);
  unsubscribe();
  s.record('k', 'Taken');
  expect(listener).toHaveBeenCalledTimes(1);
});