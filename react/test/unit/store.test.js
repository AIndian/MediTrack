import { describe, expect, it, vi } from 'vitest';
import { AppStore, localDay, storageKey, textScales, validateMedicine } from '../../src/store';
import { fresh, medicine } from '../support/fixtures';

describe('AppStore (ported from Flutter app_store_test)', () => {
  it('persists replacement, archive/restore, reversible doses, symptoms and date filtering', () => {
    const store = fresh();
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    expect(store.active).toEqual([]);
    store.put(medicine);
    store.put({ ...medicine, strength: '10 mg' });
    expect(store.state.medicines).toHaveLength(1);
    store.archive(store.active[0]);
    expect(store.active).toEqual([]);
    store.archive(store.state.medicines[0]);
    const key = store.doseKey(medicine, '08:00');
    expect(store.status(key)).toBe('Due');
    store.record(key, 'Taken');
    store.record(key, 'Skipped');
    store.record('2026-08-01|1|08:00', 'Taken');
    store.record('2026-10-09|1|08:00', 'Taken');
    expect(store.history(7)).toEqual([[key, 'Skipped']]);
    expect(store.doseLabel(key)).toContain('Sample medicine');
    expect(store.doseLabel('2026-10-08|unknown|08:00')).toContain('Removed medicine');
    store.symptom(' Headache ', 'Mild', ' Notes ');
    store.setLargeText(true);
    const restored = new AppStore({ storage: localStorage });
    expect(restored.state.medicines[0].strength).toBe('10 mg');
    expect(restored.state.symptoms[0]).toMatchObject({ name: 'Headache', notes: 'Notes' });
    expect(restored.state.textScale).toBe(2);
    expect(restored.status(key)).toBe('Skipped');
    store.record(key, 'Due');
    expect(store.status(key)).toBe('Due');
    expect(listener).toHaveBeenCalled();
    unsubscribe();
    listener.mockClear();
    store.save();
    expect(listener).not.toHaveBeenCalled();
  });

  it.each(['{bad', '{"medicines":[]}'])('preserves corrupt storage without overwriting it: %s', (raw) => {
    localStorage.setItem(storageKey, raw);
    const store = fresh();
    expect(store.state.readOnly).toBe(true);
    expect(store.state.error).toContain('Could not load');
    expect(store.put(medicine)).toBe(false);
    expect(localStorage.getItem(storageKey)).toBe(raw);
  });

  it('retains unsaved changes after a write failure and allows retry', () => {
    const storage = { getItem: () => null, setItem: vi.fn(() => { throw new Error('full'); }) };
    const store = fresh({ storage });
    expect(store.put(medicine)).toBe(false);
    expect(store.active).toEqual([medicine]);
    expect(store.state.error).toContain('Could not save');
    storage.setItem.mockImplementation(() => {});
    expect(store.save()).toBe(true);
    expect(store.state.error).toBeNull();
  });

  it('persists all five text stops and migrates the older larger-text preference', () => {
    const store = fresh();
    for (const scale of textScales) {
      store.setTextScale(scale);
      expect(fresh().state.textScale).toBe(scale);
    }
    store.setLargeText(false);
    expect(store.state.textScale).toBe(1);
    store.setLargeText(true);
    expect(store.state.textScale).toBe(2);
    for (const enabled of [true, false]) {
      localStorage.setItem(storageKey, JSON.stringify({ medicines: [medicine], doses: {}, symptoms: [], largeText: enabled }));
      expect(fresh().state.textScale).toBe(enabled ? 2 : 1);
      expect(fresh().active).toEqual([medicine]);
    }
  });

  it('rejects invalid input and uses local calendar dates', () => {
    const store = fresh();
    expect(() => store.put({ ...medicine, supply: -1 })).toThrow();
    expect(() => store.record('invalid', 'Taken')).toThrow();
    expect(() => store.record('2026-02-30|1|08:00', 'Taken')).toThrow();
    expect(() => store.record(store.doseKey(medicine, '08:00'), 'Invalid')).toThrow();
    expect(() => store.symptom(' ', 'Mild', '')).toThrow();
    expect(() => store.symptom('Headache', 'Invalid', '')).toThrow();
    expect(() => store.setTextScale(1.4)).toThrow();
    expect(localDay(new Date(2026, 9, 8, 23, 59))).toBe('2026-10-08');
    expect(validateMedicine({ name: ' ', strength: '', times: '25:00', supply: '-1' })).toHaveProperty('times');
    expect(validateMedicine({ name: 'Sample', strength: '5 mg', times: '08:00, 18:00', supply: '0' })).toEqual({});
  });
});
