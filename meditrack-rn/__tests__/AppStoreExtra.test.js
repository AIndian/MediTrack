import { AppStore, STORAGE_KEY } from '../src/state/AppStore';
function storageWith(data) {
  return {
    getItem: jest.fn().mockResolvedValue(JSON.stringify(data)),
    setItem: jest.fn().mockResolvedValue(undefined),
  };
}
const savedData = (extra = {}) => ({
  medicines: [],
  doses: {},
  symptoms: [],
  ...extra,
});
describe('Additional AppStore branch coverage', () => {
  test('restores the legacy large-text preference', async () => {
    const store = await AppStore.load(
      storageWith(savedData({ largeText: true }))
    );
    expect(store.textScale).toBe(2);
  });
  test('defaults legacy small text to 100%', async () => {
    const store = await AppStore.load(
      storageWith(savedData({ largeText: false }))
    );
    expect(store.textScale).toBe(1);
  });
  test('ignores invalid saved text scales', async () => {
    const store = await AppStore.load(
      storageWith(savedData({ textScale: 9 }))
    );
    expect(store.textScale).toBe(1);
  });
  test('ignores nonnumeric saved text scales', async () => {
    const store = await AppStore.load(
      storageWith(savedData({ textScale: 'large' }))
    );
    expect(store.textScale).toBe(1);
  });
  test('keeps valid saved text scale over legacy setting', async () => {
    const store = await AppStore.load(
      storageWith(savedData({ textScale: 1.5, largeText: true }))
    );
    expect(store.textScale).toBe(1.5);
  });
  test('handles a symptom without notes', async () => {
    const storage = storageWith(savedData());
    const store = await AppStore.load(storage);
    store.symptom('Headache', 2, undefined);
    await store.pending;
    expect(store.symptoms[0].name).toBe('Headache');
    expect(store.symptoms[0].notes).toBe('');
    expect(storage.setItem).toHaveBeenCalledWith(
      STORAGE_KEY,
      expect.any(String)
    );
  });
  test('sorts history newest first and preserves matching dates', () => {
    const store = new AppStore(storageWith(savedData()), {
      clock: () => new Date(2026, 9, 20, 12),
    });
    store.doses = {
      '2026-10-19|m1|08:00': 'Taken',
      '2026-10-20|m1|09:00': 'Skipped',
      '2026-10-20|m1|08:00': 'Taken',
      '2026-10-10|m1|08:00': 'Taken',
    };
    expect(store.history(2).map(([key]) => key)).toEqual([
      '2026-10-20|m1|09:00',
      '2026-10-20|m1|08:00',
      '2026-10-19|m1|08:00',
    ]);
  });
});
