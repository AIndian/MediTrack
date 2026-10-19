import { createMedicine } from '../models/medicine';

const NOTE = 'Demo data only, not a real prescription. Archive it to remove.';

export const SAMPLE_MEDICINES = [
  createMedicine({
    id: 'sample-1',
    name: 'Sample: Lisinopril',
    strength: '10 mg',
    instructions: NOTE,
    times: ['08:00'],
  }),
  createMedicine({
    id: 'sample-2',
    name: 'Sample: Metformin',
    strength: '500 mg',
    instructions: NOTE,
    times: ['08:00', '18:00'],
    supply: 12,
  }),
];

// Used in development builds only (see App.js).
// Saved in a single write so a partial seed can't happen.
export function seedIfEmpty(store) {
  if (store.error || store.medicines.length > 0) return false;
  store.medicines = [...SAMPLE_MEDICINES];
  store.save();
  return true;
}