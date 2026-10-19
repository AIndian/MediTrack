import { createMedicine } from '../models/medicine';

export const SAMPLE_MEDICINES = [
  createMedicine({
    id: 'sample-1',
    name: 'Lisinopril',
    strength: '10 mg',
    instructions: 'Take with water in the morning',
    times: ['08:00'],
  }),
  createMedicine({
    id: 'sample-2',
    name: 'Metformin',
    strength: '500 mg',
    instructions: 'Take with food',
    times: ['08:00', '18:00'],
    supply: 12,
  }),
];

export function seedIfEmpty(store) {
  if (store.error || store.medicines.length > 0) return false;
  SAMPLE_MEDICINES.forEach((m) => store.put(m));
  return true;
}