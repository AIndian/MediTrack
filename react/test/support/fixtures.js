import { AppStore } from '../../src/store';

export const medicine = {
  id: '1', name: 'Sample medicine', strength: '5 mg',
  instructions: 'Sample instructions', times: ['08:00', '18:00'], supply: 8, archived: false,
};

export function fresh(options = {}) {
  return new AppStore({ storage: localStorage, clock: () => new Date(2026, 9, 8, 12), ...options });
}
