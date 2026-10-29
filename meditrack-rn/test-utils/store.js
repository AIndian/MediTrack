import { AppStore } from '../src/state/AppStore';

export function fakeStorage(initial = {}) {
  const data = { ...initial };
  return {
    data,
    getItem: jest.fn(async (k) => (k in data ? data[k] : null)),
    setItem: jest.fn(async (k, v) => {
      data[k] = v;
    }),
  };
}

export const fixedClock = () => new Date(2026, 9, 19, 9, 0);

export function makeStore(initial) {
  return AppStore.load(fakeStorage(initial), { clock: fixedClock });
}