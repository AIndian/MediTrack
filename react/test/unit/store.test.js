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
    expect(() => store.put(medicine)).toThrow('Cannot edit unreadable saved data');
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

  it.each(['08:00, 08:00', ' 08:00 ,08:00 '])('rejects duplicate daily times after trimming: %s', (times) => {
    expect(validateMedicine({ name: 'Sample', strength: '5 mg', times, supply: ' 5 ' }))
      .toEqual({ times: 'Enter each daily time only once' });
    expect(() => fresh().put({ ...medicine, times: times.split(',').map((time) => time.trim()) }))
      .toThrow('Invalid medicine');
  });

  it('accepts surrounding supply whitespace without accepting fractions or unsafe integers', () => {
    const values = { name: 'Sample', strength: '5 mg', times: ' 08:00,18:00 ', supply: ' 5 ' };
    expect(validateMedicine(values)).toEqual({});
    for (const supply of ['', ' ', '-1', '1.5', '1e2', '9007199254740992']) {
      expect(validateMedicine({ ...values, supply })).toHaveProperty('supply');
    }
  });

  it('requires confirmation before resetting corrupt data and only resets React storage', () => {
    const raw = JSON.stringify({ medicines: [medicine], doses: { bad: 'Taken' }, symptoms: [] });
    localStorage.setItem(storageKey, raw);
    localStorage.setItem('meditrack.v1', 'Flutter records');
    localStorage.setItem('other-app', 'Other records');
    const store = fresh();
    const listener = vi.fn();
    store.subscribe(listener);
    expect(store.rawData).toBe(raw);
    expect(store.state.readOnly).toBe(true);
    expect(store.reset()).toBe(false);
    expect(store.reset(false)).toBe(false);
    expect(localStorage.getItem(storageKey)).toBe(raw);
    for (const change of [
      () => store.save(), () => store.put(medicine), () => store.archive(medicine),
      () => store.record('2026-10-08|1|08:00', 'Taken'),
      () => store.symptom('Headache', 'Mild', ''), () => store.setTextScale(2),
    ]) expect(change).toThrow('Cannot edit unreadable saved data');
    expect(store.reset(true)).toBe(true);
    expect(store.rawData).toBeNull();
    expect(store.state).toMatchObject({ medicines: [], doses: {}, symptoms: [], textScale: 1, error: null, readOnly: false });
    expect(localStorage.getItem(storageKey)).toBeNull();
    expect(localStorage.getItem('meditrack.v1')).toBe('Flutter records');
    expect(localStorage.getItem('other-app')).toBe('Other records');
    expect(listener).toHaveBeenCalledOnce();
    expect(store.put(medicine)).toBe(true);
    expect(fresh().active).toEqual([medicine]);
    expect(store.reset(true)).toBe(false);
  });

  it('keeps the backup and read-only state when a confirmed reset fails', () => {
    const storage = { getItem: () => '{bad', removeItem: vi.fn(() => { throw new Error('blocked'); }) };
    const store = fresh({ storage });
    expect(store.reset(true)).toBe(false);
    expect(store.rawData).toBe('{bad');
    expect(store.state.readOnly).toBe(true);
    expect(store.state.error).toContain('Could not reset');
  });

  it('does not reset a different snapshot written after the backup was read', () => {
    localStorage.setItem(storageKey, '{bad');
    const store = fresh();
    localStorage.setItem(storageKey, 'Different saved data');
    expect(store.reset(true)).toBe(false);
    expect(localStorage.getItem(storageKey)).toBe('Different saved data');
    expect(store.rawData).toBe('{bad');
    expect(store.state.readOnly).toBe(true);
    expect(store.state.error).toContain('Reload');
  });

  it('does not offer a destructive reset when storage cannot be read', () => {
    const storage = { getItem: () => { throw new Error('blocked'); }, removeItem: vi.fn() };
    const store = fresh({ storage });
    expect(store.rawData).toBeNull();
    expect(store.reset(true)).toBe(false);
    expect(storage.removeItem).not.toHaveBeenCalled();
  });

  it('orders history by recent day, chronological time, then medicine name instead of ID', () => {
    const store = fresh();
    store.put({ ...medicine, id: 'zz-uuid', name: 'Alpha' });
    store.put({ ...medicine, id: 'aa-uuid', name: 'Zeta' });
    for (const key of ['2026-10-07|zz-uuid|18:00', '2026-10-08|zz-uuid|18:00',
      '2026-10-08|aa-uuid|08:00', '2026-10-08|zz-uuid|08:00', '2026-10-08|gone|08:00']) {
      store.record(key, 'Taken');
    }
    expect(store.history(7).map(([key]) => key)).toEqual([
      '2026-10-08|zz-uuid|08:00', '2026-10-08|gone|08:00', '2026-10-08|aa-uuid|08:00',
      '2026-10-08|zz-uuid|18:00', '2026-10-07|zz-uuid|18:00',
    ]);
  });
});
