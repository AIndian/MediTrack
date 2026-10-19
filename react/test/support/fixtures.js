import { AppStore } from '../../src/store';

// Same fictional medicine and local clock as test/support/fixtures.dart.
export const med = {
  id: '1', name: 'Sample medicine', strength: '5 mg',
  instructions: 'Sample instructions', times: ['08:00', '18:00'], supply: 8, archived: false,
};
export const fixedNow = () => new Date(2026, 9, 8, 12);
export function fresh(options = {}) {
  const values = new Map();
  const storage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
  return new AppStore({ storage, now: fixedNow, ...options });
}
