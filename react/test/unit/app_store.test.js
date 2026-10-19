import { describe, expect, it, vi } from 'vitest';
import { AppStore, storageKey } from '../../src/store';
import { textScales } from '../../src/model';
import { fixedNow, fresh, med } from '../support/fixtures';

describe('Flutter app_store_test.dart → React store', () => {
  it('persists, replaces, archives, restores, undoes and filters records by local date', () => {
    const store = fresh();
    expect(store.active).toEqual([]);
    store.put(med);
    store.put(med);
    expect(store.state.medicines).toHaveLength(1);
    store.archive(med);
    expect(store.active).toEqual([]);
    store.archive(store.state.medicines[0]);
    const key = store.doseKey(med, '08:00');
    expect(key).toBe('2026-10-08|1|08:00');
    store.record(key, 'Taken');
    expect(store.status(key)).toBe('Taken');
    store.record(key, 'Skipped');
    store.record('2026-08-01|1|08:00', 'Taken');
    store.record('2026-10-09|1|08:00', 'Taken');
    expect(store.history(7)).toEqual([[key, 'Skipped']]);
    expect(store.doseLabel(key)).toContain(med.name);
    expect(store.doseLabel('2026-10-08|unknown|08:00')).toContain('Removed medicine');
    store.symptom(' Headache ', 'Mild', ' Notes ');
    store.setLargeText(true);
    const restored = fresh({ storage: store.storage });
    expect(restored.active).toEqual([med]);
    expect(restored.state.symptoms[0]).toMatchObject({ name: 'Headache', notes: 'Notes' });
    expect(restored.state.textScale).toBe(2);
    expect(restored.status(key)).toBe('Skipped');
    store.record(key, 'Due');
    expect(store.status(key)).toBe('Due');
  });

  it('preserves replacement ordering, copies input, and notifies only current subscribers', () => {
    const store = fresh();
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    const input = structuredClone(med);
    store.put(input);
    input.times.push('20:00');
    store.put({ ...med, id: '2' });
    store.put({ ...med, strength: '10 mg' });
    expect(store.state.medicines.map(m => m.id)).toEqual(['1', '2']);
    expect(store.state.medicines[0].times).toHaveLength(2);
    expect(listener).toHaveBeenCalledTimes(3);
    unsubscribe();
    store.setLargeText(false);
    expect(listener).toHaveBeenCalledTimes(3);
    expect(store.getSnapshot()).toBe(store.state);
  });

  it.each(['{bad', 'null', '{}', JSON.stringify({ medicines: [med], doses: [], symptoms: [] })])(
    'does not overwrite unreadable saved data: %s', raw => {
      const storage = { getItem: () => raw, setItem: vi.fn() };
      const store = fresh({ storage });
      expect(store.state.error).toContain('Could not load');
      expect(store.put(med)).toBe(false);
      expect(storage.setItem).not.toHaveBeenCalled();
    },
  );

  it('keeps unsaved changes visible and can retry a failed write', () => {
    const store = fresh();
    const write = vi.spyOn(store.storage, 'setItem').mockImplementationOnce(() => { throw new Error('full'); });
    expect(store.put(med)).toBe(false);
    expect(store.active).toHaveLength(1);
    expect(store.state.error).toContain('Could not save');
    expect(store.put(med)).toBe(true);
    expect(store.state.error).toBeNull();
    expect(write).toHaveBeenCalledTimes(2);
  });

  it('surfaces unavailable browser storage without overwriting anything', () => {
    const getter = vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => { throw new Error('blocked'); });
    const store = new AppStore();
    expect(store.state.error).toContain('Could not load');
    getter.mockRestore();
  });

  it('uses browser storage by default and keeps Flutter data separate', () => {
    localStorage.setItem('meditrack.v1', 'Flutter record');
    const store = new AppStore({ now: fixedNow });
    store.put(med);
    expect(JSON.parse(localStorage.getItem(storageKey)).medicines).toEqual([med]);
    expect(localStorage.getItem('meditrack.v1')).toBe('Flutter record');
  });

  it('persists all five text sizes and synchronizes the quick toggle', () => {
    const store = fresh();
    for (const scale of textScales) {
      store.setTextScale(scale);
      expect(fresh({ storage: store.storage }).state.textScale).toBe(scale);
    }
    expect(() => store.setTextScale(1.4)).toThrow();
    expect(() => store.setTextScale(3)).toThrow();
    store.setTextScale(1.5);
    store.setLargeText(false);
    expect(store.state.textScale).toBe(1);
    store.setLargeText(true);
    expect(store.state.textScale).toBe(2);
  });

  it.each([true, false])('migrates legacy larger-text preference %s without losing records', largeText => {
    const raw = JSON.stringify({ medicines: [med], doses: {}, symptoms: [], largeText });
    const store = fresh({ storage: { getItem: () => raw } });
    expect(store.state.textScale).toBe(largeText ? 2 : 1);
    expect(store.active).toEqual([med]);
    expect(store.state.error).toBeNull();
  });

  it('rejects invalid records and corrupt stored values', () => {
    const store = fresh();
    expect(() => store.put({ ...med, times: ['25:00'] })).toThrow();
    expect(() => store.record('bad', 'Taken')).toThrow();
    expect(() => store.record(store.doseKey(med, '08:00'), 'Invalid')).toThrow();
    expect(() => store.symptom(' ', 'Mild', '')).toThrow();
    expect(() => store.symptom('Headache', 'invalid', '')).toThrow();
    const valid = { medicines: [med], doses: {}, symptoms: [] };
    for (const state of [
      { ...valid, medicines: [med, med] },
      { ...valid, doses: { '2026-02-30|1|08:00': 'Taken' } },
      { ...valid, doses: { '2026-10-08|1|08:00': 'Invalid' } },
      { ...valid, symptoms: [{ name: 'Pain', severity: 'Mild', notes: '', date: 'bad' }] },
      { ...valid, textScale: 5 },
    ]) expect(fresh({ storage: { getItem: () => JSON.stringify(state) } }).state.error).toContain('Could not load');
  });

  it('includes the first day of a range, sorts newest first and handles local midnight', () => {
    const store = fresh({ now: () => new Date(2026, 0, 1, 0, 1) });
    store.record('2025-12-26|1|08:00', 'Taken');
    store.record('2025-12-25|1|08:00', 'Taken');
    store.record('2026-01-01|1|08:00', 'Skipped');
    expect(store.history(7).map(([key]) => key)).toEqual(['2026-01-01|1|08:00', '2025-12-26|1|08:00']);
    expect(store.day).toBe('2026-01-01');
  });
});
